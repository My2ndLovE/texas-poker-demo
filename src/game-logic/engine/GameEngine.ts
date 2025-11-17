import { GameState, createInitialGameState } from '../models/GameState';
import { Player, createPlayer } from '../models/Player';
import { Action, createAction } from '../models/Action';
import { Deck } from '../deck/Deck';
import { HandEvaluator } from '../evaluation/HandEvaluator';
import { PotCalculator } from '../pot/PotCalculator';
import { BettingRules } from '../rules/BettingRules';
import { PositionRules } from '../rules/PositionRules';
import { GamePhase, ActionType, PlayerStatus } from '@/utils/constants';
import { cardToString } from '../models/Card';

export class GameEngine {
  private deck: Deck;
  private handEvaluator: HandEvaluator;
  private potCalculator: PotCalculator;
  private bettingRules: BettingRules;
  private positionRules: PositionRules;

  constructor() {
    this.deck = new Deck();
    this.handEvaluator = new HandEvaluator();
    this.potCalculator = new PotCalculator();
    this.bettingRules = new BettingRules();
    this.positionRules = new PositionRules();
  }

  createGame(
    playerNames: Array<{ name: string; isBot: boolean; chips: number }>,
    smallBlind: number,
    bigBlind: number
  ): GameState {
    const players = playerNames.map((p, index) =>
      createPlayer(`player_${index}`, p.name, p.chips, index, p.isBot)
    );

    return createInitialGameState(players, smallBlind, bigBlind, 0);
  }

  startHand(state: GameState): GameState {
    // Reset deck and shuffle
    this.deck.reset();

    // Calculate positions
    const players = this.positionRules.calculatePositions(state.players, state.dealerIndex);

    // Reset player states
    const resetPlayers = players.map((p) => ({
      ...p,
      holeCards: [],
      currentBet: 0,
      totalBet: 0,
      status: p.chips > 0 ? PlayerStatus.Active : PlayerStatus.Out,
    }));

    // Post blinds
    const playersWithBlinds = this.postBlinds(resetPlayers, state.smallBlind, state.bigBlind);

    // Deal hole cards
    const playersWithCards = playersWithBlinds.map((p) => {
      if (p.status === PlayerStatus.Active || p.status === PlayerStatus.AllIn) {
        return { ...p, holeCards: this.deck.deal(2) };
      }
      return p;
    });

    // Calculate pot
    const pot = this.potCalculator.calculatePot(playersWithCards);

    // Get first player to act preflop
    const firstToAct = this.positionRules.getFirstToActPreflop(
      playersWithCards,
      state.dealerIndex
    );

    return {
      ...state,
      phase: GamePhase.Preflop,
      players: playersWithCards,
      communityCards: [],
      pot,
      currentBet: state.bigBlind,
      minRaise: state.bigBlind,
      currentPlayerIndex: firstToAct,
      deck: this.deck.getAllCards(),
      burnedCards: [],
      actionHistory: [],
      handNumber: state.handNumber + 1,
    };
  }

  private postBlinds(players: Player[], smallBlind: number, bigBlind: number): Player[] {
    return players.map((p) => {
      if (p.isSmallBlind && p.status === PlayerStatus.Active) {
        const sbAmount = Math.min(smallBlind, p.chips);
        return {
          ...p,
          currentBet: sbAmount,
          totalBet: sbAmount,
          chips: p.chips - sbAmount,
          status: sbAmount === p.chips ? PlayerStatus.AllIn : PlayerStatus.Active,
        };
      }

      if (p.isBigBlind && p.status === PlayerStatus.Active) {
        const bbAmount = Math.min(bigBlind, p.chips);
        return {
          ...p,
          currentBet: bbAmount,
          totalBet: bbAmount,
          chips: p.chips - bbAmount,
          status: bbAmount === p.chips ? PlayerStatus.AllIn : PlayerStatus.Active,
        };
      }

      return p;
    });
  }

  processAction(state: GameState, action: Action): GameState {
    const player = state.players.find((p) => p.id === action.playerId);
    if (!player) {
      throw new Error(`Player ${action.playerId} not found`);
    }

    // Update player based on action
    const updatedPlayers = this.applyAction(state.players, player, action, state.currentBet);

    // Recalculate pot
    const pot = this.potCalculator.calculatePot(updatedPlayers);

    // Add action to history
    const actionHistory = [...state.actionHistory, action];

    // Determine new current bet and min raise
    let newCurrentBet = state.currentBet;
    let newMinRaise = state.minRaise;

    if (action.type === ActionType.Bet || action.type === ActionType.Raise) {
      // Find the updated player to get their new current bet
      const updatedPlayer = updatedPlayers.find((p) => p.id === action.playerId);
      if (updatedPlayer) {
        const raiseAmount = updatedPlayer.currentBet - state.currentBet;
        newCurrentBet = updatedPlayer.currentBet;
        newMinRaise = raiseAmount;
      }
    }

    // Get next player to act
    const foldedPlayers = new Set(
      updatedPlayers.filter((p) => p.status === PlayerStatus.Folded).map((p) => p.id)
    );

    let nextPlayerIndex = this.positionRules.getNextActivePlayerIndex(
      updatedPlayers,
      state.currentPlayerIndex,
      foldedPlayers
    );

    // Check if betting round is complete
    const bettingComplete = this.isBettingRoundComplete(
      updatedPlayers,
      newCurrentBet,
      nextPlayerIndex,
      state.currentPlayerIndex
    );

    let newState: GameState = {
      ...state,
      players: updatedPlayers,
      pot,
      currentBet: newCurrentBet,
      minRaise: newMinRaise,
      currentPlayerIndex: nextPlayerIndex,
      actionHistory,
    };

    // If betting is complete, advance to next phase
    if (bettingComplete) {
      newState = this.advancePhase(newState);
    }

    return newState;
  }

  private applyAction(
    players: Player[],
    player: Player,
    action: Action,
    currentBet: number
  ): Player[] {
    return players.map((p) => {
      if (p.id !== player.id) return p;

      switch (action.type) {
        case ActionType.Fold:
          return { ...p, status: PlayerStatus.Folded };

        case ActionType.Check:
          return p;

        case ActionType.Call: {
          const callAmount = this.bettingRules.getCallAmount(p, currentBet);
          return {
            ...p,
            currentBet: p.currentBet + callAmount,
            totalBet: p.totalBet + callAmount,
            chips: p.chips - callAmount,
            status: callAmount === p.chips ? PlayerStatus.AllIn : p.status,
          };
        }

        case ActionType.Bet:
        case ActionType.Raise: {
          const betAmount = Math.min(action.amount, p.chips);
          return {
            ...p,
            currentBet: p.currentBet + betAmount,
            totalBet: p.totalBet + betAmount,
            chips: p.chips - betAmount,
            status: betAmount === p.chips ? PlayerStatus.AllIn : p.status,
          };
        }

        case ActionType.AllIn: {
          return {
            ...p,
            currentBet: p.currentBet + p.chips,
            totalBet: p.totalBet + p.chips,
            chips: 0,
            status: PlayerStatus.AllIn,
          };
        }

        default:
          return p;
      }
    });
  }

  private isBettingRoundComplete(
    players: Player[],
    currentBet: number,
    nextPlayerIndex: number,
    startPlayerIndex: number
  ): boolean {
    const activePlayers = players.filter(
      (p) => p.status === PlayerStatus.Active || p.status === PlayerStatus.AllIn
    );

    // Only one player left
    if (activePlayers.length <= 1) {
      return true;
    }

    // All players all-in
    const nonAllInPlayers = activePlayers.filter((p) => p.status === PlayerStatus.Active);
    if (nonAllInPlayers.length === 0) {
      return true;
    }

    // All active players have matched the current bet
    const allMatched = nonAllInPlayers.every((p) => p.currentBet === currentBet);

    // We've gone around the table
    const backToStart = nextPlayerIndex === startPlayerIndex;

    return allMatched && backToStart;
  }

  private advancePhase(state: GameState): GameState {
    // Reset current bets for next round
    const resetPlayers = state.players.map((p) => ({ ...p, currentBet: 0 }));

    let newPhase: GamePhase;
    let newCommunityCards = [...state.communityCards];

    switch (state.phase) {
      case GamePhase.Preflop:
        // Burn 1, deal 3 (flop)
        this.deck.burn();
        newCommunityCards = this.deck.deal(3);
        newPhase = GamePhase.Flop;
        break;

      case GamePhase.Flop:
        // Burn 1, deal 1 (turn)
        this.deck.burn();
        newCommunityCards = [...state.communityCards, ...this.deck.deal(1)];
        newPhase = GamePhase.Turn;
        break;

      case GamePhase.Turn:
        // Burn 1, deal 1 (river)
        this.deck.burn();
        newCommunityCards = [...state.communityCards, ...this.deck.deal(1)];
        newPhase = GamePhase.River;
        break;

      case GamePhase.River:
        // Go to showdown
        newPhase = GamePhase.Showdown;
        return this.handleShowdown({ ...state, players: resetPlayers, phase: newPhase });

      default:
        return state;
    }

    // Get first to act postflop
    const firstToAct = this.positionRules.getFirstToActPostflop(
      resetPlayers,
      state.dealerIndex
    );

    return {
      ...state,
      phase: newPhase,
      players: resetPlayers,
      communityCards: newCommunityCards,
      currentBet: 0,
      currentPlayerIndex: firstToAct,
    };
  }

  private handleShowdown(state: GameState): GameState {
    const activePlayers = state.players.filter((p) => p.status !== PlayerStatus.Folded);

    if (activePlayers.length === 1) {
      // Only one player left - they win
      const winner = activePlayers[0];
      const updatedPlayers = state.players.map((p) =>
        p.id === winner.id ? { ...p, chips: p.chips + state.pot.totalPot } : p
      );

      return {
        ...state,
        phase: GamePhase.HandComplete,
        players: updatedPlayers,
      };
    }

    // Evaluate hands
    const hands = activePlayers.map((p) => ({
      playerId: p.id,
      cards: [...p.holeCards, ...state.communityCards],
    }));

    const winnerIds = this.handEvaluator.findWinners(hands);

    // Distribute pots with proper side pot handling
    let updatedPlayers = [...state.players];

    // Award main pot to eligible winners
    const mainPotWinners = winnerIds.filter((id) =>
      state.pot.mainPotEligiblePlayers.includes(id)
    );
    if (mainPotWinners.length > 0 && state.pot.mainPot > 0) {
      const mainPotShare = Math.floor(state.pot.mainPot / mainPotWinners.length);
      updatedPlayers = updatedPlayers.map((p) =>
        mainPotWinners.includes(p.id) ? { ...p, chips: p.chips + mainPotShare } : p
      );
    }

    // Award each side pot to eligible winners
    for (const sidePot of state.pot.sidePots) {
      const sidePotWinners = winnerIds.filter((id) => sidePot.eligiblePlayerIds.includes(id));
      if (sidePotWinners.length > 0) {
        const sidePotShare = Math.floor(sidePot.amount / sidePotWinners.length);
        updatedPlayers = updatedPlayers.map((p) =>
          sidePotWinners.includes(p.id) ? { ...p, chips: p.chips + sidePotShare } : p
        );
      }
    }

    return {
      ...state,
      phase: GamePhase.HandComplete,
      players: updatedPlayers,
    };
  }

  endHand(state: GameState): GameState {
    // Move dealer button
    const newDealerIndex = this.positionRules.getNextDealerIndex(
      state.players,
      state.dealerIndex
    );

    // Remove players with no chips
    const remainingPlayers = state.players.filter((p) => p.chips > 0);

    return {
      ...state,
      phase: GamePhase.WaitingToStart,
      players: remainingPlayers,
      dealerIndex: newDealerIndex,
    };
  }
}
