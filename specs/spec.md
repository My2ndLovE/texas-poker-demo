# Feature Specification: Standalone Texas Hold'em Poker Game

**Project**: Standalone Poker Game
**Created**: 2025-11-18
**Updated**: 2025-11-18
**Status**: Active
**Type**: Single-player poker game with bot opponents (no backend, no database)
**Platform**: Mobile-first, responsive web application

---

## Project Overview

Build a production-quality, standalone Texas Hold'em poker game playable entirely in the browser. Players compete against intelligent bot opponents in a beautifully designed **mobile-first** interface with complete poker rules, smooth animations, and professional gameplay experience. Optimized for smartphones and tablets, with full desktop support. No server, no database, no multiplayer - pure client-side single-player entertainment.

---

## User Scenarios & Testing

### User Story 1 - Quick Play Mode (Priority: P1)

As a player, I want to quickly start a poker game against bots so I can practice my skills or enjoy casual gameplay without setup complexity.

**Why this priority**: Core value proposition. Users want to play poker immediately without registration, configuration, or waiting. This is the minimum viable product - everything else is enhancement.

**Independent Test**: Launch app, click "Quick Play", verify game starts with bots and I can play a complete hand.

**Acceptance Scenarios**:

1. **Given** I launch the app for the first time, **When** I click "Quick Play" on the main menu, **Then** a new game starts with me and 5 bot opponents (6 players total), I receive starting chips (1000), and first hand begins automatically within 2 seconds

2. **Given** I am in quick play mode, **When** I complete a hand, **Then** next hand starts automatically after 3-second delay, dealer button rotates clockwise, and blinds are posted from correct positions

3. **Given** I want to restart, **When** I click "New Game" during active play, **Then** I see confirmation dialog, and confirming resets game with fresh 1000 chips for all players

4. **Given** I run out of chips, **When** I lose all chips, **Then** game ends, I see my statistics (hands played, win rate), and "Play Again" button resets everything

---

### User Story 2 - Complete Texas Hold'em Rules (Priority: P1)

As a player, I want to play Texas Hold'em with ALL correct poker rules so the game feels authentic and educational.

**Why this priority**: Incomplete rules break the poker experience. Players expect authentic gameplay. Core requirement for credibility - cannot launch without complete rules.

**Independent Test**: Play multiple scenarios (all-in, side pots, ties, showdown) and verify all poker rules are correctly implemented and validated.

**Acceptance Scenarios**:

1. **Given** hand starts, **When** dealing begins, **Then** small blind and big blind are auto-posted from correct positions (player left of dealer = SB, next player = BB), 2 hole cards dealt to each player face-down, and action starts with player left of big blind (Under The Gun)

2. **Given** it's my turn, **When** I choose an action, **Then** I see valid options based on current bet (Fold always available, Check if no bet, Call to match bet, Raise with minimum raise enforced, All-In with all my chips)

3. **Given** I raise, **When** I enter raise amount, **Then** system validates minimum raise is at least double the previous bet, prevents raises below minimum (unless all-in), and updates pot immediately

4. **Given** preflop betting completes, **When** all players acted, **Then** 1 card is burned (discarded), 3 community cards (flop) are dealt face-up, new betting round begins with first active player left of dealer

5. **Given** flop betting completes, **When** all acted, **Then** 1 card burned, 1 turn card dealt, turn betting round begins

6. **Given** turn betting completes, **When** all acted, **Then** 1 card burned, 1 river card dealt, final betting round begins

7. **Given** multiple players all-in with different amounts, **When** hand completes, **Then** system calculates main pot and side pots correctly, each player can only win pot they contributed to, odd chips go to player closest to dealer button clockwise

8. **Given** river betting completes with 2+ players remaining, **When** showdown occurs, **Then** players reveal cards in order (last aggressor shows first, then clockwise), best 5-card hand from 7 cards wins, ties split pot evenly

9. **Given** hand evaluation at showdown, **When** comparing hands, **Then** system correctly ranks all 10 hand types (Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card), uses correct tie-breakers (kickers, highest cards)

10. **Given** betting round in progress, **When** only 1 player remains (others folded), **Then** remaining player wins immediately without showdown, cards not revealed, pot awarded, next hand begins

11. **Given** player has insufficient chips for full blind, **When** blinds are due, **Then** player posts partial blind (all-in), remains in hand but cannot bet further, side pots calculated accordingly

12. **Given** heads-up (2 players), **When** hand starts, **Then** dealer is small blind (button = SB), other player is big blind, dealer acts first preflop but last post-flop (special heads-up rules)

---

### User Story 3 - Intelligent Bot Opponents (Priority: P1)

As a player, I want to play against bots that make realistic decisions so the game feels challenging and engaging, not predictable or boring.

**Why this priority**: Single-player game lives or dies by AI quality. Bad AI = boring game = users leave. Core differentiator for standalone poker game.

**Independent Test**: Play 20 hands against each bot difficulty level, observe decision patterns, verify bots play believably and at appropriate skill levels.

**Acceptance Scenarios**:

1. **Given** I start quick play, **When** game begins, **Then** I see 5 bot opponents with distinct names (e.g., "Sarah", "Mike", "Chen", "Nina", "Alex") and avatar icons, each bot assigned personality type (tight/loose, aggressive/passive)

2. **Given** bot's turn during preflop, **When** bot evaluates action, **Then** bot considers hole cards strength, position at table, pot size, and decides within realistic time (500ms-3000ms delay to simulate thinking)

3. **Given** Easy bot plays, **When** making decisions, **Then** bot uses simple rules (fold weak hands like 7-2, call/raise strong hands like pairs, face cards), makes occasional mistakes (calls too much, doesn't bluff), win rate ~35-40% in balanced game

4. **Given** Medium bot plays, **When** making decisions, **Then** bot considers position (tight from early position, looser from late position), basic pot odds (calls if odds favorable), occasional bluffs, win rate ~45-50% in balanced game

5. **Given** Hard bot plays, **When** making decisions, **Then** bot uses advanced strategy (hand ranges, implied odds, bet sizing tells), bluffs strategically, adapts to player tendencies (tightens up against aggressive players), win rate ~55-60% in balanced game

6. **Given** bot observes my play, **When** I show patterns (e.g., always fold to raises), **Then** Medium/Hard bots adjust strategy (raise more against me), makes game feel dynamic

7. **Given** bot has no chips left, **When** bot is eliminated, **Then** bot is removed from game, remaining players continue, game tracks elimination order

---

### User Story 4 - Professional Poker Table UI (Priority: P1)

As a player, I want a visually appealing and intuitive poker table interface so I can focus on gameplay without confusion or visual clutter.

**Why this priority**: UI is the only interface to the game. Bad UI = frustrating experience = users leave. Must be professional quality for MVP. Mobile-first design ensures maximum accessibility.

**Independent Test**: Show interface to 5 poker players on mobile devices, ask them to identify all elements (pot, cards, actions), verify 100% understanding without explanation.

**Acceptance Scenarios**:

1. **Given** I view the game table on mobile, **When** interface loads, **Then** I see optimized poker table layout with green felt texture, player positions arranged for portrait/landscape viewing, clear dealer button indicator, community cards area in center, pot display prominently shown

2. **Given** I view player positions, **When** looking at each seat, **Then** each player shows avatar/icon, name, chip stack (e.g., "1,250"), current bet in round (if any), hole cards (face-down for opponents, face-up for me after dealt), dealer button next to dealer, SB/BB indicators during blind posting

3. **Given** hand is in progress, **When** actions occur, **Then** I see smooth animations optimized for mobile (60fps, cards dealing/sliding, chips moving to pot, pot amount updating with +animation, winning chips sliding to winner)

4. **Given** it's my turn on mobile, **When** I need to act, **Then** action buttons appear at bottom of screen in touch-friendly size (minimum 44x44px), countdown timer shows 30 seconds remaining with visual progress indicator, available actions clearly labeled with haptic feedback on tap

5. **Given** I select "Raise" on mobile, **When** raise interface appears, **Then** I see touch-optimized slider for raise amount, large quick-bet buttons (2x BB, Pot, All-In), min/max raise displayed, "Confirm" button with clear touch target (minimum 44x44px)

6. **Given** showdown occurs, **When** winner is determined, **Then** winning hand is highlighted with animation, hand rank displayed (e.g., "Full House, Kings over Tens"), chips slide to winner with celebration effect, winning cards briefly enlarged

7. **Given** I want to see recent actions, **When** I look at action log, **Then** I see scrollable history (e.g., "Mike raises to 40", "You call 40", "Sarah folds"), last 10 actions visible, auto-scrolls to newest, swipe gesture supported

8. **Given** game is responsive, **When** I change device orientation or screen size, **Then** table adapts seamlessly (portrait: vertical layout, landscape: horizontal layout), remains playable on all devices (mobile 375px+, tablet 768px+, desktop 1366px+), no overlapping elements, touch targets remain accessible

---

### User Story 5 - Game Settings and Customization (Priority: P2)

As a player, I want to customize game settings (bot difficulty, starting chips, animation speed) so I can tailor the experience to my preferences.

**Why this priority**: Customization enhances replayability and user satisfaction. Important for engagement but not blocking for MVP - can launch with defaults.

**Independent Test**: Access settings, modify each option, start new game, verify changes applied.

**Acceptance Scenarios**:

1. **Given** I open settings menu, **When** settings panel appears, **Then** I see options for: Bot Difficulty (Easy/Medium/Hard/Mixed), Number of Bots (1-8), Starting Chips (500/1000/2000/5000), Blind Levels ($5/$10, $10/$20, $25/$50), Animation Speed (Slow/Normal/Fast), Sound Effects (On/Off), Card Back Design (5 options)

2. **Given** I select "Mixed" bot difficulty, **When** I start new game, **Then** bots have varied difficulties (2 Easy, 2 Medium, 1 Hard), game stays challenging as I improve

3. **Given** I toggle animations to "Fast", **When** I play, **Then** card dealing and chip movements complete in half the normal time, game pace increases noticeably

4. **Given** I change starting chips to 5000, **When** I start new game, **Then** all players start with 5000 chips, blinds adjusted proportionally to maintain 50-100 BB starting stacks

5. **Given** I change card back design, **When** I return to game, **Then** opponent cards display new back design, my preference saved in browser localStorage

---

### User Story 6 - In-Game Statistics and Feedback (Priority: P2)

As a player, I want to see my current statistics and hand strength indicators so I can learn and improve my poker skills.

**Why this priority**: Statistics enhance engagement and learning. Valuable for player retention but game is playable without them. Can be added post-MVP.

**Independent Test**: Play 10 hands, view statistics, verify accuracy of tracked metrics.

**Acceptance Scenarios**:

1. **Given** I am playing, **When** I view my player panel, **Then** I see current session stats: Hands Played, Hands Won, Current Win Rate %, Total Chips Won/Lost, Biggest Pot Won

2. **Given** I receive hole cards, **When** I view my cards, **Then** I see subtle hand strength indicator (e.g., "Strong" for pocket aces, "Weak" for 7-2 offsuit, "Playable" for suited connectors), helps beginners understand starting hand quality

3. **Given** I'm in a hand, **When** I hover/tap on my cards, **Then** I see possible hand outcomes (e.g., "Pair of 8s - currently losing to visible pair of Kings"), educational tooltip without explicit odds

4. **Given** I complete a session, **When** I end game, **Then** I see summary screen with: Total Hands Played, Win Rate, Biggest Win/Loss, Hands Won by Hand Type (pie chart), "Play Again" and "Change Settings" buttons

---

### User Story 7 - Touch Controls, Gestures and Accessibility (Priority: P1)

As a mobile player, I want intuitive touch controls and gestures so I can play efficiently on my phone, with keyboard shortcuts available on desktop.

**Why this priority**: Mobile-first design requires excellent touch UX. Primary interaction method for most users. Accessibility ensures everyone can play.

**Independent Test**: Play game on mobile using only touch, verify all actions accessible with appropriate gestures. Test with screen reader on mobile and desktop.

**Acceptance Scenarios**:

1. **Given** it's my turn on mobile, **When** I tap action buttons, **Then** I feel haptic feedback, buttons respond immediately (<100ms), visual pressed state indicates action registered

2. **Given** I'm on desktop, **When** I press keyboard keys, **Then** shortcuts work: F = Fold, C = Call/Check, R = Raise (opens raise dialog), A = All-In, Enter = Confirm action, Escape = Cancel/Close dialogs

3. **Given** I use raise slider on mobile, **When** I drag the slider, **Then** slider responds smoothly to touch with large touch target (44x44px minimum), value updates in real-time, haptic feedback on milestone amounts

4. **Given** I use raise slider on desktop, **When** I press arrow keys, **Then** Up/Down arrows adjust raise amount by 1 BB, Left/Right arrows by 10% of pot, shortcuts shown in tooltip

5. **Given** I want to see action history, **When** I swipe up on action log, **Then** log scrolls smoothly with momentum, pull-to-refresh not triggered accidentally

6. **Given** I use screen reader on mobile/desktop, **When** I navigate interface, **Then** all elements have ARIA labels ("Your hole cards: Ace of Spades, King of Hearts", "Pot: 250 chips", "Sarah's turn, thinking..."), game state changes announced, touch targets clearly labeled

7. **Given** I enable color blind mode in settings, **When** I view cards, **Then** suits use patterns in addition to colors (hearts/diamonds have stripes, clubs/spades have dots), Red/Black distinction not required, patterns clear on small screens

---

### User Story 8 - Hand History and Replay (Priority: P3)

As a player, I want to review my recently played hands so I can analyze my decisions and learn from mistakes.

**Why this priority**: Educational value, helps improve skills. Valuable for serious players but not essential for casual play. Post-MVP feature.

**Independent Test**: Play 5 hands, open hand history, replay last hand, verify action sequence accurate.

**Acceptance Scenarios**:

1. **Given** I complete hands, **When** I open Hand History panel, **Then** I see list of last 20 hands with summary: Hand #, Winner, Pot Size, My Profit/Loss, My Hole Cards

2. **Given** I select a hand from history, **When** replay opens, **Then** I see action-by-action replay with timeline slider, can pause/play/speed up, see all actions in chronological order ("Preflop: You raise to 40, Mike calls, Sarah folds...")

3. **Given** I replay to showdown, **When** replay reaches end, **Then** I see all revealed cards, hand rankings, pot distribution, "What went wrong?" AI analysis suggests better play (e.g., "You could have folded on turn when pot odds didn't favor your flush draw")

---

### Edge Cases

- **What happens when timer expires during my turn?** System auto-checks if possible, otherwise auto-folds. Player sees "Timed Out" message. Timer duration configurable in settings (default 30s).

- **What happens when I try to bet more than I have?** System automatically constrains bet to my chip stack (all-in). Shows "Max: All-In" indicator. Cannot bet more than available chips.

- **What happens when I close browser mid-game?** Game state lost (no persistence by default). Optional: Save game state to localStorage, show "Resume Game" on launch. Default behavior: restart from scratch.

- **What happens when all bots are eliminated?** Game ends, player wins, victory screen shows congratulations, statistics summary, "Play Again" button.

- **What happens when two players have identical hands at showdown?** Pot split evenly. If odd chip (e.g., 101 chips split 2 ways), extra chip goes to player closest to dealer button clockwise. System shows "Split Pot" message.

- **What happens when dealer button reaches eliminated player's seat?** Dealer button skips eliminated seats, moves to next active player clockwise. System maintains correct position tracking.

- **What happens when bot has insufficient chips for blind?** Bot posts partial blind (all-in), side pot created automatically, bot remains in hand but cannot make further bets.

- **What happens when I press Raise but haven't set amount?** Raise button disabled until valid amount entered. Min raise amount pre-filled by default. "Confirm" button only enabled when valid amount selected.

- **What happens if I try to call with insufficient chips?** System automatically converts call to all-in. Shows "All-In (Short Call)" message. Side pot calculation handles partial call correctly.

- **What happens during heads-up play?** Special rules applied: dealer = small blind, other player = big blind, dealer acts first preflop (after posting SB) but last post-flop. System handles automatically.

---

## Requirements

### Functional Requirements

**Game Initialization & Setup**

- **FR-001**: System MUST allow player to start quick play game with 1-8 bot opponents (default 5 bots, 6 players total)
- **FR-002**: System MUST assign player to bottom-center seat for optimal viewing angle on all devices
- **FR-003**: System MUST assign each bot a unique name and avatar from predefined list
- **FR-004**: System MUST initialize all players with starting chips (configurable: 500/1000/2000/5000, default 1000)
- **FR-005**: System MUST randomly assign initial dealer button to a player
- **FR-006**: System MUST begin first hand automatically within 2 seconds of game start

**Blind Posting & Hand Start**

- **FR-007**: System MUST post small blind from player left of dealer before dealing cards
- **FR-008**: System MUST post big blind from player left of small blind
- **FR-009**: System MUST handle heads-up special rules (dealer = SB, opponent = BB)
- **FR-010**: System MUST handle insufficient chips for blind (player posts partial blind, goes all-in)
- **FR-011**: System MUST deal 2 hole cards face-down to each active player
- **FR-012**: System MUST show player's hole cards face-up to player only
- **FR-013**: System MUST keep opponent hole cards face-down until showdown
- **FR-014**: System MUST start preflop betting with player left of big blind (Under The Gun)

**Betting Actions & Validation**

- **FR-015**: System MUST allow player to fold (give up hand, lose all bets in pot)
- **FR-016**: System MUST allow player to check when no bet exists in current round
- **FR-017**: System MUST allow player to call by matching current highest bet
- **FR-018**: System MUST allow player to bet/raise by increasing current bet
- **FR-019**: System MUST allow player to go all-in by betting all remaining chips
- **FR-020**: System MUST validate minimum raise is at least double previous bet (or double big blind if first raise)
- **FR-021**: System MUST prevent raises below minimum unless player goes all-in with insufficient chips
- **FR-022**: System MUST enforce 30-second action timer per player turn (configurable in settings)
- **FR-023**: System MUST auto-check if timer expires and check is valid action
- **FR-024**: System MUST auto-fold if timer expires and check is not valid
- **FR-025**: System MUST display countdown timer with visual progress indicator during player turn
- **FR-026**: System MUST disable invalid action buttons (e.g., cannot check if bet exists)

**Betting Round Progression**

- **FR-027**: System MUST complete betting round when all active players have acted and bets are equal
- **FR-028**: System MUST complete betting round immediately when only 1 player remains active (all others folded)
- **FR-029**: System MUST burn 1 card before dealing flop (3 community cards)
- **FR-030**: System MUST deal 3 community cards face-up for flop
- **FR-031**: System MUST start flop betting with first active player left of dealer
- **FR-032**: System MUST burn 1 card before dealing turn (4th community card)
- **FR-033**: System MUST deal 1 turn card face-up
- **FR-034**: System MUST start turn betting with first active player left of dealer
- **FR-035**: System MUST burn 1 card before dealing river (5th community card)
- **FR-036**: System MUST deal 1 river card face-up
- **FR-037**: System MUST start river betting with first active player left of dealer
- **FR-038**: System MUST skip betting round if all active players are all-in

**Pot Calculation & Side Pots**

- **FR-039**: System MUST calculate total pot as sum of all player bets
- **FR-040**: System MUST create main pot when player goes all-in with less than highest bet
- **FR-041**: System MUST create side pots for each distinct all-in amount with multiple all-ins
- **FR-042**: System MUST track eligible players for each pot (players who contributed to that pot)
- **FR-043**: System MUST distribute odd chips (indivisible amounts) to player closest to dealer button clockwise
- **FR-044**: System MUST show pot breakdown visually (main pot + side pots) during hand
- **FR-045**: System MUST award each pot to winner eligible for that pot at showdown

**Hand Evaluation & Showdown**

- **FR-046**: System MUST evaluate each player's best 5-card hand from 7 cards (2 hole + 5 community)
- **FR-047**: System MUST correctly rank hands using standard poker hand rankings:
  1. Royal Flush (A-K-Q-J-10 same suit)
  2. Straight Flush (5 consecutive cards same suit)
  3. Four of a Kind (4 cards same rank)
  4. Full House (3 of a kind + pair)
  5. Flush (5 cards same suit, not consecutive)
  6. Straight (5 consecutive cards, mixed suits)
  7. Three of a Kind (3 cards same rank)
  8. Two Pair (2 different pairs)
  9. One Pair (2 cards same rank)
  10. High Card (no combination)
- **FR-048**: System MUST use correct tie-breakers (kickers, highest cards) when hands are equal rank
- **FR-049**: System MUST split pots evenly among tied players at showdown
- **FR-050**: System MUST reveal hole cards at showdown starting with last aggressor, then clockwise
- **FR-051**: System MUST allow losing players to muck cards (not show) if not all-in
- **FR-052**: System MUST force all-in players to show cards at showdown
- **FR-053**: System MUST display winning hand rank and description (e.g., "Straight, King high")
- **FR-054**: System MUST award pot(s) to winner(s) and update chip stacks immediately

**Hand Completion & Next Hand**

- **FR-055**: System MUST remove players with zero chips from game (eliminated)
- **FR-056**: System MUST rotate dealer button clockwise to next active player
- **FR-057**: System MUST start next hand automatically after 3-second delay (configurable)
- **FR-058**: System MUST end game when only 1 player remains with chips (victory)
- **FR-059**: System MUST end game when player runs out of chips (player eliminated)
- **FR-060**: System MUST show game-over screen with session statistics on game end

**Bot AI & Decision Making**

- **FR-061**: System MUST implement Easy bot difficulty:
  - Folds weak hands (< 20% preflop equity)
  - Calls/raises strong hands (pairs, A-K, A-Q)
  - Rarely bluffs (~10% of time)
  - No position awareness
  - Realistic thinking time (500ms-2000ms)
  - Target win rate: 35-40% in balanced game

- **FR-062**: System MUST implement Medium bot difficulty:
  - Position-aware (tight early position, loose late position)
  - Basic pot odds consideration (calls if odds > 33% equity)
  - Occasional bluffs (~25% of time in position)
  - Hand range awareness (recognizes opponent strength patterns)
  - Realistic thinking time (1000ms-3000ms)
  - Target win rate: 45-50% in balanced game

- **FR-063**: System MUST implement Hard bot difficulty:
  - Advanced hand range analysis (narrows opponent range by actions)
  - Implied odds calculation (considers future bets)
  - Strategic bluffing (bluffs on scary boards, fold to re-raises)
  - Adaptive play (exploits player tendencies)
  - Bet sizing tells (varies bet sizes for deception)
  - Realistic thinking time (1500ms-3500ms)
  - Target win rate: 55-60% in balanced game

- **FR-064**: System MUST assign each bot a personality trait (tight/loose, aggressive/passive)
- **FR-065**: System MUST display bot "thinking" indicator during decision time
- **FR-066**: System MUST prevent bots from seeing hole cards of opponents (no cheating)

**User Interface & Visual Feedback**

- **FR-067**: System MUST display poker table as elliptical shape with green felt texture
- **FR-068**: System MUST arrange player positions around table (6-9 seats)
- **FR-069**: System MUST display each player's: avatar, name, chip stack, current bet, hole cards (face-up for player, face-down for opponents)
- **FR-070**: System MUST display dealer button next to current dealer
- **FR-071**: System MUST display small blind and big blind indicators during blind posting
- **FR-072**: System MUST display community cards in center of table
- **FR-073**: System MUST display pot amount prominently with chip icons
- **FR-074**: System MUST display action buttons (Fold, Check/Call, Raise) clearly during player turn
- **FR-075**: System MUST display raise amount selector with slider and quick-bet buttons
- **FR-076**: System MUST display countdown timer with visual progress during player turn
- **FR-077**: System MUST display action log showing recent actions (last 10 actions)

**Animations & Visual Effects**

- **FR-078**: System MUST animate card dealing (cards slide from deck to players)
- **FR-079**: System MUST animate chip movements (chips slide to pot when bet)
- **FR-080**: System MUST animate pot amount increase (number changes with scale effect)
- **FR-081**: System MUST animate winner celebration (highlight winning hand, chips slide to winner)
- **FR-082**: System MUST maintain 60fps animation performance on mobile and desktop
- **FR-083**: System MUST allow disabling animations in settings
- **FR-084**: System MUST provide fast animation mode (2x speed)

**Mobile & Touch Requirements**

- **FR-085**: System MUST support touch input as primary interaction method
- **FR-086**: System MUST provide haptic feedback on button taps (if device supports)
- **FR-087**: System MUST ensure all interactive elements meet minimum touch target size (44x44px iOS, 48x48px Android)
- **FR-088**: System MUST prevent accidental actions (require confirmation for Fold, All-In)
- **FR-089**: System MUST support pinch-to-zoom on cards for better visibility
- **FR-090**: System MUST support both portrait and landscape orientations
- **FR-091**: System MUST adapt layout automatically on orientation change without data loss
- **FR-092**: System MUST support swipe gestures (swipe up for action history, swipe down to dismiss modals)
- **FR-093**: System MUST prevent page scrolling/zooming during gameplay (viewport locked)
- **FR-094**: System MUST work in fullscreen mode on mobile browsers
- **FR-095**: System MUST support iOS Safari, Chrome Mobile, Firefox Mobile, Samsung Internet
- **FR-096**: System MUST handle mobile-specific events (orientation change, app backgrounding, network loss)
- **FR-097**: System MUST optimize asset loading for mobile networks (progressive loading, lazy loading)
- **FR-098**: System MUST cache assets for offline play after first load (Service Worker)

**Settings & Customization**

- **FR-099**: System MUST allow configuring number of bots (1-8, default 5)
- **FR-100**: System MUST allow configuring bot difficulty (Easy/Medium/Hard/Mixed, default Mixed)
- **FR-101**: System MUST allow configuring starting chips (500/1000/2000/5000, default 1000)
- **FR-102**: System MUST allow configuring blind levels ($5/$10, $10/$20, $25/$50, default $10/$20)
- **FR-103**: System MUST allow configuring action timer duration (15s/30s/60s/Off, default 30s)
- **FR-104**: System MUST allow configuring animation speed (Slow/Normal/Fast/Off, default Normal)
- **FR-105**: System MUST allow enabling/disabling sound effects (default On)
- **FR-106**: System MUST allow selecting card back design (5 options, default blue)
- **FR-107**: System MUST save settings to browser localStorage (persists across sessions)
- **FR-108**: System MUST apply setting changes immediately or on next game start

**Statistics & Tracking**

- **FR-109**: System MUST track current session statistics:
  - Hands played
  - Hands won
  - Win rate percentage
  - Total chips won/lost
  - Biggest pot won
  - Current chip stack
- **FR-110**: System MUST display current session stats on player panel
- **FR-111**: System MUST display session summary on game end screen
- **FR-112**: System MUST save session statistics to localStorage by default (can be disabled in settings)

**Accessibility & User Experience**

- **FR-113**: System MUST support keyboard shortcuts on desktop for all actions:
  - F = Fold
  - C = Call/Check
  - R = Raise (open raise dialog)
  - A = All-In
  - Enter = Confirm action
  - Escape = Cancel/Close
- **FR-114**: System MUST provide ARIA labels for screen readers on all interactive elements
- **FR-115**: System MUST announce game state changes to screen readers ("Your turn", "Flop dealt", "You won 250 chips")
- **FR-116**: System MUST support color blind mode with patterned card suits
- **FR-117**: System MUST remain playable on all screen sizes (mobile 375px+, tablet 768px+, desktop 1366px+)
- **FR-118**: System MUST scale interface responsively when window resized or device rotated
- **FR-119**: System MUST show tooltips on hover (desktop) and long-press (mobile) explaining game elements
- **FR-120**: System MUST meet WCAG 2.1 Level AA compliance standards for accessibility

**Error Handling & Edge Cases**

- **FR-121**: System MUST handle browser refresh/close gracefully (show confirmation if game active)
- **FR-122**: System MUST validate all player inputs (bet amounts, raise amounts)
- **FR-123**: System MUST prevent invalid actions (cannot check when bet exists, cannot raise below minimum)
- **FR-124**: System MUST handle insufficient chips scenarios (auto-convert to all-in)
- **FR-125**: System MUST handle side pot calculations with 4+ all-ins correctly
- **FR-126**: System MUST handle tie scenarios at showdown (split pots, odd chip distribution)
- **FR-127**: System MUST handle heads-up special rules automatically
- **FR-128**: System MUST skip eliminated players when rotating dealer button
- **FR-129**: System MUST log errors to browser console for debugging
- **FR-130**: System MUST display user-friendly error messages (no technical jargon)

---

## Technical Dependencies

### Core Libraries

- **Hand Evaluator**: pokersolver (https://github.com/goldfire/pokersolver)
  - Battle-tested: 2,700+ weekly downloads, 1,100+ repos using it
  - TypeScript types available (@types/pokersolver)
  - Zero dependencies, production-ready
  - Simple synchronous API
  - Why: Stable, reliable, widely adopted, simple API, production-proven

### Framework & Build Tools

- **Frontend Framework**: React 18.2+ with TypeScript 5.x (strict mode)
- **State Management**: Zustand 4.x with persist middleware
- **Build Tool**: Vite 5.x (fast HMR, optimized builds)
- **Styling**: Tailwind CSS 3.x for utility-first responsive design
- **Icons**: Lucide React (tree-shakeable, 1000+ icons)
- **Testing**: Jest 29.x + React Testing Library
- **Localization**: react-i18next

### Mobile Optimization

- **Service Worker**: Workbox for offline caching and PWA support
- **Touch Gestures**: Native browser touch events with Hammer.js fallback
- **Viewport**: Mobile-optimized viewport meta tags
- **Performance**: Lighthouse CI for performance monitoring

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Player can start a game on mobile and complete first hand within 30 seconds of tapping "Quick Play"
- **SC-002**: 100% of poker rules implemented correctly (verified by comprehensive test suite with 200+ test cases)
- **SC-003**: Medium bots win 45-50% of hands against Easy bots in 1000-hand simulation (validates AI balance)
- **SC-004**: Animations maintain 60fps on mobile devices (verified on iPhone 12+, Samsung Galaxy S20+) and desktop
- **SC-005**: Touch action processing (tap to UI update) completes in <100ms (95th percentile)
- **SC-006**: Side pot calculations are 100% accurate in multi-player all-in scenarios (verified by 50 edge case tests)
- **SC-007**: Interface is understandable to 95%+ of new mobile players without tutorial (measured by playtesting with 20 users)
- **SC-008**: Zero game-breaking bugs or incorrect poker rules (verified by regression test suite)
- **SC-009**: Game remains playable on all screen sizes (mobile 375px+, tablet 768px+, desktop 1366px+) with no UI overlap
- **SC-010**: Settings changes apply correctly 100% of time (verified by 30 settings test cases)
- **SC-011**: Touch targets meet minimum size requirements (44x44px iOS, 48x48px Android) with 100% compliance
- **SC-012**: Test coverage ≥80% for game logic, ≥60% for UI components
- **SC-013**: Build size <2MB for optimized production bundle, <500KB initial load (code-splitting + lazy loading)
- **SC-014**: Time from game start to first hand dealt is <2 seconds on mobile (including animations)
- **SC-015**: Average player session length >15 minutes on mobile (measured in playtesting with 50+ users)
- **SC-016**: PWA installable on iOS and Android devices
- **SC-017**: Lighthouse Performance score ≥90, Accessibility score ≥95
- **SC-018**: First Contentful Paint <1 second, Time to Interactive <3 seconds on 3G networks

---

## Assumptions & Constraints

### Assumptions

- Players have basic understanding of Texas Hold'em rules (game provides visual hints but not comprehensive tutorial)
- Players use modern mobile browsers (iOS Safari 14+, Chrome Mobile 90+, Firefox Mobile 90+, Samsung Internet 14+) or desktop browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+)
- Players have smartphones (iOS 12+, Android 8+), tablets, or desktop/laptop computers
- Players have JavaScript enabled (game is pure client-side JavaScript/TypeScript)
- Players accept that game state is not saved across browser sessions by default (settings and stats are saved)
- Players are comfortable with English language for MVP (localization for other languages post-MVP)
- Players have touch input (primary) or mouse/trackpad (secondary) for interactions
- Mobile players have reasonable network connectivity (3G or better for initial load, playable offline after first load)

### Constraints

- **No Backend**: All game logic runs client-side in browser (no server, no database, no API calls)
- **No Multiplayer**: Single-player only, no online/local multiplayer (network code out of scope)
- **No Cloud Persistence**: Game state lost on browser close, settings/stats saved to localStorage only (no cloud saves)
- **Single Game Mode**: Cash game only, no tournaments, no sit-and-go (simplified scope for MVP)
- **Fixed Table Size**: 6-9 players maximum (2-9 player support, but optimal experience at 6)
- **No Real Money**: Play money only, no integration with payment systems or cryptocurrency
- **Mobile-First**: Optimized for mobile devices first, then tablets and desktop
- **English Only**: UI text in English, localization infrastructure ready but translations post-MVP
- **Modern Browsers**: Requires ES2020+ features, no Internet Explorer support
- **Network**: Requires initial network connection to load app, then playable offline (PWA)

---

## Out of Scope (Post-MVP)

The following features are explicitly EXCLUDED from initial release:

**Gameplay Variants**
- Tournament mode (structured blinds, elimination format)
- Sit-and-go format
- Other poker variants (Omaha, 7-Card Stud, Razz, etc.)
- Multi-table gameplay
- Fast-fold poker

**Multiplayer Features**
- Online multiplayer (requires backend infrastructure)
- Local multiplayer (hot-seat mode)
- Friend invitations
- Spectator mode
- Chat system

**Progression & Monetization**
- User accounts and profiles (persistent across devices)
- Achievements and unlockables
- Leaderboards
- Real money or cryptocurrency integration
- In-app purchases or microtransactions
- Subscription model

**Advanced Features**
- Hand replayer with analysis
- Detailed statistics dashboard (VPIP, PFR, aggression factor, etc.)
- Hand range calculator
- Equity calculator
- Note-taking on opponents
- Hand history export (CSV, JSON)

**Platform Expansion**
- Native mobile apps (iOS, Android) - PWA is MVP
- VR poker table
- Smart TV apps
- Desktop apps (Electron)

**Social Features**
- User profiles
- Friend system
- Private tables
- Chat rooms
- Emotes and reactions

These may be considered for future versions but are not part of the standalone game MVP. Focus is on delivering a polished, complete, single-player poker experience.

---

**Specification Version**: 2.0 (Mobile-First)
**Last Updated**: 2025-11-18
**Status**: Active - Ready for implementation
**Target Platforms**: Mobile (iOS/Android), Tablet, Desktop
**Hand Evaluator**: pokersolver (battle-tested, 2,700+ weekly downloads)
