import { useRef } from "react";
import Card from "./Card";
import { useCardSpacing } from "../hooks/useCardSpacing";

const BACK_WIDTH = 24; // matches Card's "small" width (w-6 = 1.5rem = 24px)

function OpponentCards({ count = 0 }) {
  const containerRef = useRef(null);
  const safeCount = Math.max(0, count);

  const spacing = useCardSpacing({
    containerRef,
    count: safeCount,
    cardWidth: BACK_WIDTH,
    gap: 4,
  });

  return (
    <div ref={containerRef} className="flex items-center justify-center min-w-0 w-full overflow-visible py-1">
      {Array.from({ length: safeCount }).map((_, index) => (
        <Card
          key={index}
          card={null}
          size="small"
          overlap={index === 0 ? 0 : spacing - BACK_WIDTH}
        />
      ))}
    </div>
  );
}

export default function OpponentSide({ player, isCurrentTurn = false, isRamsch = false }) {
  if (!player) {
    return (
      <div className="h-full flex items-center justify-center text-emerald-300 text-sm italic">
        Waiting for opponent...
      </div>
    );
  }

  const cardCount =
    typeof player.cardNumber === "number"
      ? player.cardNumber
      : Array.isArray(player.cards)
      ? player.cards.length
      : 0;

  return (
    <div className="h-full flex flex-col justify-center items-stretch">
      <div
        className={`bg-emerald-700/80 rounded-xl p-3 shadow-md text-sm text-center text-white transition-all duration-200
          ${
            isCurrentTurn
              ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-emerald-900 shadow-yellow-500/40"
              : "border border-emerald-600/50"
          }`}
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold text-base truncate">{player.name}</p>
          <span className="text-xs text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded-full">
            {player.points ?? 0} Pts
          </span>
        </div>

        {!isRamsch && player.currentBid != null && (
          <p className="text-xs text-yellow-300 mb-1">
            Bid: {player.currentBid}
          </p>
        )}

        {!isRamsch && player.hasPassed && (
          <span className="text-xs text-red-300 font-medium block mb-1">Passed (Weg)</span>
        )}

        <OpponentCards count={cardCount} />
      </div>
    </div>
  );
}
