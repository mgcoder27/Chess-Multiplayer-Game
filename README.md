# Chess Multiplayer Game

A browser-based multiplayer chess game with server-based matchmaking and move
relay. The multiplayer application is in `Chess-Multiplayer/`; the other
top-level folders contain a separate single-player chessboard project.

## Features

- Matchmaking for 10-, 15-, and 20-minute time controls.
- Real-time move-state relay between paired players using Socket.IO.
- The multiplayer client uses chessboard.js to display the board and chess.js
  to apply and check chess moves.
- Matchmaking queues are held in server memory. Game state is not persisted,
  so games and waiting queues are lost when the server restarts.

## How to run

Requirements: Node.js and npm.

```sh
cd Chess-Multiplayer
npm ci
npm start
```

Then open [http://localhost:3000](http://localhost:3000) in a browser. To use
a different listening port, set the `PORT` environment variable. The Socket.IO
CORS origin can be set with `CORS_ORIGIN`; it defaults to `*`.

## How to run tests

From `Chess-Multiplayer/`, run:

```sh
npm test
```

The Jest tests cover matchmaking queueing, pairing, duplicate requests,
disconnection cleanup, and invalid time controls.

## Deploy on Render

This repository includes a Render Blueprint in [`render.yaml`](./render.yaml)
for the multiplayer app. To deploy it:

1. Push this repository to GitHub.
2. In Render, choose **New +** → **Blueprint** and connect this repository.
3. Review the `chess-multiplayer` web service and choose a plan, then apply the
   Blueprint.

Render installs dependencies with `npm ci` and starts the app with `npm start`.
The server listens on Render's `PORT` environment variable and serves the game
and Socket.IO from the same web service; no separate static site or CORS
configuration is needed.

Matchmaking queues and active games are stored only in server memory. They are
lost when the service restarts, and running multiple instances does not share
queues or game state. For reliable multiplayer sessions, use a single instance
and a plan that does not frequently spin the service down.

## Implementation notes

The server pairs players using in-memory matchmaking queues and relays
client-reported board state over Socket.IO. Move legality is handled by the
client's chess.js library; the server does not persist game state.
