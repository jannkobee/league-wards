<template>
  <div class="dashboard-page">
    <!-- Atmospheric Background Rings -->
    <div class="celestial-ring ring-1"></div>
    <div class="celestial-ring ring-2"></div>

    <div class="dashboard-hero">
      <SearchBar ref="searchBarRef" />

      <!-- Quick Scout Chips -->
      <div class="quick-scout-section">
        <span class="quick-scout-label"> <i class="pi pi-compass"></i> Quick Scout: </span>
        <div class="chips-list">
          <button
            v-for="preset in presets"
            :key="preset.name"
            class="summoner-chip"
            @click="selectPreset(preset)"
          >
            <span class="chip-flag">{{ preset.regionLabel }}</span>
            <span class="chip-name">{{ preset.name }}</span>
          </button>
        </div>

        <router-link to="/codex" class="codex-chip-link">
          <i class="pi pi-book"></i>
          <span>Runeterra Codex</span>
        </router-link>
      </div>
    </div>

    <!-- Feature Pillars -->
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon-box vision-icon-glow">
          <i class="pi pi-eye"></i>
        </div>
        <h3 class="feature-title">Vision Mastery Index</h3>
        <p class="feature-desc">
          Unveil warding density, control ward investment, and map coverage with specialized vision
          analytics.
        </p>
      </div>

      <div class="feature-card">
        <div class="feature-icon-box rank-icon-glow">
          <i class="pi pi-shield"></i>
        </div>
        <h3 class="feature-title">Ranked Trajectory</h3>
        <p class="feature-desc">
          Track Solo/Duo and Flex Queue tier standings with official League tier emblems and win
          rate metrics.
        </p>
      </div>

      <div class="feature-card">
        <div class="feature-icon-box combat-icon-glow">
          <i class="pi pi-bolt"></i>
        </div>
        <h3 class="feature-title">Combat & Scoreboards</h3>
        <p class="feature-desc">
          Inspect 10-player match scoreboards, item progressions, runes, and objective captures in
          high fidelity.
        </p>
      </div>

      <router-link to="/codex" class="feature-card codex-card-link">
        <div class="feature-icon-box codex-icon-glow">
          <i class="pi pi-book"></i>
        </div>
        <h3 class="feature-title">Runeterra Codex</h3>
        <p class="feature-desc">
          Explore complete champion lore, official spell mechanics, skin galleries, and item armory
          recipes.
        </p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SearchBar from "@/components/SearchBar.vue";

const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null);

const presets = [
  { name: "kovi#2001", region: "sg2", regionLabel: "SEA" },
  { name: "Faker#KR1", region: "kr", regionLabel: "KR" },
  { name: "Caps#EUW", region: "euw1", regionLabel: "EUW" },
  { name: "Doublelift#NA1", region: "na1", regionLabel: "NA" },
];

const selectPreset = (preset: { name: string; region: string }) => {
  if (searchBarRef.value) {
    searchBarRef.value.setAccountAndRegion(preset.name, preset.region);
  }
};
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  gap: 50px;
}

/* Celestial Rings */
.celestial-ring {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.ring-1 {
  width: 700px;
  height: 700px;
  border: 1px dashed rgba(200, 170, 110, 0.08);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: rotateRing 80s linear infinite;
}

.ring-2 {
  width: 1000px;
  height: 1000px;
  border: 1px solid rgba(10, 200, 185, 0.05);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: rotateRingRev 120s linear infinite;
}

@keyframes rotateRing {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes rotateRingRev {
  from {
    transform: translate(-50%, -50%) rotate(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

.dashboard-hero {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Quick Scout Chips */
.quick-scout-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-scout-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
}

.chips-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.summoner-chip {
  background: rgba(14, 21, 35, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 170, 110, 0.25);
  color: #f0e6d2;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s ease;
}

.summoner-chip:hover {
  background: rgba(10, 200, 185, 0.15);
  border-color: #0ac8b9;
  color: #fff;
  box-shadow: 0 0 12px rgba(10, 200, 185, 0.35);
  transform: translateY(-2px);
}

.chip-flag {
  background: rgba(200, 170, 110, 0.2);
  color: #c8aa6e;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
}

.codex-chip-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(200, 170, 110, 0.12);
  border: 1px solid rgba(200, 170, 110, 0.35);
  color: var(--color-gold);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s ease;
  margin-left: 6px;
}

.codex-chip-link:hover {
  background: rgba(200, 170, 110, 0.25);
  border-color: #ffd700;
  color: #fff;
  box-shadow: 0 0 14px rgba(200, 170, 110, 0.4);
  transform: translateY(-2px);
}

/* Feature Pillars */
.features-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  max-width: 1200px;
  width: 100%;
}

@media (max-width: 1040px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}

.codex-card-link {
  text-decoration: none;
  cursor: pointer;
}

.codex-card-link:hover {
  border-color: var(--color-gold);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(200, 170, 110, 0.25);
}

.codex-icon-glow {
  background: radial-gradient(circle, rgba(200, 170, 110, 0.25) 0%, transparent 70%);
  color: var(--color-gold);
  border: 1px solid rgba(200, 170, 110, 0.3);
}

.feature-card {
  background: rgba(14, 21, 35, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(200, 170, 110, 0.15);
  border-radius: 14px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 170, 110, 0.4), transparent);
}

.feature-card:hover {
  border-color: rgba(10, 200, 185, 0.4);
  transform: translateY(-4px);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.4),
    0 0 16px rgba(10, 200, 185, 0.15);
}

.feature-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vision-icon-glow {
  background: radial-gradient(circle, rgba(10, 200, 185, 0.25) 0%, rgba(10, 200, 185, 0.05) 100%);
  color: #00f0ff;
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.2);
}

.rank-icon-glow {
  background: radial-gradient(circle, rgba(200, 170, 110, 0.25) 0%, rgba(200, 170, 110, 0.05) 100%);
  color: #ffd700;
  border-color: rgba(200, 170, 110, 0.3);
  box-shadow: 0 0 16px rgba(200, 170, 110, 0.2);
}

.combat-icon-glow {
  background: radial-gradient(circle, rgba(244, 63, 94, 0.25) 0%, rgba(244, 63, 94, 0.05) 100%);
  color: #f43f5e;
  border-color: rgba(244, 63, 94, 0.3);
  box-shadow: 0 0 16px rgba(244, 63, 94, 0.2);
}

.feature-title {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
</style>
