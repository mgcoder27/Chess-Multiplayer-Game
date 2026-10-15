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

## Implementation notes

The server pairs players using in-memory matchmaking queues and relays
client-reported board state over Socket.IO. Move legality is handled by the
client's chess.js library; the server does not persist game state.
