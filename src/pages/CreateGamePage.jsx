import { useState } from "react";
import { createGame } from "../api/gamesApi";
import { useNavigate } from "react-router-dom";

export default function CreateGamePage() {
  const navigate = useNavigate();

  const [maxPlayerSize, setMaxPlayerSize] = useState(3);
  
  const minMPS = 3;
  const maxMPS = 3;

  
  const handleMaxPlayerSizeChange = (value) => {
    let num = Number(value);
    num = Math.max(minMPS, num);
    num = Math.min(maxMPS, num);
    setMaxPlayerSize(num);
  };

  const handleCreateGame = async () => {
    const res = await createGame({
      maxPlayerSize,
    });

    navigate(`/games/${res.data.id}`);
  };

  return (
    <div>
      <h2>Create Game</h2>

      <fieldset style={{ marginBottom: "1rem" }}>
        <label>
            Maximum Player Count ({minMPS}-{maxMPS}):{" "}
            <input
              type="number"
              min={minMPS}
              max={maxMPS}
              value={maxPlayerSize}
              onChange={(e) => handleMaxPlayerSizeChange(e.target.value)}
            />
          </label>
      </fieldset>

      <button onClick={handleCreateGame}>Create New Game</button>
    </div>
  );
}
