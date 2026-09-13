<template>
  <div class="match-history-root">
    <!-- Queue Filters Bar -->
    <div class="filters-capsule">
      <div class="filter-pills">
        <button
          v-for="filter in queueFilters"
          :key="filter.label"
          class="queue-pill"
          :class="{ active: selectedQueue === filter.queueId }"
          @click="selectQueue(filter.queueId)"
        >
          {{ filter.label }}
        </button>
      </div>

      <div v-if="matches.length > 0" class="loaded-badge">
        <span class="count-num">{{ matches.length }}</span> Matches Analyzed
      </div>
    </div>

    <!-- Initial Loading State -->
    <div v-if="loading && matches.length === 0" class="observatory-loading">
      <div class="observatory-spinner">
        <svg class="lens-svg" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="6" stroke="#0ac8b9" stroke-width="2" />
          <path
            d="M12 2v4m0 12v4M2 12h4m12 0h4"
            stroke="#c8aa6e"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <p class="observatory-loading-text">Scanning match timeline...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="observatory-error">
      <i class="pi pi-exclamation-circle error-symbol"></i>
      <h4 class="error-heading">Observatory Connection Failed</h4>
      <p class="error-detail">{{ error }}</p>
      <button class="realign-btn" @click="loadInitialMatches">
        <i class="pi pi-refresh"></i> Re-align Lenses
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && matches.length === 0" class="observatory-empty">
      <div class="empty-icon-halo">
        <i class="pi pi-eye-slash"></i>
      </div>
      <h4 class="empty-heading">No Matches Recorded</h4>
      <p class="empty-sub">No recent games found for this queue selection in the current region.</p>
    </div>

    <!-- Main Matches Content -->
    <div v-else class="history-content">
      <!-- Performance Command Center -->
      <MatchSummaryStats :stats="summaryStats" />

      <!-- Match Cards Feed -->
      <div class="matches-feed">
        <MatchCard
          v-for="match in matches"
          :key="match.metadata.matchId"
          :match="match"
          :current-puuid="puuid"
          :region="region"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="pagination-footer">
        <button class="load-more-capsule" :disabled="loadingMore" @click="loadMoreMatches">
          <span v-if="loadingMore" class="capsule-spin"></span>
          <i v-else class="pi pi-plus"></i>
          <span>{{ loadingMore ? "Accessing Archives..." : "Load More Matches" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type {
  MatchDto,
  MatchSummaryStats as MatchSummaryStatsType,
  ChampionSummaryStats,
} from "@/types/league";
import { useApi } from "@/composables/useApi";
import MatchSummaryStats from "./MatchSummaryStats.vue";
import MatchCard from "./MatchCard.vue";

const props = defineProps<{
  puuid: string;
  region: string;
}>();

const emit = defineEmits<{
  (e: "update:vision-title", title: string): void;
}>();

const { getAListOfMatchIdsByPUuid, getMatchesByIds } = useApi();

const matches = ref<MatchDto[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const selectedQueue = ref<number | null>(null);
const hasMore = ref(true);

const queueFilters = [
  { label: "All", queueId: null },
  { label: "Ranked Solo", queueId: 420 },
  { label: "Ranked Flex", queueId: 440 },
  { label: "ARAM", queueId: 450 },
  { label: "Normal", queueId: 400 },
];

const selectQueue = (queueId: number | null) => {
  if (selectedQueue.value === queueId) return;
  selectedQueue.value = queueId;
  loadInitialMatches();
};

const loadInitialMatches = async () => {
  if (!props.puuid) return;

  loading.value = true;
  error.value = null;
  matches.value = [];
  hasMore.value = true;

  try {
    const queueParam = selectedQueue.value !== null ? selectedQueue.value : undefined;
    const res = await getAListOfMatchIdsByPUuid(props.puuid, props.region, 0, 10, queueParam);
    const matchIds = res.data || [];

    if (matchIds.length === 0) {
      hasMore.value = false;
      return;
    }

    if (matchIds.length < 10) {
      hasMore.value = false;
    }

    const matchDetails = await getMatchesByIds(matchIds, props.region);
    matches.value = matchDetails;

    // Calculate and emit vision title
    updateVisionTitle();
  } catch (err: unknown) {
    console.error("Failed to load matches:", err);
    const maybeAxiosError = err as { response?: { data?: { status?: { message?: string } } } };
    error.value =
      maybeAxiosError?.response?.data?.status?.message ||
      "Unable to establish connection to Riot Games match archives. Check API key status.";
  } finally {
    loading.value = false;
  }
};

const loadMoreMatches = async () => {
  if (loadingMore.value || !hasMore.value || !props.puuid) return;

  loadingMore.value = true;
  try {
    const queueParam = selectedQueue.value !== null ? selectedQueue.value : undefined;
    const startIndex = matches.value.length;
    const res = await getAListOfMatchIdsByPUuid(
      props.puuid,
      props.region,
      startIndex,
      10,
      queueParam,
    );
    const newMatchIds = res.data || [];

    if (newMatchIds.length === 0) {
      hasMore.value = false;
      return;
    }

    if (newMatchIds.length < 10) {
      hasMore.value = false;
    }

    const newMatchDetails = await getMatchesByIds(newMatchIds, props.region);
    matches.value = [...matches.value, ...newMatchDetails];
    updateVisionTitle();
  } catch (err: unknown) {
    console.error("Failed to load more matches:", err);
  } finally {
    loadingMore.value = false;
  }
};

const updateVisionTitle = () => {
  const stats = summaryStats.value;
  if (stats.totalGames === 0) return;

  if (stats.avgVisionScore >= 45 || stats.avgControlWards >= 3) {
    emit("update:vision-title", "Ward Architect");
  } else if (stats.avgVisionScore >= 30) {
    emit("update:vision-title", "Sight Sentinel");
  } else if (stats.avgWardsKilled >= 4) {
    emit("update:vision-title", "Shadow Sweeper");
  } else if (stats.avgControlWards >= 2) {
    emit("update:vision-title", "Vision Guardian");
  } else {
    emit("update:vision-title", "Fog Navigator");
  }
};

const summaryStats = computed<MatchSummaryStatsType>(() => {
  const total = matches.value.length;
  if (total === 0) {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      kdaRatio: 0,
      avgVisionScore: 0,
      avgWardsPlaced: 0,
      avgControlWards: 0,
      avgWardsKilled: 0,
      avgCs: 0,
      topChampions: [],
    };
  }

  let wins = 0;
  let losses = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalVisionScore = 0;
  let totalWardsPlaced = 0;
  let totalControlWards = 0;
  let totalWardsKilled = 0;
  let totalCs = 0;

  const champMap = new Map<string, ChampionSummaryStats>();

  for (const match of matches.value) {
    const p = match.info.participants.find((item) => item.puuid === props.puuid);
    if (!p) continue;

    const isRemake =
      (match.info.gameDuration > 10000 ? match.info.gameDuration / 1000 : match.info.gameDuration) <
        300 || p.gameEndedInEarlySurrender;

    if (!isRemake) {
      if (p.win) wins++;
      else losses++;
    }

    totalKills += p.kills || 0;
    totalDeaths += p.deaths || 0;
    totalAssists += p.assists || 0;
    totalVisionScore += p.visionScore || 0;
    totalWardsPlaced += p.wardsPlaced || 0;
    totalControlWards += p.visionWardsBoughtInGame || 0;
    totalWardsKilled += p.wardsKilled || 0;
    totalCs += (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);

    const champ = p.championName || "Unknown";
    if (!champMap.has(champ)) {
      champMap.set(champ, {
        championName: champ,
        games: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
        cs: 0,
      });
    }

    const cStat = champMap.get(champ)!;
    cStat.games++;
    if (p.win) cStat.wins++;
    else cStat.losses++;
    cStat.kills += p.kills || 0;
    cStat.deaths += p.deaths || 0;
    cStat.assists += p.assists || 0;
    cStat.cs += (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
  }

  const decisiveGames = wins + losses;
  const winRate = decisiveGames > 0 ? Math.round((wins / decisiveGames) * 100) : 0;
  const avgKills = Number((totalKills / total).toFixed(1));
  const avgDeaths = Number((totalDeaths / total).toFixed(1));
  const avgAssists = Number((totalAssists / total).toFixed(1));
  const kdaRatio = avgDeaths === 0 ? avgKills + avgAssists : (avgKills + avgAssists) / avgDeaths;

  const topChampions = Array.from(champMap.values()).sort((a, b) => b.games - a.games);

  return {
    totalGames: total,
    wins,
    losses,
    winRate,
    avgKills,
    avgDeaths,
    avgAssists,
    kdaRatio,
    avgVisionScore: totalVisionScore / total,
    avgWardsPlaced: totalWardsPlaced / total,
    avgControlWards: totalControlWards / total,
    avgWardsKilled: totalWardsKilled / total,
    avgCs: totalCs / total,
    topChampions,
  };
});

watch(
  () => [props.puuid, props.region],
  () => {
    loadInitialMatches();
  },
);

onMounted(() => {
  loadInitialMatches();
});
</script>

<style scoped>
.match-history-root {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Filters Capsule */
.filters-capsule {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(14, 21, 35, 0.75);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 12px;
  padding: 6px 14px;
}

.filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.queue-pill {
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.queue-pill:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.queue-pill.active {
  background: rgba(10, 200, 185, 0.15);
  border-color: #0ac8b9;
  color: #00f0ff;
  box-shadow: 0 0 10px rgba(10, 200, 185, 0.25);
}

.loaded-badge {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.count-num {
  color: var(--color-gold);
  font-weight: 800;
}

/* Observatory Loading */
.observatory-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 14px;
}

.observatory-spinner {
  width: 48px;
  height: 48px;
  animation: spinSlow 4s linear infinite;
}

.lens-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 8px rgba(10, 200, 185, 0.5));
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.observatory-loading-text {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--color-gold);
  letter-spacing: 0.5px;
}

/* Observatory Error */
.observatory-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 50px 20px;
  background: rgba(244, 63, 94, 0.05);
  border: 1px solid rgba(244, 63, 94, 0.25);
  border-radius: 14px;
}

.error-symbol {
  font-size: 38px;
  color: #f43f5e;
  margin-bottom: 12px;
}

.error-heading {
  font-family: var(--font-heading);
  font-size: 16px;
  color: #fff;
  margin-bottom: 6px;
}

.error-detail {
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 460px;
  margin-bottom: 18px;
}

.realign-btn {
  background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.realign-btn:hover {
  box-shadow: 0 0 12px rgba(244, 63, 94, 0.5);
  transform: translateY(-1px);
}

/* Observatory Empty */
.observatory-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 70px 20px;
  background: rgba(14, 21, 35, 0.6);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 14px;
}

.empty-icon-halo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 20px;
  margin-bottom: 14px;
}

.empty-heading {
  font-family: var(--font-heading);
  font-size: 16px;
  color: #fff;
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Pagination Footer */
.pagination-footer {
  display: flex;
  justify-content: center;
  margin-top: 14px;
  margin-bottom: 24px;
}

.load-more-capsule {
  background: rgba(14, 21, 35, 0.85);
  border: 1px solid rgba(200, 170, 110, 0.3);
  color: #f0e6d2;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  padding: 10px 28px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.load-more-capsule:hover:not(:disabled) {
  background: rgba(10, 200, 185, 0.15);
  border-color: #0ac8b9;
  color: #00f0ff;
  box-shadow: 0 0 16px rgba(10, 200, 185, 0.3);
  transform: translateY(-2px);
}

.load-more-capsule:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.capsule-spin {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #00f0ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
