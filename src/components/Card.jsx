import SpadesKing from "../assets/cards/SpadesKing.png";
import SpadesQueen from "../assets/cards/SpadesQueen.png";
import SpadesJack from "../assets/cards/SpadesJack.png";
import SpadesAce from "../assets/cards/SpadesAce.png";
import SpadesSeven from "../assets/cards/SpadesSeven.png";
import SpadesEight from "../assets/cards/SpadesEight.png";
import SpadesNine from "../assets/cards/SpadesNine.png";
import SpadesTen from "../assets/cards/SpadesTen.png";

import HeartsKing from "../assets/cards/HeartsKing.png";
import HeartsQueen from "../assets/cards/HeartsQueen.png";
import HeartsJack from "../assets/cards/HeartsJack.png";
import HeartsAce from "../assets/cards/HeartsAce.png";
import HeartsSeven from "../assets/cards/HeartsSeven.png";
import HeartsEight from "../assets/cards/HeartsEight.png";
import HeartsNine from "../assets/cards/HeartsNine.png";
import HeartsTen from "../assets/cards/HeartsTen.png";

import DiamondsKing from "../assets/cards/DiamondsKing.png";
import DiamondsQueen from "../assets/cards/DiamondsQueen.png";
import DiamondsJack from "../assets/cards/DiamondsJack.png";
import DiamondsAce from "../assets/cards/DiamondsAce.png";
import DiamondsSeven from "../assets/cards/DiamondsSeven.png";
import DiamondsEight from "../assets/cards/DiamondsEight.png";
import DiamondsNine from "../assets/cards/DiamondsNine.png";
import DiamondsTen from "../assets/cards/DiamondsTen.png";

import ClubsKing from "../assets/cards/ClubsKing.png";
import ClubsQueen from "../assets/cards/ClubsQueen.png";
import ClubsJack from "../assets/cards/ClubsJack.png";
import ClubsAce from "../assets/cards/ClubsAce.png";
import ClubsSeven from "../assets/cards/ClubsSeven.png";
import ClubsEight from "../assets/cards/ClubsEight.png";
import ClubsNine from "../assets/cards/ClubsNine.png";
import ClubsTen from "../assets/cards/ClubsTen.png";

import BackSite from "../assets/cards/BackSite.png";

const cardImages = {
  Spades: {
    King: SpadesKing,
    Queen: SpadesQueen,
    Jack: SpadesJack,
    Ace: SpadesAce,
    Seven: SpadesSeven,
    Eight: SpadesEight,
    Nine: SpadesNine,
    Ten: SpadesTen,
  },

  Hearts: {
    King: HeartsKing,
    Queen: HeartsQueen,
    Jack: HeartsJack,
    Ace: HeartsAce,
    Seven: HeartsSeven,
    Eight: HeartsEight,
    Nine: HeartsNine,
    Ten: HeartsTen,
  },

  Diamonds: {
    King: DiamondsKing,
    Queen: DiamondsQueen,
    Jack: DiamondsJack,
    Ace: DiamondsAce,
    Seven: DiamondsSeven,
    Eight: DiamondsEight,
    Nine: DiamondsNine,
    Ten: DiamondsTen,
  },

  Clubs: {
    King: ClubsKing,
    Queen: ClubsQueen,
    Jack: ClubsJack,
    Ace: ClubsAce,
    Seven: ClubsSeven,
    Eight: ClubsEight,
    Nine: ClubsNine,
    Ten: ClubsTen,
  },
};

const SIZE_CLASSES = {
  small: "w-6 h-9",
  medium: "w-16 h-24",
  large: "w-20 h-28",
};

export default function Card({
  card,
  size = "medium",
  overlap = 0,
  selected = false,
  interactive = false,
  onClick,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragOver = false,
}) {
  const image = cardImages[card?.type]?.[card?.value] || BackSite;
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.medium;

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOver : undefined}
      onDrop={draggable ? onDrop : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      onClick={interactive ? onClick : undefined}
      style={{ marginLeft: overlap }}
      className={[
        "relative flex-shrink-0 transition-transform duration-150 ease-out select-none",
        sizeClass,
        interactive ? "cursor-pointer" : "",
        selected
          ? "-translate-y-4 z-30"
          : interactive
          ? "hover:-translate-y-3 hover:scale-[1.15] hover:z-30"
          : "",
        dragOver ? "ring-2 ring-yellow-300 rounded-lg" : "",
      ].join(" ")}
    >
      <img
        src={image}
        alt={card ? `${card.type} of ${card.value}` : "Card back"}
        draggable="false"
        className="w-full h-full object-contain rounded-lg shadow select-none pointer-events-none"
      />
    </div>
  );
}