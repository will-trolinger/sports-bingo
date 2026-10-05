# Sports Bingo

A bingo game with MLB, NFL and college team logos. Mark off teams as they show up during games.

Play it at **https://bingo.wtrolinger.me**.

## Features

- **Three boards**: Baseball, Football and College, each kept separately
- **Random boards**: a fresh 5x5 card of teams whenever you want one
- **Accounts**: log in to save your bingos and look back at past cards, or play as a guest
- **Blackout**: after a bingo, start a new card or keep going for all 25 squares
- **Celebration**: confetti for every completed line

## How to Play

1. Pick a sport
2. Tap a team when it appears in a game
3. Get 5 in a row (across, down or diagonal) for a bingo

## Local Development

```
npm install
npm run dev:api   # the API and a local database, on port 8787
npm run dev       # the site, on port 5173, passing /api to the API
```

`npm test` runs the tests (the API's run inside the Workers runtime against a
local database) and `npm run build` builds the site into `dist/`.

## Deployment

The site and API run as one Cloudflare Worker with a D1 database, configured
in `wrangler.jsonc`. To deploy:

```
npm run build
npx wrangler d1 migrations apply sports-bingo --remote   # only when migrations/ changed
npx wrangler deploy
```

The old GitHub Pages address redirects here from the `gh-pages` branch.

## Tech Stack

- React, TypeScript, Vite and Tailwind CSS
- Cloudflare Workers, D1 and Hono for the API
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) for celebrations
- Team logos from ESPN's CDN
