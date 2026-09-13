import axios from "@/plugins/axios";
import { ref } from "vue";
import { getAccountRegionalRouting, getMatchRegionalRouting } from "@/utils/riotRouting";
import type { MatchDto, RiotAccountDto, SummonerDto, LeagueEntryDto } from "@/types/league";

const matchCache = new Map<string, MatchDto>();

export const useApi = () => {
  const loading = ref(false);

  async function getAccountByRiotId(gameName: string, tagLine: string, regionCode?: string) {
    loading.value = true;
    const regional = regionCode ? getAccountRegionalRouting(regionCode) : "asia";
    try {
      return await axios.get<RiotAccountDto>(
        `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      );
    } finally { loading.value = false; }
  }

  async function getLeagueEntriesInAllQueuesForAGivenPUuid(pUuid: string, regionCode: string) {
    loading.value = true;
    try {
      return await axios.get<LeagueEntryDto[]>(
        `https://${regionCode.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-puuid/${pUuid}`,
      );
    } finally { loading.value = false; }
  }

  async function getASummonerByPUuid(pUuid: string, regionCode: string) {
    loading.value = true;
    try {
      return await axios.get<SummonerDto>(
        `https://${regionCode.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${pUuid}`,
      );
    } finally { loading.value = false; }
  }

  async function getAListOfMatchIdsByPUuid(pUuid: string, regionCode: string, start = 0, count = 10, queue?: number) {
    loading.value = true;
    const regional = getMatchRegionalRouting(regionCode);
    try {
      const parameters = new URLSearchParams({ start: String(start), count: String(count) });
      if (queue !== undefined) parameters.set("queue", String(queue));
      return await axios.get<string[]>(
        `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${pUuid}/ids?${parameters}`,
      );
    } finally { loading.value = false; }
  }

  async function getMatchById(matchId: string, regionCode: string): Promise<MatchDto> {
    if (matchCache.has(matchId)) return matchCache.get(matchId)!;
    const regional = getMatchRegionalRouting(regionCode);
    const response = await axios.get<MatchDto>(
      `https://${regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    );
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
