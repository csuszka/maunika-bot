import { useCallback, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
// import { useWhatChanged } from "@simbathesailor/use-what-changed";
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

  const { sendMessage, lastMessage } = useWebSocket(`${TWITCH_WEBSOCKET_URL}`, {
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
  });

  const lastMessageChecks = useCallback(() => {
    const messageRows: string[] = lastMessage?.data?.split("\r\n");
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

        if (currentUser === "maunikabot") {
          return;
        }

        setLastDisplayedMessage(line);

        const command = lineWords[3].toLowerCase();

        if (command === ":!lurk") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Köszi szépen a lurköt! 🤗`);
          return;
        }

        if (command === ":!banana") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Pikachu! ⚡`);
          return;
        }

        if (command === ":!potato") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Banana! 🍌`);
          return;
        }

        if (command === ":!pikachu") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Pika-pikaaaaaaaa 💛`);
          return;
        }

        if (command === ":!medve") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :FUTÁÁÁÁS! 😭`);
          return;
        }

        if (command === ":!hurka") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :De ne májasat! 🦇`);
          return;
        }

        if (command === ":!kolbász") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Mustárral és kenyérrel 🤤`);
          return;
        }

        if (command === ":!kísértet") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Ott a 👻 a 💩nál!`);
          return;
        }

        if (command === ":!teriyaki") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Nyamm 🤩`);
          return;
        }

        if (command === ":!krumpli" || command === ":!burgonya") {
          sendMessage(
            `PRIVMSG #${TWITCH_CHANNEL} :🥔 Hasáb 🥔 Püré 🥔 Rakott 🥔 Petrezselymes 🥔 Tört 🥔 Töltött 🥔`
          );
          return;
        }

        if (command === ":!lóf") {
          sendMessage(`PRIVMSG #${TWITCH_CHANNEL} :Na de kérem! 😮`);
          return;
        }

        if (command === ":!sushi") {
          sendMessage(
            `PRIVMSG #${TWITCH_CHANNEL} :Lazac-avokádó maki rendel! 🍣✨`
          );
          return;
        }

        if (command === ":!bánat") {
          sendMessage(
            `PRIVMSG #${TWITCH_CHANNEL} :Utca, utca, bánat utca 🎵 Bánat kővel van kirakva 🎵 Azt is tudom, hogy ki rakta 🎵 Hogy én járjak sírva rajta 🎵 Nem járok én sírva rajta 🎵 Nem járok én sírva rajta 🎵 Járjon, aki rakosgatta 🎵 Járjon, aki rakosgatta`
          );
          return;
        }

        if (command === ":!elem") {
          sendMessage(
            `PRIVMSG #${TWITCH_CHANNEL} :Nem emelhetem el elemelem elemelhetetlen elemét, mert elemelem elemelhetetlen eleme elemelhetetlen!`
          );
          return;
        }
      }
    });
  }, [TWITCH_CHANNEL, lastMessage?.data, sendMessage]);

  useEffect(() => {
    if (lastMessage) {
      lastMessageChecks();
    }
  }, [lastMessage, lastMessageChecks]);

  // useWhatChanged(
  //   [
  //     onlineUsers,
  //     count,
  //     lastDisplayedMessage,
  //     readyState,
  //     lastMessage,
  //     lastMessageChecks,
  //   ],
  //   "onlineUsers,count,lastDisplayedMessage,readyState,lastMessage,lastMessageChecks"
  // );

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="card">
          <div>count is {count}</div>
          <div className="card">
            <p>{lastDisplayedMessage}</p>
          </div>
          <div className="grid grid-cols-5 bg-red-600">
            {onlineUsers.map((user, index) => (
              <div key={index}>{"💚 " + user}</div>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}

export default App;
