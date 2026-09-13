<template>
  <div class="page-container">
    <!-- Top Search Capsule -->
    <header class="search-header">
      <SearchBar />
    </header>

    <!-- Loading State -->
    <div v-if="accountLoading && !accountPuuid && !profileNotFound" class="page-loading">
      <div class="ward-loader">
        <svg class="loader-svg" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="#0ac8b9" stroke-width="2" />
          <path
            d="M12 2v3m0 14v3M2 12h3m14 0h3"
            stroke="#c8aa6e"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <p class="loading-label">Aligning observatory lenses...</p>
    </div>

    <!-- Profile Not Found Page -->
    <div v-else-if="profileNotFound" class="not-found-page">
      <div class="glass-card not-found-card">
        <div class="not-found-radar">
          <div class="radar-scan-pulse"></div>
          <div class="radar-lost-icon">
            <i class="pi pi-compass"></i>
          </div>
        </div>

        <div class="not-found-content">
          <span class="status-pill">Observatory Signal Lost</span>
          <h1 class="not-found-title">Summoner Not Found</h1>
          <p class="not-found-desc">
            We scanned the Runeterra celestial records in
            <strong class="text-cyan">{{ currentRegion.toUpperCase() }}</strong> for
            <strong class="text-gold">{{ summonerGameName }}#{{ summonerTagLine }}</strong
            >, but found no active summoner footprint.
          </p>

          <div class="not-found-checklist">
            <div class="check-item">
              <i class="pi pi-check-circle check-icon"></i>
              <span
                >Include the Riot tagline (e.g. <code>#NA1</code>, <code>#SG2</code>,
                <code>#KR1</code>, <code>#2001</code>)</span
              >
            </div>
            <div class="check-item">
              <i class="pi pi-check-circle check-icon"></i>
              <span>Check for typos or recently updated Riot ID names</span>
            </div>
            <div class="check-item">
              <i class="pi pi-check-circle check-icon"></i>
              <span>Verify that the chosen region matches where this account plays</span>
            </div>
          </div>

          <div class="not-found-search-box">
            <SearchBar />
          </div>

          <router-link to="/" class="back-home-btn">
            <i class="pi pi-arrow-left"></i>
            <span>Return to Observatory Dashboard</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Account Dashboard -->
    <div v-else class="account-dashboard">
      <!-- Left Column: Prestigious Profile & Ranks -->
      <aside class="profile-column">
        <!-- Summoner Hero Card -->
        <div class="glass-card summoner-hero-card" :class="getTierGlowClass(primaryTier)">
          <!-- Atmospheric Card Header Banner -->
          <div class="hero-banner-backdrop">
            <div class="banner-mesh-glow"></div>
            <!-- Discreet Banner Refresh Button -->
            <button
              class="banner-refresh-btn"
              :disabled="accountLoading"
              title="Refresh Profile Data"
              @click="loadSummonerData"
            >
              <i class="pi pi-sync" :class="{ 'spin-active': accountLoading }"></i>
            </button>
          </div>

          <!-- Avatar Section with Majestic Tier Wings -->
          <div class="avatar-wings-stage">
            <img
              v-if="tierWingsSrc"
              :src="tierWingsSrc"
              class="tier-wings-graphic"
              alt="Tier Wings"
            />
            <div class="avatar-frame-ring">
              <img class="profile-avatar" :src="profileIcon" alt="Profile Icon" />
              <div class="level-crest">
                <span class="lvl-txt">LVL</span>
                <span class="lvl-num">{{ account?.summonerLevel || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Summoner Identity (Unified & Streamlined) -->
          <div class="summoner-meta">
            <!-- Click-to-copy Riot ID -->
            <div class="identity-card" title="Click to copy Riot ID" @click="copyRiotId">
              <span class="player-name">{{ summonerGameName }}</span>
              <span class="tag-badge">#{{ summonerTagLine }}</span>
              <span class="copy-hint" :class="{ 'is-copied': copied }">
                <i :class="copied ? 'pi pi-check' : 'pi pi-copy'"></i>
                <span class="hint-text">{{ copied ? "Copied" : "Copy" }}</span>
              </span>
            </div>

            <!-- Sleek Metadata Strip (Region only) -->
            <div class="meta-strip">
              <span class="meta-pill region-pill">{{ currentRegion.toUpperCase() }}</span>
            </div>

            <!-- Streamlined Vision Mastery Insignia -->
            <div class="vision-sigil-chip">
              <div class="sigil-eye-halo">
                <i class="pi pi-eye"></i>
              </div>
              <div class="sigil-info">
                <span class="sigil-eyebrow">Vision Mastery</span>
                <span class="sigil-rank-title">{{ visionTitle }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Solo / Duo Queue Crest Card -->
        <div class="glass-card rank-crest-card" :class="getTierGlowClass(soloQueueTier)">
          <div class="crest-header">
            <div class="crest-title-group">
              <span class="crest-type">Ranked Solo / Duo</span>
              <span class="season-badge">Season 2026</span>
            </div>
            <span class="crest-status-tag" :class="soloQueueData.length ? 'active' : 'unranked'">
              {{ soloQueueData.length ? "Active" : "Unranked" }}
            </span>
          </div>

          <div class="crest-body">
            <template v-if="soloQueueData.length">
              <div
                v-for="acc in soloQueueData"
                :key="acc.queueType + acc.tier"
                class="rank-item-box"
              >
                <div class="emblem-wrapper">
                  <img class="rank-emblem" :src="getRankImage(acc?.tier)" :alt="acc?.tier" />
                </div>
                <div class="rank-stat-details">
                  <div class="tier-heading">{{ formatTierTitle(acc?.tier, acc?.rank) }}</div>

                  <!-- LP and Rank-Up Status Pill -->
                  <div class="lp-status-row">
                    <span class="lp-badge">{{ acc?.leaguePoints }} LP</span>
                    <span
                      v-if="getRankUpInfo(acc)"
                      class="rankup-pill"
                      :class="{ 'peak-pill': getRankUpInfo(acc)?.isMaxTier }"
                    >
                      <i
                        :class="
                          getRankUpInfo(acc)?.isMaxTier ? 'pi pi-crown' : 'pi pi-angle-double-up'
                        "
                      ></i>
                      <span>{{ getRankUpInfo(acc)?.badgeText }}</span>
                    </span>
                  </div>

                  <!-- LP Progress Bar to Next Rank -->
                  <div
                    v-if="getRankUpInfo(acc)"
                    class="lp-progress-section"
                    :title="`${acc?.leaguePoints} LP (${getRankUpInfo(acc)?.progressPercent}%)`"
                  >
                    <div class="lp-progress-track">
                      <div
                        class="lp-progress-bar"
                        :style="{ width: `${getRankUpInfo(acc)?.progressPercent}%` }"
                      ></div>
                    </div>
                  </div>

                  <div class="winrate-bar-wrap">
                    <div class="wr-label">
                      <span>{{ acc.wins }}W {{ acc.losses }}L</span>
                      <span class="wr-highlight"
                        >{{ getRankWinRate(acc.wins, acc.losses) }}% WR</span
                      >
                    </div>
                    <div class="wr-progress-bar">
                      <div
                        class="wr-progress-fill"
                        :style="{ width: `${getRankWinRate(acc.wins, acc.losses)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="rank-item-box unranked-box">
                <div class="emblem-wrapper">
                  <img class="rank-emblem" :src="getRankImage('UNRANKED')" alt="Unranked" />
                </div>
                <div class="rank-stat-details">
                  <div class="tier-heading text-muted">Unranked</div>
                  <div class="unranked-sub">No recent ranked games recorded</div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Flex Queue Crest Card -->
        <div class="glass-card rank-crest-card" :class="getTierGlowClass(flexQueueTier)">
          <div class="crest-header">
            <div class="crest-title-group">
              <span class="crest-type">Ranked Flex</span>
              <span class="season-badge">Season 2026</span>
            </div>
            <span class="crest-status-tag" :class="flexQueueData.length ? 'active' : 'unranked'">
              {{ flexQueueData.length ? "Active" : "Unranked" }}
            </span>
          </div>

          <div class="crest-body">
            <template v-if="flexQueueData.length">
              <div
                v-for="acc in flexQueueData"
                :key="acc.queueType + acc.tier"
                class="rank-item-box"
              >
                <div class="emblem-wrapper">
                  <img class="rank-emblem" :src="getRankImage(acc?.tier)" :alt="acc?.tier" />
                </div>
                <div class="rank-stat-details">
                  <div class="tier-heading">{{ formatTierTitle(acc?.tier, acc?.rank) }}</div>

                  <!-- LP and Rank-Up Status Pill -->
                  <div class="lp-status-row">
                    <span class="lp-badge">{{ acc?.leaguePoints }} LP</span>
                    <span
                      v-if="getRankUpInfo(acc)"
                      class="rankup-pill"
                      :class="{ 'peak-pill': getRankUpInfo(acc)?.isMaxTier }"
                    >
                      <i
                        :class="
                          getRankUpInfo(acc)?.isMaxTier ? 'pi pi-crown' : 'pi pi-angle-double-up'
                        "
                      ></i>
                      <span>{{ getRankUpInfo(acc)?.badgeText }}</span>
                    </span>
                  </div>

                  <!-- LP Progress Bar to Next Rank -->
                  <div
                    v-if="getRankUpInfo(acc)"
                    class="lp-progress-section"
                    :title="`${acc?.leaguePoints} LP (${getRankUpInfo(acc)?.progressPercent}%)`"
                  >
                    <div class="lp-progress-track">
                      <div
                        class="lp-progress-bar"
                        :style="{ width: `${getRankUpInfo(acc)?.progressPercent}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- Apex Ladder Stepper (Master -> Grandmaster -> Challenger) -->
                  <div
                    v-if="
                      ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(acc?.tier?.toUpperCase())
                    "
                    class="apex-ladder-track"
                    title="Apex Progression Hierarchy"
                  >
                    <span
                      class="apex-tier-node"
                      :class="{
                        active: acc.tier.toUpperCase() === 'MASTER',
                        cleared: ['GRANDMASTER', 'CHALLENGER'].includes(acc.tier.toUpperCase()),
                      }"
                    >
                      Master
                    </span>
                    <i class="pi pi-angle-right apex-track-arrow"></i>
                    <span
                      class="apex-tier-node"
                      :class="{
                        active: acc.tier.toUpperCase() === 'GRANDMASTER',
                        cleared: acc.tier.toUpperCase() === 'CHALLENGER',
                      }"
                    >
                      Grandmaster
                    </span>
                    <i class="pi pi-angle-right apex-track-arrow"></i>
                    <span
                      class="apex-tier-node"
                      :class="{
                        active: acc.tier.toUpperCase() === 'CHALLENGER',
                      }"
                    >
                      Challenger
                    </span>
                  </div>

                  <div class="winrate-bar-wrap">
                    <div class="wr-label">
                      <span>{{ acc.wins }}W {{ acc.losses }}L</span>
                      <span class="wr-highlight"
                        >{{ getRankWinRate(acc.wins, acc.losses) }}% WR</span
                      >
                    </div>
                    <div class="wr-progress-bar">
                      <div
                        class="wr-progress-fill"
                        :style="{ width: `${getRankWinRate(acc.wins, acc.losses)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="rank-item-box unranked-box">
                <div class="emblem-wrapper">
                  <img class="rank-emblem" :src="getRankImage('UNRANKED')" alt="Unranked" />
                </div>
                <div class="rank-stat-details">
                  <div class="tier-heading text-muted">Unranked</div>
                  <div class="unranked-sub">No recent flex games recorded</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <!-- Right Column: Match History Command Center -->
      <main class="matches-column">
        <MatchHistory
          v-if="accountPuuid"
          :puuid="accountPuuid"
          :region="currentRegion"
          @update:vision-title="handleVisionTitle"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useApi } from "@/composables/useApi";
import { useRoute } from "vue-router";
import { useDataDragon } from "@/composables/useDataDragon";
import type { LeagueEntryDto, SummonerDto } from "@/types/league";
import MatchHistory from "@/components/MatchHistory/MatchHistory.vue";
import SearchBar from "@/components/SearchBar.vue";
import { showToast } from "@/composables/useToast";

const { fetchLatestDataDragonVersion, getProfileIcon } = useDataDragon();

const route = useRoute();
const { getAccountByRiotId, getLeagueEntriesInAllQueuesForAGivenPUuid, getASummonerByPUuid } =
  useApi();

const accountLoading = ref(false);
const profileNotFound = ref(false);
const name = ref("");
const summonerGameName = ref("");
const summonerTagLine = ref("");
const account = ref<SummonerDto | null>(null);
const accountPuuid = ref<string>("");
const currentRegion = ref<string>("");
const queueData = ref<LeagueEntryDto[]>([]);
const profileIcon = ref("");
const copied = ref(false);
const visionTitle = ref("Ward Architect");

const images: Record<string, string> = import.meta.glob("@/assets/Ranked Emblems Latest/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const wingImages: Record<string, string> = import.meta.glob(
  "@/assets/Ranked Emblems Latest/Tier Wings/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const getRankImage = (tier?: string): string => {
  const path = `/src/assets/Ranked Emblems Latest/${tier}.png`;
  return images[path] || images["/src/assets/Ranked Emblems Latest/UNRANKED.png"];
};

const formatTierTitle = (tier?: string, rank?: string): string => {
  if (!tier) return "Unranked";
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  if (["Master", "Grandmaster", "Challenger"].includes(formattedTier)) {
    return formattedTier;
  }
  return rank ? `${formattedTier} ${rank}` : formattedTier;
};

interface RankUpInfo {
  lpNeeded: number | null;
  targetRank: string;
  badgeText: string;
  progressPercent: number;
  isMaxTier: boolean;
}

const TIER_ORDER = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
];

const DIVISION_ORDER = ["IV", "III", "II", "I"];

const formatTierName = (tier: string): string => {
  return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
};

const getRankUpInfo = (acc?: LeagueEntryDto): RankUpInfo | null => {
  if (!acc || !acc.tier) return null;

  const tier = acc.tier.toUpperCase();
  const rank = acc.rank?.toUpperCase() || "";
  const lp = Math.max(0, acc.leaguePoints || 0);

  // Apex Tiers: Master -> Grandmaster -> Challenger
  if (tier === "CHALLENGER") {
    return {
      lpNeeded: null,
      targetRank: "Challenger",
      badgeText: "Peak Tier · Challenger",
      progressPercent: 100,
      isMaxTier: true,
    };
  }

  if (tier === "GRANDMASTER") {
    // Grandmaster always promotes to Challenger (Threshold: 500 LP)
    const targetLp = 500;
    if (lp < targetLp) {
      const needed = targetLp - lp;
      return {
        lpNeeded: needed,
        targetRank: "Challenger",
        badgeText: `${needed} LP to Challenger`,
        progressPercent: Math.min(100, Math.round((lp / targetLp) * 100)),
        isMaxTier: false,
      };
    } else {
      return {
        lpNeeded: 0,
        targetRank: "Challenger",
        badgeText: "Challenger Ready",
        progressPercent: 100,
        isMaxTier: false,
      };
    }
  }

  if (tier === "MASTER") {
    // Master always promotes to Grandmaster (Threshold: 200 LP)
    const targetLp = 200;
    if (lp < targetLp) {
      const needed = targetLp - lp;
      return {
        lpNeeded: needed,
        targetRank: "Grandmaster",
        badgeText: `${needed} LP to GM`,
        progressPercent: Math.min(100, Math.round((lp / targetLp) * 100)),
        isMaxTier: false,
      };
    }
    return null;
  }

  // Standard Tiers (IRON through DIAMOND)
  const currentTierIndex = TIER_ORDER.indexOf(tier);
  const currentDivIndex = DIVISION_ORDER.indexOf(rank);

  // Each standard division requires 100 LP to promote
  const needed = Math.max(0, 100 - lp);
  const progressPercent = Math.min(100, lp);

  let targetRank = "";

  if (currentDivIndex >= 0 && currentDivIndex < DIVISION_ORDER.length - 1) {
    // Division progression: IV -> III, III -> II, II -> I
    const nextDivision = DIVISION_ORDER[currentDivIndex + 1];
    targetRank = `${formatTierName(tier)} ${nextDivision}`;
  } else if (currentDivIndex === DIVISION_ORDER.length - 1) {
    // At division I: promote to next tier (e.g. Gold I -> Platinum IV, Diamond I -> Master)
    if (currentTierIndex >= 0 && currentTierIndex < TIER_ORDER.length - 1) {
      const nextTier = TIER_ORDER[currentTierIndex + 1];
      if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(nextTier)) {
        targetRank = formatTierName(nextTier);
      } else {
        targetRank = `${formatTierName(nextTier)} IV`;
      }
    } else {
      targetRank = "Next Tier";
    }
  } else {
    targetRank = "Promotion";
  }

  return {
    lpNeeded: needed,
    targetRank,
    badgeText: needed === 0 ? "Promotion Ready" : `${needed} LP to ${targetRank}`,
    progressPercent,
    isMaxTier: false,
  };
};

const soloQueueData = computed(() =>
  queueData.value.filter((acc) => acc.queueType === "RANKED_SOLO_5x5"),
);

const flexQueueData = computed(() =>
  queueData.value.filter((acc) => acc.queueType === "RANKED_FLEX_SR"),
);

const soloQueueTier = computed(() => soloQueueData.value[0]?.tier || "");
const flexQueueTier = computed(() => flexQueueData.value[0]?.tier || "");
const primaryTier = computed(() => soloQueueTier.value || flexQueueTier.value || "");

const tierWingsSrc = computed(() => {
  const tier = primaryTier.value;
  if (!tier) return "";
  const titleTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  const path = `/src/assets/Ranked Emblems Latest/Tier Wings/${titleTier}.png`;
  return wingImages[path] || "";
});

const getTierGlowClass = (tier: string) => {
  const t = tier.toUpperCase();
  if (t === "CHALLENGER") return "glow-challenger";
  if (t === "GRANDMASTER") return "glow-grandmaster";
  if (t === "MASTER") return "glow-master";
  if (t === "DIAMOND") return "glow-diamond";
  if (t === "EMERALD") return "glow-emerald";
  if (t === "PLATINUM") return "glow-platinum";
  if (t === "GOLD") return "glow-gold";
  return "";
};

const getRankWinRate = (wins: number, losses: number): number => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

const copyRiotId = async () => {
  try {
    await navigator.clipboard.writeText(name.value);
    copied.value = true;
    showToast({
      severity: "success",
      summary: "Copied!",
      detail: `${name.value} copied to clipboard`,
      life: 2000,
    });
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Clipboard copy failed", err);
  }
};

const handleVisionTitle = (title: string) => {
  if (title) visionTitle.value = title;
};

const loadSummonerData = async () => {
  if (!route.params.account || !route.params.region) return;

  const rawAccount = route.params.account.toString().replace("%23", "#");
  const accountParam = rawAccount.split("#");
  const regionParam = route.params.region.toString();
  currentRegion.value = regionParam;

  summonerGameName.value = accountParam[0];
  summonerTagLine.value = accountParam[1] || "";
  name.value = `${accountParam[0]} #${accountParam[1] || ""}`;
  accountLoading.value = true;
  profileNotFound.value = false;

  try {
    const accountRes = await getAccountByRiotId(accountParam[0], accountParam[1], regionParam);

    if (accountRes.data?.puuid) {
      accountPuuid.value = accountRes.data.puuid;
      if (accountRes.data.gameName) {
        summonerGameName.value = accountRes.data.gameName;
      }
      if (accountRes.data.tagLine) {
        summonerTagLine.value = accountRes.data.tagLine;
      }
      name.value = `${summonerGameName.value} #${summonerTagLine.value}`;

      const [entryRes, summonerRes] = await Promise.all([
        getLeagueEntriesInAllQueuesForAGivenPUuid(accountRes.data.puuid, regionParam),
        getASummonerByPUuid(accountRes.data.puuid, regionParam),
      ]);

      account.value = summonerRes.data;
      queueData.value = entryRes.data || [];
      profileIcon.value = getProfileIcon(summonerRes.data.profileIconId);
    } else {
      profileNotFound.value = true;
    }
  } catch (error) {
    console.error("Error loading summoner data:", error);
    profileNotFound.value = true;
  } finally {
    accountLoading.value = false;
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
.page-container {
  min-height: 100vh;
  padding: 24px 24px 80px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
}

.search-header {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

/* Loading State */
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  gap: 18px;
}

.ward-loader {
  width: 54px;
  height: 54px;
  animation: spinLoader 3s linear infinite;
}

.loader-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 10px rgba(10, 200, 185, 0.5));
}

@keyframes spinLoader {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-label {
  font-family: var(--font-heading);
  font-size: 15px;
  color: var(--color-gold);
  letter-spacing: 1px;
}

/* Dashboard Layout */
.account-dashboard {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1000px) {
  .account-dashboard {
    grid-template-columns: 1fr;
  }
}

.profile-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Glass Card */
.glass-card {
  background: rgba(8, 12, 22, 0.28);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

/* Summoner Hero Card */
.summoner-hero-card {
  padding: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Banner Backdrop */
.hero-banner-backdrop {
  width: 100%;
  height: 90px;
  background: radial-gradient(circle at 50% 0%, rgba(10, 200, 185, 0.12) 0%, transparent 70%);
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.banner-mesh-glow {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 80px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

/* Avatar & Wings Stage */
.avatar-wings-stage {
  position: relative;
  width: 160px;
  height: 110px;
  margin-top: -55px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.tier-wings-graphic {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 190px;
  height: 160px;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.avatar-frame-ring {
  position: relative;
  width: 90px;
  height: 90px;
  z-index: 2;
}

.profile-avatar {
  width: 90px;
  height: 90px;
  border-radius: 20px;
  border: 2.5px solid var(--color-gold);
  box-shadow:
    0 0 20px rgba(200, 170, 110, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.8);
  display: block;
}

.level-crest {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #101827 0%, #06090e 100%);
  color: #ffd700;
  border: 1.5px solid rgba(255, 215, 0, 0.6);
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: baseline;
  gap: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

.lvl-txt {
  font-size: 8px;
  color: var(--color-text-secondary);
}

.lvl-num {
  font-weight: 900;
}

/* Summoner Meta (Clean & Streamlined) */
.summoner-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  margin-top: 8px;
  z-index: 2;
  width: 100%;
}

.banner-refresh-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 5;
}

.banner-refresh-btn:hover:not(:disabled) {
  background: rgba(10, 200, 185, 0.2);
  color: #00f0ff;
  border-color: #0ac8b9;
}

.identity-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition:
    background 0.2s,
    transform 0.15s;
}

.identity-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.identity-card:active {
  transform: scale(0.98);
}

.player-name {
  font-family: var(--font-body);
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-transform: none;
}

.tag-badge {
  background: rgba(200, 170, 110, 0.15);
  color: var(--color-gold);
  border: 1px solid rgba(200, 170, 110, 0.3);
  font-size: 13px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
}

.copy-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.6;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.identity-card:hover .copy-hint {
  opacity: 1;
  color: #00f0ff;
}

.copy-hint.is-copied {
  opacity: 1;
  color: #34d399;
}

.hint-text {
  font-size: 10px;
  font-weight: 600;
}

.meta-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.meta-pill {
  font-weight: 600;
}

.region-pill {
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.1);
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.level-pill {
  color: var(--color-text-secondary);
}

.meta-dot {
  color: rgba(255, 255, 255, 0.25);
}

/* Vision Sigil Chip */
.vision-sigil-chip {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(10, 200, 185, 0.12) 0%, rgba(200, 170, 110, 0.08) 100%);
  border: 1px solid rgba(10, 200, 185, 0.3);
  border-radius: 12px;
  padding: 8px 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.sigil-eye-halo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, rgba(10, 200, 185, 0.05) 100%);
  border: 1px solid rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
  font-size: 14px;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.sigil-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.sigil-eyebrow {
  font-size: 9px;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  font-weight: 600;
  text-transform: uppercase;
}

.sigil-rank-title {
  font-size: 14px;
  font-weight: 800;
  color: #00f0ff;
  letter-spacing: 0.3px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.35);
}

.spin-active {
  animation: spinLoader 1s linear infinite;
}

/* Rank Crest Card */
.rank-crest-card {
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.crest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.crest-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crest-type {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.2px;
}

/* Profile Not Found Page */
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px 80px 16px;
  min-height: 60vh;
}

.not-found-card {
  max-width: 640px;
  width: 100%;
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
  background: rgba(8, 12, 22, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.not-found-radar {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-scan-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px dashed rgba(200, 170, 110, 0.4);
  animation: radarRotate 8s linear infinite;
}

@keyframes radarRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.radar-lost-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(20, 25, 40, 0.9) 100%);
  border: 1.5px solid rgba(239, 68, 68, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f87171;
  font-size: 22px;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.status-pill {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #f87171;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 3px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

.not-found-title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0;
}

.not-found-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 500px;
  margin: 0;
}

.text-cyan {
  color: #00f0ff;
}

.text-gold {
  color: var(--color-gold);
}

.not-found-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 14px 18px;
  width: 100%;
  text-align: left;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.check-icon {
  color: var(--color-gold);
  font-size: 13px;
}

.check-item code {
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 6px;
  border-radius: 4px;
  color: #00f0ff;
  font-size: 11px;
}

.not-found-search-box {
  width: 100%;
  margin-top: 8px;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-gold);
  text-decoration: none;
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid rgba(200, 170, 110, 0.3);
  background: rgba(200, 170, 110, 0.08);
  transition: all 0.2s;
  margin-top: 6px;
}

.back-home-btn:hover {
  background: rgba(200, 170, 110, 0.18);
  color: #ffd700;
  border-color: #ffd700;
  transform: translateY(-1px);
}

.season-badge {
  font-size: 9px;
  color: var(--color-text-muted);
}

.crest-status-tag {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
}

.crest-status-tag.active {
  background: rgba(10, 200, 185, 0.15);
  color: #0ac8b9;
  border: 1px solid rgba(10, 200, 185, 0.3);
}

.crest-status-tag.unranked {
  background: rgba(255, 255, 255, 0.05);
  color: #64748b;
}

.rank-item-box {
  display: flex;
  align-items: center;
  gap: 16px;
}

.emblem-wrapper {
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-emblem {
  width: 78px;
  height: 78px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
}

.rank-stat-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tier-heading {
  font-size: 17px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.5px;
}

.lp-status-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  margin-top: 1px;
  min-width: 0;
  overflow: hidden;
}

.lp-badge {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-gold);
  letter-spacing: 0.2px;
}

.rankup-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(10, 200, 185, 0.12);
  border: 1px solid rgba(10, 200, 185, 0.35);
  color: #00f0ff;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1.5px 7px;
  border-radius: 6px;
  letter-spacing: 0.2px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.rankup-pill i {
  font-size: 9.5px;
  color: #00f0ff;
}

.rankup-pill.peak-pill {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
  color: #ffd700;
}

.rankup-pill.peak-pill i {
  color: #ffd700;
}

.lp-progress-section {
  width: 100%;
  margin-top: 4px;
  margin-bottom: 2px;
}

.lp-progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.lp-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0ac8b9 0%, #00f0ff 100%);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.winrate-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
}

.wr-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.wr-highlight {
  color: #0ac8b9;
  font-weight: 800;
}

.wr-progress-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.wr-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ac8b9 0%, #00f0ff 100%);
  border-radius: 3px;
}

.unranked-sub {
  font-size: 11px;
  color: var(--color-text-muted);
}

.text-muted {
  color: #64748b;
}

/* Tier Glow Variants */
.glow-gold {
  border-color: rgba(200, 170, 110, 0.4);
  box-shadow: 0 4px 24px rgba(200, 170, 110, 0.15);
}

.glow-emerald {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 24px rgba(16, 185, 129, 0.15);
}

.glow-diamond {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 4px 24px rgba(0, 240, 255, 0.15);
}

.glow-master {
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 4px 24px rgba(168, 85, 247, 0.15);
}

.glow-grandmaster {
  border-color: rgba(239, 68, 68, 0.45);
  box-shadow: 0 4px 24px rgba(239, 68, 68, 0.18);
}

.glow-challenger {
  border-color: rgba(250, 204, 21, 0.45);
  box-shadow: 0 4px 24px rgba(250, 204, 21, 0.22);
}

/* Apex Ladder Stepper (Master -> Grandmaster -> Challenger) */
.apex-ladder-track {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  width: fit-content;
}

.apex-tier-node {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.2px;
  transition: all 0.2s;
}

.apex-tier-node.cleared {
  color: #a855f7;
  font-weight: 700;
}

.apex-tier-node.active {
  color: #00f0ff;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
}

.apex-track-arrow {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.25);
}

.matches-column {
  min-width: 0;
}
</style>
