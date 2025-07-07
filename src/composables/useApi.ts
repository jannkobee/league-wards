import axios from "@/plugins/axios";
import { ref } from "vue";

export const useApi = () => {
  const loading = ref(false);

  // ACCOUNT-V1 Tab
  async function getAccountByRiotId(gameName: string, tagLine: string) {
    loading.value = true;
    try {
      const res = await axios.get(
        `/.netlify/functions/riot-api?endpoint=account&gameName=${gameName}&tagLine=${tagLine}`,
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
        `/.netlify/functions/riot-api?endpoint=league&pUuid=${pUuid}&regionCode=${regionCode}`,
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
        `/.netlify/functions/riot-api?endpoint=summoner&pUuid=${pUuid}&regionCode=${regionCode}`,
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
        `/.netlify/functions/riot-api?endpoint=matches&pUuid=${pUuid}&regionCode=${regionCode}`,
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
