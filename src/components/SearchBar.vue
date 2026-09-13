<template>
  <div class="search-bar-root" :class="{ 'is-compact': isCompact }">
    <!-- Brand Header for Dashboard -->
    <div v-if="!isCompact" class="brand-hero" @click="$router.push({ name: 'dashboard' })">
      <div class="ward-emblem-beacon">
        <svg class="beacon-svg" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3.5" stroke="#00f0ff" stroke-width="2" />
          <path
            d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.2-6.8l-2.1 2.1m-9.4 9.4l-2.1 2.1m0-13.6l2.1 2.1m9.4 9.4l2.1 2.1"
            stroke="#c8aa6e"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <h1 class="brand-title">LEAGUE WARDS</h1>
      <p class="brand-tagline">
        Illuminating the Fog of War: Real-Time Vision & Match Intelligence
      </p>
    </div>

    <!-- Compact Brand Header for Account View -->
    <div v-else class="compact-brand-group">
      <div class="compact-brand" @click="$router.push({ name: 'dashboard' })">
        <svg class="mini-beacon-svg" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="#00f0ff" stroke-width="2" />
          <path
            d="M12 2v3m0 14v3M2 12h3m14 0h3"
            stroke="#c8aa6e"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <span class="compact-title-text">LEAGUE WARDS</span>
      </div>
      <router-link to="/codex" class="compact-codex-btn" title="Open Runeterra Codex">
        <i class="pi pi-book"></i>
        <span>Codex</span>
      </router-link>
    </div>

    <!-- Interactive Region Pill Strip (Replaces Dropdown!) -->
    <div class="region-pill-strip">
      <div class="primary-pills">
        <button
          v-for="reg in primaryRegions"
          :key="reg.code"
          class="region-strip-btn"
          :class="{ active: form.region === reg.code }"
          @click="selectRegion(reg.code)"
        >
          <span class="reg-code">{{ reg.code.toUpperCase() }}</span>
          <span class="reg-name">{{ reg.shortName }}</span>
        </button>

        <button
          class="region-strip-btn more-toggle"
          :class="{ active: isMoreOpen || isMoreSelected }"
          @click="isMoreOpen = !isMoreOpen"
        >
          <span>{{ isMoreSelected ? currentMoreShortName : "+ More" }}</span>
          <i :class="isMoreOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
        </button>
      </div>

      <!-- Expandable More Regions -->
      <transition name="expand-fade">
        <div v-if="isMoreOpen" class="more-regions-drawer">
          <button
            v-for="reg in secondaryRegions"
            :key="reg.code"
            class="more-reg-chip"
            :class="{ active: form.region === reg.code }"
            @click="selectRegion(reg.code)"
          >
            <span class="reg-code">{{ reg.code.toUpperCase() }}</span>
            <span class="reg-name">{{ reg.name }}</span>
          </button>
        </div>
      </transition>
    </div>

    <!-- Search Input Capsule -->
    <div class="search-capsule-bar">
      <div class="current-region-indicator">
        <span class="indicator-dot"></span>
        <span class="indicator-text">{{ form.region.toUpperCase() }}</span>
      </div>

      <div class="capsule-input-field">
        <i class="pi pi-search search-mag-icon"></i>
        <input
          v-model="form.account"
          type="text"
          class="native-search-input"
          placeholder="Summoner Name + #Tag (e.g. kovi#2001, Faker#KR1)"
          @input="handleInput"
          @keyup.enter="findSummoner"
        />
      </div>

      <button class="search-trigger-btn" :disabled="loading" @click="findSummoner">
        <span v-if="loading" class="spin-ring"></span>
        <span v-else class="trigger-label">
          <span>SCOUT</span>
          <i class="pi pi-bolt"></i>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useApi } from "@/composables/useApi";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();
const { loading, getAccountByRiotId } = useApi();

const isCompact = computed(() => route.name === "account-view");
const isMoreOpen = ref(false);

const form = reactive({
  region: (route.params.region as string) || "sg2",
  account: ((route.params.account as string) || "").replace("%23", "#"),
});

const primaryRegions = [
  { code: "sg2", shortName: "SEA", name: "South East Asia" },
  { code: "euw1", shortName: "EUW", name: "Europe West" },
  { code: "na1", shortName: "NA", name: "North America" },
  { code: "kr", shortName: "KR", name: "Korea" },
  { code: "eun1", shortName: "EUNE", name: "Europe Nordic" },
  { code: "oc1", shortName: "OCE", name: "Oceania" },
];

const secondaryRegions = [
  { code: "jp1", name: "Japan" },
  { code: "br1", name: "Brazil" },
  { code: "la1", name: "Latin America North" },
  { code: "la2", name: "Latin America South" },
  { code: "tr1", name: "Turkey" },
  { code: "ph2", name: "Philippines" },
  { code: "vn2", name: "Vietnam" },
  { code: "tw2", name: "Taiwan" },
];

const isMoreSelected = computed(() => {
  return secondaryRegions.some((r) => r.code === form.region);
});

const currentMoreShortName = computed(() => {
  const found = secondaryRegions.find((r) => r.code === form.region);
  return found ? found.code.toUpperCase() : "+ More";
});

const selectRegion = (code: string) => {
  form.region = code;
  isMoreOpen.value = false;
};

// Smart Region Auto-Detection based on tag
const handleInput = () => {
  const parts = form.account.split("#");
  if (parts.length > 1) {
    const tag = parts[1].toLowerCase().trim();
    if (tag.startsWith("kr")) form.region = "kr";
    else if (tag.startsWith("euw")) form.region = "euw1";
    else if (tag.startsWith("na")) form.region = "na1";
    else if (tag.startsWith("eun")) form.region = "eun1";
    else if (tag.startsWith("oce") || tag.startsWith("oc1")) form.region = "oc1";
    else if (tag.startsWith("sg") || tag.startsWith("sea")) form.region = "sg2";
    else if (tag.startsWith("jp")) form.region = "jp1";
    else if (tag.startsWith("br")) form.region = "br1";
    else if (tag.startsWith("ph")) form.region = "ph2";
    else if (tag.startsWith("vn")) form.region = "vn2";
    else if (tag.startsWith("tw")) form.region = "tw2";
    else if (tag.startsWith("lan") || tag.startsWith("la1")) form.region = "la1";
    else if (tag.startsWith("las") || tag.startsWith("la2")) form.region = "la2";
  }
};

const findSummoner = async () => {
  const [username, tag] = form.account.split("#");

  if (!username || !tag || !form.region) return;

  const accountRes = await getAccountByRiotId(username, tag, form.region);
  const accountData = accountRes?.data;

  if (accountData?.puuid) {
    router.push({
      name: "account-view",
      params: {
        account: form.account.replace("#", "%23"),
        region: form.region,
      },
    });
  }
};

defineExpose({
  setAccountAndRegion: (account: string, region: string) => {
    form.account = account;
    form.region = region;
    findSummoner();
  },
});
</script>

<style scoped>
.search-bar-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  gap: 16px;
}

.search-bar-root.is-compact {
  max-width: 100%;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
}

/* Brand Hero */
.brand-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.ward-emblem-beacon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(10, 200, 185, 0.25) 0%,
    rgba(200, 170, 110, 0.08) 70%,
    transparent 100%
  );
  border: 1px solid rgba(10, 200, 185, 0.45);
  box-shadow: 0 0 24px rgba(10, 200, 185, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  animation: beaconPulse 4s ease-in-out infinite alternate;
}

.beacon-svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.6));
}

@keyframes beaconPulse {
  0% {
    box-shadow: 0 0 16px rgba(10, 200, 185, 0.2);
  }
  100% {
    box-shadow:
      0 0 32px rgba(10, 200, 185, 0.5),
      0 0 10px rgba(200, 170, 110, 0.4);
  }
}

.brand-title {
  font-family: var(--font-heading);
  font-size: 46px;
  font-weight: 800;
  letter-spacing: 4px;
  background: linear-gradient(180deg, #fff9e6 0%, #c8aa6e 65%, #8c6a28 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
}

.brand-tagline {
  font-size: 13px;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  margin-top: 6px;
}

/* Compact Brand for AccountView */
.compact-brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.compact-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.compact-codex-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 21, 35, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 170, 110, 0.25);
  color: var(--color-gold);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.compact-codex-btn:hover {
  background: rgba(200, 170, 110, 0.2);
  border-color: #ffd700;
  color: #fff;
  box-shadow: 0 0 10px rgba(200, 170, 110, 0.3);
}

.mini-beacon-svg {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 0 4px #0ac8b9);
}

.compact-title-text {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(180deg, #fff7e6 0%, #c8aa6e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Region Pill Strip (No dropdowns!) */
.region-pill-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.primary-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.region-strip-btn {
  background: rgba(14, 21, 35, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 170, 110, 0.2);
  color: var(--color-text-secondary);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.region-strip-btn:hover {
  background: rgba(10, 200, 185, 0.12);
  border-color: rgba(10, 200, 185, 0.4);
  color: #fff;
  transform: translateY(-1px);
}

.region-strip-btn.active {
  background: linear-gradient(135deg, rgba(10, 200, 185, 0.25) 0%, rgba(0, 240, 255, 0.1) 100%);
  border-color: #0ac8b9;
  color: #00f0ff;
  box-shadow: 0 0 12px rgba(10, 200, 185, 0.3);
}

.reg-code {
  font-weight: 800;
}

.reg-name {
  font-size: 10px;
  opacity: 0.75;
}

.more-toggle {
  background: rgba(255, 255, 255, 0.03);
  border-style: dashed;
}

/* More Regions Drawer */
.more-regions-drawer {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(10, 16, 28, 0.85);
  backdrop-filter: blur(12px);
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(200, 170, 110, 0.15);
}

.more-reg-chip {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  gap: 4px;
  transition: all 0.15s;
}

.more-reg-chip:hover {
  background: rgba(10, 200, 185, 0.15);
  color: #fff;
}

.more-reg-chip.active {
  background: rgba(10, 200, 185, 0.25);
  border-color: #0ac8b9;
  color: #00f0ff;
}

/* Search Capsule Bar */
.search-capsule-bar {
  display: flex;
  align-items: center;
  width: 100%;
  background: rgba(10, 16, 28, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(200, 170, 110, 0.3);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.5),
    0 0 1px 1px rgba(10, 200, 185, 0.15);
  border-radius: 50px;
  padding: 6px 8px;
  transition: all 0.3s ease;
}

.search-capsule-bar:focus-within {
  border-color: #0ac8b9;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 16px rgba(10, 200, 185, 0.4);
}

.current-region-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 200, 185, 0.12);
  border: 1px solid rgba(10, 200, 185, 0.3);
  padding: 5px 12px;
  border-radius: 20px;
  margin-left: 4px;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 6px #00f0ff;
}

.indicator-text {
  font-size: 11px;
  font-weight: 800;
  color: #00f0ff;
  letter-spacing: 0.5px;
}

.capsule-input-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.search-mag-icon {
  color: #c8aa6e;
  font-size: 14px;
}

.native-search-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
}

.native-search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
}

/* Scout Trigger Button */
.search-trigger-btn {
  background: linear-gradient(135deg, #c8aa6e 0%, #9a783e 100%);
  color: #070a10;
  border: 1px solid rgba(255, 240, 200, 0.5);
  padding: 10px 22px;
  border-radius: 40px;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(200, 170, 110, 0.3);
}

.search-trigger-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0ac8b9 0%, #00a89a 100%);
  color: #fff;
  border-color: #00f0ff;
  box-shadow: 0 0 16px rgba(10, 200, 185, 0.5);
  transform: scale(1.02);
}

.search-trigger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.trigger-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spin-ring {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transition */
.expand-fade-enter-active,
.expand-fade-leave-active {
  transition: all 0.25s ease;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 768px) {
  .search-bar-root.is-compact {
    flex-direction: column;
    align-items: center;
  }
  .search-capsule-bar {
    flex-direction: column;
    border-radius: 20px;
    padding: 10px;
    gap: 10px;
  }
  .current-region-indicator {
    align-self: flex-start;
  }
  .search-trigger-btn {
    width: 100%;
  }
  .brand-title {
    font-size: 32px;
  }
}
</style>
