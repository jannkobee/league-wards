<template>
  <div class="match-details-view">
    <!-- Blue Team (100) -->
    <div class="team-panel team-panel-blue">
      <div class="team-banner">
        <div class="banner-title-group">
          <span class="team-crest-badge blue-crest">Blue Side</span>
          <span
            class="outcome-label"
            :class="{ 'text-win': blueTeam?.win, 'text-loss': !blueTeam?.win }"
          >
            {{ blueTeam?.win ? "VICTORY" : "DEFEAT" }}
          </span>
        </div>

        <div class="banner-objectives">
          <span class="obj-badge" title="Barons Slain">
            <i class="pi pi-shield"></i> {{ blueTeam?.objectives?.baron?.kills || 0 }}
          </span>
          <span class="obj-badge" title="Dragons Slain">
            <i class="pi pi-star"></i> {{ blueTeam?.objectives?.dragon?.kills || 0 }}
          </span>
          <span class="obj-badge" title="Turrets Destroyed">
            <i class="pi pi-building"></i> {{ blueTeam?.objectives?.tower?.kills || 0 }}
          </span>
          <span class="obj-badge gold-obj" title="Total Team Gold">
            <i class="pi pi-dollar"></i> {{ formatNumber(blueTotalGold) }}
          </span>
        </div>
      </div>

      <!-- Table Column Header -->
      <div class="table-column-headers">
        <div class="th-champ">Champion</div>
        <div class="th-player">Summoner</div>
        <div class="th-kda">KDA</div>
        <div class="th-damage">Damage</div>
        <div class="th-vision">Vision</div>
        <div class="th-cs">CS</div>
        <div class="th-items">Items</div>
      </div>

      <!-- Blue Players List -->
      <div class="players-table">
        <div
          v-for="p in blueParticipants"
          :key="p.puuid"
          class="player-entry-row"
          :class="{ 'current-player-highlight': p.puuid === currentPuuid }"
        >
          <!-- Champ -->
          <div class="entry-champ">
            <div
              class="mini-portrait-box"
              :title="`Inspect ${p.championName} in Codex`"
              @click.stop="openChampionModal(p.championName)"
            >
              <img :src="getChampionIcon(p.championName)" class="mini-portrait" />
              <span class="mini-lvl">{{ p.champLevel }}</span>
            </div>
            <div class="mini-spells-runes">
              <img
                v-if="getSummonerSpellIcon(p.summoner1Id)"
                :src="getSummonerSpellIcon(p.summoner1Id)"
                class="entry-icon"
              />
              <img
                v-if="getSummonerSpellIcon(p.summoner2Id)"
                :src="getSummonerSpellIcon(p.summoner2Id)"
                class="entry-icon"
              />
            </div>
          </div>

          <!-- Name & Tag -->
          <div class="entry-identity">
            <router-link
              :to="{
                name: 'account-view',
                params: {
                  account: `${p.riotIdGameName || p.summonerName}#${p.riotIdTagline || region}`,
                  region: region,
                },
              }"
              class="entry-player-name"
              :class="{ 'bold-self': p.puuid === currentPuuid }"
            >
              {{ p.riotIdGameName || p.summonerName }}
            </router-link>
            <span class="entry-tag">#{{ p.riotIdTagline || region }}</span>
          </div>

          <!-- Scoreboard Stats -->
          <div class="entry-kda">
            <div class="kda-nums">
              <span class="k-blue">{{ p.kills }}</span
              >/<span class="d-red">{{ p.deaths }}</span
              >/<span class="a-green">{{ p.assists }}</span>
            </div>
            <span class="kda-ratio-label">{{ formatKda(p.kills, p.deaths, p.assists) }}</span>
          </div>

          <div class="entry-damage-bar-col">
            <div class="dmg-num">{{ formatNumber(p.totalDamageDealtToChampions) }}</div>
            <div class="dmg-bar-track">
              <div
                class="dmg-bar-fill fill-blue"
                :style="{ width: `${(p.totalDamageDealtToChampions / maxDamageInMatch) * 100}%` }"
              ></div>
            </div>
          </div>

          <div class="entry-vision-pill">
            <i class="pi pi-eye"></i>
            <span class="vis-val">{{ p.visionScore }}</span>
            <span v-if="p.visionWardsBoughtInGame" class="pink-sub"
              >({{ p.visionWardsBoughtInGame }}p)</span
            >
          </div>

          <div class="entry-cs">
            <span class="cs-t">{{ p.totalMinionsKilled + p.neutralMinionsKilled }}</span>
            <span class="cs-m">{{ getCsPerMin(p) }}/m</span>
          </div>

          <div class="entry-inventory">
            <div
              v-for="(item, idx) in [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6]"
              :key="idx"
              class="entry-item-slot"
              :class="{ 'trinket-slot': idx === 6, 'has-item': item > 0 }"
              :title="item > 0 ? 'Click to inspect item in Codex' : ''"
              @click.stop="item > 0 ? openItemModal(item) : null"
            >
              <img v-if="item > 0" :src="getItemIcon(item)" class="entry-item-img" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Red Team (200) -->
    <div class="team-panel team-panel-red">
      <div class="team-banner">
        <div class="banner-title-group">
          <span class="team-crest-badge red-crest">Red Side</span>
          <span
            class="outcome-label"
            :class="{ 'text-win': redTeam?.win, 'text-loss': !redTeam?.win }"
          >
            {{ redTeam?.win ? "VICTORY" : "DEFEAT" }}
          </span>
        </div>

        <div class="banner-objectives">
          <span class="obj-badge" title="Barons Slain">
            <i class="pi pi-shield"></i> {{ redTeam?.objectives?.baron?.kills || 0 }}
          </span>
          <span class="obj-badge" title="Dragons Slain">
            <i class="pi pi-star"></i> {{ redTeam?.objectives?.dragon?.kills || 0 }}
          </span>
          <span class="obj-badge" title="Turrets Destroyed">
            <i class="pi pi-building"></i> {{ redTeam?.objectives?.tower?.kills || 0 }}
          </span>
          <span class="obj-badge gold-obj" title="Total Team Gold">
            <i class="pi pi-dollar"></i> {{ formatNumber(redTotalGold) }}
          </span>
        </div>
      </div>

      <!-- Table Column Header -->
      <div class="table-column-headers">
        <div class="th-champ">Champion</div>
        <div class="th-player">Summoner</div>
        <div class="th-kda">KDA</div>
        <div class="th-damage">Damage</div>
        <div class="th-vision">Vision</div>
        <div class="th-cs">CS</div>
        <div class="th-items">Items</div>
      </div>

      <!-- Red Players List -->
      <div class="players-table">
        <div
          v-for="p in redParticipants"
          :key="p.puuid"
          class="player-entry-row"
          :class="{ 'current-player-highlight': p.puuid === currentPuuid }"
        >
          <!-- Champ -->
          <div class="entry-champ">
            <div
              class="mini-portrait-box"
              :title="`Inspect ${p.championName} in Codex`"
              @click.stop="openChampionModal(p.championName)"
            >
              <img :src="getChampionIcon(p.championName)" class="mini-portrait" />
              <span class="mini-lvl">{{ p.champLevel }}</span>
            </div>
            <div class="mini-spells-runes">
              <img
                v-if="getSummonerSpellIcon(p.summoner1Id)"
                :src="getSummonerSpellIcon(p.summoner1Id)"
                class="entry-icon"
              />
              <img
                v-if="getSummonerSpellIcon(p.summoner2Id)"
                :src="getSummonerSpellIcon(p.summoner2Id)"
                class="entry-icon"
              />
            </div>
          </div>

          <!-- Name & Tag -->
          <div class="entry-identity">
            <router-link
              :to="{
                name: 'account-view',
                params: {
                  account: `${p.riotIdGameName || p.summonerName}#${p.riotIdTagline || region}`,
                  region: region,
                },
              }"
              class="entry-player-name"
              :class="{ 'bold-self': p.puuid === currentPuuid }"
            >
              {{ p.riotIdGameName || p.summonerName }}
            </router-link>
            <span class="entry-tag">#{{ p.riotIdTagline || region }}</span>
          </div>

          <!-- Scoreboard Stats -->
          <div class="entry-kda">
            <div class="kda-nums">
              <span class="k-blue">{{ p.kills }}</span
              >/<span class="d-red">{{ p.deaths }}</span
              >/<span class="a-green">{{ p.assists }}</span>
            </div>
            <span class="kda-ratio-label">{{ formatKda(p.kills, p.deaths, p.assists) }}</span>
          </div>

          <div class="entry-damage-bar-col">
            <div class="dmg-num">{{ formatNumber(p.totalDamageDealtToChampions) }}</div>
            <div class="dmg-bar-track">
              <div
                class="dmg-bar-fill fill-red"
                :style="{ width: `${(p.totalDamageDealtToChampions / maxDamageInMatch) * 100}%` }"
              ></div>
            </div>
          </div>

          <div class="entry-vision-pill">
            <i class="pi pi-eye"></i>
            <span class="vis-val">{{ p.visionScore }}</span>
            <span v-if="p.visionWardsBoughtInGame" class="pink-sub"
              >({{ p.visionWardsBoughtInGame }}p)</span
            >
          </div>

          <div class="entry-cs">
            <span class="cs-t">{{ p.totalMinionsKilled + p.neutralMinionsKilled }}</span>
            <span class="cs-m">{{ getCsPerMin(p) }}/m</span>
          </div>

          <div class="entry-inventory">
            <div
              v-for="(item, idx) in [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6]"
              :key="idx"
              class="entry-item-slot"
              :class="{ 'trinket-slot': idx === 6, 'has-item': item > 0 }"
              :title="item > 0 ? 'Click to inspect item in Codex' : ''"
              @click.stop="item > 0 ? openItemModal(item) : null"
            >
              <img v-if="item > 0" :src="getItemIcon(item)" class="entry-item-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { MatchDto, ParticipantDto } from "@/types/league";
import { useDataDragon } from "@/composables/useDataDragon";
import { formatKda } from "@/utils/riotRouting";
import { useCodexModal } from "@/composables/useCodexModal";

const props = defineProps<{
  match: MatchDto;
  currentPuuid: string;
  region: string;
}>();

const { getChampionIcon, getItemIcon, getSummonerSpellIcon } = useDataDragon();
const { openChampionModal, openItemModal } = useCodexModal();

const blueTeam = computed(() => props.match.info.teams.find((t) => t.teamId === 100));
const redTeam = computed(() => props.match.info.teams.find((t) => t.teamId === 200));

const blueParticipants = computed(() =>
  props.match.info.participants.filter((p) => p.teamId === 100),
);

const redParticipants = computed(() =>
  props.match.info.participants.filter((p) => p.teamId === 200),
);

const blueTotalGold = computed(() =>
  blueParticipants.value.reduce((acc, p) => acc + (p.goldEarned || 0), 0),
);

const redTotalGold = computed(() =>
  redParticipants.value.reduce((acc, p) => acc + (p.goldEarned || 0), 0),
);

const maxDamageInMatch = computed(() => {
  return Math.max(
    1,
    ...props.match.info.participants.map((p) => p.totalDamageDealtToChampions || 0),
  );
});

const getCsPerMin = (p: ParticipantDto): string => {
  const cs = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
  let duration = props.match.info.gameDuration;
  if (duration > 10000) duration = Math.floor(duration / 1000);
  const minutes = duration / 60;
  if (minutes <= 0) return "0.0";
  return (cs / minutes).toFixed(1);
};

const formatNumber = (num: number): string => {
  if (!num) return "0";
  return num.toLocaleString();
};
</script>

<style scoped>
.match-details-view {
  padding: 12px 20px 24px 20px;
  background: transparent;
  border: none;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

/* Team Panels (Translucent glass so wallpaper shows through clearly) */
.team-panel {
  position: relative;
  z-index: 1;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
  background: rgba(10, 15, 26, 0.25);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border: none;
}

.team-panel-blue {
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, rgba(10, 15, 26, 0.22) 40%);
}

.team-panel-red {
  background: linear-gradient(90deg, rgba(244, 63, 94, 0.08) 0%, rgba(10, 15, 26, 0.22) 40%);
}

.team-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border: none;
  background: rgba(6, 9, 16, 0.35);
}

.banner-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-crest-badge {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  letter-spacing: 1px;
}

.blue-crest {
  background: rgba(0, 240, 255, 0.2);
  color: #00f0ff;
  border: none;
}

.red-crest {
  background: rgba(244, 63, 94, 0.2);
  color: #f87171;
  border: none;
}

.outcome-label {
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 1px;
}

.text-win {
  color: #00f0ff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}

.text-loss {
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
}

.banner-objectives {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 600;
}

.obj-badge {
  display: flex;
  align-items: center;
  gap: 5px;
}

.gold-obj {
  color: #ffd700;
  font-weight: 800;
}

/* Table Column Headers */
.table-column-headers {
  display: grid;
  grid-template-columns: 85px 1.4fr 1.1fr 1.3fr 90px 90px 200px;
  align-items: center;
  padding: 8px 16px;
  background: rgba(6, 9, 16, 0.4);
  border: none;
  font-size: 11px;
  font-weight: 800;
  color: var(--color-gold);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  gap: 10px;
}

/* Player Rows */
.players-table {
  display: flex;
  flex-direction: column;
}

.player-entry-row {
  display: grid;
  grid-template-columns: 85px 1.4fr 1.1fr 1.3fr 90px 90px 200px;
  align-items: center;
  padding: 8px 16px;
  border: none;
  font-size: 12px;
  gap: 10px;
  background: rgba(8, 12, 22, 0.16);
  transition: background 0.15s;
}

.player-entry-row:nth-child(even) {
  background: rgba(12, 18, 30, 0.24);
}

.player-entry-row:hover {
  background: rgba(10, 200, 185, 0.22);
}

.current-player-highlight {
  background: rgba(10, 200, 185, 0.26) !important;
  border: none;
}

/* Champ Portrait */
.entry-champ {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-portrait-box {
  position: relative;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mini-portrait-box:hover {
  transform: scale(1.12);
}

.mini-portrait-box:hover .mini-portrait {
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
}

.mini-portrait {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  transition: box-shadow 0.2s ease;
}

.mini-lvl {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: #06090e;
  color: #ffd700;
  font-size: 9px;
  font-weight: 800;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.7);
}

.mini-spells-runes {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.entry-icon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

/* Identity */
.entry-identity {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-player-name {
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

.entry-player-name:hover {
  color: #00f0ff !important;
  text-decoration: underline;
}

.bold-self {
  font-weight: 800;
  color: #00f0ff !important;
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.6);
}

.entry-tag {
  color: #94a3b8;
  font-size: 11px;
  margin-left: 3px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

/* KDA */
.entry-kda {
  display: flex;
  flex-direction: column;
}

.kda-nums {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

.k-blue {
  color: #60a5fa;
}

.d-red {
  color: #f87171;
}

.a-green {
  color: #34d399;
}

.kda-ratio-label {
  font-size: 11px;
  font-weight: 700;
  color: #cbd5e1;
}

/* Damage Bar */
.entry-damage-bar-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-right: 10px;
}

.dmg-num {
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
}

.dmg-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.dmg-bar-fill {
  height: 100%;
  border-radius: 3px;
}

.fill-blue {
  background: linear-gradient(90deg, #0ac8b9 0%, #00f0ff 100%);
}

.fill-red {
  background: linear-gradient(90deg, #f43f5e 0%, #ff6b81 100%);
}

/* Vision Pill */
.entry-vision-pill {
  color: #00f0ff;
  font-weight: 800;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pink-sub {
  color: #ec4899;
  font-size: 10px;
}

/* CS */
.entry-cs {
  display: flex;
  flex-direction: column;
}

.cs-t {
  font-weight: 800;
  color: #ffffff;
  font-size: 12px;
}

.cs-m {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

/* Items */
.entry-inventory {
  display: flex;
  gap: 3px;
}

.entry-item-slot {
  width: 25px;
  height: 25px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.entry-item-slot.has-item {
  cursor: pointer;
}

.entry-item-slot.has-item:hover {
  transform: scale(1.18);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  z-index: 5;
}

.trinket-slot {
  border-radius: 50%;
  border: none;
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.4);
}

.entry-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Tab: Vision Deep Dive Columns */
.vision-deep-col {
  display: flex;
  flex-direction: column;
}

.deep-val {
  font-size: 13px;
  font-weight: 800;
}

.bold-white {
  color: #ffffff;
}

.deep-val.cyan {
  color: #00f0ff;
}

.deep-val.pink-text {
  color: #ec4899;
}

.deep-val.gold-text {
  color: #ffd700;
}

.deep-sub {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
}

/* Tab: Combat Columns */
.combat-dmg-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: span 3;
}

.combat-num-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.c-dmg-bold {
  font-weight: 800;
  color: #ffffff;
}

.c-dmg-pct {
  color: #cbd5e1;
  font-weight: 600;
}

.combat-bar-track {
  height: 7px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.combat-bar-fill {
  height: 100%;
  background: #0ac8b9;
}

.combat-cs-col {
  display: flex;
  flex-direction: column;
  grid-column: span 2;
}

.c-cs {
  font-weight: 800;
  color: #ffffff;
}

.c-gold {
  color: #ffd700;
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .table-column-headers,
  .player-entry-row {
    grid-template-columns: 70px 1.2fr 1fr 1fr 140px;
  }
  .entry-damage-bar-col,
  .entry-vision-pill,
  .th-damage,
  .th-vision {
    display: none;
  }
}
</style>
