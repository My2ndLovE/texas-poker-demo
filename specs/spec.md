# Feature Specification: Mobile-First Texas Hold'em Poker Game

**Project**: Standalone Poker Game (Mobile-First)
**Created**: 2025-11-18
**Updated**: 2025-11-18 (Mobile-First Rewrite)
**Status**: Active
**Type**: Single-player poker game with bot opponents (no backend, no database)
**Primary Platform**: Mobile devices (iOS, Android)
**Secondary Platform**: Desktop/Tablet

---

## Project Overview

Build a production-quality, mobile-first Texas Hold'em poker game playable entirely in the browser on smartphones. Players compete against intelligent bot opponents in a touch-optimized interface with complete poker rules, smooth animations, and professional mobile gameplay experience. Supports both portrait and landscape orientations. No server, no database, no multiplayer - pure client-side single-player entertainment.

**Target Devices**:
- **Primary**: iPhone SE (375x667), iPhone 12/13/14 (390-393x844), Android (360-428x800)
- **Secondary**: Tablets (768x1024+), Desktop (1024x768+)

**Key Mobile Features**:
- Touch-first interactions (tap, swipe, long-press)
- Portrait AND landscape layouts
- Offline PWA (installable, works without internet)
- Optimized for 4G bandwidth (<500KB initial load)
- Battery-efficient animations

---

## User Scenarios & Testing

### User Story 1 - Quick Play Mode (Priority: P1)

As a mobile player, I want to quickly start a poker game against bots with one tap so I can play poker anywhere, anytime.

**Why this priority**: Core value proposition. Mobile users want instant gameplay without registration, configuration, or waiting. This is the minimum viable product - everything else is enhancement.

**Independent Test**: Launch app on iPhone, tap "Quick Play", verify game starts with bots and I can play a complete hand using only touch.

**Acceptance Scenarios**:

1. **Given** I launch the app for the first time on my phone, **When** I tap "Quick Play" on the main menu, **Then** a new game starts with me and 3-5 bot opponents (4-6 players total), I receive starting chips (1000), and first hand begins automatically within 2 seconds

2. **Given** I am in quick play mode, **When** I complete a hand, **Then** next hand starts automatically after 3-second delay, dealer button rotates clockwise, and blinds are posted from correct positions

3. **Given** I want to restart, **When** I tap "New Game" during active play, **Then** I see confirmation bottom sheet, and confirming resets game with fresh 1000 chips for all players

4. **Given** I run out of chips, **When** I lose all chips, **Then** game ends, I see my statistics (hands played, win rate) in bottom sheet, and "Play Again" button resets everything

5. **Given** I rotate my device, **When** orientation changes from portrait to landscape (or vice versa), **Then** game layout smoothly transitions, game state is preserved, and my turn timer pauses during rotation

---

### User Story 2 - Complete Texas Hold'em Rules (Priority: P1)

As a player, I want to play Texas Hold'em with ALL correct poker rules so the game feels authentic and educational.

**Why this priority**: Incomplete rules break the poker experience. Players expect authentic gameplay. Core requirement for credibility - cannot launch without complete rules.

**Independent Test**: Play multiple scenarios (all-in, side pots, ties, showdown) on mobile device and verify all poker rules are correctly implemented.

**Acceptance Scenarios**:

1. **Given** hand starts, **When** dealing begins, **Then** small blind and big blind are auto-posted from correct positions (player left of dealer = SB, next player = BB), 2 hole cards dealt to each player face-down, and action starts with player left of big blind (Under The Gun)

2. **Given** it's my turn on mobile, **When** I view available actions, **Then** I see touch-optimized buttons (minimum 48px height) for valid options: Fold (always available), Check (if no bet), Call (to match bet), Raise (with minimum raise enforced), All-In (with all my chips)

3. **Given** I raise, **When** I use touch slider to select amount, **Then** system validates minimum raise is at least double the previous bet, prevents raises below minimum (unless all-in), and updates pot immediately with animation

4. **Given** preflop betting completes, **When** all players acted, **Then** 1 card is burned (discarded), 3 community cards (flop) are dealt face-up with staggered animation, new betting round begins with first active player left of dealer

5. **Given** flop betting completes, **When** all acted, **Then** 1 card burned, 1 turn card dealt, turn betting round begins

6. **Given** turn betting completes, **When** all acted, **Then** 1 card burned, 1 river card dealt, final betting round begins

7. **Given** multiple players all-in with different amounts, **When** hand completes, **Then** system calculates main pot and side pots correctly, each player can only win pot they contributed to, odd chips go to player in earlier position relative to last aggressor

8. **Given** river betting completes with 2+ players remaining, **When** showdown occurs, **Then** players reveal cards in order (last aggressor shows first, if no aggressor then first player left of button), best 5-card hand from 7 cards wins, ties split pot evenly

9. **Given** hand evaluation at showdown, **When** comparing hands, **Then** system correctly ranks all 10 hand types (Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card), uses correct tie-breakers (kickers, highest cards)

10. **Given** betting round in progress, **When** only 1 player remains (others folded), **Then** remaining player wins immediately without showdown, cards not revealed, pot awarded, next hand begins

11. **Given** player has insufficient chips for full blind, **When** blinds are due, **Then** player posts partial blind (all-in), remains in hand but cannot bet further, side pots calculated accordingly

12. **Given** heads-up (2 players), **When** hand starts, **Then** dealer is small blind (button = SB), other player is big blind, dealer acts first preflop but last post-flop (special heads-up rules)

13. **Given** game state saved after each hand, **When** I close browser and return later, **Then** I can resume from start of next hand with same chip stacks and dealer position

14. **Given** blind levels set to increase, **When** X hands have been played, **Then** blinds automatically increase to next level (e.g., $10/$20 → $25/$50), players notified with toast message

---

### User Story 3 - Intelligent Bot Opponents (Priority: P1)

As a player, I want to play against bots that make realistic decisions so the game feels challenging and engaging, not predictable or boring. Bot personalities should persist across games.

**Why this priority**: Single-player game lives or dies by AI quality. Bad AI = boring game = users leave. Core differentiator for standalone poker game.

**Independent Test**: Play 20 hands against each bot difficulty level on mobile, observe decision patterns, verify bots play believably and at appropriate skill levels.

**Acceptance Scenarios**:

1. **Given** I start quick play, **When** game begins, **Then** I see 3-5 bot opponents with distinct names (e.g., "Sarah", "Mike", "Chen", "Nina", "Alex") and avatar icons, each bot assigned personality type (tight/loose, aggressive/passive) that persists across all games

2. **Given** bot's turn during preflop, **When** bot evaluates action, **Then** bot considers hole cards strength, position at table, pot size, and decides within realistic time (500ms-3000ms delay to simulate thinking)

3. **Given** Easy bot plays, **When** making decisions, **Then** bot uses simple rules (fold weak hands like 7-2, call/raise strong hands like pairs, face cards), makes occasional mistakes (calls too much, doesn't bluff), win rate varies in mixed games

4. **Given** Medium bot plays, **When** making decisions, **Then** bot considers position (tight from early position, looser from late position), basic pot odds (calls if odds favorable), occasional bluffs, win rate varies in mixed games

5. **Given** Hard bot plays, **When** making decisions, **Then** bot uses advanced strategy (hand ranges, implied odds, bet sizing tells), bluffs strategically, adapts to player tendencies (tightens up against aggressive players), win rate varies in mixed games

6. **Given** bot observes my play, **When** I show patterns (e.g., always fold to raises), **Then** Medium/Hard bots adjust strategy (raise more against me), makes game feel dynamic

7. **Given** bot has no chips left, **When** bot is eliminated, **Then** bot is removed from game, remaining players continue, game tracks elimination order

8. **Given** I play multiple games, **When** I encounter bot "Sarah" again, **Then** Sarah exhibits same personality traits (e.g., tight-aggressive) as previous games

---

### User Story 4 - Mobile-Optimized Poker Table UI (Priority: P1)

As a mobile player, I want a touch-optimized poker interface that works perfectly in both portrait and landscape so I can play comfortably in any orientation.

**Why this priority**: Mobile UI is the only interface to the game. Bad mobile UX = frustrating experience = users leave. Must be mobile-native quality for MVP.

**Independent Test**: Show interface to 5 poker players on mobile devices, ask them to play 3 hands in portrait and landscape, verify 100% understanding and comfortable touch interactions.

**Acceptance Scenarios**:

**Portrait Mode (Primary)**:

1. **Given** I view game in portrait mode, **When** interface loads, **Then** I see my player area at bottom (cards, chips, name), community cards in center, opponent players stacked vertically above, dealer button indicator, pot display prominently in center-top

2. **Given** I view my player area (portrait), **When** looking at my position, **Then** I see my 2 hole cards (large, readable), chip stack (e.g., "1,250"), current bet (if any), and action buttons anchored to bottom of screen within thumb reach

3. **Given** it's my turn (portrait), **When** I need to act, **Then** action buttons appear at bottom: "Fold" (red, left), "Call/Check" (blue, center), "Raise" (green, right), all minimum 48px height, with 20-second countdown timer above buttons

4. **Given** I select "Raise" (portrait), **When** raise interface appears, **Then** I see large touch-optimized slider (60px touch target), quick-bet buttons (2x BB, Pot, All-In) as large chips, min/max raise displayed clearly, "Confirm" button (green, 56px height) to execute

5. **Given** I view community cards (portrait), **When** flop/turn/river are dealt, **Then** cards appear in horizontal center, sized appropriately for mobile screen (50-60px width), with smooth dealing animation

6. **Given** I view opponents (portrait), **When** looking at other players, **Then** I see 2-3 opponents visible at once in vertical stack, each showing: small avatar (40px), name, chip stack, current bet, cards (face-down, small), dealer button if applicable. If >3 opponents, I can scroll/swipe to see others

**Landscape Mode (Secondary)**:

7. **Given** I rotate to landscape mode, **When** interface adjusts, **Then** I see traditional poker table layout with elliptical table, players arranged around table (my position at bottom), community cards in center, action buttons at bottom-right within thumb reach

8. **Given** it's my turn (landscape), **When** I need to act, **Then** action buttons appear at bottom-right corner: "Fold", "Call/Check", "Raise" arranged horizontally, minimum 44px height each, with timer displayed top-right

9. **Given** I view poker table (landscape), **When** looking at layout, **Then** I see up to 6 player positions around elliptical table, green felt texture background, all players visible simultaneously (no scrolling), dealer button rotates around table

**Universal (Both Orientations)**:

10. **Given** hand is in progress, **When** actions occur, **Then** I see touch-responsive animations (cards dealing/sliding, chips moving to pot with haptic feedback if supported, pot amount updating with +animation, winning chips sliding to winner)

11. **Given** I tap any action button, **When** button pressed, **Then** I see immediate visual feedback (button scales down 95%, background darkens), haptic feedback (vibration if supported), action processes within 100ms

12. **Given** showdown occurs, **When** winner is determined, **Then** winning hand is highlighted with animation, hand rank displayed in large text (e.g., "Full House"), chips slide to winner with celebration effect, winning cards briefly enlarged, bottom sheet shows hand breakdown

13. **Given** I want to see recent actions, **When** I swipe up from bottom (or tap history icon), **Then** action log slides up as bottom sheet showing last 10 actions (e.g., "Mike raises to 40", "You call 40"), dismissible by swiping down

14. **Given** game is responsive, **When** I use on different phones, **Then** layout adapts to screen sizes (iPhone SE 375px to iPhone 14 Pro Max 428px), maintains aspect ratio, no overlapping elements, all text readable without zooming

15. **Given** I interact with UI, **When** I tap cards/buttons, **Then** touch targets are minimum 44x44px (iOS) or 48x48dp (Android), spacing between buttons is 8px minimum to prevent mis-taps

---

### User Story 5 - Touch Gestures for Quick Actions (Priority: P1)

As a mobile player, I want intuitive touch gestures so I can make decisions faster than tapping buttons.

**Why this priority**: Gestures are natural on mobile and speed up gameplay. Power users appreciate shortcuts. Core mobile UX pattern.

**Independent Test**: Play 10 hands using only gestures (no action buttons), verify all actions accessible and gesture recognition accurate.

**Acceptance Scenarios**:

1. **Given** it's my turn, **When** I swipe left on my cards or action area, **Then** I fold immediately with subtle animation and haptic feedback

2. **Given** it's my turn and I can check, **When** I tap table/community cards area, **Then** I check immediately with table tap sound effect

3. **Given** it's my turn and I need to call, **When** I tap my card area once, **Then** I call the current bet immediately with chip animation

4. **Given** it's my turn, **When** I swipe up on my cards, **Then** raise slider appears as bottom sheet with large touch targets

5. **Given** raise slider is open, **When** I swipe up again quickly, **Then** I go all-in with confirmation dialog (prevent accidental all-ins)

6. **Given** it's my turn, **When** I long-press (500ms) on action area, **Then** action menu appears showing all options with descriptions, dismissible by tapping outside

7. **Given** I want to view my odds, **When** I double-tap my hole cards, **Then** hand strength indicator appears (e.g., "Strong hand", "Weak hand") with percentage

8. **Given** game is in progress, **When** I pinch-zoom on community cards, **Then** cards enlarge for better visibility (accessibility feature)

9. **Given** multiple opponents visible, **When** I swipe left/right on opponent area, **Then** opponent carousel scrolls to show hidden players (if >3 opponents in portrait mode)

10. **Given** I accidentally start a gesture, **When** I cancel by reversing direction, **Then** gesture is cancelled and no action taken

---

### User Story 6 - Game Settings and Customization (Priority: P2)

As a player, I want to customize game settings (bot difficulty, starting chips, animation speed) via mobile-optimized controls so I can tailor the experience to my preferences.

**Why this priority**: Customization enhances replayability and user satisfaction. Important for engagement but not blocking for MVP - can launch with defaults.

**Independent Test**: Access settings, modify each option using touch controls, start new game, verify changes applied.

**Acceptance Scenarios**:

1. **Given** I open settings menu (via hamburger icon), **When** settings bottom sheet slides up, **Then** I see mobile-optimized controls: Bot Difficulty (segmented control: Easy/Medium/Hard/Mixed), Number of Bots (stepper: 2-8), Starting Chips (dropdown: 500/1000/2000/5000), Blind Levels (dropdown: $5/$10, $10/$20, $25/$50), Blind Increases (toggle + frequency selector), Animation Speed (segmented control: Off/Fast/Normal/Slow), Sound Effects (toggle), Haptic Feedback (toggle), Card Back Design (horizontal scrollable image selector with 5 options), Player Name (text input with on-screen keyboard)

2. **Given** I select "Mixed" bot difficulty, **When** I start new game, **Then** bots have varied difficulties (1 Easy, 2 Medium, 1 Hard), game stays challenging as I improve

3. **Given** I toggle animations to "Fast", **When** I play, **Then** card dealing and chip movements complete in half the normal time, game pace increases noticeably

4. **Given** I change starting chips to 5000, **When** I start new game, **Then** all players start with 5000 chips, blinds adjusted proportionally to maintain 50-100 BB starting stacks

5. **Given** I enable blind increases, **When** I set frequency to "every 10 hands", **Then** blinds increase after 10 hands ($10/$20 → $25/$50 → $50/$100), toast notification shows "Blinds increased to $25/$50"

6. **Given** I change card back design, **When** I scroll through carousel and tap a design, **Then** preview shows selected back, opponent cards display new back design in game, preference saved in localStorage

7. **Given** I change player name, **When** I tap name field and type using on-screen keyboard, **Then** my display name updates in game (max 12 characters), saved for future sessions

8. **Given** I toggle haptic feedback on (iOS/Android), **When** I perform actions, **Then** device vibrates subtly (light impact for button taps, medium impact for card dealing, heavy impact for winning pot)

9. **Given** settings sheet is open, **When** I swipe down or tap outside, **Then** sheet dismisses and returns to game/menu

---

### User Story 7 - In-Game Statistics and Feedback (Priority: P2)

As a player, I want to see my current statistics and hand strength indicators so I can learn and improve my poker skills.

**Why this priority**: Statistics enhance engagement and learning. Valuable for player retention but game is playable without them. Can be added post-MVP.

**Independent Test**: Play 10 hands, view statistics via bottom sheet, verify accuracy of tracked metrics.

**Acceptance Scenarios**:

1. **Given** I am playing, **When** I tap stats icon (top-right), **Then** stats bottom sheet slides up showing current session: Hands Played, Hands Won, Current Win Rate %, Total Chips Won/Lost, Biggest Pot Won, Play Time

2. **Given** I receive hole cards, **When** I double-tap my cards, **Then** I see hand strength indicator badge (e.g., "Very Strong" for pocket aces with green color, "Weak" for 7-2 offsuit with red color, "Playable" for suited connectors with yellow), indicator auto-hides after 2 seconds

3. **Given** I'm in a hand, **When** I long-press on my cards, **Then** I see tooltip showing possible outcomes (e.g., "Pair of 8s - Weak against visible betting pattern"), educational without explicit odds

4. **Given** I complete a session, **When** I end game or run out of chips, **Then** I see summary screen as full-page overlay with: Total Hands Played, Win Rate %, Biggest Win/Loss, Hands Won by Hand Type (simple bar chart optimized for mobile), "Play Again" button (primary), "Change Settings" button (secondary), "Share Results" button (triggers mobile share sheet)

5. **Given** summary screen is visible, **When** I tap "Share Results", **Then** native mobile share sheet appears with text: "I just played 23 hands of poker and won 15! 💰 [app link]", shareable to social media, messaging apps

---

### User Story 8 - Accessibility for Mobile Users (Priority: P2)

As a player with accessibility needs, I want screen reader support, larger text options, and color blind modes so I can play comfortably on mobile.

**Why this priority**: Inclusive design is essential. Many mobile users rely on accessibility features. Demonstrates quality and care.

**Independent Test**: Test with iOS VoiceOver and Android TalkBack, verify all elements accessible, adjust text size in iOS settings, verify layout adapts.

**Acceptance Scenarios**:

1. **Given** I use iOS VoiceOver or Android TalkBack, **When** I navigate interface with swipe gestures, **Then** all elements have descriptive labels ("Your hole cards: Ace of Spades, King of Hearts", "Pot: 250 chips", "Sarah's turn, thinking...", "Call button, costs 40 chips"), game state changes are announced

2. **Given** I enable color blind mode (Deuteranopia) in settings, **When** I view cards and chips, **Then** suits use distinct patterns in addition to colors: hearts have dots, diamonds have stripes, clubs have squares, spades are solid. Chip colors use patterns: white chips have no pattern, red chips have diagonal lines, green chips have checkered pattern

3. **Given** I increase text size in device settings (iOS Dynamic Type, Android Font Scale), **When** I open game, **Then** all text scales proportionally (chip stacks, player names, hand descriptions, buttons), layout adjusts to accommodate larger text without truncation

4. **Given** I enable reduce motion in device settings, **When** I play game, **Then** animations are simplified or removed (cards appear instantly instead of sliding, chips teleport to pot), game remains fully playable

5. **Given** I enable high contrast mode in device settings, **When** I view game, **Then** all text has sufficient contrast (WCAG AAA where possible), borders are more pronounced, button states are clearly visible

6. **Given** I use game with screen reader, **When** it's my turn, **Then** timer countdown is announced every 5 seconds ("15 seconds remaining", "10 seconds remaining", "5 seconds"), action buttons announce current cost ("Call, 40 chips", "Raise, minimum 80 chips")

---

### User Story 9 - PWA Installation and Offline Play (Priority: P2)

As a mobile player, I want to install the game as an app and play offline so I can enjoy poker anywhere, even without internet.

**Why this priority**: PWA features enhance mobile experience dramatically. Installation improves engagement and retention. Offline play is crucial for mobile users.

**Independent Test**: Install PWA on iPhone and Android, play offline, verify game works without internet connection.

**Acceptance Scenarios**:

1. **Given** I visit game URL on mobile browser (Safari, Chrome), **When** I use site for first time, **Then** browser prompts "Add to Home Screen" or "Install App" with custom prompt explaining benefits (offline play, full-screen, faster loading)

2. **Given** I install PWA, **When** I tap app icon on home screen, **Then** app launches in full-screen mode (no browser UI), displays custom splash screen with game logo and tagline during load

3. **Given** I have played game before, **When** I open app without internet connection, **Then** game loads instantly from cache, I can resume last saved game state, all features work except settings that require loading new assets

4. **Given** I am playing offline, **When** I start new game, **Then** game functions normally (bot AI works, hand evaluation works, all poker rules enforced), game state saved locally after each hand

5. **Given** I close PWA mid-hand, **When** I reopen app (offline or online), **Then** game resumes from beginning of current hand (hands are auto-saved after completion, mid-hand state is preserved but resets to start of hand on reload for simplicity)

6. **Given** I am offline, **When** I try to access features requiring internet (future features like leaderboards), **Then** I see friendly message "This feature requires internet connection" with offline indicator in top bar

7. **Given** app has update available, **When** I connect to internet, **Then** update downloads in background, prompts "New version available - Tap to update" as non-intrusive banner, applies update after user confirmation

---

### User Story 10 - Performance and Battery Efficiency (Priority: P1)

As a mobile player, I want smooth gameplay that doesn't drain my battery so I can play for extended sessions.

**Why this priority**: Poor performance or high battery drain = users uninstall. Critical for mobile games.

**Independent Test**: Play 30 minutes continuously on iPhone 11 and Pixel 5, verify 60fps throughout, battery drain <15%.

**Acceptance Scenarios**:

1. **Given** I play game on iPhone 11 or Pixel 5, **When** animations play (card dealing, chip movements), **Then** frame rate maintains 60fps continuously, no dropped frames, no lag or stuttering

2. **Given** I play game for 30 minutes, **When** I check battery usage, **Then** app has consumed <15% battery (approximately 2 hours of gameplay per full charge)

3. **Given** I start new hand, **When** cards are dealt, **Then** Time to Interactive is <200ms (from action to cards visible), no loading spinner required

4. **Given** app is first loaded, **When** I tap Quick Play, **Then** initial JavaScript bundle is <500KB (gzipped), images are <50KB each (WebP format), total initial load <1MB, Time to Interactive <3 seconds on 4G connection

5. **Given** I play in direct sunlight, **When** screen brightness is maximum, **Then** all text remains readable (sufficient contrast), card suits are distinguishable, buttons are clearly visible

6. **Given** I have low battery (<20%), **When** game detects low battery mode (iOS Low Power Mode, Android Battery Saver), **Then** animations automatically switch to "Fast" or "Off" mode, haptic feedback reduces intensity, game prompts "Battery saver mode detected - Animations reduced"

7. **Given** I play for extended period, **When** monitoring memory usage, **Then** memory consumption remains stable (no memory leaks), game doesn't slow down over time, browser doesn't crash or reload

---

### Edge Cases

- **What happens when timer expires during my turn?** System auto-checks if possible, otherwise auto-folds. Player sees "Timed Out" toast message. Timer duration is 20 seconds for mobile (faster than desktop 30s).

- **What happens when I try to bet more than I have?** System automatically constrains bet to my chip stack (all-in). Shows "Max: All-In" indicator below slider. Cannot bet more than available chips.

- **What happens when I rotate device mid-action?** Game state preserved, action timer pauses during rotation, UI smoothly transitions to new orientation, same action options remain available after rotation completes.

- **What happens when I receive phone call mid-hand?** Game pauses when app goes to background, timer pauses, hand state saved. When returning to app, player sees "Welcome back!" and 3-second countdown before timer resumes (gives time to refocus).

- **What happens when I accidentally swipe to fold?** No undo mechanism (consistent with real poker), but sensitive gestures require >50px swipe distance and >200ms duration to prevent accidental triggers. User can cancel swipe by reversing direction before threshold.

- **What happens when app is in background for long time (>10 minutes)?** App state saved, but current hand is reset to beginning (for simplicity and fairness to bots who were "thinking"). Chip stacks and dealer position preserved.

- **What happens when I close browser mid-game?** Game state auto-saved after each completed hand in localStorage. On next launch, game offers "Resume game?" with chip stacks preserved, or "New game?" to restart.

- **What happens when all bots are eliminated?** Game ends, player wins, victory screen shows congratulations, statistics summary, confetti animation, "Play Again" button.

- **What happens when two players have identical hands at showdown?** Pot split evenly. If odd chip (e.g., 101 chips split 2 ways), extra chip goes to player in earlier position relative to last aggressor (as clarified). System shows "Split Pot" message.

- **What happens when dealer button reaches eliminated player's seat?** Dealer button skips eliminated seats, moves to next active player clockwise. System maintains correct position tracking.

- **What happens when bot has insufficient chips for blind?** Bot posts partial blind (all-in), side pot created automatically, bot remains in hand but cannot make further bets.

- **What happens when I press Raise but haven't set amount?** Raise button disabled until valid amount selected. Min raise amount pre-filled by default. "Confirm" button only enabled when valid amount selected.

- **What happens if I try to call with insufficient chips?** System automatically converts call to all-in. Shows "All-In (Short Call)" toast message. Side pot calculation handles partial call correctly.

- **What happens during heads-up play?** Special rules applied: dealer = small blind, other player = big blind, dealer acts first preflop (after posting SB) but last post-flop. System handles automatically.

- **What happens when I play in landscape mode?** Layout switches to traditional poker table (elliptical, players around table). Touch targets remain same size. Action buttons move to bottom-right corner (right-thumb reach). Switch is seamless with state preservation.

- **What happens if I enable airplane mode mid-game?** Game continues normally (all computation is client-side). Auto-save works via localStorage. User sees offline indicator in status bar but game is fully playable.

- **What happens when device storage is full?** App checks available storage before saving game state. If <1MB available, shows warning toast "Low storage - Game may not save progress" but continues playing. Critical saves (completed hands) prioritized over statistics.

---

## Requirements

### Functional Requirements

**Game Initialization & Setup**

- **FR-001**: System MUST allow player to start quick play game with 2-8 bot opponents (default 3-5 bots based on screen size, 4-6 players total)
- **FR-002**: System MUST randomly assign player a seat at the table (bottom position in portrait, random in landscape)
- **FR-003**: System MUST assign each bot a unique name and avatar from predefined list
- **FR-004**: System MUST initialize all players with starting chips (configurable: 500/1000/2000/5000, default 1000)
- **FR-005**: System MUST randomly assign initial dealer button to a player
- **FR-006**: System MUST begin first hand automatically within 2 seconds of game start
- **FR-007**: System MUST support both portrait and landscape orientations with smooth transitions
- **FR-008**: System MUST save game state after each completed hand to localStorage
- **FR-009**: System MUST allow player to customize their name (max 12 characters, alphanumeric + spaces)

**Blind Posting & Hand Start**

- **FR-010**: System MUST post small blind from player left of dealer before dealing cards
- **FR-011**: System MUST post big blind from player left of small blind
- **FR-012**: System MUST handle heads-up special rules (dealer = SB, opponent = BB)
- **FR-013**: System MUST handle insufficient chips for blind (player posts partial blind, goes all-in)
- **FR-014**: System MUST deal 2 hole cards face-down to each active player
- **FR-015**: System MUST show player's hole cards face-up to player only (large, readable on mobile)
- **FR-016**: System MUST keep opponent hole cards face-down until showdown
- **FR-017**: System MUST start preflop betting with player left of big blind (Under The Gun)
- **FR-018**: System MUST support optional blind increases at configurable intervals (every X hands)
- **FR-019**: System MUST notify players when blinds increase via toast message

**Betting Actions & Validation (Touch-Optimized)**

- **FR-020**: System MUST allow player to fold via button tap or swipe-left gesture
- **FR-021**: System MUST allow player to check when no bet exists via button or tap-on-table gesture
- **FR-022**: System MUST allow player to call by tapping call button or tapping own cards
- **FR-023**: System MUST allow player to bet/raise via raise button or swipe-up gesture (opens slider)
- **FR-024**: System MUST allow player to go all-in via button or double swipe-up gesture (with confirmation)
- **FR-025**: System MUST validate minimum raise is at least double previous bet (or double big blind if first raise)
- **FR-026**: System MUST prevent raises below minimum unless player goes all-in with insufficient chips
- **FR-027**: System MUST enforce 20-second action timer per player turn (mobile-optimized, shorter than desktop 30s)
- **FR-028**: System MUST auto-check if timer expires and check is valid action
- **FR-029**: System MUST auto-fold if timer expires and check is not valid
- **FR-030**: System MUST display countdown timer with visual progress indicator (circular or bar) during player turn
- **FR-031**: System MUST disable invalid action buttons (e.g., cannot check if bet exists, button grayed out)
- **FR-032**: System MUST provide touch feedback for all button presses (scale animation + haptic if supported)
- **FR-033**: System MUST support gesture cancellation (reverse swipe direction to cancel)
- **FR-034**: System MUST prevent accidental actions (swipe must be >50px distance and >200ms duration)

**Betting Round Progression**

- **FR-035**: System MUST complete betting round when all active players have acted and bets are equal
- **FR-036**: System MUST complete betting round immediately when only 1 player remains active (all others folded)
- **FR-037**: System MUST burn 1 card before dealing flop (3 community cards)
- **FR-038**: System MUST deal 3 community cards face-up for flop with staggered animation
- **FR-039**: System MUST start flop betting with first active player left of dealer
- **FR-040**: System MUST burn 1 card before dealing turn (4th community card)
- **FR-041**: System MUST deal 1 turn card face-up
- **FR-042**: System MUST start turn betting with first active player left of dealer
- **FR-043**: System MUST burn 1 card before dealing river (5th community card)
- **FR-044**: System MUST deal 1 river card face-up
- **FR-045**: System MUST start river betting with first active player left of dealer
- **FR-046**: System MUST skip betting round if all active players are all-in

**Pot Calculation & Side Pots**

- **FR-047**: System MUST calculate total pot as sum of all player bets
- **FR-048**: System MUST create main pot when player goes all-in with less than highest bet
- **FR-049**: System MUST create side pots for each distinct all-in amount with multiple all-ins
- **FR-050**: System MUST track eligible players for each pot (players who contributed to that pot)
- **FR-051**: System MUST distribute odd chips (indivisible amounts) to player in earlier position relative to last aggressor
- **FR-052**: System MUST show pot breakdown visually (main pot + side pots) during hand
- **FR-053**: System MUST award each pot to winner eligible for that pot at showdown

**Hand Evaluation & Showdown**

- **FR-054**: System MUST evaluate each player's best 5-card hand from 7 cards (2 hole + 5 community)
- **FR-055**: System MUST correctly rank hands using standard poker hand rankings:
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
- **FR-056**: System MUST use correct tie-breakers (kickers, highest cards) when hands are equal rank
- **FR-057**: System MUST split pots evenly among tied players at showdown
- **FR-058**: System MUST reveal hole cards at showdown starting with last aggressor, then first player left of button if no aggressor
- **FR-059**: System MUST allow losing players to muck cards (not show) if they choose
- **FR-060**: System MUST force all-in players to show cards at showdown (cannot muck)
- **FR-061**: System MUST display winning hand rank and description as bottom sheet or overlay (e.g., "Straight, King high")
- **FR-062**: System MUST award pot(s) to winner(s) and update chip stacks immediately

**Hand Completion & Next Hand**

- **FR-063**: System MUST remove players with zero chips from game (eliminated)
- **FR-064**: System MUST rotate dealer button clockwise to next active player
- **FR-065**: System MUST start next hand automatically after 3-second delay (configurable in settings)
- **FR-066**: System MUST end game when only 1 player remains with chips (victory)
- **FR-067**: System MUST end game when player runs out of chips (player eliminated)
- **FR-068**: System MUST show game-over screen with session statistics on game end
- **FR-069**: System MUST save completed hand state to localStorage after pot awarded
- **FR-070**: System MUST increment blind level after configured number of hands if blind increases enabled

**Bot AI & Decision Making**

- **FR-071**: System MUST implement Easy bot difficulty:
  - Folds weak hands (< 20% preflop equity)
  - Calls/raises strong hands (pairs, A-K, A-Q)
  - Rarely bluffs (~10% of time)
  - No position awareness
  - Realistic thinking time (500ms-2000ms)
  - Win rate varies in mixed games

- **FR-072**: System MUST implement Medium bot difficulty:
  - Position-aware (tight early position, loose late position)
  - Basic pot odds consideration (calls if odds > 33% equity)
  - Occasional bluffs (~25% of time in position)
  - Hand range awareness (recognizes opponent strength patterns)
  - Realistic thinking time (1000ms-3000ms)
  - Win rate varies in mixed games

- **FR-073**: System MUST implement Hard bot difficulty:
  - Advanced hand range analysis (narrows opponent range by actions)
  - Implied odds calculation (considers future bets)
  - Strategic bluffing (bluffs on scary boards, fold to re-raises)
  - Adaptive play (exploits player tendencies)
  - Bet sizing tells (varies bet sizes for deception)
  - Realistic thinking time (1500ms-3500ms)
  - Win rate varies in mixed games

- **FR-074**: System MUST assign each bot a personality trait (tight/loose, aggressive/passive) that persists across all games for that bot name
- **FR-075**: System MUST display bot "thinking" indicator during decision time
- **FR-076**: System MUST prevent bots from seeing hole cards of opponents (no cheating)

**Mobile User Interface & Visual Feedback**

**Portrait Mode (Primary)**:

- **FR-077**: System MUST display player area at bottom of screen in portrait mode with: large hole cards, chip stack, current bet, player name
- **FR-078**: System MUST display community cards in center-top area, horizontally arranged, sized appropriately for mobile (50-60px width per card)
- **FR-079**: System MUST display 2-3 opponents in vertical stack above community cards, showing: small avatar (40px), name, chip stack, current bet, face-down cards
- **FR-080**: System MUST allow scrolling or swiping to view additional opponents if >3 in portrait mode
- **FR-081**: System MUST anchor action buttons to bottom of screen (Fold, Call/Check, Raise) with minimum 48px height each
- **FR-082**: System MUST display pot amount prominently in center-top with chip icon
- **FR-083**: System MUST display dealer button indicator next to current dealer (small, 24px)
- **FR-084**: System MUST display action timer above action buttons with visual countdown (circular or linear progress)

**Landscape Mode (Secondary)**:

- **FR-085**: System MUST display traditional poker table layout in landscape mode with elliptical table
- **FR-086**: System MUST arrange player positions around table (player at bottom, opponents around perimeter)
- **FR-087**: System MUST display community cards in center of table
- **FR-088**: System MUST position action buttons at bottom-right corner (right-thumb reach) in landscape
- **FR-089**: System MUST display all 4-6 players simultaneously in landscape mode (no scrolling required)
- **FR-090**: System MUST maintain same touch target sizes (44-48px minimum) in landscape mode

**Universal (Both Orientations)**:

- **FR-091**: System MUST ensure all interactive elements meet minimum touch target size: 44x44px (iOS) or 48x48dp (Android)
- **FR-092**: System MUST provide spacing of 8px minimum between adjacent buttons to prevent mis-taps
- **FR-093**: System MUST display small blind and big blind indicators during blind posting (badge on player seat)
- **FR-094**: System MUST scale text and UI elements proportionally for screen sizes from 320px to 428px width
- **FR-095**: System MUST support pinch-to-zoom on community cards for accessibility
- **FR-096**: System MUST display hand strength indicator when player double-taps hole cards (badge: Strong/Playable/Weak)

**Animations & Visual Effects (Mobile-Optimized)**:

- **FR-097**: System MUST animate card dealing with staggered timing (deal to each player sequentially, 100ms between)
- **FR-098**: System MUST animate chip movements (chips slide from player to pot, 300ms duration)
- **FR-099**: System MUST animate pot amount increase (number scales up with spring animation)
- **FR-100**: System MUST animate winner celebration (highlight winning hand, chips slide to winner, confetti optional)
- **FR-101**: System MUST maintain 60fps animation performance on iPhone 11 and Pixel 5
- **FR-102**: System MUST allow disabling animations in settings (switch to instant updates)
- **FR-103**: System MUST provide fast animation mode (2x speed) in settings
- **FR-104**: System MUST reduce animations automatically when device is in low power mode
- **FR-105**: System MUST use GPU-accelerated CSS properties (transform, opacity) for animations

**Touch Gestures**:

- **FR-106**: System MUST support swipe-left gesture to fold (>50px distance, >200ms duration)
- **FR-107**: System MUST support tap-on-table gesture to check when valid
- **FR-108**: System MUST support tap-on-cards gesture to call when valid
- **FR-109**: System MUST support swipe-up gesture to open raise slider
- **FR-110**: System MUST support double swipe-up gesture to all-in (with confirmation dialog)
- **FR-111**: System MUST support long-press gesture (500ms) to show action menu with descriptions
- **FR-112**: System MUST support double-tap on hole cards to show hand strength indicator
- **FR-113**: System MUST support pinch-zoom on community cards to enlarge (accessibility)
- **FR-114**: System MUST support swipe left/right on opponent area to scroll through players (portrait mode, >3 opponents)
- **FR-115**: System MUST allow gesture cancellation by reversing swipe direction before threshold
- **FR-116**: System MUST provide haptic feedback (vibration) for gestures if device supports and enabled in settings

**Raise Slider (Touch-Optimized)**:

- **FR-117**: System MUST display raise slider as bottom sheet with large touch target (60px thumb area)
- **FR-118**: System MUST show quick-bet buttons (2x BB, Pot, All-In) as large chips (56px each) above slider
- **FR-119**: System MUST display min/max raise amounts clearly with current bet highlighted
- **FR-120**: System MUST provide visual feedback when dragging slider (haptic ticks at intervals if supported)
- **FR-121**: System MUST show large "Confirm" button (green, 56px height) to execute raise
- **FR-122**: System MUST validate raise amount in real-time (disable Confirm if invalid)
- **FR-123**: System MUST dismiss slider by swiping down or tapping outside

**Settings & Customization**:

- **FR-124**: System MUST display settings as mobile-optimized bottom sheet with scrollable content
- **FR-125**: System MUST allow configuring number of bots (stepper control: 2-8, default 3-5 based on screen size)
- **FR-126**: System MUST allow configuring bot difficulty (segmented control: Easy/Medium/Hard/Mixed, default Mixed)
- **FR-127**: System MUST allow configuring starting chips (dropdown: 500/1000/2000/5000, default 1000)
- **FR-128**: System MUST allow configuring blind levels (dropdown: $5/$10, $10/$20, $25/$50, default $10/$20)
- **FR-129**: System MUST allow enabling blind increases (toggle + frequency picker: every X hands)
- **FR-130**: System MUST allow configuring action timer duration (dropdown: 10s/15s/20s/30s/Off, default 20s)
- **FR-131**: System MUST allow configuring animation speed (segmented control: Off/Fast/Normal/Slow, default Normal)
- **FR-132**: System MUST allow enabling/disabling sound effects (toggle, default On)
- **FR-133**: System MUST allow enabling/disabling haptic feedback (toggle, default On)
- **FR-134**: System MUST allow selecting card back design (horizontal scrollable carousel with 5 options)
- **FR-135**: System MUST allow customizing player name (text input, max 12 characters, alphanumeric + spaces)
- **FR-136**: System MUST save settings to browser localStorage (persists across sessions)
- **FR-137**: System MUST apply setting changes immediately or on next game start (as appropriate)

**Statistics & Tracking**:

- **FR-138**: System MUST track current session statistics:
  - Hands played
  - Hands won
  - Win rate percentage
  - Total chips won/lost
  - Biggest pot won
  - Current chip stack
  - Play time duration
- **FR-139**: System MUST display session stats in bottom sheet (accessible via stats icon)
- **FR-140**: System MUST display session summary on game end screen (full-page overlay)
- **FR-141**: System MUST optionally save session statistics to localStorage (enabled in settings)
- **FR-142**: System MUST provide "Share Results" button on game end screen that opens native mobile share sheet

**Accessibility & User Experience**:

- **FR-143**: System MUST provide ARIA labels for screen readers on all interactive elements
- **FR-144**: System MUST announce game state changes to screen readers ("Your turn", "Flop dealt: King of Hearts, Queen of Spades, Jack of Diamonds", "You won 250 chips")
- **FR-145**: System MUST announce timer countdown to screen readers (every 5 seconds: "15 seconds remaining")
- **FR-146**: System MUST support color blind mode (Deuteranopia) with patterned card suits: hearts=dots, diamonds=stripes, clubs=squares, spades=solid
- **FR-147**: System MUST support color blind mode for chips with patterns: white=no pattern, red=diagonal lines, green=checkered
- **FR-148**: System MUST respect device Dynamic Type / Font Scale settings (iOS/Android)
- **FR-149**: System MUST scale all text proportionally when font size increased (up to 200%)
- **FR-150**: System MUST respect Reduce Motion setting (disable/simplify animations)
- **FR-151**: System MUST respect High Contrast mode (increase border thickness, text contrast)
- **FR-152**: System MUST ensure WCAG AA contrast compliance (4.5:1 for normal text, 3:1 for large text)
- **FR-153**: System MUST remain playable on smallest target device (iPhone SE: 375x667px)
- **FR-154**: System MUST scale interface responsively when window resized or orientation changed

**PWA Features**:

- **FR-155**: System MUST provide Web App Manifest for PWA installation (name, icons, theme color, display mode)
- **FR-156**: System MUST register Service Worker for offline functionality
- **FR-157**: System MUST cache all static assets (JS, CSS, images) for offline play
- **FR-158**: System MUST work fully offline (all game logic is client-side)
- **FR-159**: System MUST display custom splash screen during PWA launch
- **FR-160**: System MUST prompt user to install PWA on first visit (iOS: "Add to Home Screen", Android: Install banner)
- **FR-161**: System MUST display offline indicator when device has no internet connection
- **FR-162**: System MUST check for app updates when online and prompt user to update
- **FR-163**: System MUST apply PWA updates only after user confirmation (avoid mid-game disruption)

**Orientation Handling**:

- **FR-164**: System MUST detect orientation change events (portrait ↔ landscape)
- **FR-165**: System MUST smoothly transition layout when orientation changes (300ms animation)
- **FR-166**: System MUST preserve complete game state during orientation change
- **FR-167**: System MUST pause action timer during orientation transition (resume after layout settles)
- **FR-168**: System MUST adapt UI components for new orientation (portrait: vertical stack, landscape: table layout)
- **FR-169**: System MUST maintain same touch target sizes regardless of orientation
- **FR-170**: System MUST reposition action buttons for optimal thumb reach (portrait: bottom center, landscape: bottom-right)

**Background/Foreground Handling**:

- **FR-171**: System MUST detect when app goes to background (user switches apps, receives call, locks device)
- **FR-172**: System MUST pause action timer when app in background
- **FR-173**: System MUST save game state when app goes to background (hand completion state, chip stacks, dealer position)
- **FR-174**: System MUST show "Welcome back!" message when app returns to foreground
- **FR-175**: System MUST provide 3-second countdown before resuming timer (gives user time to refocus)
- **FR-176**: System MUST reset current hand to beginning if app backgrounded >10 minutes (preserve chip stacks)

**Error Handling & Edge Cases**:

- **FR-177**: System MUST handle browser refresh/close gracefully (auto-save game state after each hand)
- **FR-178**: System MUST offer "Resume game?" option on launch if saved game exists in localStorage
- **FR-179**: System MUST validate all player inputs (bet amounts, raise amounts, gestures)
- **FR-180**: System MUST prevent invalid actions (cannot check when bet exists, cannot raise below minimum)
- **FR-181**: System MUST handle insufficient chips scenarios (auto-convert to all-in)
- **FR-182**: System MUST handle side pot calculations with 4+ all-ins correctly
- **FR-183**: System MUST handle tie scenarios at showdown (split pots, odd chip distribution to earlier position relative to last aggressor)
- **FR-184**: System MUST handle heads-up special rules automatically
- **FR-185**: System MUST skip eliminated players when rotating dealer button
- **FR-186**: System MUST display user-friendly error messages as toast notifications (no technical jargon)
- **FR-187**: System MUST log errors to browser console for debugging (without exposing to user)
- **FR-188**: System MUST check device storage before saving game state
- **FR-189**: System MUST show warning if device storage <1MB available ("Low storage - Game may not save progress")
- **FR-190**: System MUST prioritize critical saves (completed hands, settings) over optional data (full statistics)

**Performance Requirements (Mobile-Specific)**:

- **FR-191**: System MUST maintain 60fps animation performance on iPhone 11 (A13 Bionic) and Pixel 5 (Snapdragon 765G)
- **FR-192**: System MUST process action (tap to UI update) in <100ms (95th percentile)
- **FR-193**: System MUST load initial bundle in <500KB (gzipped)
- **FR-194**: System MUST optimize images to <50KB each (WebP format with fallback)
- **FR-195**: System MUST achieve Time to Interactive <3 seconds on 4G connection (throttled to 4Mbps)
- **FR-196**: System MUST consume <15% battery during 30-minute gameplay session
- **FR-197**: System MUST not cause memory leaks (memory usage stable over 100 hands)
- **FR-198**: System MUST code-split heavy modules (bot AI, hand evaluation) for faster initial load
- **FR-199**: System MUST lazy-load non-critical components (settings, stats, game over screen)
- **FR-200**: System MUST use requestAnimationFrame for all animations
- **FR-201**: System MUST debounce scroll/touch events to prevent performance degradation
- **FR-202**: System MUST use CSS containment for player seat components
- **FR-203**: System MUST use will-change sparingly (mobile GPU memory limited)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Player can start a game and complete first hand within 15 seconds of tapping "Quick Play" on mobile device
- **SC-002**: 100% of poker rules implemented correctly (verified by comprehensive test suite with 200+ test cases)
- **SC-003**: Bot win rates vary naturally in mixed difficulty games (validated by 1000-hand simulation)
- **SC-004**: Animations maintain 60fps on iPhone 11 and Pixel 5 (verified by Chrome DevTools FPS meter and device testing)
- **SC-005**: Action processing (tap to UI update) completes in <100ms (95th percentile)
- **SC-006**: Side pot calculations are 100% accurate in multi-player all-in scenarios (verified by 50 edge case tests)
- **SC-007**: Interface is understandable to 95%+ of new mobile players without tutorial (measured by playtesting with 20 users on mobile devices)
- **SC-008**: Zero game-breaking bugs or incorrect poker rules (verified by regression test suite)
- **SC-009**: Game remains playable on iPhone SE (375x667px) with no UI overlap or scrolling
- **SC-010**: Settings changes apply correctly 100% of time (verified by 30 settings test cases)
- **SC-011**: Touch gestures work reliably with <2% mis-recognition rate (verified by user testing)
- **SC-012**: Test coverage ≥80% for game logic, ≥60% for UI components
- **SC-013**: Initial bundle size <500KB (gzipped), total assets <1MB for first load
- **SC-014**: Time from game start to first hand dealt is <2 seconds (including animations)
- **SC-015**: Average mobile player session length >20 minutes (measured in playtesting with 50+ users)
- **SC-016**: PWA installation rate >30% after 3 game sessions (measured in production)
- **SC-017**: Battery consumption <15% for 30-minute session (measured on iPhone 11 and Pixel 5)
- **SC-018**: Game works 100% offline after first load (verified by airplane mode testing)
- **SC-019**: Orientation change completes in <300ms with preserved game state (verified by device testing)
- **SC-020**: All touch targets meet minimum size: 44x44px (iOS) or 48x48dp (Android)

---

## Assumptions & Constraints

### Assumptions

- Players have basic understanding of Texas Hold'em rules (game provides visual hints but not comprehensive tutorial)
- Players use modern mobile browsers (iOS Safari 15+, Chrome Android 100+, Samsung Internet 16+)
- Players have smartphones with screen sizes 320px-428px width (iPhone SE to iPhone 14 Pro Max, Android equivalents)
- Players have JavaScript enabled (game is pure client-side JavaScript/TypeScript)
- Players accept that game state is saved after each completed hand (mid-hand state resets to hand start on reload)
- Players are comfortable with English language for MVP (localization for other languages post-MVP)
- Players primarily use touch interactions (keyboard support is secondary, for desktop users)
- Players have sufficient device storage (>10MB) for PWA installation and game state

### Constraints

- **Mobile-First**: Primary optimization for phones (320-428px width), tablet/desktop secondary
- **Touch-First**: Gestures and tap as primary input, keyboard shortcuts secondary (desktop only)
- **No Backend**: All game logic runs client-side in browser (no server, no database, no API calls)
- **No Multiplayer**: Single-player only, no online/local multiplayer (network code out of scope)
- **Limited Persistence**: Game state saved after completed hands only, mid-hand state resets on reload (simplicity)
- **Single Game Mode**: Cash game only, no tournaments, no sit-and-go (simplified scope for MVP)
- **Player Count**: 4-6 players optimal for mobile (2-8 supported, but 6+ may require scrolling in portrait)
- **No Real Money**: Play money only, no integration with payment systems or cryptocurrency
- **Modern Browsers**: Requires ES2020+ features, no Internet Explorer support, iOS 15+ / Android Chrome 100+
- **Offline-First**: Must work 100% offline after initial load (PWA requirement)
- **Battery Conscious**: Animations and features must be optimized for mobile battery life
- **English Only MVP**: UI text in English, localization infrastructure ready but translations post-MVP

---

## Out of Scope (Post-MVP)

The following features are explicitly EXCLUDED from initial release:

**Gameplay Variants**
- Tournament mode (structured blinds, elimination format, prize pools)
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
- Social features

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
- AI difficulty that learns from player behavior

**Platform Expansion**
- Native mobile apps (iOS App Store, Google Play - current is PWA only)
- Tablet-specific optimized layouts (responsive design covers tablets but not optimized)
- Desktop-optimized layouts (responsive design covers desktop but mobile is priority)
- VR poker table
- Smart TV apps

**Social Features**
- User profiles
- Friend system
- Private tables
- Chat rooms
- Emotes and reactions
- Video/voice chat

**Enhanced Mobile Features**
- Push notifications (requires backend)
- Cloud save sync across devices (requires backend)
- Biometric authentication (Touch ID / Face ID for settings protection)
- Apple Watch / Wear OS companion app
- Widget for home screen

**Advanced Accessibility**
- Full multilingual support (infrastructure ready, translations post-MVP)
- Custom color schemes beyond color blind mode
- Voice control
- External controller support

These may be considered for future versions but are not part of the standalone mobile game MVP. Focus is on delivering a polished, complete, single-player poker experience optimized for mobile devices.

---

**Hand Evaluation Library**: [PokerHandEvaluator](https://github.com/HenryRLee/PokerHandEvaluator) (C++ with TypeScript/WASM implementation)

**Specification Version**: 2.0 (Mobile-First)
**Last Updated**: 2025-11-18
**Status**: Active - Ready for mobile-first implementation
