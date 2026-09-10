export default function Scoreboard({ scores = [] }) {
    const sortedScores = [...scores]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  
    return (
      <div className="w-44 flex-shrink-0">
        <div className="bg-slate-800 rounded-xl px-3 py-2 shadow">
          <p className="font-semibold text-sm mb-1">
            Score
          </p>
  
          <div className="space-y-1">
            {sortedScores.map((player, index) => (
              <div
                key={player.name ?? index}
                className="flex justify-between items-center text-sm"
              >
                <span className="truncate mr-2">
                  {player.name}
                </span>
  
                <span className="font-semibold">
                  {player.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }