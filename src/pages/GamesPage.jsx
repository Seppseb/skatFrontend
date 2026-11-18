import { useEffect, useState, useCallback } from "react";
import { useGameListWebSocket } from "../hooks/useGameWebSocket";
import { listGames } from "../api/gamesApi";
import GameTable from "../components/GameTable";
import GameFilter from "../components/GameFilter";
import { useNavigate } from "react-router-dom";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("notStarted");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const handleWebSocketMessage = useCallback(() => {
    fetchGames();
  }, []);

  useGameListWebSocket(handleWebSocketMessage);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await listGames();
      setGames(res.data || []);
    } catch (err) {
      console.error("Failed to load games:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleCreateGame = async () => {
    navigate(`/createGame`);
  };

  const filtered = games.filter((g) => {
    if (filter === "notStarted") return g.state === "WAITING_FOR_PLAYERS";
    if (filter === "ongoing") return g.state !== "WAITING_FOR_PLAYERS" && g.state !== "FINISHED";
    if (filter === "past") return g.state === "FINISHED";
    return true;
  });

  return (
    <div>
      <h2>Available Games</h2>
      <GameFilter filter={filter} setFilter={setFilter} />
      {loading && games.length === 0 ? (
        <p>Loading games...</p>
      ) : (
        <GameTable games={filtered} />
      )}
      <div>
        <br />
        <button onClick={handleCreateGame}>Create New Game</button>
      </div>
    </div>
  );
}
