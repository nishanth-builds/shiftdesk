# ShiftDesk

Employee shift tracking with photo check-in, team-specific daily KPI reports, and an admin dashboard. Built with React + Vite, with Google Sheets and Google Drive as a no-cost backend (Google Apps Script).

## Features
- Employee login/logout flow with webcam photo proof
- Team-specific KPI forms (Support, Sales, Operations, Management), edited in one file: `src/kpi.js`
- Duplicate protection, so repeat submissions never create extra rows
- All data is saved to your Google Sheet (tabs: Logins, Logouts, KPI per team); photos go to a Drive folder
- Local demo mode when no sheet is connected

## Tech
React 18, Vite 5, Google Apps Script, Google Sheets, Google Drive

## Run locally
```bash
npm install
npm run dev
```

## Connect a Google Sheet (optional)
1. Create a Google Sheet, then Extensions > Apps Script, and paste `backend/Code.gs`.
2. Run `authorize` once, then Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
3. Copy `.env.example` to `.env` and set `VITE_SHEET_URL` to the `/exec` URL.

## Customize
- Teams and KPI questions: `src/kpi.js` (and the `TEAMS` list in `backend/Code.gs`)
- Colors: CSS variables at the top of `src/styles.css`
- Logos: `src/logo.png`, `src/logo-home.png`

## Deploy
`npm run build`, then upload the `dist` folder to Netlify, Vercel or GitHub Pages.
Never commit `.env`.

## Project structure
```
src/
  App.jsx                 root: view routing + layout
  api.js  kpi.js          Google Sheet calls, team/KPI config
  constants.js            modes + motivation messages
  hooks/                  useNow, useCount, useWho
  utils/                  storage (localStorage), format (dates/names)
  components/
    Home.jsx  SlideAct.jsx  Scene.jsx
    LoginFlow.jsx  LogoutFlow.jsx  Details.jsx  PhotoBox.jsx  Dots.jsx
    Done.jsx  Split.jsx
```
