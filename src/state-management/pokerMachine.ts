/**
 * XState Poker Game State Machine
 * Handles all game state transitions and game logic flow
 */

import { createMachine, assign } from 'xstate';
import type { PokerContext, PokerEvent, Player } from '@/types';
import { createDeck, shuffleDeck, cardToPokersolverFormat } from '@/utils/deck';
import { createPlayer } from '@/utils/player';
import PokerSolver from 'pokersolver';

// ============================================================================
// Initial Context
// ============================================================================

const initialContext: PokerContext = {
  players: [],
  communityCards: [],
  pot: {
    mainPot: 0,
    sidePots: [],
    totalPot: 0,
  },
  currentPlayerIndex: 0,
  dealerIndex: 0,
  smallBlind: 10,
  bigBlind: 20,
  deck: [],
  burnedCards: [],
  actionHistory: [],
  gamePhase: null,
};

// ============================================================================
// Poker State Machine
// ============================================================================

export const pokerMachine = createMachine(
  {
    id: 'poker',
    types: {} as {
      context: PokerContext;
      events: PokerEvent;
    },
    initial: 'menu',
    context: initialContext,
    states: {
      // Menu state - waiting to start game
      menu: {
        on: {
          START_GAME: {
            target: 'inGame',
            actions: 'initializeGame',
          },
        },
      },

      // In-game state - main game loop
      inGame: {
        initial: 'postingBlinds',
        states: {
          // Post blinds and deal hole cards
          postingBlinds: {
            entry: ['postBlinds', 'dealHoleCards'],
            on: {
              ADVANCE_PHASE: {
                target: 'preflop',
              },
            },
          },

          // Preflop betting round
          preflop: {
            entry: 'startBettingRound',
            on: {
              PLAYER_ACTION: {
                actions: 'applyAction',
              },
              ADVANCE_PHASE: {
                target: 'flop',
                guard: 'bettingRoundComplete',
              },
            },
          },

          // Flop (3 community cards)
          flop: {
            entry: ['burnCard', 'dealFlop', 'startBettingRound'],
            on: {
              PLAYER_ACTION: {
                actions: 'applyAction',
              },
              ADVANCE_PHASE: {
                target: 'turn',
                guard: 'bettingRoundComplete',
              },
            },
          },

          // Turn (4th community card)
          turn: {
            entry: ['burnCard', 'dealTurn', 'startBettingRound'],
            on: {
              PLAYER_ACTION: {
                actions: 'applyAction',
              },
              ADVANCE_PHASE: {
                target: 'river',
                guard: 'bettingRoundComplete',
              },
            },
          },

          // River (5th community card)
          river: {
            entry: ['burnCard', 'dealRiver', 'startBettingRound'],
            on: {
              PLAYER_ACTION: {
                actions: 'applyAction',
              },
              ADVANCE_PHASE: {
                target: 'showdown',
                guard: 'bettingRoundComplete',
              },
            },
          },

          // Showdown - evaluate hands and determine winners
          showdown: {
            entry: ['evaluateHands', 'distributePots', 'announceWinner'],
            on: {
              COMPLETE_HAND: {
                target: 'handComplete',
              },
            },
          },

          // Hand complete - prepare for next hand
          handComplete: {
            entry: ['rotateDealerButton', 'eliminateZeroStackPlayers', 'resetForNextHand'],
            always: [
              {
                target: 'postingBlinds',
                guard: 'moreThanOnePlayerRemaining',
              },
              {
                target: '#poker.gameOver',
                guard: 'onlyOnePlayerRemaining',
              },
            ],
          },
        },
      },

      // Game over state
      gameOver: {
        entry: 'showGameOverScreen',
        on: {
          START_GAME: {
            target: 'inGame',
            actions: 'initializeGame',
          },
          RESET_GAME: {
            target: 'menu',
            actions: 'resetToInitialState',
          },
        },
      },
    },
  },
  {
    // ========================================================================
    // Actions
    // ========================================================================
    actions: {
      initializeGame: assign(({ event }) => {
        if (event.type !== 'START_GAME') return {};

        const settings = event.settings;
        const deck = shuffleDeck(createDeck());

        // Create human player
        const humanPlayer = createPlayer('human-1', 'You', 'human', settings.startingChips, 0);

        // Create bot players
        const botPlayers: Player[] = [];
        for (let i = 0; i < settings.numBots; i++) {
          const botDifficulty =
            settings.botDifficulty === 'mixed'
              ? (['easy', 'medium', 'hard'] as const)[i % 3]
              : settings.botDifficulty;

          botPlayers.push(
            createPlayer(
              `bot-${i + 1}`,
              `Bot ${i + 1}`,
              'bot',
              settings.startingChips,
              i + 1,
              botDifficulty
            )
          );
        }

        return {
          players: [humanPlayer, ...botPlayers],
          smallBlind: settings.smallBlind,
          bigBlind: settings.bigBlind,
          deck,
          dealerIndex: 0,
          communityCards: [],
          burnedCards: [],
          actionHistory: [],
          pot: {
            mainPot: 0,
            sidePots: [],
            totalPot: 0,
          },
        };
      }),

      postBlinds: assign(({ context }) => {
        // Calculate blind positions (for heads-up vs multi-way)
        const numPlayers = context.players.length;
        let smallBlindPos: number;
        let bigBlindPos: number;

        if (numPlayers === 2) {
          // Heads-up: dealer is small blind, other player is big blind
          smallBlindPos = context.dealerIndex;
          bigBlindPos = (context.dealerIndex + 1) % numPlayers;
        } else {
          // Multi-way: small blind is left of dealer, big blind is left of small blind
          smallBlindPos = (context.dealerIndex + 1) % numPlayers;
          bigBlindPos = (context.dealerIndex + 2) % numPlayers;
        }

        // Update players with blind bets
        const updatedPlayers = context.players.map((player, index) => {
          if (index === smallBlindPos) {
            const blindAmount = Math.min(context.smallBlind, player.chips);
            return {
              ...player,
              chips: player.chips - blindAmount,
              currentBet: blindAmount,
              isAllIn: player.chips - blindAmount === 0,
            };
          } else if (index === bigBlindPos) {
            const blindAmount = Math.min(context.bigBlind, player.chips);
            return {
              ...player,
              chips: player.chips - blindAmount,
              currentBet: blindAmount,
              isAllIn: player.chips - blindAmount === 0,
            };
          }
          return player;
        });

        // Calculate pot
        const totalBlinds = updatedPlayers.reduce((sum, p) => sum + p.currentBet, 0);

        return {
          players: updatedPlayers,
          pot: {
            mainPot: totalBlinds,
            sidePots: [],
            totalPot: totalBlinds,
          },
          currentPlayerIndex: (bigBlindPos + 1) % numPlayers,
          gamePhase: 'preflop' as const,
        };
      }),

      dealHoleCards: assign(({ context }) => {
        // Deal 2 hole cards to each player
        let deckCopy = [...context.deck];
        const updatedPlayers = context.players.map((player) => {
          const card1 = deckCopy.shift();
          const card2 = deckCopy.shift();

          if (!card1 || !card2) {
            throw new Error('Not enough cards in deck');
          }

          return {
            ...player,
            holeCards: [card1, card2],
          };
        });

        return {
          players: updatedPlayers,
          deck: deckCopy,
        };
      }),

      burnCard: assign(({ context }) => {
        // Burn the top card from the deck
        const deckCopy = [...context.deck];
        const burnedCard = deckCopy.shift();

        if (!burnedCard) {
          throw new Error('No cards left in deck to burn');
        }

        return {
          deck: deckCopy,
          burnedCards: [...context.burnedCards, burnedCard],
        };
      }),

      dealFlop: assign(({ context }) => {
        // Deal 3 cards to the board (flop)
        const deckCopy = [...context.deck];
        const card1 = deckCopy.shift();
        const card2 = deckCopy.shift();
        const card3 = deckCopy.shift();

        if (!card1 || !card2 || !card3) {
          throw new Error('Not enough cards in deck for flop');
        }

        return {
          deck: deckCopy,
          communityCards: [...context.communityCards, card1, card2, card3],
          gamePhase: 'flop' as const,
        };
      }),

      dealTurn: assign(({ context }) => {
        // Deal 1 card to the board (turn)
        const deckCopy = [...context.deck];
        const card = deckCopy.shift();

        if (!card) {
          throw new Error('No cards left in deck for turn');
        }

        return {
          deck: deckCopy,
          communityCards: [...context.communityCards, card],
          gamePhase: 'turn' as const,
        };
      }),

      dealRiver: assign(({ context }) => {
        // Deal 1 card to the board (river)
        const deckCopy = [...context.deck];
        const card = deckCopy.shift();

        if (!card) {
          throw new Error('No cards left in deck for river');
        }

        return {
          deck: deckCopy,
          communityCards: [...context.communityCards, card],
          gamePhase: 'river' as const,
        };
      }),

      startBettingRound: assign(({ context }) => {
        // Reset current bets for all players
        const updatedPlayers = context.players.map((player) => ({
          ...player,
          currentBet: 0,
        }));

        // Find first active player to act (left of big blind for preflop, left of dealer otherwise)
        let firstPlayerIndex: number;
        if (context.gamePhase === 'preflop') {
          // Preflop: action starts left of big blind
          const bigBlindPos =
            context.players.length === 2
              ? (context.dealerIndex + 1) % context.players.length
              : (context.dealerIndex + 2) % context.players.length;
          firstPlayerIndex = (bigBlindPos + 1) % context.players.length;
        } else {
          // Postflop: action starts left of dealer
          firstPlayerIndex = (context.dealerIndex + 1) % context.players.length;
        }

        return {
          players: updatedPlayers,
          currentPlayerIndex: firstPlayerIndex,
        };
      }),

      applyAction: assign(({ context, event }) => {
        if (event.type !== 'PLAYER_ACTION') return context;

        const action = event.action;
        const currentPlayer = context.players[context.currentPlayerIndex];

        if (!currentPlayer) {
          return context;
        }

        let updatedPlayers = [...context.players];
        let updatedPot = context.pot.totalPot;

        // Apply the action to the current player
        switch (action.type) {
          case 'fold':
            updatedPlayers[context.currentPlayerIndex] = {
              ...currentPlayer,
              isFolded: true,
            };
            break;

          case 'check':
            // No changes needed
            break;

          case 'call': {
            // Calculate call amount
            const currentBet = Math.max(...context.players.map((p) => p.currentBet));
            const callAmount = Math.min(currentBet - currentPlayer.currentBet, currentPlayer.chips);

            updatedPlayers[context.currentPlayerIndex] = {
              ...currentPlayer,
              chips: currentPlayer.chips - callAmount,
              currentBet: currentPlayer.currentBet + callAmount,
              isAllIn: currentPlayer.chips - callAmount === 0,
            };

            updatedPot += callAmount;
            break;
          }

          case 'bet':
          case 'raise': {
            const raiseAmount = Math.min(action.amount, currentPlayer.chips);

            updatedPlayers[context.currentPlayerIndex] = {
              ...currentPlayer,
              chips: currentPlayer.chips - raiseAmount,
              currentBet: currentPlayer.currentBet + raiseAmount,
              isAllIn: currentPlayer.chips - raiseAmount === 0,
            };

            updatedPot += raiseAmount;
            break;
          }

          case 'all-in': {
            const allInAmount = currentPlayer.chips;

            updatedPlayers[context.currentPlayerIndex] = {
              ...currentPlayer,
              chips: 0,
              currentBet: currentPlayer.currentBet + allInAmount,
              isAllIn: true,
            };

            updatedPot += allInAmount;
            break;
          }
        }

        // Move to next active player
        let nextPlayerIndex = (context.currentPlayerIndex + 1) % context.players.length;
        while (
          updatedPlayers[nextPlayerIndex] &&
          (updatedPlayers[nextPlayerIndex]!.isFolded ||
            updatedPlayers[nextPlayerIndex]!.isAllIn)
        ) {
          nextPlayerIndex = (nextPlayerIndex + 1) % context.players.length;
        }

        return {
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex,
          pot: {
            ...context.pot,
            mainPot: updatedPot,
            totalPot: updatedPot,
          },
          actionHistory: [...context.actionHistory, action],
        };
      }),

      evaluateHands: assign(({ context }) => {
        // Evaluate hands for all active players
        const activePlayers = context.players.filter((p) => !p.isFolded);

        // If only one player remains, they win by default
        if (activePlayers.length === 1) {
          return context;
        }

        // Convert cards to pokersolver format and evaluate
        const communityCardsStr = context.communityCards.map(cardToPokersolverFormat);

        // Evaluate each player's hand (for display purposes)
        activePlayers.forEach((player) => {
          const holeCardsStr = player.holeCards.map(cardToPokersolverFormat);
          const allCards = [...holeCardsStr, ...communityCardsStr];
          PokerSolver.solve(allCards);
        });

        // Store hand evaluations for display (optional - could add to context)
        return context;
      }),

      distributePots: assign(({ context }) => {
        const activePlayers = context.players.filter((p) => !p.isFolded);

        // If only one player remains, they win the entire pot
        if (activePlayers.length === 1) {
          const winner = activePlayers[0];
          if (!winner) return context;

          const updatedPlayers = context.players.map((p) =>
            p.id === winner.id ? { ...p, chips: p.chips + context.pot.totalPot } : p
          );

          return {
            players: updatedPlayers,
            pot: {
              mainPot: 0,
              sidePots: [],
              totalPot: 0,
            },
          };
        }

        // Multiple players - evaluate hands and distribute
        const communityCardsStr = context.communityCards.map(cardToPokersolverFormat);

        const playerHands = activePlayers.map((player) => {
          const holeCardsStr = player.holeCards.map(cardToPokersolverFormat);
          const allCards = [...holeCardsStr, ...communityCardsStr];
          return {
            player,
            hand: PokerSolver.solve(allCards),
          };
        });

        // Determine winners
        const hands = playerHands.map((ph) => ph.hand);
        const winningHands = PokerSolver.winners(hands);

        // Find players with winning hands
        const winners = playerHands.filter((ph) => winningHands.includes(ph.hand));

        // Distribute pot evenly among winners
        const potShare = Math.floor(context.pot.totalPot / winners.length);

        const updatedPlayers = context.players.map((player) => {
          const isWinner = winners.some((w) => w.player.id === player.id);
          if (isWinner) {
            return { ...player, chips: player.chips + potShare };
          }
          return player;
        });

        return {
          players: updatedPlayers,
          pot: {
            mainPot: 0,
            sidePots: [],
            totalPot: 0,
          },
        };
      }),

      announceWinner: () => {
        // UI action - handled by React components
        // Could store winner info in context for display
      },

      rotateDealerButton: assign(({ context }) => {
        const nextDealer = (context.dealerIndex + 1) % context.players.length;
        return {
          dealerIndex: nextDealer,
        };
      }),

      eliminateZeroStackPlayers: assign(({ context }) => {
        const activePlayers = context.players.filter((p) => p.chips > 0);
        return {
          players: activePlayers,
        };
      }),

      resetForNextHand: assign(() => {
        // Reset for next hand
        const deck = shuffleDeck(createDeck());
        return {
          deck,
          communityCards: [],
          burnedCards: [],
          actionHistory: [],
          pot: {
            mainPot: 0,
            sidePots: [],
            totalPot: 0,
          },
          gamePhase: null,
        };
      }),

      showGameOverScreen: () => {
        // UI action - handled by React components
      },

      resetToInitialState: assign(() => initialContext),
    },

    // ========================================================================
    // Guards
    // ========================================================================
    guards: {
      bettingRoundComplete: ({ context }) => {
        // Filter active players (not folded, not all-in)
        const activePlayers = context.players.filter((p) => !p.isFolded && !p.isAllIn);

        // If only one or no active players, round is complete
        if (activePlayers.length <= 1) {
          return true;
        }

        // Check if there are any actions in history for current phase
        const currentPhaseActions = context.actionHistory.filter(() => {
          // Simple check: if we have any actions, assume they're for current phase
          // In a more sophisticated implementation, we'd track phase with each action
          return true;
        });

        // Need at least one action per active player
        if (currentPhaseActions.length < activePlayers.length) {
          return false;
        }

        // Check if all active players have equal bets
        const activeBets = activePlayers.map((p) => p.currentBet);
        const maxBet = Math.max(...activeBets);

        const allBetsEqual = activePlayers.every((p) => p.currentBet === maxBet);

        return allBetsEqual;
      },

      moreThanOnePlayerRemaining: ({ context }) => {
        return context.players.filter((p) => p.chips > 0).length > 1;
      },

      onlyOnePlayerRemaining: ({ context }) => {
        return context.players.filter((p) => p.chips > 0).length === 1;
      },
    },
  }
);
