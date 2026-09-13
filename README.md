# League Wards

A Vue 3 and Vite project for viewing League of Legends player ranks and match history.

**Live demo:** [League Wards](https://leaguewards.netlify.app/)

## Tech stack

- Vue 3, TypeScript, and Vite
- PrimeVue
- Netlify Functions
- Riot Games API

## Development

```sh
npm install
npm run dev
```

The Netlify function requires a `RIOT_API_KEY` environment variable. For local Netlify-function development, use Netlify CLI and configure the variable in your Netlify site or local environment.

## Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — type-check and create a production build
- `npm run lint` — lint and automatically fix files

## Features

- Player search by Riot ID
- Current rank and LP
- Recent match history with match details
