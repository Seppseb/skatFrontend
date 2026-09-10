import { useEffect, useState } from "react";

export function useCardSpacing({ containerRef, count, cardWidth, gap = 8, minVisibleFraction = 0.25 }) {
  const [spacing, setSpacing] = useState(cardWidth + gap);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const containerWidth = el.clientWidth;
      const natural = cardWidth + gap;

      if (count <= 1) {
        setSpacing(natural);
        return;
      }

      const neededWidth = natural * (count - 1) + cardWidth;
      if (neededWidth <= containerWidth) {
        setSpacing(natural);
      } else {
        const maxSpacing = (containerWidth - cardWidth) / (count - 1);
        setSpacing(Math.max(maxSpacing, cardWidth * minVisibleFraction));
      }
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, count, cardWidth, gap, minVisibleFraction]);

  return spacing; // px distance between successive card left-edges
}