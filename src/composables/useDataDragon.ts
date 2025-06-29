import axios from "axios";
import { ref } from "vue";

export const useDataDragon = () => {
  const dataDragonLatestVersion = ref("");

  const fetchLatestDataDragonVersion = async () => {
    try {
      const response = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");

      if (Array.isArray(response.data)) {
        dataDragonLatestVersion.value = response.data[0];
      }
    } catch (error) {
      console.error("Failed to fetch Data Dragon latest version:", error);
    }
  };

  return {
    dataDragonLatestVersion,
    fetchLatestDataDragonVersion,
  };
};
