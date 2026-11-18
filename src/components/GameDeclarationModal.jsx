import { useState } from "react";

const GAME_TYPES = [
  { id: "GRAND", label: "Grand", symbol: "👑", base: 24, desc: "Only Jacks are trumps" },
  { id: "CLUBS", label: "Clubs (Kreuz)", symbol: "♣", base: 12, desc: "Jacks + Clubs are trumps", color: "text-emerald-400" },
  { id: "SPADES", label: "Spades (Pik)", symbol: "♠", base: 11, desc: "Jacks + Spades are trumps", color: "text-blue-300" },
  { id: "HEARTS", label: "Hearts (Herz)", symbol: "♥", base: 10, desc: "Jacks + Hearts are trumps", color: "text-rose-400" },
  { id: "DIAMONDS", label: "Diamonds (Karo)", symbol: "♦", base: 9, desc: "Jacks + Diamonds are trumps", color: "text-amber-400" },
  { id: "NULL", label: "Null", symbol: "🚫", base: 23, desc: "No trumps; take 0 tricks to win", color: "text-purple-300" },
];

export default function GameDeclarationModal({
  isOpen = false,
  isHand = false,
  onDeclare,
}) {
  const [selectedType, setSelectedType] = useState("GRAND");
  const [schneiderAnnounced, setSchneiderAnnounced] = useState(false);
  const [schwarzAnnounced, setSchwarzAnnounced] = useState(false);
  const [ouvert, setOuvert] = useState(false);

  if (!isOpen) return null;

  const isNull = selectedType === "NULL";

  const handleDeclare = () => {
    onDeclare?.({
      gameType: selectedType,
      hand: isHand,
      schneider: !isNull && schneiderAnnounced,
      schwarz: !isNull && schwarzAnnounced,
      ouvert: ouvert,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-emerald-950 border border-emerald-600 rounded-3xl shadow-2xl p-6 text-white flex flex-col gap-5">
        {/* Title */}
        <div className="border-b border-emerald-800 pb-3">
          <h2 className="text-xl font-bold text-yellow-300">
            Declare Game (Spielansage)
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Choose your contract. As declarer, you play alone against the two other players.
          </p>
        </div>

        {/* Game Type Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GAME_TYPES.map((gt) => {
            const isSelected = selectedType === gt.id;
            return (
              <button
                key={gt.id}
                type="button"
                onClick={() => setSelectedType(gt.id)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-800 border-yellow-400 ring-2 ring-yellow-400 shadow-lg scale-102"
                    : "bg-emerald-900/60 border-emerald-700/60 hover:bg-emerald-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-2xl ${gt.color || ""}`}>{gt.symbol}</span>
                  <span className="text-xs bg-emerald-950 px-2 py-0.5 rounded font-mono text-emerald-300">
                    {gt.id === "NULL" ? "Val: 23" : `Base: ${gt.base}`}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="font-bold text-sm">{gt.label}</p>
                  <p className="text-[11px] text-emerald-300/80 leading-tight mt-0.5">
                    {gt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modifiers / Announcements */}
        {!isNull ? (
          <div className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
              Optional Announcements
            </p>

            {isHand && (
              <span className="text-xs text-yellow-300 bg-yellow-950/60 px-2.5 py-1 rounded-lg border border-yellow-700/50 inline-block mb-1">
                ✋ Hand Game Active (Played without picking up Skat)
              </span>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-emerald-950/50 p-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={schneiderAnnounced}
                  onChange={(e) => {
                    setSchneiderAnnounced(e.target.checked);
                    if (!e.target.checked) setSchwarzAnnounced(false);
                  }}
                  className="rounded accent-emerald-500 cursor-pointer"
                />
                <span>Schneider angesagt (Win ≥ 90 pts)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-emerald-950/50 p-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={schwarzAnnounced}
                  onChange={(e) => {
                    setSchwarzAnnounced(e.target.checked);
                    if (e.target.checked) setSchneiderAnnounced(true);
                  }}
                  className="rounded accent-emerald-500 cursor-pointer"
                />
                <span>Schwarz angesagt (Win all 10 tricks)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-emerald-950/50 p-2 rounded-xl sm:col-span-2">
                <input
                  type="checkbox"
                  checked={ouvert}
                  onChange={(e) => setOuvert(e.target.checked)}
                  className="rounded accent-emerald-500 cursor-pointer"
                />
                <span>Ouvert (Open Hand - show all your cards to opponents)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-900/40 border border-emerald-800 rounded-2xl p-4 text-xs">
            <p className="font-semibold text-emerald-200 mb-1">Null Game Rules:</p>
            <p className="text-emerald-300/90">
              There are no trumps. Card rank: Ace, King, Queen, Jack, 10, 9, 8, 7.
              You must lose every trick. If you win even a single trick, you lose the game immediately.
            </p>
            <label className="flex items-center gap-2 cursor-pointer mt-3 bg-emerald-950/50 p-2 rounded-xl">
              <input
                type="checkbox"
                checked={ouvert}
                onChange={(e) => setOuvert(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer"
              />
              <span>Null Ouvert (Open hand: 46 pts / Hand Ouvert: 59 pts)</span>
            </label>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleDeclare}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold py-3 rounded-2xl shadow-lg cursor-pointer transition text-base"
          >
            Confirm & Start Playing ({selectedType})
          </button>
        </div>
      </div>
    </div>
  );
}
