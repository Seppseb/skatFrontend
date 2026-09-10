import { useRef } from "react";
import Card from "./Card";
import { useCardSpacing } from "../hooks/useCardSpacing";

const BACK_WIDTH = 24; // matches Card's "small" width (w-6 = 1.5rem = 24px)

function OpponentCards({ count }) {
  const containerRef = useRef(null);
  const spacing = useCardSpacing({
    containerRef,
    count,
    cardWidth: BACK_WIDTH,
    gap: 4,
  });

  return (
    <div ref={containerRef} className="flex items-center justify-center min-w-0 w-full">
      {Array.from({ length: count }).map((_, index) => (
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

export default function OpponentSide({ playersOfThisSide, you }) {
  return (
    <div className="h-full flex flex-col justify-center items-stretch">
      <div className="flex flex-col gap-3">
        {playersOfThisSide && (
          <div
            key={playersOfThisSide.name}
            className={`bg-emerald-700 rounded-xl p-3 shadow text-sm text-center text-white
              ${playersOfThisSide.userId === you?.userId ? "border-2 border-yellow-400" : ""}`}
          >
            <p className="font-semibold mb-2 flex justify-center items-center gap-2">
              {playersOfThisSide.name}:&nbsp;
              <span className="text-xs tracking-wide">{playersOfThisSide.points ?? 0} Points</span>
            </p>
            <OpponentCards count={playersOfThisSide?.cardNumber ?? 0} />
          </div>
        )}
      </div>
    </div>
  );
}