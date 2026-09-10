import React from "react";
import Card from "./Card";


export default function PlayerPanel({
  players,
  you,
}) {

  

  let playersOfThisSide;
  if (!!players && !!you) {
    let playerIndex = you.playerIndex;
    if (side === "left") playerIndex += 1;
    if (side === "right") playerIndex += 2;
    playerIndex = playerIndex % 3;

    for (const id in players) {
      let player = players[id];
      if (player.playerIndex == playerIndex) {
        playersOfThisSide = player;
        break;
      }
    }
  }

  return (
    <div className="h-full flex flex-col justify-center items-stretch">
      <div className="flex flex-col gap-3">
        { (playersOfThisSide ? (
            <div
              key={playersOfThisSide.name}
              className={`bg-emerald-700 rounded-xl p-3 shadow text-sm text-center text-white 
                ${playersOfThisSide.userId == you?.userId ? 'border-2 border-yellow-400' : ''}`
              }
            >
              <p className="font-semibold mb-2 flex justify-center items-center gap-2">
                {playersOfThisSide.name}:&nbsp;
                <span className="text-xs tracking-wide">{(playersOfThisSide.points ?? 0)} Points</span>
              </p>

              {/* Cards */}
              <div className="flex items-center justify-center gap-0 flex-1 min-w-0">
              {Array.from({ length: Math.max(playersOfThisSide?.cardNumber ?? 0, 12) }).map((_, index) => (
                <Card card={null} size={"small"} />
              ))}
              </div>

            </div>
            
          ) : null
        )}
      </div>
    </div>
  );
}
