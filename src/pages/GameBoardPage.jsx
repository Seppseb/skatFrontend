import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useGameWebSocket } from "../hooks/useGameWebSocket";
import OpponentSide from "../components/OpponentCards";
import PlayerInventory from "../components/PlayerInventory";
import { getGame, sendReady, build, buildRoad, getUserInfo, moveRobber, chooseVictim, confirmDice } from "../api/gamesApi";
import { playSound } from "../utils/sounds";
import roundStartSound from "../assets/sounds/SFX_impactjar01.wav";
import victorySound from "../assets/sounds/brass_positive_long.wav";

export default function GameBoardPage() {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState(null);
  const [log, setLog] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [player, setPlayer] = useState(null);
  const [leftPlayer, setLeftPlayer] = useState(null);
  const [rightPlayer, setRightPlayer] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);


  const handleWebSocketMessage = useCallback((event) => {
    fetchGame();
    handleSounds(event);
    if (event.type === 'INITIAL_ROLL' && event.playerId === playerId) {
      if (event.message) {
        const dice1 = event.message[0];
        const dice2 = event.message[1];
        setDiceValues([dice1, dice2]);
        setShowDicePopup(true);
      }
    }
    else if (event.type === 'INITIAL_PLACE' && event.playerId === playerId) {

    }
    else if (event.type === 'START_TURN' && event.playerId === playerId) {
      
    }
    else if (event.type === 'DICE_RESULT' && event.playerId === playerId) {

    }
    else if (event.type === 'THREW_DICE' && event.playerId === playerId) {

    }
    setLog(event);
  }, [playerId]);

  const { isConnected } = useGameWebSocket(gameId, handleWebSocketMessage);

  const handleSounds = (event) => {
    if (event == null || event.type == null) return;
    if (event.type === 'START_TURN' && event.playerId === playerId) {
      playSound(roundStartSound, 0.7);
    } else if (event.type == "BUILD_ROAD") {
      playSound(roadSound, 0.7);
    } else if (event.type == "BUILD_VILLAGE") {
      playSound(villageSound, 0.7);
    } else if (event.type == "BUILD_CITY") {
      playSound(citySound, 0.7);
    } else if (event.type == "MOVED_ROBBER") {
      playSound(robberSound, 0.7);
    } else if (event.type == "WON") {
      playSound(victorySound, 0.7);
    }
  }

  useEffect(() => {
    if (isConnected) {
      //console.log("WebSocket connected — sending READY");
      //sendReady(gameId);
    }
  }, [isConnected, gameId]);


  const handleChooseVictim = (chosenPlayerId) => {
    chooseVictim(gameId, chosenPlayerId);
    setShowVictimPopup(false);
  };


  useEffect(() => {
    fetchGame();
    fetchUserInfo();
  }, [gameId]);
  
  const fetchGame = async () => {
    const res = await getGame(gameId);
    const game = res.data;
    console.log(game);

    if (!!game.players && !!game.you) {
      const leftPlayerIndex = (game.you.playerIndex + 1) % 3;
      const rightPlayerIndex = (game.you.playerIndex + 2) % 3;
      for (const id in game.players) {
        let player = game.players[id];
        if (player.playerIndex == leftPlayerIndex) {
          setLeftPlayer(player);
        }
        if (player.playerIndex == rightPlayerIndex) {
          setRightPlayer(player);
        }
      }
    }
    setGame(game);
    if (game.players) {
      setPlayers(game.players);
    }
    if (game.you) {
      setPlayer(game.you);
    }
  };

  const fetchUserInfo = async () => {
    const res = await getUserInfo();
    if (!res || !res.data) return;
    const data = res.data.split(";");
    setPlayerId(data[0]);
    console.log(res.data);
  };
  
    
  useEffect(() => {
    const isNowPlayerTurn = !!playerId && playerId === game?.currentPlayer?.userId;
    setIsPlayerTurn(isNowPlayerTurn);
  }, [playerId, game, game?.currentPlayer, game?.state, game?.initialIsPlacingRoad, game?.isWaitingForMovingRobber, game?.isWaitingForChoosingVictim]);

  // center on load
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.4), 3));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - startDrag.x,
      y: e.clientY - startDrag.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleConfirmDice = () => {
    setShowDicePopup(false);
    if (!game || !game.state || game.state === "ROLL_FOR_POSITION") {
      sendReady(gameId);
    } else {
      confirmDice(gameId);
    }

  };

  const handleReturnToGame = () => {
    setShowWinPopup(false);
  };

  const handleBuild = (row, col) => {
    build(gameId, row, col);
  };

  const handleBuildRoad = (row, col) => {
    buildRoad(gameId, row, col);
  };

  const handleMoveRobber = (row, col) => {
    if (game?.board?.robber?.location?.rowIndex === null) return;
    if (game?.board?.robber?.location?.colIndex === null) return;
    moveRobber(gameId, game?.board?.robber?.location?.rowIndex, game?.board?.robber?.location?.colIndex, row, col);
  };


  return (
    <div className="flex flex-col h-screen w-screen bg-emerald-900 text-white">
      {/* ... existing layout ... */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/5 bg-emerald-800 border-r border-emerald-700 flex flex-col justify-center p-4">
          <OpponentSide playersOfThisSide={leftPlayer} you={player}/>
        </div>
        <div
          className="flex-1 bg-slate-900 relative overflow-hidden no-select"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute transition-transform duration-150 ease-in-out"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) translate(-50%, -50%)`,
              transformOrigin: "center",
              willChange: "transform",
            }}
          >

          </div>

          <div className="pointer-events-none absolute inset-0 border-4 border-emerald-950"></div>
        </div>
        <div className="w-1/5 bg-emerald-800 border-l border-emerald-700 flex flex-col justify-center p-4">
          <OpponentSide playersOfThisSide={rightPlayer} you={player}/>
        </div>
      </div>
      <div className="h-32 bg-emerald-950 border-t border-emerald-800">
      <PlayerInventory
        player={player}
        bid={true}
        canBid={true}
        onBid={() => console.log("bid")}
        onStopBidding={() => console.log("stop bidding")}
      />
      </div>
    </div>
  );
}