<template>
  <div class="container">
    <h1 class="title" @click="$router.push({ name: 'dashboard' })">League Wards</h1>
    <SearchBar />
    <div>
      <Card>
        <template #title>
          <Card class="card-elevated">
            <template #content>
              <div class="profile-info">
                <img class="profile-icon" :src="profileIcon" />
                <h5>{{ account?.summonerLevel }}</h5>
                {{ name }}
              </div>
            </template>
          </Card>
        </template>

        <template #content>
          <div class="rank-container">
            <!-- SOLO QUEUE -->
            <Card class="card-elevated">
              <template #title>Solo Queue Rank</template>
              <template #content>
                <div class="rank-info">
                  <div class="rank-details">
                    <template v-if="soloQueueData.length">
                      <div v-for="acc in soloQueueData" :key="acc.queueType + acc.tier">
                        <img class="rank-icon" :src="getRankImage(acc?.tier)" />
                        <h5>{{ acc?.tier }} {{ acc?.rank }}</h5>
                        <h5>{{ acc?.leaguePoints }} LP</h5>
                      </div>
                    </template>
                    <template v-else>
                      <img class="rank-icon" :src="getRankImage('UNRANKED')" />
                      <h5>Unranked</h5>
                    </template>
                  </div>
                </div>
              </template>
            </Card>

            <!-- FLEX QUEUE -->
            <Card class="card-elevated">
              <template #title>Flex Queue Rank</template>
              <template #content>
                <div class="rank-info">
                  <div class="rank-details">
                    <template v-if="flexQueueData.length">
                      <div v-for="acc in flexQueueData" :key="acc.queueType + acc.tier">
                        <img class="rank-icon" :src="getRankImage(acc?.tier)" />
                        <h5>{{ acc?.tier }} {{ acc?.rank }}</h5>
                        <h5>{{ acc?.leaguePoints }} LP</h5>
                      </div>
                    </template>
                    <template v-else>
                      <img class="rank-icon" :src="getRankImage('UNRANKED')" />
                      <h5>Unranked</h5>
                    </template>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useRoute } from "vue-router";
import { useDataDragon } from "@/composables/useDataDragon";

const { dataDragonLatestVersion, fetchLatestDataDragonVersion } = useDataDragon();

interface LeagueQueueData {
  leagueId: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | string;
  tier: string;
  rank: string;
  summonerId: string;
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

const route = useRoute();

const { getAccountByRiotId, getLeagueEntriesInAllQueuesForAGivenPUuid, getASummonerByPUuid } =
  useApi();

const name = ref();
const account = ref();
const queueData = ref<LeagueQueueData[]>([]);
const profileIcon = ref();

const images: Record<string, string> = import.meta.glob("@/assets/Ranked Emblems Latest/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const getRankImage = (tier?: string): string => {
  const path = `/src/assets/Ranked Emblems Latest/${tier}.png`;

  return images[path] || images["/src/assets/Ranked Emblems Latest/UNRANKED.png"];
};

const soloQueueData = computed(() =>
  queueData.value.filter((acc) => acc.queueType === "RANKED_SOLO_5x5"),
);

const flexQueueData = computed(() =>
  queueData.value.filter((acc) => acc.queueType === "RANKED_FLEX_SR"),
);

const loadSummonerData = async () => {
  const accountParam = route.params.account.toString().split("#");
  const regionParam = route.params.region.toString();

  name.value = `${accountParam[0]} #${accountParam[1]}`;

  const accountRes = await getAccountByRiotId(accountParam[0], accountParam[1]);

  if (accountRes.data.puuid !== "") {
    const [entryRes, summonerRes] = await Promise.all([
      getLeagueEntriesInAllQueuesForAGivenPUuid(accountRes.data.puuid, regionParam),
      getASummonerByPUuid(accountRes.data.puuid, regionParam),
    ]);

    profileIcon.value = `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/profileicon/${summonerRes.data.profileIconId}.png`;

    account.value = summonerRes.data;
    queueData.value = entryRes.data;
  }
};

onMounted(async () => {
  await fetchLatestDataDragonVersion();
  await loadSummonerData();
});

watch(
  () => [route.params.account, route.params.region],
  async () => {
    await loadSummonerData();
  },
);
</script>

<style scoped>
.container {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 40px;
  user-select: none;
}

.title {
  font-size: 40px;
  font-weight: 700;
  cursor: pointer;
}

.card-elevated {
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.profile-icon {
  width: 150px;
}

.rank-container {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.rank-info {
  display: flex;
  justify-content: space-evenly;
}

.rank-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.rank-icon {
  width: 150px;
}
</style>
