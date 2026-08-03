# App Store & Play Store submission — EdgePilot AI

EdgePilot AI is a **sports betting research / analytics** app. It does **not** accept wagers, custody funds, or operate as a sportsbook. Keep that distinction clear in every store field.

## Prerequisites

1. Apple Developer Program membership + App Store Connect app (`ai.edgepilot.app`)
2. Google Play Console app (`ai.edgepilot.app`)
3. Expo account + `eas init` (writes real `projectId` into `app.json`)
4. Production icons / screenshots (generate with Expo or design tools; current assets are placeholders until branded artwork is exported)
5. Live Terms / Privacy URLs after counsel review (web placeholders today)
6. Backend: production web API + Supabase Auth for real accounts (mobile currently ships demo/local session)

## Suggested listing copy

**Name:** EdgePilot AI  

**Subtitle (iOS) / short description (Android):**  
Sports betting research — odds, EV, bankroll discipline.

**Full description (draft):**  
EdgePilot AI helps you research sports markets with odds comparison, expected-value estimates, bankroll limits, and an AI research assistant.  

• Compare moneyline and market quotes across books  
• Scan illustrative EV opportunities  
• Track research bets and bankroll caps  
• Ask AI about slate context, odds math, and stake sizing  

EdgePilot does not accept wagers and is not a sportsbook. Outputs are informational estimates, not guarantees. You must meet the legal gambling age in your jurisdiction. Gamble responsibly.

**Keywords (iOS):** sports odds, betting research, expected value, bankroll, analytics, NBA, NFL

## Age rating / content

- **Gambling** category: yes — simulated / informational gambling content (no real-money wagering in-app)
- Age: typically **17+** (Apple) / **Teen or Mature** (Google) — confirm with questionnaire answers
- Include responsible-gambling language and link to your Responsible Use page
- Do **not** claim guaranteed profits or “locks”

## Screenshots to capture

Use iPhone 6.7" and 6.5", plus Android phone:

1. Welcome / brand hero  
2. Dashboard slate  
3. Odds comparison  
4. EV scanner  
5. AI coach  
6. Bankroll limits  

Prefer dark forest UI with accent CTAs matching the web product.

## Privacy nutrition / Data safety

Disclose as applicable once live:

- Account email (Auth)
- App activity / preferences (on-device or synced)
- Diagnostics
- No tracking across apps unless you add ATT / ads (current build does not)

## Review notes (paste for Apple)

> EdgePilot AI is an analytics research tool. Users can explore mock or live odds, EV estimates, and bankroll settings. The app does not place bets or process gambling payments. Stripe subscriptions (if enabled) are for software access via the web; in-app purchases can be added later for mobile plans. Demo mode works without credentials for review: open app → Continue with demo → accept age/research gates.

## Android notes

- Use Play App Signing
- Upload AAB from `eas build --profile production`
- Start on **internal** testing track (`eas.json` submit.android.track)
- Complete Gambling policy declarations if prompted

## After first submit

- Wire `EXPO_PUBLIC_API_URL` + Supabase Auth in EAS secrets
- Replace placeholder icons with final 1024² App Store / Play icon
- Add IAP or external purchase links per store rules if selling Pro/Elite on mobile
- Keep web Terms/Privacy and mobile disclosures in sync
