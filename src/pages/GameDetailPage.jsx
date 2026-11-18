import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getGameInfo, getUserInfo, joinGame, startGame } from "../api/gamesApi";
import { useGameWebSocket } from "../hooks/useGameWebSocket";

export default function GameDetailPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [name, setName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  const continueToGamePage = useCallback(() => {
    navigate(`/games/${gameId}/board`);
  }, [navigate, gameId]);

  const handleWebSocketMessage = useCallback(
    (event) => {
      if (event?.game) {
        setGame(event.game);
        if (event.game.state && event.game.state !== "WAITING_FOR_PLAYERS") {
          continueToGamePage();
          return;
        }
      }

      const eventType = (event?.type || "").toUpperCase();
      if (
        eventType === "STARTED_GAME" ||
        eventType === "GAME_STARTED" ||
        eventType === "START_GAME" ||
        eventType === "START" ||
        eventType === "BIDDING" ||
        eventType === "RAMSCH_STARTED"
      ) {
        continueToGamePage();
      }
    },
    [continueToGamePage]
  );

  useGameWebSocket(gameId, handleWebSocketMessage);

  const fetchGame = useCallback(async () => {
    try {
      const res = await getGameInfo(gameId);
      const gameData = res.data;
      setGame(gameData);

      // If the game has already started, automatically forward to the board
      if (gameData?.state && gameData.state !== "WAITING_FOR_PLAYERS") {
        continueToGamePage();
      }
    } catch (err) {
      console.error("Failed to load game info:", err);
    }
  }, [gameId, continueToGamePage]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await getUserInfo();
      if (!res?.data) return;
      const data = res.data.split(";");
      setPlayerId(data[0]);
      setName(data[1] || "");
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  }, []);

  useEffect(() => {
    fetchGame();
    fetchUserInfo();
  }, [fetchGame, fetchUserInfo]);

  useEffect(() => {
    if (game) {
      const started = Boolean(game.state && game.state !== "WAITING_FOR_PLAYERS");
      setHasStarted(started);
      setIsOwner(Boolean(playerId && game.ownerId && playerId === game.ownerId));

      if (started) {
        continueToGamePage();
      }
    }
  }, [game, playerId, continueToGamePage]);

  const handleJoin = async () => {
    if (!name || name.trim().length < 1) return;
    try {
      const res = await joinGame(gameId, name.trim());
      if (res?.data?.userId) {
        localStorage.setItem("userId", res.data.userId);
        setPlayerId(res.data.userId);
      }
      fetchGame();
    } catch (err) {
      console.error("Failed to join game:", err);
    }
  };

  const handleStartGame = async () => {
    if (isOwner) {
      try {
        const res = await startGame(gameId);
        if (res?.data?.state && res.data.state !== "WAITING_FOR_PLAYERS") {
          continueToGamePage();
        } else {
          fetchGame();
        }
      } catch (err) {
        console.error("Failed to start game:", err);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleJoin();
    }
  };

  const handleNameFieldChange = (val) => {
    if (val && val.length > 15) return;
    setName(val);
  };

  const copyGameLink = async () => {
    const link = `${window.location.origin}/skatFrontend/games/${gameId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  if (!game) return <p>Loading...</p>;

  const playerList = Object.values(game.players ?? {});
  const playerNumber = playerList.length;
  const maxPlayers = game.config?.maxPlayerSize || 3;
  const isJoined = Boolean(playerId && game.players?.[playerId]);

  return (
    <div>
      <h2 style={{ marginBottom: "0.5rem" }}>Game Lobby</h2>
      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1rem" }}>
        Room Code: {gameId}
      </p>

      <div style={{ marginBottom: "1.5rem", fontWeight: "bold" }}>
        {hasStarted ? "🟢 Game started" : "🟡 Waiting for players"}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3>
          Players ({playerNumber}/{maxPlayers})
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          {playerList.map((p) => (
            <div
              key={p.userId || p.id || p.name}
              style={{
                color: "#222",
                background: "#e8f0fe",
                padding: "0.4rem 0.6rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "bold",
              }}
            >
              {p.name}
            </div>
          ))}

          {Array.from({ length: Math.max(0, maxPlayers - playerNumber) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                background: "#f1f3f5",
                padding: "0.4rem 0.6rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#888",
              }}
            >
              ⬜ Empty
            </div>
          ))}
        </div>
      </div>

      {!hasStarted && (
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginRight: "0.5rem",
            }}
            placeholder="Name"
            value={name}
            onChange={(e) => handleNameFieldChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            style={{
              padding: "0.5rem 0.8rem",
              borderRadius: "8px",
              border: "none",
              background: "#4c8bf5",
              color: "white",
              cursor: "pointer",
            }}
            onClick={handleJoin}
          >
            {!isJoined ? "Join Game" : "Change Name"}
          </button>
        </div>
      )}

      {!hasStarted && playerNumber >= 2 && isOwner && (
        <button
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: "10px",
            border: "none",
            background: "#22c55e",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
          onClick={handleStartGame}
        >
          ▶ Start Game
        </button>
      )}

      {!hasStarted && playerNumber < 2 && (
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Waiting for players (at least 2, typically 3)...
        </p>
      )}

      {!hasStarted && playerNumber >= 2 && !isOwner && (
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Waiting for <strong>{game.players?.[game.ownerId]?.name}</strong> to start...
        </p>
      )}

      {hasStarted && (
        <button
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: "10px",
            border: "none",
            background: "#22c55e",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
          onClick={continueToGamePage}
        >
          ↪ Continue to Game
        </button>
      )}

      <button
        style={{
          background: "transparent",
          border: "none",
          color: "#4c8bf5",
          cursor: "pointer",
        }}
        onClick={copyGameLink}
      >
        {copied ? "✔ Link copied!" : "Invite Friends"}
      </button>
    </div>
  );
}
