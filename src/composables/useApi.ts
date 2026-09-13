import axios from "@/plugins/axios";
import { ref } from "vue";
import { getAccountRegionalRouting, getMatchRegionalRouting } from "@/utils/riotRouting";
import type { MatchDto, RiotAccountDto, SummonerDto, LeagueEntryDto } from "@/types/league";

const matchCache = new Map<string, MatchDto>();
const useDirectRiotApi = import.meta.env.VITE_API_MODE === "direct";

function riotApiUrl(parameters: Record<string, string | number | undefined>) {
  if (useDirectRiotApi) return directRiotApiUrl(parameters);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return `/.netlify/functions/riot-api?${query}`;
}

function directRiotApiUrl(parameters: Record<string, string | number | undefined>) {
  const { endpoint, gameName, tagLine, pUuid, regionCode, matchId, start = 0, count = 10, queue } = parameters;
  const platform = String(regionCode).toLowerCase();

  switch (endpoint) {
    case "account":
      return `https://${getAccountRegionalRouting(String(regionCode ?? "asia"))}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(String(gameName))}/${encodeURIComponent(String(tagLine))}`;
    case "league":
      return `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${encodeURIComponent(String(pUuid))}`;
    case "summoner":
      return `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(String(pUuid))}`;
    case "matches": {
      const search = new URLSearchParams({ start: String(start), count: String(count) });
      if (queue !== undefined) search.set("queue", String(queue));
      return `https://${getMatchRegionalRouting(String(regionCode))}.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(String(pUuid))}/ids?${search}`;
    }
    case "match":
      return `https://${getMatchRegionalRouting(String(regionCode))}.api.riotgames.com/lol/match/v5/matches/${encodeURIComponent(String(matchId))}`;
    default:
      throw new Error("Unsupported Riot API endpoint");
  }
}

export const useApi = () => {
  const loading = ref(false);

  async function getAccountByRiotId(gameName: string, tagLine: string, regionCode?: string) {
    loading.value = true;
    try {
      return await axios.get<RiotAccountDto>(riotApiUrl({ endpoint: "account", gameName, tagLine, regionCode }));
    } finally { loading.value = false; }
  }

  async function getLeagueEntriesInAllQueuesForAGivenPUuid(pUuid: string, regionCode: string) {
    loading.value = true;
    try {
      return await axios.get<LeagueEntryDto[]>(riotApiUrl({ endpoint: "league", pUuid, regionCode }));
    } finally { loading.value = false; }
  }

  async function getASummonerByPUuid(pUuid: string, regionCode: string) {
    loading.value = true;
    try {
      return await axios.get<SummonerDto>(riotApiUrl({ endpoint: "summoner", pUuid, regionCode }));
    } finally { loading.value = false; }
  }

  async function getAListOfMatchIdsByPUuid(pUuid: string, regionCode: string, start = 0, count = 10, queue?: number) {
    loading.value = true;
    try {
      return await axios.get<string[]>(riotApiUrl({ endpoint: "matches", pUuid, regionCode, start, count, queue }));
    } finally { loading.value = false; }
  }

  async function getMatchById(matchId: string, regionCode: string): Promise<MatchDto> {
    if (matchCache.has(matchId)) return matchCache.get(matchId)!;
    const response = await axios.get<MatchDto>(riotApiUrl({ endpoint: "match", matchId, regionCode }));
    matchCache.set(matchId, response.data);
    return response.data;
  }

  async function getMatchesByIds(matchIds: string[], regionCode: string): Promise<MatchDto[]> {
    loading.value = true;
    try {
      const results = await Promise.allSettled(matchIds.map((id) => getMatchById(id, regionCode)));
      return results
        .filter((result): result is PromiseFulfilledResult<MatchDto> => result.status === "fulfilled")
        .map((result) => result.value)
        .filter((match) => Boolean(match.info));
    } finally { loading.value = false; }
  }

  return { loading, getAccountByRiotId, getLeagueEntriesInAllQueuesForAGivenPUuid, getASummonerByPUuid, getAListOfMatchIdsByPUuid, getMatchById, getMatchesByIds };
};
