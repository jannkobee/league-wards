import axios from "@/plugins/axios";
import { ref } from "vue";
import { getAccountRegionalRouting, getMatchRegionalRouting } from "@/utils/riotRouting";
import type { MatchDto, RiotAccountDto, SummonerDto, LeagueEntryDto } from "@/types/league";

// In-memory cache for match details (match data is immutable once completed)
const matchCache = new Map<string, MatchDto>();

export const useApi = () => {
  const loading = ref(false);

  // ACCOUNT-V1: Account by Riot ID (requires americas, asia, or europe)
  async function getAccountByRiotId(gameName: string, tagLine: string, regionCode?: string) {
    loading.value = true;
    const regional = regionCode ? getAccountRegionalRouting(regionCode) : "asia";

    try {
      const res = await axios.get<RiotAccountDto>(
        `https://${regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          gameName,
        )}/${encodeURIComponent(tagLine)}`,
      );

      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // LEAGUE-V4: League entries (platform routing e.g. sg2, euw1, na1, kr)
  async function getLeagueEntriesInAllQueuesForAGivenPUuid(pUuid: string, regionCode: string) {
    loading.value = true;

    try {
      const res = await axios.get<LeagueEntryDto[]>(
        `https://${regionCode.toLowerCase()}.api.riotgames.com/lol/league/v4/entries/by-puuid/${pUuid}`,
      );

      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // SUMMONER-V4: Summoner by PUUID (platform routing e.g. sg2, euw1, na1, kr)
  async function getASummonerByPUuid(pUuid: string, regionCode: string) {
    loading.value = true;

    try {
      const res = await axios.get<SummonerDto>(
        `https://${regionCode.toLowerCase()}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${pUuid}`,
      );

      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // MATCH-V5: Get Match IDs (regional routing e.g. americas, asia, europe, sea)
  async function getAListOfMatchIdsByPUuid(
    pUuid: string,
    regionCode: string,
    start = 0,
    count = 10,
    queue?: number,
  ) {
    loading.value = true;
    const regional = getMatchRegionalRouting(regionCode);

    let url = `https://${regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${pUuid}/ids?start=${start}&count=${count}`;
    if (queue !== undefined && queue !== null) {
      url += `&queue=${queue}`;
    }

    try {
      const res = await axios.get<string[]>(url);
      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // MATCH-V5: Get Match Details by ID (regional routing)
  async function getMatchById(matchId: string, regionCode: string): Promise<MatchDto> {
    if (matchCache.has(matchId)) {
      return matchCache.get(matchId)!;
    }

    const regional = getMatchRegionalRouting(regionCode);
    const res = await axios.get<MatchDto>(
      `https://${regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    );

    if (res.data) {
      matchCache.set(matchId, res.data);
    }
    return res.data;
  }

  // MATCH-V5: Batch fetch matches by IDs
  async function getMatchesByIds(matchIds: string[], regionCode: string): Promise<MatchDto[]> {
    loading.value = true;
    try {
      const matchPromises = matchIds.map((id) => getMatchById(id, regionCode));
      const results = await Promise.allSettled(matchPromises);
      const matches: MatchDto[] = [];

      for (const res of results) {
        if (res.status === "fulfilled" && res.value?.info) {
          matches.push(res.value);
        }
      }

      return matches;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    getAccountByRiotId,
    getLeagueEntriesInAllQueuesForAGivenPUuid,
    getASummonerByPUuid,
    getAListOfMatchIdsByPUuid,
    getMatchById,
    getMatchesByIds,
  };
};
