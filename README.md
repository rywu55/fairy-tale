# Fairy Tale — Dungeon Crawler

A browser-based dungeon crawler where you raise and battle with a fairy companion. Explore procedurally generated tile maps, fight monsters, collect gold, and upgrade your fairy across 5 floors.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (included with Node.js)

## Installation

```bash
git clone https://github.com/rywu55/fairy-tale.git
cd fairy-tale
npm install
```

## Running Locally

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build for production (output to `dist/`) |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |

## How to Play

1. **Create your fairy** — choose an element and allocate starter attribute points
2. **Enter the dungeon** — navigate a tile map using the D-Pad or arrow keys
3. **Explore** — fog of war lifts as you move; find monsters, loot, and chests
4. **Battle** — stepping onto a monster tile starts turn-based combat
5. **Advance** — open the chest on each floor to proceed; reach floor 5 and find the stairs to win
6. **Upgrade** — spend gold between runs to improve your fairy's attributes and move power

## Controls

| Input | Action |
|---|---|
| Arrow keys | Move |
| D-Pad buttons | Move (mouse/touch) |
