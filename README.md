# Baseball Bingo

A simple, client-side bingo game featuring MLB and NFL team logos. Play bingo by marking off teams as they appear during games!

## Features

- **Two Sports**: Switch between Baseball and Football teams
- **Random Boards**: Generate unique 5x5 bingo cards with random team selections
- **Persistent State**: Your board and marked cells are saved in browser localStorage
- **Celebration**: Confetti animation when you get a bingo (5 in a row, column, or diagonal)
- **Fully Client-Side**: No backend required, runs entirely in the browser

## Live Demo

This app is deployed on GitHub Pages and automatically updates on every push to `main`.

## How to Play

1. Choose your sport (Baseball or Football)
2. Click "Generate New Card" to create a random bingo board
3. Click on team logos to mark them during the game
4. Get 5 in a row (horizontal, vertical, or diagonal) to win!

## Local Development

Simply open `index.html` in your browser. No build process or server required.

## Deployment

This project uses GitHub Actions to automatically deploy to GitHub Pages on every push to the `main` branch.

The workflow is configured in `.github/static.yml`.

## Tech Stack

- Pure HTML/CSS/JavaScript
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) for celebrations
- Team logos from ESPN CDN
- localStorage for persistence

