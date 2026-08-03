# EdgePilot AI — Mobile (Expo)

Native iOS and Android apps for App Store and Google Play. Shares EdgePilot branding and research workflows with the Next.js web product; this is **not** a WebView wrapper.

## Stack

- Expo SDK 57 + Expo Router
- TypeScript
- Fraunces + DM Sans
- Local demo auth / mock slate until Supabase + API URL are wired
- EAS Build / Submit (`eas.json`)

## Run locally

```bash
cd mobile
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or scan the QR with Expo Go.

Optional env (create `mobile/.env`):

```
EXPO_PUBLIC_API_URL=https://your-edgepilot-web-host
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Without keys, the app uses on-device demo session + mock odds/EV/AI.

## App identity

| Field | Value |
| --- | --- |
| Name | EdgePilot AI |
| Bundle / package | `ai.edgepilot.app` |
| Scheme | `edgepilot` |
| Splash | `#0C1F19` |

Replace `extra.eas.projectId` in `app.json` after `eas init`.

## Store builds

```bash
npm i -g eas-cli
eas login
cd mobile
eas init
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

See [STORE_SUBMISSION.md](./STORE_SUBMISSION.md) for listing copy, age ratings, and gambling disclosures.

## Screens

- Welcome / sign in / sign up
- Age + research-only onboarding
- Home dashboard, Odds, EV Scanner, AI coach, More
- Bankroll, Bets, Settings
