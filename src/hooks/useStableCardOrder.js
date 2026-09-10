import { useEffect, useRef, useState } from "react";

const cardKey = (card) => `${card.type}-${card.value}`;

export function useStableCardOrder(cards) {
  const [order, setOrder] = useState(() => (cards ?? []).map(cardKey));
  const byKey = useRef(new Map());

  useEffect(() => {
    const map = new Map();
    (cards ?? []).forEach((c) => map.set(cardKey(c), c));
    byKey.current = map;

    setOrder((prev) => {
      const incoming = new Set(map.keys());
      const kept = prev.filter((k) => incoming.has(k));
      const keptSet = new Set(kept);
      const added = (cards ?? [])
        .map(cardKey)
        .filter((k) => !keptSet.has(k));
      return [...kept, ...added];
    });
  }, [cards]);

  const orderedCards = order.map((k) => byKey.current.get(k)).filter(Boolean);

  function reorder(fromIndex, toIndex) {
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  return [orderedCards, reorder, cardKey];
}