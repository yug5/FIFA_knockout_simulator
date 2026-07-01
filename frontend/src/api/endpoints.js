import client from './client';

export const getMatches = async () => {
  const response = await client.get('/matches');
  return response.data;
};

export const checkName = async (name) => {
  const response = await client.post(`/participants/check-name?name=${encodeURIComponent(name)}`);
  return response.data;
};

export const submitPrediction = async (name, predictions) => {
  const response = await client.post('/predictions', { name, predictions });
  return response.data;
};

export const getPredictionByName = async (name) => {
  const response = await client.get(`/predictions/${encodeURIComponent(name)}`);
  return response.data;
};

export const getAllPredictions = async () => {
  const response = await client.get('/predictions');
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await client.get('/leaderboard');
  return response.data;
};

export const getPopularityStats = async () => {
  const response = await client.get('/stats/popularity');
  return response.data;
};

export const getAdminMatches = async () => {
  const response = await client.get('/admin/matches');
  return response.data;
};

export const setMatchResult = async (id, winner) => {
  const response = await client.put(`/admin/matches/${id}/result`, { winner });
  return response.data;
};

export const seedMatches = async () => {
  const response = await client.post('/admin/matches/seed');
  return response.data;
};

export const updateMatchTeams = async (id, payload) => {
  const response = await client.put(`/admin/matches/${id}/teams`, payload);
  return response.data;
};

export const adjustParticipantPoints = async (id, points) => {
  const response = await client.put(`/admin/participants/${id}/points`, { points });
  return response.data;
};

