# Production Readiness Review - Critical Bugs Found

**Date**: 2025-11-17
**Reviewer**: Claude Code
**Status**: ❌ NOT PRODUCTION READY - Critical bugs found

## Summary

Found **3 critical bugs** that will cause game logic failures in production. All bugs are in the core game engine and must be fixed before deployment.

---

## Critical Bug #1: Incorrect Player Bet Tracking in Bet/Raise Actions

**Severity**: 🔴 CRITICAL
**File**: `src/game-logic/engine/GameEngine.ts:208-217`
**Impact**: Player's current bet amount is completely wrong after betting/raising, breaking all subsequent game logic

### Current Code (BUGGY):
```typescript
case ActionType.Bet:
case ActionType.Raise: {
  const betAmount = Math.min(action.amount, p.chips);
  return {
    ...p,
    currentBet: betAmount,  // ❌ WRONG: Should be p.currentBet + betAmount
    totalBet: p.totalBet + betAmount,
    chips: p.chips - betAmount,
    status: betAmount === p.chips ? PlayerStatus.AllIn : p.status,
  };
}
```

### Problem:
The code treats `action.amount` as an ADDITIONAL amount (which is correct based on ActionButtons.tsx and BettingRules.calculateNewBet), but then sets `currentBet` to that amount instead of adding it to the existing bet.

### Example Bug Scenario:
1. Player has bet $10 in current round (currentBet = 10, chips = 90)
2. Player raises by $20 more (action.amount = 20)
3. **Expected**: currentBet = 30, chips = 70
4. **Actual**: currentBet = 20 (WRONG!), chips = 70

### Fix Required:
```typescript
case ActionType.Bet:
case ActionType.Raise: {
  const betAmount = Math.min(action.amount, p.chips);
  return {
    ...p,
    currentBet: p.currentBet + betAmount,  // ✅ CORRECT: Add to existing bet
    totalBet: p.totalBet + betAmount,
    chips: p.chips - betAmount,
    status: betAmount === p.chips ? PlayerStatus.AllIn : p.status,
  };
}
```

---

## Critical Bug #2: Incorrect Table Bet Level Tracking

**Severity**: 🔴 CRITICAL
**File**: `src/game-logic/engine/GameEngine.ts:138-142`
**Impact**: Game-wide current bet and minimum raise amounts are wrong, causing betting validation to fail

### Current Code (BUGGY):
```typescript
if (action.type === ActionType.Bet || action.type === ActionType.Raise) {
  const raiseAmount = action.amount - state.currentBet;  // ❌ WRONG logic
  newCurrentBet = action.amount;  // ❌ WRONG: action.amount is additional, not total
  newMinRaise = raiseAmount;
}
```

### Problem:
The code incorrectly calculates the new table-level bet and raise amount because it treats `action.amount` as a total bet, but it's actually an ADDITIONAL amount.

### Example Bug Scenario:
1. Table current bet is $10
2. Player A has currentBet $10 (matched), raises by adding $20 (action.amount = 20)
3. **Expected**:
   - Player A's new currentBet = $30
   - Table's new currentBet = $30
   - New minRaise = $20 (the increment)
4. **Actual**:
   - raiseAmount = 20 - 10 = 10 (WRONG)
   - newCurrentBet = 20 (WRONG, should be 30)
   - newMinRaise = 10 (WRONG, should be 20)

### Fix Required:
```typescript
if (action.type === ActionType.Bet || action.type === ActionType.Raise) {
  // Player's new currentBet is already updated in updatedPlayers from applyAction
  const updatedPlayer = updatedPlayers.find(p => p.id === action.playerId)!;
  const raiseAmount = updatedPlayer.currentBet - state.currentBet;
  newCurrentBet = updatedPlayer.currentBet;
  newMinRaise = raiseAmount;
}
```

**Note**: This fix depends on Bug #1 being fixed first, otherwise updatedPlayer.currentBet will still be wrong.

---

## Critical Bug #3: Side Pots Not Distributed in Showdown

**Severity**: 🔴 CRITICAL
**File**: `src/game-logic/engine/GameEngine.ts:345-354`
**Impact**: Winners receive incorrect amounts when there are all-in situations with side pots

### Current Code (BUGGY):
```typescript
// Distribute pots
// For now, simplified: winners split total pot  // ❌ This comment admits the bug!
const winAmount = Math.floor(state.pot.totalPot / winnerIds.length);

const updatedPlayers = state.players.map((p) => {
  if (winnerIds.includes(p.id)) {
    return { ...p, chips: p.chips + winAmount };
  }
  return p;
});
```

### Problem:
The code completely ignores the carefully calculated side pots in `state.pot.mainPot` and `state.pot.sidePots`. The PotCalculator correctly creates side pots with eligibility tracking, but the showdown logic just splits the total pot among all winners.

### Example Bug Scenario:
1. Player A goes all-in for $50
2. Player B goes all-in for $100
3. Player C calls $100
4. Pot structure:
   - Main pot: $150 (3 × $50) - A, B, C eligible
   - Side pot: $100 (2 × $50) - Only B, C eligible
5. **If A wins**: Should win $150 (main pot only)
6. **If B wins**: Should win $250 (main + side pot)
7. **Actual**: All winners just split $250 evenly, ignoring eligibility

### Fix Required:
```typescript
// Distribute main pot
let updatedPlayers = [...state.players];

// Award main pot
const mainPotWinners = winnerIds.filter(id =>
  state.pot.mainPot.eligiblePlayerIds.includes(id)
);
if (mainPotWinners.length > 0) {
  const mainPotShare = Math.floor(state.pot.mainPot.amount / mainPotWinners.length);
  updatedPlayers = updatedPlayers.map(p =>
    mainPotWinners.includes(p.id)
      ? { ...p, chips: p.chips + mainPotShare }
      : p
  );
}

// Award each side pot
for (const sidePot of state.pot.sidePots) {
  const sidePotWinners = winnerIds.filter(id =>
    sidePot.eligiblePlayerIds.includes(id)
  );
  if (sidePotWinners.length > 0) {
    const sidePotShare = Math.floor(sidePot.amount / sidePotWinners.length);
    updatedPlayers = updatedPlayers.map(p =>
      sidePotWinners.includes(p.id)
        ? { ...p, chips: p.chips + sidePotShare }
        : p
    );
  }
}

return {
  ...state,
  phase: GamePhase.HandComplete,
  players: updatedPlayers,
};
```

---

## Additional Issues (Non-Critical)

### Issue #4: Potential Memory Leaks from setTimeout

**Severity**: ⚠️ MEDIUM
**File**: `src/state-management/gameStore.ts:66-68, 79-81, 125-127`

**Problem**: Multiple `setTimeout` calls are made without cleanup. If the component unmounts or state changes rapidly, these timeouts can still fire and cause:
- Accessing stale state
- Triggering actions on unmounted components
- Memory leaks from accumulated timers

**Recommendation**: Use `useEffect` cleanup in React components, or track timeout IDs and clear them when appropriate.

---

### Issue #5: Missing Error Handling

**Severity**: ⚠️ MEDIUM
**Files**: Various

**Problem**: No error boundaries or try-catch blocks. If any game logic throws an exception (e.g., player not found, invalid state), the entire app will crash.

**Recommendation**: Add error boundaries and defensive checks in critical paths.

---

## Testing Status

**Unit Tests**: ✅ 73 tests passing
- BUT tests don't cover the bet/raise flow with action processing
- Tests use BettingRules.calculateNewBet() which is correct, but GameEngine doesn't use it!

**Integration Tests**: ❌ None
**Manual Testing**: ❌ Not performed yet

---

## Recommendation

**DO NOT DEPLOY** until all 3 critical bugs are fixed. These bugs will cause:
1. Incorrect pot calculations
2. Players unable to bet/raise correctly
3. Wrong winners being paid incorrect amounts

Estimate to fix: 1-2 hours including testing

---

## Next Steps

1. Fix Bug #1 (bet/raise player tracking)
2. Fix Bug #2 (table bet tracking) - depends on #1
3. Fix Bug #3 (side pot distribution)
4. Add integration tests for bet/raise flow
5. Manual testing with various scenarios
6. Consider fixing Issue #4 (setTimeout cleanup)
7. Add error boundaries (Issue #5)
