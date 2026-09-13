<template>
  <div v-if="stats.totalGames > 0" class="command-center-card">
    <!-- Best Champ Wallpaper -->
    <div
      v-if="bestChampWallpaper"
      class="perf-wallpaper"
      :style="{ backgroundImage: `url(${bestChampWallpaper})` }"
    ></div>
    <div class="perf-wallpaper-veil"></div>

    <div class="card-accent-line"></div>

    <!-- Section 1: Win Rate & Combat Record -->
    <div class="summary-col combat-record-col">
      <div class="col-eyebrow"><i class="pi pi-chart-pie"></i> PERFORMANCE</div>

      <div class="record-ring-wrap">
        <div class="conic-ring" :style="winRateCircleStyle">
          <div class="ring-core">
            <span class="wr-large-pct">{{ stats.winRate }}%</span>
            <span class="wr-caption">WIN RATE</span>
          </div>
        </div>
      </div>

      <div class="record-meta">
        <div class="games-count">
          <span class="bold">{{ stats.totalGames }} Games</span>
          <span class="pill-win">{{ stats.wins }}W</span>
          <span class="pill-loss">{{ stats.losses }}L</span>
        </div>

        <div class="kda-summary">
          <div class="kda-trio">
            <span class="k">{{ stats.avgKills }}</span> /
            <span class="d">{{ stats.avgDeaths }}</span> /
            <span class="a">{{ stats.avgAssists }}</span>
          </div>
          <div class="kda-score" :class="getKdaClass(stats.kdaRatio)">
            {{ stats.kdaRatio.toFixed(2) }}:1 KDA
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Vision & Warding Spotlight -->
    <div class="summary-col vision-spotlight-col">
      <div class="col-eyebrow eyebrow-vision"><i class="pi pi-eye"></i> VISION & MAP CONTROL</div>

      <div class="vision-score-hero">
        <div class="vision-hero-num">{{ stats.avgVisionScore.toFixed(1) }}</div>
        <div class="vision-hero-sub">Average Vision Score</div>
      </div>

      <div class="vision-bars-list">
        <!-- Wards Placed -->
        <div class="vision-meter-row">
          <div class="meter-info">
            <span class="meter-name">Stealth Wards</span>
            <span class="meter-val">{{ stats.avgWardsPlaced.toFixed(1) }}</span>
          </div>
          <div class="meter-track">
            <div
              class="meter-fill fill-stealth"
              :style="{ width: `${Math.min(100, (stats.avgWardsPlaced / 25) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Control Wards -->
        <div class="vision-meter-row">
          <div class="meter-info">
            <span class="meter-name pink-text">Control Wards</span>
            <span class="meter-val pink-text">{{ stats.avgControlWards.toFixed(1) }}</span>
          </div>
          <div class="meter-track">
            <div
              class="meter-fill fill-pink"
              :style="{ width: `${Math.min(100, (stats.avgControlWards / 8) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Wards Cleared -->
        <div class="vision-meter-row">
          <div class="meter-info">
            <span class="meter-name">Wards Cleared</span>
            <span class="meter-val">{{ stats.avgWardsKilled.toFixed(1) }}</span>
          </div>
          <div class="meter-track">
            <div
              class="meter-fill fill-cleared"
              :style="{ width: `${Math.min(100, (stats.avgWardsKilled / 10) * 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 3: Most Played Champions -->
    <div class="summary-col signature-champs-col">
      <div class="col-eyebrow"><i class="pi pi-star"></i> SIGNATURE CHAMPIONS</div>

      <div class="champions-roster">
        <div
          v-for="champ in stats.topChampions.slice(0, 3)"
          :key="champ.championName"
          class="champ-card"
          :title="`Inspect ${champ.championName} in Codex`"
          @click.stop="openChampionModal(champ.championName)"
        >
          <div class="champ-avatar-wrap">
            <img
              :src="getChampionIcon(champ.championName)"
              :alt="champ.championName"
              class="champ-face"
            />
            <span class="champ-games-tag">{{ champ.games }}G</span>
          </div>

          <div class="champ-details">
            <div class="champ-title-row">
              <span class="c-name">{{ champ.championName }}</span>
              <span class="c-wr" :class="getWinRateClass(getChampWinRate(champ))">
                {{ getChampWinRate(champ) }}% WR
              </span>
            </div>

            <div class="champ-kda-sub">
              {{ formatKda(champ.kills, champ.deaths, champ.assists) }} KDA
              <span class="cs-sub">({{ (champ.cs / champ.games).toFixed(0) }} CS)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MatchSummaryStats, ChampionSummaryStats } from "@/types/league";
import { useDataDragon } from "@/composables/useDataDragon";
import { formatKda } from "@/utils/riotRouting";
import { useCodexModal } from "@/composables/useCodexModal";

const props = defineProps<{
  stats: MatchSummaryStats;
}>();

const { getChampionIcon, getChampionSplash } = useDataDragon();
const { openChampionModal } = useCodexModal();

// Best champ = highest win rate among champs with ≥ 3 games, fallback to most played
const bestChamp = computed(() => {
  const champs = props.stats.topChampions;
  if (!champs.length) return null;
  const qualified = champs.filter((c) => c.games >= 3);
  if (qualified.length) {
    return qualified.reduce((best, c) => (c.wins / c.games > best.wins / best.games ? c : best));
  }
  return champs[0];
});

const bestChampWallpaper = computed(() =>
  bestChamp.value ? getChampionSplash(bestChamp.value.championName) : "",
);

const winRateCircleStyle = computed(() => {
  const wr = props.stats.winRate;
  return {
    background: `conic-gradient(#00f0ff 0deg, #0ac8b9 ${wr * 3.6}deg, rgba(244, 63, 94, 0.4) ${
      wr * 3.6
    }deg 360deg)`,
  };
});

const getChampWinRate = (champ: ChampionSummaryStats) => {
  if (champ.games === 0) return 0;
  return Math.round((champ.wins / champ.games) * 100);
};

const getKdaClass = (ratio: number) => {
  if (ratio >= 4) return "kda-legendary";
  if (ratio >= 3) return "kda-great";
  if (ratio >= 2) return "kda-good";
  return "kda-neutral";
};

const getWinRateClass = (wr: number) => {
  if (wr >= 60) return "wr-high";
  if (wr >= 50) return "wr-mid";
  return "wr-low";
};
</script>

<style scoped>
.command-center-card {
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 1.2fr 1.3fr;
  gap: 20px;
  background: rgba(6, 10, 20, 0.35);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-bottom: 18px;
}

.perf-wallpaper {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;
  opacity: 0.28;
  z-index: 0;
  pointer-events: none;
}

.perf-wallpaper-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(6, 10, 20, 0.5) 0%,
    rgba(6, 10, 20, 0.2) 50%,
    rgba(6, 10, 20, 0.55) 100%
  );
  z-index: 0;
  pointer-events: none;
}

.card-accent-line {
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  z-index: 1;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(10, 200, 185, 0.6),
    rgba(200, 170, 110, 0.6),
    transparent
  );
}

@media (max-width: 960px) {
  .command-center-card {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.summary-col {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.combat-record-col {
  align-items: center;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding-right: 16px;
}

.vision-spotlight-col {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 16px;
}

.signature-champs-col {
  padding-left: 10px;
}

@media (max-width: 960px) {
  .combat-record-col,
  .vision-spotlight-col {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0 0 20px 0;
  }
  .signature-champs-col {
    padding-left: 0;
  }
}

.col-eyebrow {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-gold);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
}

.eyebrow-vision {
  color: #00f0ff;
}

/* Win Rate Ring */
.record-ring-wrap {
  margin: 6px 0 12px 0;
}

.conic-ring {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(10, 200, 185, 0.2);
}

.ring-core {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #090e18;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.wr-large-pct {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.wr-caption {
  font-size: 8px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.record-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.games-count {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bold {
  font-weight: 700;
}

.pill-win {
  color: #00f0ff;
  font-weight: 700;
}

.pill-loss {
  color: #f43f5e;
  font-weight: 700;
}

.kda-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.kda-trio {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.kda-trio .k {
  color: #60a5fa;
}

.kda-trio .d {
  color: #f87171;
}

.kda-trio .a {
  color: #34d399;
}

.kda-score {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.kda-legendary {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.kda-great {
  color: #00f0ff;
}

.kda-good {
  color: #34d399;
}

.kda-neutral {
  color: #94a3b8;
}

/* Vision Spotlight */
.vision-score-hero {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.vision-hero-num {
  font-size: 32px;
  font-weight: 900;
  color: #00f0ff;
  line-height: 1;
  text-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
}

.vision-hero-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.vision-bars-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vision-meter-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meter-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.pink-text {
  color: #ec4899;
}

.meter-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  border-radius: 4px;
}

.fill-stealth {
  background: linear-gradient(90deg, #0ac8b9 0%, #00f0ff 100%);
}

.fill-pink {
  background: linear-gradient(90deg, #ec4899 0%, #f43f5e 100%);
}

.fill-cleared {
  background: linear-gradient(90deg, #c8aa6e 0%, #ffd700 100%);
}

/* Signature Champions */
.champions-roster {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.champ-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 6px 10px;
  transition: all 0.2s;
}

.champ-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(200, 170, 110, 0.25);
}

.champ-avatar-wrap {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.champ-face {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1.5px solid rgba(200, 170, 110, 0.3);
}

.champ-games-tag {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #090e18;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.champ-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.champ-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.c-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.c-wr {
  font-size: 11px;
  font-weight: 700;
}

.champ-kda-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.cs-sub {
  color: var(--color-text-muted);
}

.wr-high {
  color: #34d399;
}

.wr-mid {
  color: #00f0ff;
}

.wr-low {
  color: #f87171;
}
</style>
