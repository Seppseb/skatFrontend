import { useEffect, useRef, useState, useCallback } from "react";

export const cardKey = (card) => {
  if (!card) return "unknown";
  const suit = card.type || card.suit;
  const val = card.value || card.rank;
  return `${suit}-${val}`;
};

export function skatCardRank(card) {
  if (!card) return 999;
  const suit = card.type || card.suit;
  const val = card.value || card.rank;

  // Jacks are highest in Skat (Clubs > Spades > Hearts > Diamonds)
  if (val === "Jack") {
    const jackSuitOrder = { Clubs: 1, Spades: 2, Hearts: 3, Diamonds: 4 };
    return jackSuitOrder[suit] ?? 5;
  }

  // Non-jacks grouped by suit (Clubs, Spades, Hearts, Diamonds)
  const suitOrder = { Clubs: 10, Spades: 20, Hearts: 30, Diamonds: 40 };
  const valOrder = {
    Ace: 1,
    Ten: 2,
    King: 3,
    Queen: 4,
    Nine: 5,
    Eight: 6,
    Seven: 7,
  };

  return (suitOrder[suit] ?? 50) + (valOrder[val] ?? 9);
}

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

  const reorder = useCallback((fromIndex, toIndex) => {
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const sortBySkatRules = useCallback(() => {
    setOrder((prev) => {
      return [...prev].sort((a, b) => {
        const cardA = byKey.current.get(a);
        const cardB = byKey.current.get(b);
        return skatCardRank(cardA) - skatCardRank(cardB);
      });
    });
  }, []);

  return [orderedCards, reorder, cardKey, sortBySkatRules];
}
