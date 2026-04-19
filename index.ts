import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf-8");
type Player = {
  id: string;
  score: number;
};
let serverRef: Bun.Server<WSData>;
let players = new Map<string, Player>();
let currentNumbers: number[] = [];
let currentSum = 0;
function generateGame() {
  currentNumbers = [];

  for (let i = 0; i < 3; i++) {
    currentNumbers.push(Math.ceil(Math.random() * 100));
  }

  currentSum = currentNumbers.reduce((a, b) => a + b, 0);
}
function broadcast() {
  serverRef.publish(
    "game",
    JSON.stringify({
      type: "game_update", // ✅ match frontend
      numbers: currentNumbers,
      players: Array.from(players.values()),
    })
  );
}
type WSData = {
  id: string;
};
generateGame();
Bun.serve<WSData>({
  port: 3000,

  fetch(req, server) {
  serverRef = server; // ✅ store reference

  if (server.upgrade(req, {
    data: {
      id: crypto.randomUUID(),
    },
  })) return;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
},

  websocket: {
  open(ws) {
  const id = ws.data.id; // ✅ use existing

  players.set(id, { id, score: 0 });

  ws.subscribe("game");

  ws.send(JSON.stringify({
    type: "game_update",
    numbers: currentNumbers,
    players: Array.from(players.values()),
  }));
},

    message(ws, message) {
      if (typeof message !== "string") return;

      const parsed = JSON.parse(message);

     if (parsed.type === "answer") {
      if(!ws.data){
        return
      }
  const player = players.get(ws.data.id);

  if (!player) return;

  if (parsed.value === currentSum) {
    player.score++;

    generateGame();
    broadcast(); // ✅ no ws.server
  } else {
    ws.send(JSON.stringify({ type: "wrong" }));
  }
}
    },

    close(ws) {
      players.delete(ws.data.id);
    },
  },
});