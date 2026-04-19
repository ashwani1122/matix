import { readFileSync } from "fs";

const html = readFileSync("./index.html", "utf-8");

function generate(): number[] {
  const numbers: number[] = [];

  for (let i = 0; i < 3; i++) {
    numbers.push(Math.ceil(Math.random() * 100));
  }

  return numbers;
}

Bun.serve({
  port: 3000,

  fetch(req, server) {
    if (server.upgrade(req)) return;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },

  websocket: {
    open(ws) {
      ws.send(JSON.stringify({
        type: "numbers",
        data: generate(),
      }));
    },

    message(ws, message) {
      if (typeof message !== "string") return;

      try {
        const parsed = JSON.parse(message);

        if (parsed.type === "generate") {
          ws.send(JSON.stringify({
            type: "numbers",
            data: generate(),
          }));
        }
      } catch (err) {
        console.log("Invalid JSON");
      }
    },

    close(ws) {
      console.log("Client disconnected");
    },
  },
});