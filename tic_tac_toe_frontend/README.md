# Tic Tac Toe Frontend (Ocean Professional)

A modern, responsive Tic Tac Toe game built with React, featuring:
- Two game modes: Two Players and Play vs AI
- Smart AI using minimax with win/block heuristics
- Clear status with winner/tie indication and highlighted winning line
- Ocean Professional theme: blue & amber accents
- Fully responsive centered layout with options panel

## Getting Started

From this directory:

- `npm start` to run the app at http://localhost:3000
- `npm test` to run tests
- `npm run build` to create a production build

No environment variables are required.

## Theme

Ocean Professional Palette:
- Primary: #2563EB
- Secondary/Success: #F59E0B
- Error: #EF4444
- Background: #f9fafb
- Surface: #ffffff
- Text: #111827

Dark mode is supported via a document `data-theme` attribute.

## Game Rules and Features

- Standard 3x3 Tic Tac Toe.
- In Play vs AI mode, you can choose AI as X or O.
- Winning line is highlighted; ties and winners are clearly indicated.
- History navigation lets you jump to prior moves.

## Project Structure

- `src/App.js` contains UI and all game logic (PvP and AI).
- `src/App.css` contains theme variables and global styles.
- `src/index.js` standard React entry point.
- `src/App.test.js` basic smoke tests for UI.

## Accessibility

- Buttons and status elements include accessible labels.
- Live region updates on status changes.

Enjoy the game!
