# Critical Game Flow Bugs Found in Deep Review

**Date**: 2025-11-17
**Status**: 🔴 GAME-BREAKING BUGS - Will cause infinite loops and stuck games

---

## Bug #4: Betting Round Never Completes (CRITICAL - Game Breaking)

**Severity**: 🔴 GAME BREAKING
**File**: `src/game-logic/engine/GameEngine.ts:240-267`
**Impact**: Betting rounds never complete in normal play, game gets stuck waiting for player action

### The Problem:

The `isBettingRoundComplete` function uses faulty logic to detect when a betting round ends:

```typescript
const bettingComplete = this.isBettingRoundComplete(
  updatedPlayers,
  newCurrentBet,
  nextPlayerIndex,      // Who acts next
  state.currentPlayerIndex  // Who just acted
);

// In isBettingRoundComplete:
const backToStart = nextPlayerIndex === startPlayerIndex;
return allMatched && backToStart;
```

**The bug**: `nextPlayerIndex` will NEVER equal `state.currentPlayerIndex` in normal play because `getNextActivePlayerIndex` always returns a different player (unless only 1 player remains, which is already caught by the earlier check).

### Example Scenario (Game Gets Stuck):

3 players preflop after blinds (SB=$5, BB=$10):

1. **UTG calls $10**
   - state.currentPlayerIndex = 2 (UTG)
   - nextPlayerIndex = 0 (SB)
   - backToStart = (0 === 2) = FALSE
   - allMatched = FALSE (SB at $5, BB at $10, UTG at $10)
   - Continue ✓

2. **SB calls $5 more (total $10)**
   - state.currentPlayerIndex = 0 (SB)
   - nextPlayerIndex = 1 (BB)
   - backToStart = (1 === 0) = FALSE
   - allMatched = FALSE (BB at $10, others $10, but BB hasn't acted on this round)
   - Continue ✓

3. **BB checks (already at $10)**
   - state.currentPlayerIndex = 1 (BB)
   - nextPlayerIndex = 2 (UTG)
   - backToStart = (2 === 1) = FALSE ❌
   - allMatched = TRUE (everyone at $10)
   - return FALSE && TRUE = **FALSE**
   - **BUG**: Betting continues to UTG again!

4. **UTG would act again** (infinite loop potential)

### The Fix:

Need to track the **first player to act** in the betting round, not the current player. When action returns to the first player AND all bets are matched, the round is complete.

---

## Bug #5: Game Continues After Everyone Folds (CRITICAL)

**Severity**: 🔴 CRITICAL
**File**: `src/game-logic/engine/GameEngine.ts:270-321`
**Impact**: When everyone folds except one player, community cards continue to be dealt instead of awarding pot immediately

### The Problem:

```typescript
private advancePhase(state: GameState): GameState {
  // Reset current bets for next round
  const resetPlayers = state.players.map((p) => ({ ...p, currentBet: 0 }));

  let newPhase: GamePhase;
  let newCommunityCards = [...state.communityCards];

  switch (state.phase) {
    case GamePhase.Preflop:
      this.deck.burn();
      newCommunityCards = this.deck.deal(3);  // ❌ WRONG if only 1 player left
      newPhase = GamePhase.Flop;
      break;
    // ...
  }
  // ...
}
```

**No check for early hand termination!**

### Example Scenario:

1. Preflop: Players A, B, C
2. A raises, B folds, C folds
3. isBettingRoundComplete returns true (only 1 player left)
4. **advancePhase is called**
5. **BUG**: Flop is dealt! (should award pot to A immediately)
6. Game tries to get first to act, but only A remains
7. Game state becomes inconsistent

### The Fix:

Check at the start of `advancePhase` if only one non-folded player remains. If so, go directly to hand complete (award pot).

---

## Bug #6: getNextActivePlayerIndex Returns All-In Players (CRITICAL)

**Severity**: 🔴 GAME BREAKING
**File**: `src/game-logic/rules/PositionRules.ts:74-89`
**Impact**: Game gets stuck when current player is all-in (gameStore skips them, but they're still currentPlayerIndex)

### The Problem:

```typescript
getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number,
  foldedPlayerIds: Set<string>
): number {
  let nextIndex = (currentIndex + 1) % players.length;
  let iterations = 0;

  // Find next player who hasn't folded
  while (foldedPlayerIds.has(players[nextIndex].id) && iterations < players.length) {
    nextIndex = (nextIndex + 1) % players.length;
    iterations++;
  }

  return nextIndex;  // ❌ Can return all-in player!
}
```

**Only skips folded players, not all-in players!**

### Example Scenario:

1. Player A bets and goes all-in
2. processAction sets currentPlayerIndex to next player (B)
3. But B is also all-in
4. gameStore's processBotActions checks: `currentPlayer.status === PlayerStatus.AllIn`
5. Returns early (skips)
6. **Game is stuck** - no one acts, betting round never ends

### The Fix:

Skip both folded AND all-in players when finding next active player.

---

## Bug #7: Missing Winner Display in UI

**Severity**: ⚠️ HIGH (UX Issue)
**File**: `src/presentation/pages/PokerTable.tsx`
**Impact**: Players don't know who won or why

### The Problem:

When hand completes, UI shows:
```jsx
<div className="text-2xl font-bold mb-4">Hand Complete!</div>
```

But doesn't show:
- Who won
- What hand they had
- How much they won

### The Fix:

Add winner information to GameState and display in UI.

---

## Bug #8: All-In Players Should Run Out All Cards

**Severity**: ⚠️ MEDIUM (Poker Rules)
**File**: `src/game-logic/engine/GameEngine.ts:270-321`
**Impact**: When all remaining players are all-in, cards should be dealt immediately (no betting rounds)

### Current Behavior:
If 2 players go all-in preflop, the game still pauses at each street for betting rounds (but no one can act).

### Expected Behavior:
When all active players are all-in, deal all remaining community cards at once (called "running it out").

---

## Summary

**Critical (Game Breaking)**: 3 bugs (#4, #5, #6)
**High Priority**: 2 bugs (#7, #8)

These bugs will cause:
- Infinite loops or stuck games
- Incorrect game flow
- Poor user experience
- Violations of poker rules

**All must be fixed before production.**
