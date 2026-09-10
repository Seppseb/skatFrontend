import { useRef, useState, useEffect } from "react";
import Card from "./Card";
import BidButtons from "./BidButtons";
import { useStableCardOrder } from "../hooks/useStableCardOrder";
import { useCardSpacing } from "../hooks/useCardSpacing";

const CARD_WIDTH = 64; // must match Card's "medium" width (w-16 = 4rem = 64px)

export default function PlayerInventory({
  player,
  bid,
  onBid,
  onStopBidding,
  onPlayCard,
}) {
  const [orderedCards, reorder, cardKey] = useStableCardOrder(player?.cards);
  const [selectedKey, setSelectedKey] = useState(null);
  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [canBid, setCanBid] = useState(false);


  useEffect(() => {
    setCanBid(player != null && player.isBidding);
  }, [player]);

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

  return (
    <div className="mx-4 my-2 px-4 flex items-center justify-between h-full gap-6">
      <div className="w-40 flex-shrink-0">
        <p className="font-semibold text-lg">
          {player?.name}:&nbsp;
          <span className="text-xs tracking-wide">{player?.points ?? 0} Points</span>
        </p>
      </div>

      {/* Cards */}
      <div
        ref={containerRef}
        className="flex items-center justify-center flex-1 min-w-0 h-32 overflow-visible"
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

      {selectedCard && (
        <button
          onClick={handlePlay}
          className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          Play {selectedCard.value} of {selectedCard.type}
        </button>
      )}

      <BidButtons
        bid={bid}
        canBid={canBid}
        onBid={onBid}
        onStopBidding={onStopBidding}
      />
    </div>
  );
}