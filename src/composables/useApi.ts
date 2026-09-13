import axios from "@/plugins/axios";
import { ref } from "vue";
import type { MatchDto, RiotAccountDto, SummonerDto, LeagueEntryDto } from "@/types/league";

const matchCache = new Map<string, MatchDto>();

function riotApiUrl(parameters: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined) query.set(key, String(value));
  }
  return `/.netlify/functions/riot-api?${query}`;
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
