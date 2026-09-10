export default function BidButtons({
  bid = false,
  canBid = true,
  onBid,
  onStopBidding,
}) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {bid && (
        <button
          onClick={onBid}
          disabled={!canBid}
          className={`
            px-4
            py-2
            rounded-xl
            shadow
            font-semibold
            ${
              canBid
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-slate-500 opacity-60 cursor-not-allowed"
            }
          `}
        >
          Bid
        </button>
      )}

      {bid && (
        <button
          onClick={onStopBidding}
          disabled={!canBid}
          className={`
            px-4
            py-2
            rounded-xl
            shadow
            font-semibold
            ${
              canBid
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-slate-500 opacity-60 cursor-not-allowed"
            }
          `}
        >
          Stop Bidding
        </button>
      )}
    </div>
  );
}