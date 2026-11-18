import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useGameWebSocket } from "../hooks/useGameWebSocket";
import OpponentSide from "../components/OpponentCards";
import PlayerInventory from "../components/PlayerInventory";
import Card from "../components/Card";
import SkatDiscardDrawer from "../components/SkatDiscardDrawer";
import GameDeclarationModal from "../components/GameDeclarationModal";
import {
  getGame,
  getUserInfo,
  startGame as sendStartGame,
  bid as sendBid,
  stopBid as sendStopBid,
  pickSkat as sendPickSkat,
  discardSkat as sendDiscardSkat,
  declareGame as sendDeclareGame,
  playCard as sendPlayCard,
} from "../api/gamesApi";
import { playSound } from "../utils/sounds";
import roundStartSound from "../assets/sounds/SFX_impactjar01.wav";
import cardPlaySound from "../assets/sounds/SFX_impactwoodraw01.wav";
import victorySound from "../assets/sounds/brass_positive_long.wav";

export default function GameBoardPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [playerId, setPlayerId] = useState("");
  const [player, setPlayer] = useState(null);
  const [leftPlayer, setLeftPlayer] = useState(null);
  const [rightPlayer, setRightPlayer] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);

  // Skat flow states
  const [showSkatDrawer, setShowSkatDrawer] = useState(false);
  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [isHandGame, setIsHandGame] = useState(false);

  const fetchGame = useCallback(async () => {
    try {
      const res = await getGame(gameId);
      const gameData = res.data;
      setGame(gameData);

      if (gameData?.players && gameData?.you) {
        const leftPlayerIndex = (gameData.you.playerIndex + 1) % 3;
        const rightPlayerIndex = (gameData.you.playerIndex + 2) % 3;
        for (const id in gameData.players) {
          const p = gameData.players[id];
          if (p.playerIndex === leftPlayerIndex) {
            setLeftPlayer(p);
          }
          if (p.playerIndex === rightPlayerIndex) {
            setRightPlayer(p);
          }
        }
      }

      if (gameData?.you) {
        setPlayer(gameData.you);
      }

      // Automatically trigger Skat drawer or declaration modal based on game state
      // ONLY for the declarer (the player who won the auction)
      const isDeclarer = gameData?.you?.isDeclarer || gameData?.declarerId === gameData?.you?.userId;
      if (isDeclarer) {
        if (gameData?.state === "SKAT_PHASE" || gameData?.state === "DISCARDING") {
          setShowSkatDrawer(true);
        } else if (gameData?.state === "DECLARATION") {
          setShowDeclarationModal(true);
        }
      }
    } catch (err) {
      console.error("Failed to load game:", err);
    }
  }, [gameId]);

  const handleSounds = useCallback(
    (event) => {
      if (!event?.type) return;
      if (event.type === "START_TURN" && event.playerId === playerId) {
        playSound(roundStartSound, 0.7);
      } else if (event.type === "CARD_PLAYED") {
        playSound(cardPlaySound, 0.7);
      } else if (event.type === "WON" || event.type === "GAME_OVER") {
        playSound(victorySound, 0.7);
      }
    },
    [playerId]
  );

  const handleWebSocketMessage = useCallback(
    (event) => {
      fetchGame();
      handleSounds(event);
    },
    [fetchGame, handleSounds]
  );

  useGameWebSocket(gameId, handleWebSocketMessage);

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await getUserInfo();
      if (!res?.data) return;
      const data = res.data.split(";");
      setPlayerId(data[0]);
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  }, []);

  useEffect(() => {
    fetchGame();
    fetchUserInfo();
  }, [fetchGame, fetchUserInfo]);

  useEffect(() => {
    const isNowPlayerTurn = Boolean(
      playerId && game?.currentPlayer?.userId === playerId
    );
    setIsPlayerTurn(isNowPlayerTurn);
  }, [playerId, game]);

  // Skat actions
  const nextBidValue = game?.nextBid || (game?.currentBid ? (game.currentBid < 18 ? 18 : game.currentBid + 2) : 18);
  const bidValueToSend = game?.isAnswering ? (game?.currentBid ?? nextBidValue) : nextBidValue;
  const isBiddingPhase = game?.state === "BIDDING" || Boolean(game?.isBidding);
  const isCurrentBidder = isPlayerTurn && isBiddingPhase;
  const isRamsch = game?.state === "RAMSCH";
  const isOwner = Boolean(playerId && game?.ownerId && playerId === game.ownerId);

  const handleStartGameDirectly = async () => {
    try {
      await sendStartGame(gameId);
      fetchGame();
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  const handleBid = async () => {
    try {
      await sendBid(gameId, bidValueToSend);
      fetchGame();
    } catch (err) {
      console.error("Failed to submit bid:", err);
    }
  };

  const handleStopBidding = async () => {
    try {
      await sendStopBid(gameId);
      fetchGame();
    } catch (err) {
      console.error("Failed to stop bidding:", err);
    }
  };

  const handlePickSkat = async () => {
    try {
      await sendPickSkat(gameId);
      fetchGame();
    } catch (err) {
      console.error("Failed to pick skat:", err);
    }
  };

  const handlePlayHand = () => {
    setIsHandGame(true);
    setShowSkatDrawer(false);
    setShowDeclarationModal(true);
  };

  const handleConfirmDiscard = async (cards) => {
    try {
      await sendDiscardSkat(gameId, cards);
      setShowSkatDrawer(false);
      setShowDeclarationModal(true);
      fetchGame();
    } catch (err) {
      console.error("Failed to discard skat:", err);
    }
  };

  const handleDeclareGame = async (declaration) => {
    try {
      await sendDeclareGame(gameId, declaration);
      setShowDeclarationModal(false);
      fetchGame();
    } catch (err) {
      console.error("Failed to declare game:", err);
    }
  };

  const handlePlayCard = async (card) => {
    try {
      playSound(cardPlaySound, 0.7);
      await sendPlayCard(gameId, card);
      fetchGame();
    } catch (err) {
      console.error("Failed to play card:", err);
    }
  };

  // Turn check helpers
  const isLeftPlayerTurn = Boolean(
    leftPlayer && game?.currentPlayer?.userId === leftPlayer.userId
  );
  const isRightPlayerTurn = Boolean(
    rightPlayer && game?.currentPlayer?.userId === rightPlayer.userId
  );

  // Trick cards
  const trickCards = Array.isArray(game?.currentTrick)
    ? game.currentTrick
    : Array.isArray(game?.trickCards)
    ? game.trickCards
    : [];

  const isWaitingForPlayers = game?.state === "WAITING_FOR_PLAYERS";
  const playerCount = Object.keys(game?.players ?? {}).length;

  return (
    <div className="flex flex-col h-screen w-screen bg-emerald-900 text-white select-none">
      {/* Main Table area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Opponent */}
        <div className="w-1/5 bg-emerald-800/90 border-r border-emerald-700/60 flex flex-col justify-center p-4">
          <OpponentSide player={leftPlayer} isCurrentTurn={isLeftPlayerTurn} isRamsch={isRamsch} />
        </div>

        {/* Center Felt / Table */}
        <div className="flex-1 bg-gradient-to-b from-emerald-800 to-emerald-950 relative overflow-hidden flex flex-col items-center justify-between p-6">
          {/* Header Info Banner */}
          <div className="bg-emerald-950/70 border border-emerald-700/50 rounded-2xl px-6 py-2 shadow-lg flex items-center gap-6 text-sm flex-wrap justify-center">
            <div>
              <span className="text-emerald-400 font-medium">State: </span>
              <span className="font-semibold text-white">{game?.state || "Connecting..."}</span>
            </div>

            {game?.currentBid != null && (
              <div className="border-l border-emerald-700/60 pl-6">
                <span className="text-emerald-400 font-medium">Current Bid: </span>
                <span className="font-bold text-yellow-300">{game.currentBid}</span>
              </div>
            )}

            {game?.gameType && (
              <div className="border-l border-emerald-700/60 pl-6">
                <span className="text-emerald-400 font-medium">Contract: </span>
                <span className="font-bold text-white">{game.gameType}</span>
              </div>
            )}

            {isRamsch && (
              <div className="border-l border-emerald-700/60 pl-6">
                <span className="text-amber-400 font-medium">Mode: </span>
                <span className="font-bold text-amber-300">Ramsch</span>
                <span className="text-xs text-emerald-200 ml-2 font-normal hidden md:inline">(Fewest points wins! Only Jacks are trumps)</span>
              </div>
            )}

            {game?.currentPlayer && (
              <div className="border-l border-emerald-700/60 pl-6">
                <span className="text-emerald-400 font-medium">Turn: </span>
                <span className="font-bold text-yellow-400">
                  {game.currentPlayer.name || game.currentPlayer.userId}
                </span>
              </div>
            )}
          </div>

          {/* If waiting for players, show an informative banner with start button */}
          {isWaitingForPlayers && (
            <div className="my-auto bg-emerald-950/90 border-2 border-yellow-500/80 rounded-2xl p-6 text-center max-w-md shadow-2xl flex flex-col items-center gap-3">
              <span className="text-3xl">⏳</span>
              <h3 className="text-lg font-bold text-yellow-300">
                Waiting for Players ({playerCount}/3)
              </h3>
              <p className="text-xs text-emerald-200">
                Skat requires 3 players. Once all 3 have joined the lobby, the game will deal 10 cards to each player and 2 into the Skat, transitioning straight to the Bidding phase.
              </p>
              {isOwner && (
                <button
                  onClick={handleStartGameDirectly}
                  className="mt-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold px-5 py-2.5 rounded-xl shadow cursor-pointer transition"
                >
                  ▶ Start Game (Deal Cards)
                </button>
              )}
            </div>
          )}

          {/* Center Trick Area (Stich) */}
          {!isWaitingForPlayers && (
            <div className="flex flex-col items-center justify-center my-auto">
              <p className="text-xs font-semibold tracking-wider text-emerald-300 uppercase mb-3">
                Current Trick
              </p>

              <div className="flex items-center justify-center gap-4 min-h-[120px] bg-emerald-900/40 border border-emerald-700/40 rounded-2xl p-6 shadow-inner">
                {trickCards.length > 0 ? (
                  trickCards.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <Card card={c.card || c} size="large" />
                      {c.playerName && (
                        <span className="text-xs text-emerald-200 font-medium">{c.playerName}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex gap-4">
                    {[0, 1, 2].map((slot) => (
                      <div
                        key={slot}
                        className="w-20 h-28 border-2 border-dashed border-emerald-700/60 rounded-lg flex items-center justify-center text-xs text-emerald-500/60"
                      >
                        Slot {slot + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skat Cards (if on table) */}
              {game?.skat && Array.isArray(game.skat) && (
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-xs text-emerald-300 mb-1">
                    {isRamsch ? "Skat (awarded to 10th trick winner)" : "Skat"}
                  </span>
                  <div className="flex gap-2">
                    {game.skat.map((skatCard, idx) => (
                      <Card key={idx} card={skatCard} size="small" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table decorative border */}
          <div className="pointer-events-none absolute inset-0 border-4 border-emerald-950/60 rounded-none"></div>
        </div>

        {/* Right Opponent */}
        <div className="w-1/5 bg-emerald-800/90 border-l border-emerald-700/60 flex flex-col justify-center p-4">
          <OpponentSide player={rightPlayer} isCurrentTurn={isRightPlayerTurn} isRamsch={isRamsch} />
        </div>
      </div>

      {/* Bottom Inventory (Player's Hand & Controls) */}
      <div className="h-36 bg-emerald-950 border-t border-emerald-800/80">
        <PlayerInventory
          player={player}
          isPlayerTurn={isPlayerTurn}
          bid={isBiddingPhase}
          canBid={isCurrentBidder}
          currentBid={game?.currentBid}
          nextBid={nextBidValue}
          isAnswering={Boolean(game?.isAnswering)}
          canPlayCard={isPlayerTurn && !isBiddingPhase && !isWaitingForPlayers}
          onBid={handleBid}
          onStopBidding={handleStopBidding}
          onPlayCard={handlePlayCard}
        />
      </div>

      {/* Skat Pickup & Discard Drawer */}
      <SkatDiscardDrawer
        isOpen={showSkatDrawer}
        skat={game?.skat || []}
        playerCards={player?.cards || []}
        onPickSkat={handlePickSkat}
        onPlayHand={handlePlayHand}
        onConfirmDiscard={handleConfirmDiscard}
      />

      {/* Game Declaration Modal */}
      <GameDeclarationModal
        isOpen={showDeclarationModal}
        isHand={isHandGame}
        onDeclare={handleDeclareGame}
      />
    </div>
  );
}
