import WebSocket from "ws";
import "dotenv/config";
import fs from "fs";

const ws = new WebSocket(`${process.env.TWITCH_WEBSOCKET_URL}`);

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const today = `${year}-${month}-${day}`;

const log = (today: string, now: number, message: string) => {
  fs.appendFile(`logs/${today}.txt`, `[${now}] ${message}\r\n`, (error) => {
    if (error) {
      throw error;
    }
  });
};

ws.on("open", () => {
  console.log("Connected to server");

  // ws.send("Hello, server!");
  ws.send(`PASS ${process.env.TWITCH_OAUTH}`);
  ws.send(`NICK ${process.env.TWITCH_NICK}`);
  ws.send(`JOIN #${process.env.TWITCH_CHANNEL}`);

  ws.send(`CAP REQ :twitch.tv/commands`);
  // ws.send(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
  ws.send(`CAP REQ :twitch.tv/membership`);
});

ws.on("message", (message: string) => {
  console.log(`Received message from server: ${message} 😇`);

  const now = Date.now();

  if (message.includes("JOIN")) {
    // ws.send(`PASS ${process.env.TWITCH_OAUTH}`);
    // ws.send(`NICK ${process.env.TWITCH_NICK}`);
    // ws.send(`JOIN #${process.env.TWITCH_CHANNEL}`);
    // :csabi115!csabi115@csabi115.tmi.twitch.tv
    // const messageRows: string[] = message.split("\r\n");
    // const messageArray = message.split(" ");
    // if (
    //   messageArray[1] !== "JOIN" &&
    //   messageArray[2] !== `#${process.env.TWITCH_CHANNEL}`
    // ) {
    //   return;
    // }
    log(today, now, message);
  }

  //Keepalive
  if (message.includes("PING")) {
    ws.send("PONG :tmi.twitch.tv");
  }

  //rejoining chat - needs test
  if (message.includes("PART")) {
    // ws.send(`PASS ${process.env.TWITCH_OAUTH}`);
    // ws.send(`NICK ${process.env.TWITCH_NICK}`);
    // ws.send(`JOIN #${process.env.TWITCH_CHANNEL}`);
    log(today, now, message);
  }

  if (message.includes("!banana")) {
    ws.send(`PRIVMSG #${process.env.TWITCH_CHANNEL} :42!`);
  }
});

ws.on("close", () => {
  console.log("Disconnected from server");
});
