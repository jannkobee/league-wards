<template>
  <div class="match-item-card" :class="[resultClass, { 'is-expanded': isExpanded }]">
    <!-- Seamless Full-Card Champion Splash Wallpaper Backdrop (Extends through top) -->
    <div class="match-card-full-wallpaper" :style="splashBackgroundStyle"></div>
    <div class="match-card-ambient-overlay" :class="resultClass"></div>

    <!-- Match Header / Summary Bar -->
    <div class="card-bar" @click="toggleExpand">
      <!-- Game Mode & Time -->
      <div class="col-meta">
        <span class="queue-badge">{{ queueName }}</span>
        <span class="time-elapsed">{{ relativeTime }}</span>
        <div class="outcome-tag" :class="resultClass">
          {{ isRemake ? "REMAKE" : currentParticipant?.win ? "VICTORY" : "DEFEAT" }}
        </div>
        <span class="duration-text">{{ durationText }}</span>
      </div>

      <!-- Champion & Setup -->
      <div class="col-champion">
        <div
          class="champ-portrait-box"
          :title="`Inspect ${currentParticipant?.championName} in Codex`"
          @click.stop="openChampionModal(currentParticipant?.championName || '')"
        >
          <img
            :src="getChampionIcon(currentParticipant?.championName || '')"
            :alt="currentParticipant?.championName"
            class="champ-portrait"
          />
          <span class="champ-lvl-pill">{{ currentParticipant?.champLevel }}</span>
        </div>

        <div class="runes-spells-cluster">
          <div class="cluster-col">
            <img
              v-if="getSummonerSpellIcon(currentParticipant?.summoner1Id || 0)"
              :src="getSummonerSpellIcon(currentParticipant?.summoner1Id || 0)"
              class="icon-spell"
            />
            <img
              v-if="getSummonerSpellIcon(currentParticipant?.summoner2Id || 0)"
              :src="getSummonerSpellIcon(currentParticipant?.summoner2Id || 0)"
              class="icon-spell"
            />
          </div>
          <div class="cluster-col">
            <img v-if="primaryRuneIcon" :src="primaryRuneIcon" class="icon-rune rune-keystone" />
            <img v-if="secondaryRuneIcon" :src="secondaryRuneIcon" class="icon-rune" />
          </div>
        </div>
      </div>

      <!-- Combat KDA & KP -->
      <div class="col-kda">
        <div class="kda-stat-line">
          <span class="k-num">{{ currentParticipant?.kills }}</span> /
          <span class="d-num">{{ currentParticipant?.deaths }}</span> /
          <span class="a-num">{{ currentParticipant?.assists }}</span>
        </div>
        <div class="kda-multiplier" :class="kdaClass">
          {{
            formatKda(
              currentParticipant?.kills || 0,
              currentParticipant?.deaths || 0,
              currentParticipant?.assists || 0,
            )
          }}
          KDA
        </div>
        <div v-if="killParticipation !== null" class="kp-tag">
          {{ killParticipation }}% Kill Part.
        </div>
      </div>

      <!-- Vision & CS Spotlight -->
      <div class="col-vision-cs">
        <div class="vision-indicator" title="Vision Score">
          <i class="pi pi-eye"></i>
          <span class="vision-val-bold">{{ currentParticipant?.visionScore || 0 }}</span>
          <span class="vision-lbl">Vision</span>
        </div>

        <div v-if="currentParticipant?.visionWardsBoughtInGame" class="control-ward-tag">
          <span class="pink-dot"></span>
          {{ currentParticipant.visionWardsBoughtInGame }} Control Wards
        </div>

        <div class="cs-indicator" title="Total Minions and Monsters Killed">
          <i class="pi pi-bolt"></i> {{ totalCs }} ({{ csPerMin }}/m) CS
        </div>
      </div>

      <!-- Inventory Grid -->
      <div class="col-inventory">
        <div class="inventory-matrix">
          <div
            v-for="(item, idx) in itemsList"
            :key="idx"
            class="item-pocket"
            :class="{ 'trinket-pocket': idx === 6, 'has-item': item > 0 }"
            :title="item > 0 ? 'Click to inspect item in Codex' : ''"
            @click.stop="item > 0 ? openItemModal(item) : null"
          >
            <img v-if="item > 0" :src="getItemIcon(item)" class="item-visual" />
          </div>
        </div>
      </div>

      <!-- 10-Player Roster Preview -->
      <div class="col-roster">
        <div class="roster-team team-blue">
          <div
            v-for="p in blueTeam"
            :key="p.puuid"
            class="roster-player"
            :class="{ 'player-active': p.puuid === currentPuuid }"
            :title="`Inspect ${p.championName} in Codex`"
            @click.stop="openChampionModal(p.championName)"
          >
            <img :src="getChampionIcon(p.championName)" class="roster-champ-icon" />
            <span class="roster-player-name">{{ p.riotIdGameName || p.summonerName }}</span>
          </div>
        </div>
        <div class="roster-team team-red">
          <div
            v-for="p in redTeam"
            :key="p.puuid"
            class="roster-player"
            :class="{ 'player-active': p.puuid === currentPuuid }"
            :title="`Inspect ${p.championName} in Codex`"
            @click.stop="openChampionModal(p.championName)"
          >
            <img :src="getChampionIcon(p.championName)" class="roster-champ-icon" />
            <span class="roster-player-name">{{ p.riotIdGameName || p.summonerName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Expandable Scoreboard Details -->
    <transition name="details-slide">
      <MatchDetails
        v-if="isExpanded"
        :match="match"
        :current-puuid="currentPuuid"
        :region="region"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { MatchDto, ParticipantDto } from "@/types/league";
import { useDataDragon } from "@/composables/useDataDragon";
import {
  getQueueName,
  formatGameDuration,
  formatRelativeTime,
  formatKda,
} from "@/utils/riotRouting";
import MatchDetails from "./MatchDetails.vue";
import { useCodexModal } from "@/composables/useCodexModal";

const props = defineProps<{
  match: MatchDto;
  currentPuuid: string;
  region: string;
}>();

const { getChampionIcon, getChampionSplash, getItemIcon, getSummonerSpellIcon, getRuneIcon } =
  useDataDragon();
const { openChampionModal, openItemModal } = useCodexModal();

const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const currentParticipant = computed<ParticipantDto | undefined>(() => {
  return props.match.info.participants.find((p) => p.puuid === props.currentPuuid);
});

const isRemake = computed(() => {
  const duration = props.match.info.gameDuration;
  const inSeconds = duration > 10000 ? Math.floor(duration / 1000) : duration;
  return inSeconds < 300 || currentParticipant.value?.gameEndedInEarlySurrender;
});

const resultClass = computed(() => {
  if (isRemake.value) return "remake";
  return currentParticipant.value?.win ? "victory" : "defeat";
});

const splashBackgroundStyle = computed(() => {
  const champ = currentParticipant.value?.championName;
  if (!champ) return {};
  const url = getChampionSplash(champ);
  return {
    backgroundImage: `url(${url})`,
  };
});

const queueName = computed(() => getQueueName(props.match.info.queueId));

const durationText = computed(() => formatGameDuration(props.match.info.gameDuration));

const relativeTime = computed(() => {
  const timestamp = props.match.info.gameEndTimestamp || props.match.info.gameCreation;
  return formatRelativeTime(timestamp);
});

const primaryRuneIcon = computed(() => {
  const p = currentParticipant.value;
  if (!p) return "";
  const primaryStyle = p.perks?.styles?.find((s) => s.description === "primaryStyle");
  const keystone = primaryStyle?.selections?.[0]?.perk;
  return keystone ? getRuneIcon(keystone) : "";
});

const secondaryRuneIcon = computed(() => {
  const p = currentParticipant.value;
  if (!p) return "";
  const subStyle = p.perks?.styles?.find((s) => s.description === "subStyle");
  return subStyle ? getRuneIcon(subStyle.style) : "";
});

const totalCs = computed(() => {
  const p = currentParticipant.value;
  if (!p) return 0;
  return (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
});

const csPerMin = computed(() => {
  const duration = props.match.info.gameDuration;
  const inSeconds = duration > 10000 ? Math.floor(duration / 1000) : duration;
  const mins = inSeconds / 60;
  if (mins <= 0) return "0.0";
  return (totalCs.value / mins).toFixed(1);
});

const killParticipation = computed<number | null>(() => {
  const p = currentParticipant.value;
  if (!p) return null;
  const teamParticipants = props.match.info.participants.filter((item) => item.teamId === p.teamId);
  const totalTeamKills = teamParticipants.reduce((sum, item) => sum + (item.kills || 0), 0);
  if (totalTeamKills === 0) return 0;
  return Math.round(((p.kills + p.assists) / totalTeamKills) * 100);
});

const kdaClass = computed(() => {
  const p = currentParticipant.value;
  if (!p) return "kda-neutral";
  if (p.deaths === 0) return "kda-legendary";
  const ratio = (p.kills + p.assists) / p.deaths;
  if (ratio >= 4) return "kda-legendary";
  if (ratio >= 3) return "kda-great";
  if (ratio >= 2) return "kda-good";
  return "kda-neutral";
});

const itemsList = computed(() => {
  const p = currentParticipant.value;
  if (!p) return [0, 0, 0, 0, 0, 0, 0];
  return [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6];
});

const blueTeam = computed(() => props.match.info.participants.filter((p) => p.teamId === 100));

const redTeam = computed(() => props.match.info.participants.filter((p) => p.teamId === 200));
</script>

<style scoped>
.match-item-card {
  position: relative;
  border-radius: 12px;
  border-left: 4px solid rgba(100, 116, 139, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 12px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
}

.match-item-card.victory {
  border-left-color: rgba(10, 200, 185, 0.7);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(10, 200, 185, 0.1);
}

.match-item-card.defeat {
  border-left-color: rgba(244, 63, 94, 0.7);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(244, 63, 94, 0.1);
}

.match-item-card.remake {
  border-left-color: rgba(100, 116, 139, 0.5);
}

.match-item-card:hover {
  border-top-color: rgba(200, 170, 110, 0.2);
  border-right-color: rgba(200, 170, 110, 0.2);
  border-bottom-color: rgba(200, 170, 110, 0.2);
  transform: translateY(-1px);
}

/* Card Bar (Header row) */
.card-bar {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 105px 145px 115px 150px 140px 1fr;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  gap: 14px;
  background: rgba(6, 9, 16, 0.28);
  transition: background 0.2s ease;
}

.card-bar:hover {
  background: rgba(6, 9, 16, 0.16);
}

.match-item-card.is-expanded .card-bar {
  background: rgba(6, 9, 16, 0.2);
}

/* Full-Card Champion Splash Wallpaper Backdrop (Extends from top header through details) */
.match-card-full-wallpaper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center 18%;
  background-repeat: no-repeat;
  opacity: 0.72;
  filter: saturate(1.25) contrast(1.15);
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.match-item-card:hover .match-card-full-wallpaper {
  opacity: 0.82;
}

/* Full-Card Ambient Vignette Layer */
.match-card-ambient-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.match-card-ambient-overlay.victory {
  background: linear-gradient(180deg, rgba(6, 9, 16, 0.22) 0%, rgba(6, 9, 16, 0.42) 100%),
    linear-gradient(
      90deg,
      rgba(9, 14, 24, 0.5) 0%,
      rgba(10, 18, 30, 0.18) 45%,
      rgba(10, 200, 185, 0.07) 100%
    );
}

.match-card-ambient-overlay.defeat {
  background: linear-gradient(180deg, rgba(6, 9, 16, 0.22) 0%, rgba(6, 9, 16, 0.42) 100%),
    linear-gradient(
      90deg,
      rgba(16, 11, 18, 0.5) 0%,
      rgba(22, 13, 22, 0.18) 45%,
      rgba(244, 63, 94, 0.07) 100%
    );
}

.match-card-ambient-overlay.remake {
  background: linear-gradient(180deg, rgba(6, 9, 16, 0.22) 0%, rgba(6, 9, 16, 0.42) 100%),
    linear-gradient(
      90deg,
      rgba(15, 23, 42, 0.5) 0%,
      rgba(15, 23, 42, 0.18) 45%,
      rgba(100, 116, 139, 0.07) 100%
    );
}

/* Direct Content children above overlay */
.col-meta,
.col-champion,
.col-kda,
.col-vision-cs,
.col-inventory,
.col-roster {
  position: relative;
  z-index: 3;
}

@media (max-width: 1100px) {
  .card-bar {
    grid-template-columns: 95px 135px 105px 135px 1fr;
  }
  .col-roster {
    display: none !important;
  }
}

@media (max-width: 840px) {
  .card-bar {
    grid-template-columns: 85px 120px 100px 1fr;
  }
  .col-inventory {
    display: none !important;
  }
}

/* Col: Meta */
.col-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}

.queue-badge {
  font-family: var(--font-body);
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  letter-spacing: 0.2px;
}

.time-elapsed {
  color: var(--color-text-secondary);
  font-size: 10px;
}

.outcome-tag {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-top: 1px;
}

.outcome-tag.victory {
  color: #00f0ff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.outcome-tag.defeat {
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
}

.outcome-tag.remake {
  color: #94a3b8;
}

.duration-text {
  color: var(--color-text-muted);
  font-size: 10px;
}

/* Col: Champion */
.col-champion {
  display: flex;
  align-items: center;
  gap: 10px;
}

.champ-portrait-box {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.champ-portrait-box:hover {
  transform: scale(1.06);
}

.champ-portrait-box:hover .champ-portrait {
  border-color: #00f0ff;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}

.champ-portrait {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid rgba(200, 170, 110, 0.45);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease;
}

.champ-lvl-pill {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #06090e;
  color: #ffd700;
  font-size: 9px;
  font-weight: 800;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 215, 0, 0.5);
}

.runes-spells-cluster {
  display: flex;
  gap: 4px;
}

.cluster-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.icon-spell {
  width: 21px;
  height: 21px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.icon-rune {
  width: 21px;
  height: 21px;
  background: #080d16;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

/* Col: KDA */
.col-kda {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kda-stat-line {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}

.k-num {
  color: #60a5fa;
}

.d-num {
  color: #f87171;
}

.a-num {
  color: #34d399;
}

.kda-multiplier {
  font-size: 12px;
  font-weight: 700;
}

.kda-legendary {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
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

.kp-tag {
  font-size: 10px;
  font-weight: 600;
  color: #f43f5e;
}

/* Col: Vision & CS */
.col-vision-cs {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
}

.vision-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #00f0ff;
  font-weight: 700;
}

.vision-val-bold {
  font-weight: 800;
  font-size: 14px;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}

.vision-lbl {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.control-ward-tag {
  font-size: 10px;
  color: #ec4899;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pink-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ec4899;
  box-shadow: 0 0 8px #ec4899;
}

.cs-indicator {
  font-size: 11px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Col: Inventory */
.col-inventory {
  display: flex;
  align-items: center;
}

.inventory-matrix {
  display: grid;
  grid-template-columns: repeat(4, 26px);
  gap: 3px;
}

.item-pocket {
  width: 26px;
  height: 26px;
  background: rgba(6, 10, 18, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.6);
  transition: all 0.2s ease;
}

.item-pocket.has-item {
  cursor: pointer;
}

.item-pocket.has-item:hover {
  border-color: #ffd700;
  transform: scale(1.15);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  z-index: 5;
}

.trinket-pocket {
  border-radius: 50%;
  border-color: rgba(200, 170, 110, 0.6);
  box-shadow: 0 0 8px rgba(200, 170, 110, 0.25);
}

.item-visual {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Col: Roster */
.col-roster {
  display: flex;
  gap: 10px;
}

.roster-team {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 82px;
}

.roster-player {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.15s ease;
}

.roster-player:hover {
  color: #00f0ff;
}

.roster-player.player-active {
  color: #00f0ff;
  font-weight: 800;
}

.roster-champ-icon {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  flex-shrink: 0;
}

.roster-player-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Transition */
.details-slide-enter-active,
.details-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.details-slide-enter-from,
.details-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
