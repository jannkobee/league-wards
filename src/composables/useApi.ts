import axios from "@/plugins/axios";
import { ref } from "vue";

export const useApi = () => {
  const loading = ref(false);

  // ACCOUNT-V1 Tab
  async function getAccountByRiotId(gameName: string, tagLine: string) {
    loading.value = true;

    try {
      const res = await axios.get(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      );

      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // LEAGUE-V4 Tab
  async function getLeagueEntriesInAllQueuesForAGivenPUuid(pUuid: string, regionCode: string) {
    loading.value = true;

    try {
      const res = await axios.get(
        `https://${regionCode}.api.riotgames.com/lol/league/v4/entries/by-puuid/${pUuid}`,
      );

      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // SUMMONER-V4 Tab
  async function getASummonerByPUuid(pUuid: string, regionCode: string) {
    loading.value = true;

    try {
      const res = await axios.get(
        `https://${regionCode}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${pUuid}`,
      );

      return res;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // MATCH-V5 Tab
  async function getAListOfMatchIdsByPUuid(pUuid: string, regionCode: string) {
    loading.value = true;

    try {
      const res = await axios.get(
        `https://${regionCode}.api.riotgames.com/lol/match/v5/matches/by-puuid/${pUuid}/ids`,
      );

      return res;
    } catch (error) {
      throw error;
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
  };
};
