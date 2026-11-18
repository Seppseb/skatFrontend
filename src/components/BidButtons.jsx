export default function BidButtons({
  bid = false,
  canBid = true,
  currentBid = null,
  nextBid = 18,
  isAnswering = false,
  onBid,
  onStopBidding,
}) {
  if (!bid) return null;

  const holdValue = currentBid ?? nextBid;

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={onBid}
        disabled={!canBid}
        className={`
          px-4
          py-2
          rounded-xl
          shadow
          font-semibold
          transition-colors
          ${
            canBid
              ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              : "bg-slate-600 opacity-50 cursor-not-allowed text-slate-300"
          }
        `}
      >
        {isAnswering ? `Hold (${holdValue})` : `Bid ${nextBid}`}
      </button>

      <button
        onClick={onStopBidding}
        disabled={!canBid}
        className={`
          px-4
          py-2
          rounded-xl
          shadow
          font-semibold
          transition-colors
          ${
            canBid
              ? "bg-rose-700 hover:bg-rose-600 text-white cursor-pointer"
              : "bg-slate-600 opacity-50 cursor-not-allowed text-slate-300"
          }
        `}
      >
        Pass (Weg)
      </button>
    </div>
  );
}
