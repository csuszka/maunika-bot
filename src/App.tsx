import { useCallback, useEffect, useState } from "react";
import "./App.css";
import useWebSocket from "react-use-websocket";
import { useWhatChanged } from "@simbathesailor/use-what-changed";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./ui-components/ErrorFallback";

function App() {
  const [count, setCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastDisplayedMessage, setLastDisplayedMessage] = useState<string>("");

  const TWITCH_WEBSOCKET_URL = import.meta.env
    .VITE_TWITCH_WEBSOCKET_URL as string;
  const TWITCH_OAUTH = import.meta.env.VITE_TWITCH_OAUTH as string;
  const TWITCH_NICK = import.meta.env.VITE_TWITCH_NICK as string;
  const TWITCH_CHANNEL = import.meta.env.VITE_TWITCH_CHANNEL as string;

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `${TWITCH_WEBSOCKET_URL}`,
    {
      share: true,
      shouldReconnect: () => true,
      onOpen: () => {
        setCount(() => 0);
        setOnlineUsers(() => []);
        sendMessage(`PASS ${TWITCH_OAUTH}`);
        sendMessage(`NICK ${TWITCH_NICK}`);
        sendMessage(`JOIN #${TWITCH_CHANNEL}`);

        sendMessage(`CAP REQ :twitch.tv/commands`);
        // ws.send(`CAP REQ :twitch.tv/commands twitch.tv/tags`);
        sendMessage(`CAP REQ :twitch.tv/membership`);
      },
    }
  );

  const lastMessageChecks = useCallback(() => {
    const messageRows = lastMessage?.data?.split("\r\n");
    messageRows?.forEach((line: string) => {
      const lineWords: string[] = line.split(" ");
      const exclamationMarkIndex: number = lineWords[0].indexOf("!");
      const currentUser: string = lineWords[0].substring(
        1,
        exclamationMarkIndex
      );

      if (lineWords[1] === "JOIN") {
        setOnlineUsers((users) => [...users, currentUser]);
        setCount((count) => count + 1);
      }

      if (lineWords[1] === "PART") {
        setOnlineUsers((onlineUsers) => {
          const currentUserIndex = onlineUsers.indexOf(currentUser);
          const newUsers = [...onlineUsers];
          newUsers.splice(currentUserIndex, 1);
          return newUsers;
        });
        setCount((count) => count - 1);
      }

      if (lineWords[1] === "PRIVMSG") {
        console.log(lineWords);
        setLastDisplayedMessage(line);
      }
    });
  }, [lastMessage?.data]);

  useEffect(() => {
    if (lastMessage) {
      lastMessageChecks();
    }
  }, [lastMessage, lastMessageChecks]);

  useWhatChanged(
    [
      onlineUsers,
      count,
      lastDisplayedMessage,
      readyState,
      lastMessage,
      lastMessageChecks,
    ],
    "onlineUsers,count,lastDisplayedMessage,readyState,lastMessage,lastMessageChecks"
  );

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="card">
          <button>count is {count}</button>
          <div className="card">
            <p>{lastDisplayedMessage}</p>
          </div>
          <div className="grid-cols-5 bg-red-600">
            {onlineUsers.map((user, index) => (
              <div key={index}>{"💚 " + user}</div>
            ))}
          </div>
        </div>

        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </ErrorBoundary>
    </>
  );
}

export default App;
