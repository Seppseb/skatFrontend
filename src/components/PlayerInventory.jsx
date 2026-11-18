import { useRef, useState } from "react";
import Card from "./Card";
import BidButtons from "./BidButtons";
import { useStableCardOrder } from "../hooks/useStableCardOrder";
import { useCardSpacing } from "../hooks/useCardSpacing";

const CARD_WIDTH = 64; // matches Card's "medium" width (w-16 = 4rem = 64px)

export default function PlayerInventory({
  player,
  isPlayerTurn = false,
  bid = false,
  canBid = false,
  currentBid = null,
  nextBid = 18,
  isAnswering = false,
  canPlayCard = false,
  onBid,
  onStopBidding,
  onPlayCard,
}) {
  const [orderedCards, reorder, cardKey, sortBySkatRules] = useStableCardOrder(player?.cards);
  const [selectedKey, setSelectedKey] = useState(null);
  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const containerRef = useRef(null);
  const spacing = useCardSpacing({
    containerRef,
    count: orderedCards.length,
    cardWidth: CARD_WIDTH,
    gap: 8,
  });

  const selectedCard = orderedCards.find((c) => cardKey(c) === selectedKey) ?? null;

  function handlePlay() {
    if (!selectedCard) return;
    onPlayCard?.(selectedCard);
    setSelectedKey(null);
  }

  const cardSuit = selectedCard?.type || selectedCard?.suit;
  const cardVal = selectedCard?.value || selectedCard?.rank;

  return (
    <div
      className={`mx-4 my-2 px-4 flex items-center justify-between h-full gap-4 transition-all duration-200 rounded-xl
        ${isPlayerTurn ? "ring-2 ring-yellow-400 bg-emerald-900/60" : "bg-emerald-950/40"}`}
    >
      {/* Player info & Sort button */}
      <div className="w-44 flex-shrink-0 flex flex-col justify-center gap-1">
        <p className="font-semibold text-base truncate">
          {player?.name || "You"}
          {isPlayerTurn && <span className="ml-2 text-xs text-yellow-300 font-bold">(Your Turn)</span>}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-wide bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-200">
            {player?.points ?? 0} Points
          </span>
          {orderedCards.length > 0 && (
            <button
              onClick={sortBySkatRules}
              className="text-xs bg-emerald-800 hover:bg-emerald-700 text-white px-2 py-0.5 rounded shadow cursor-pointer transition"
              title="Sort cards by Skat rules"
            >
              Sort
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        ref={containerRef}
        className="flex items-center justify-center flex-1 min-w-0 h-28 overflow-visible"
      >
        {orderedCards.map((card, index) => (
          <Card
            key={cardKey(card)}
            card={card}
            size="medium"
            interactive
            overlap={index === 0 ? 0 : spacing - CARD_WIDTH}
            selected={selectedKey === cardKey(card)}
            onClick={() =>
              setSelectedKey((prev) => (prev === cardKey(card) ? null : cardKey(card)))
            }
            draggable
            onDragStart={() => (dragIndex.current = index)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDrop={() => {
              if (dragIndex.current !== null && dragIndex.current !== index) {
                reorder(dragIndex.current, index);
              }
              dragIndex.current = null;
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              dragIndex.current = null;
              setDragOverIndex(null);
            }}
            dragOver={dragOverIndex === index}
          />
        ))}
      </div>

      {/* Action Area: Play Card button OR Bidding Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!bid && selectedCard && (
          <button
            onClick={handlePlay}
            disabled={!canPlayCard}
            className={`flex-shrink-0 font-semibold px-4 py-2 rounded-xl shadow transition
              ${
                canPlayCard
                  ? "bg-yellow-400 hover:bg-yellow-300 text-emerald-950 cursor-pointer"
                  : "bg-slate-600 text-slate-300 opacity-60 cursor-not-allowed"
              }`}
          >
            Play {cardVal} of {cardSuit}
          </button>
        )}

        <BidButtons
          bid={bid}
          canBid={canBid}
          currentBid={currentBid}
          nextBid={nextBid}
          isAnswering={isAnswering}
          onBid={onBid}
          onStopBidding={onStopBidding}
        />
      </div>
    </div>
  );
}
