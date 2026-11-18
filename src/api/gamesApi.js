import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: API_BASE + "/api/games",
});

API.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId");

  if (userId) {
    config.headers["X-User-Id"] = userId;
  }

  return config;
});

// Lobby & Lifecycle
export const listGames = () => API.get("");
export const createGame = (config) => API.post("/create", config);
export const joinGame = (gameId, name) => API.post(`/${gameId}/join?name=${encodeURIComponent(name)}`);
export const startGame = (gameId) => API.post(`/${gameId}/start`);
export const sendReady = (gameId) => API.post(`/${gameId}/ready`);
export const getGameInfo = (gameId) => API.get(`/info/${gameId}`);
export const getGame = (gameId) => API.get(`/${gameId}`);
export const getUserInfo = () => API.get(`/whoAmI`);

// Skat Game Actions
export const bid = (gameId, bidValue) => API.post(`/${gameId}/bid`, { bid: bidValue });
export const stopBid = (gameId) => API.post(`/${gameId}/stopBid`);
export const passBid = (gameId) => API.post(`/${gameId}/passBid`);
export const pickSkat = (gameId) => API.post(`/${gameId}/pickSkat`);
export const discardSkat = (gameId, cards) => API.post(`/${gameId}/discardSkat`, { cards });
export const declareGame = (gameId, declaration) => API.post(`/${gameId}/declareGame`, declaration);
export const playCard = (gameId, card) => API.post(`/${gameId}/playCard`, card);
