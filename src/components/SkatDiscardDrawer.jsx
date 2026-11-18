import { useState, useEffect } from "react";
import Card from "./Card";
import { cardKey } from "../hooks/useStableCardOrder";

export default function SkatDiscardDrawer({
  isOpen = false,
  skat = [],
  playerCards = [],
  onPickSkat,
  onPlayHand,
  onConfirmDiscard,
}) {
  const [hasPickedUp, setHasPickedUp] = useState(false);
  const [selectedToDiscard, setSelectedToDiscard] = useState([]);

  // Reset internal state when the drawer opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasPickedUp(false);
      setSelectedToDiscard([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // After picking up, the backend adds the 2 skat cards to the player's hand,
  // so playerCards will already contain 12 cards. We just use playerCards directly.
  // Before picking up, we show the player's 10 cards separately from the skat preview.
  const cardsToShow = hasPickedUp ? playerCards : playerCards;

  const toggleDiscardCard = (card) => {
    const key = cardKey(card);
    if (selectedToDiscard.some((c) => cardKey(c) === key)) {
      setSelectedToDiscard((prev) => prev.filter((c) => cardKey(c) !== key));
    } else {
      if (selectedToDiscard.length < 2) {
        setSelectedToDiscard((prev) => [...prev, card]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedToDiscard.length !== 2) return;
    onConfirmDiscard?.(selectedToDiscard);
  };

  const isSelected = (card) =>
    selectedToDiscard.some((c) => cardKey(c) === cardKey(card));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-4xl bg-emerald-950 border-t-2 border-emerald-600 rounded-t-3xl shadow-2xl p-6 text-white flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-emerald-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-yellow-300">
              Skat Phase: You Won The Auction!
            </h2>
            <p className="text-sm text-emerald-200">
              {!hasPickedUp
                ? "You can pick up the Skat cards to improve your hand, or play a Hand game for a higher score multiplier."
                : `Select exactly 2 cards from your ${cardsToShow.length} cards to discard into the Skat (drücken).`}
            </p>
          </div>
        </div>

        {/* Phase 1: Not picked up yet */}
        {!hasPickedUp ? (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-3">
                The 2 Skat Cards
              </p>
              <div className="flex gap-4 justify-center">
                {(skat && skat.length > 0 ? skat : [null, null]).map(
                  (c, idx) => (
                    <Card key={idx} card={c} size="large" />
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setHasPickedUp(true);
                  onPickSkat?.();
                }}
                className="bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold px-6 py-3 rounded-xl shadow-lg cursor-pointer transition transform hover:scale-105"
              >
                📥 Pick Up Skat (Take 2 Cards)
              </button>

              <button
                onClick={onPlayHand}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow cursor-pointer transition"
              >
                ✋ Play Hand Game (Keep Skat Secret)
              </button>
            </div>
          </div>
        ) : (
          /* Phase 2: Picked up, now selecting 2 cards to discard */
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-emerald-900/60 px-4 py-2 rounded-xl border border-emerald-700/50">
              <span className="text-sm font-semibold text-emerald-100">
                Discard Selection:{" "}
                <span
                  className={
                    selectedToDiscard.length === 2
                      ? "text-yellow-300 font-bold"
                      : "text-rose-300 font-bold"
                  }
                >
                  {selectedToDiscard.length} / 2 cards selected
                </span>
                <span className="text-xs text-emerald-400 ml-3">
                  ({cardsToShow.length} cards in hand)
                </span>
              </span>
              <p className="text-xs text-emerald-300 italic">
                Tip: Card points in the Skat count toward your final score!
              </p>
            </div>

            {/* Cards display */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2">
              {cardsToShow.map((card, idx) => {
                const selected = isSelected(card);
                return (
                  <div
                    key={cardKey(card) || idx}
                    onClick={() => toggleDiscardCard(card)}
                    className={`relative cursor-pointer transition-transform duration-150 rounded-lg p-1 ${
                      selected
                        ? "ring-4 ring-rose-500 -translate-y-2 bg-rose-950/60"
                        : "hover:-translate-y-1"
                    }`}
                  >
                    <Card card={card} size="medium" />
                    {selected && (
                      <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                        ✕
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-emerald-800">
              <button
                onClick={handleConfirm}
                disabled={selectedToDiscard.length !== 2}
                className={`font-bold px-6 py-2.5 rounded-xl shadow transition ${
                  selectedToDiscard.length === 2
                    ? "bg-yellow-400 hover:bg-yellow-300 text-emerald-950 cursor-pointer"
                    : "bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                Confirm Discard & Choose Game ({selectedToDiscard.length}/2)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
