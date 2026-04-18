import { readFileSync } from "fs";


const html = readFileSync("./index.html", "utf-8");

Bun.serve({
  port: 3000,
  
   fetch(req, server) {
    // WebSocket upgrade
    if (server.upgrade(req)) return;

    // Serve HTML page
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },

  websocket: {
    open(ws) {
    const  numbers = [];
     for (let index = 0; index < 3; index++) {
      
      const randomNum = Math.ceil(Math.random()*100)
        numbers.push(randomNum);

     }
      ws.send(JSON.stringify(numbers)); 
    },

    message(ws, message) {
     
    },

    close(ws) {
      console.log("Client disconnected");
    },
  },
});