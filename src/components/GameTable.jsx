import { useNavigate } from "react-router-dom";

export default function GameTable({ games = [] }) {
  const navigate = useNavigate();

  function handleJoinGame(id) {
    navigate(`/games/${id}`);
  }

  return (
    <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>State</th>
          <th>Players</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {games.length === 0 && (
          <tr><td colSpan="4" align="center">No games found</td></tr>
        )}
        {games.map((g) => (
          <tr key={g.id}>
            <td>{g.id}</td>
            <td>{g.state}</td>
            <td>{Object.keys(g.players ?? {}).length}</td>
            <td>
              <button onClick={() => handleJoinGame(g.id)}>Enter</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
