<template>
  <div class="codex-page">
    <!-- Atmospheric Celestial Rings Backdrop -->
    <div class="celestial-ring ring-1"></div>
    <div class="celestial-ring ring-2"></div>

    <div class="codex-container">
      <!-- Top Navigation Header -->
      <header class="codex-header">
        <div class="header-left">
          <router-link to="/" class="back-link-btn">
            <i class="pi pi-arrow-left"></i>
            <span>Observatory</span>
          </router-link>
        </div>

        <div class="header-center">
          <div class="codex-emblem-beacon">
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
          <h1 class="codex-title">RUNETERRA CODEX</h1>
          <p class="codex-subtitle">Ancient Lore, Combat Abilities & Grand Item Armory</p>
        </div>

        <div class="header-right">
          <!-- Main Tab Switcher: Champions vs Items -->
          <div class="tab-switcher">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'champions' }"
              @click="activeTab = 'champions'"
            >
              <i class="pi pi-users"></i>
              <span>Champions ({{ championsList.length }})</span>
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'items' }"
              @click="activeTab = 'items'"
            >
              <i class="pi pi-shield"></i>
              <span>Items ({{ itemsList.length }})</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Filter Controls Strip -->
      <div class="controls-capsule glass-card">
        <!-- Search Input -->
        <div class="search-field">
          <i class="pi pi-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="codex-search-input"
            :placeholder="
              activeTab === 'champions'
                ? 'Search champion by name or title (e.g. Ahri, Darkin)...'
                : 'Search item by name or stat (e.g. Infinity Edge, Ward)...'
            "
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Role Filter Chips for Champions -->
        <div v-if="activeTab === 'champions'" class="filter-chips-row">
          <button
            v-for="role in championRoles"
            :key="role.id"
            class="filter-chip"
            :class="{ active: selectedChampionRole === role.id }"
            @click="selectedChampionRole = role.id"
          >
            {{ role.label }}
          </button>
        </div>

        <!-- Category Filter Chips for Items -->
        <div v-else class="filter-chips-row">
          <button
            v-for="cat in itemCategories"
            :key="cat.id"
            class="filter-chip"
            :class="{ active: selectedItemCategory === cat.id }"
            @click="selectedItemCategory = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="codex-loading-state">
        <div class="loader-beacon"></div>
        <p class="loading-text">Deciphering celestial scrolls...</p>
      </div>

      <!-- Grid Content -->
      <div v-else class="codex-content-area">
        <!-- CHAMPIONS GRID -->
        <div v-if="activeTab === 'champions'" class="champions-grid">
          <div
            v-for="champ in filteredChampions"
            :key="champ.id"
            class="champion-card glass-card"
            @click="openChampion(champ.id)"
          >
            <!-- Card Background Splash Preview -->
            <div
              class="card-splash-art"
              :style="{ backgroundImage: `url(${getChampionSplash(champ.id)})` }"
            ></div>
            <div class="card-ambient-tint"></div>

            <div class="card-foreground">
              <!-- Roles Row -->
              <div class="champ-badges-row">
                <span v-for="tag in champ.tags" :key="tag" class="role-tag">
                  {{ tag }}
                </span>
              </div>

              <!-- Champion Portrait & Title -->
              <div class="champ-info-block">
                <h3 class="champ-name">{{ champ.name }}</h3>
                <span class="champ-title">{{ champ.title }}</span>
              </div>

              <div class="card-cta-hint">
                <span>Inspect Lore</span>
                <i class="pi pi-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- ITEMS GRID -->
        <div v-else class="items-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="item-card glass-card"
            @click="openItem(item)"
          >
            <div class="item-card-inner">
              <div class="item-avatar-box">
                <img :src="getItemIcon(Number(item.id))" :alt="item.name" class="item-thumb" />
                <span v-if="item.gold?.total" class="item-gold-pill">
                  {{ item.gold.total }} G
                </span>
              </div>

              <div class="item-text-info">
                <h4 class="item-grid-name">{{ item.name }}</h4>
                <p class="item-grid-plain">{{ item.plaintext || "Equipment and mechanics" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="
            (activeTab === 'champions' && filteredChampions.length === 0) ||
            (activeTab === 'items' && filteredItems.length === 0)
          "
          class="empty-results-box glass-card"
        >
          <i class="pi pi-search empty-icon"></i>
          <h3>No records found</h3>
          <p>Try adjusting your search keywords or filter options.</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChampionModal
      :champion-id="selectedChampionId"
      :visible="championModalVisible"
      @update:visible="championModalVisible = $event"
      @close="selectedChampionId = null"
    />

    <ItemModal
      :item="selectedItem"
      :all-items="itemsList"
      :visible="itemModalVisible"
      @update:visible="itemModalVisible = $event"
      @select-item="handleSubItemSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import type { ChampionOverviewDto, ItemDto } from "@/types/league";
import { useDataDragon } from "@/composables/useDataDragon";
import ChampionModal from "@/components/Codex/ChampionModal.vue";
import ItemModal from "@/components/Codex/ItemModal.vue";

const route = useRoute();

const { fetchAllChampions, fetchAllItems, getChampionSplash, getItemIcon } = useDataDragon();

const activeTab = ref<"champions" | "items">("champions");
const loading = ref(false);
const searchQuery = ref("");

// Data Lists
const championsList = ref<ChampionOverviewDto[]>([]);
const itemsList = ref<ItemDto[]>([]);

// Modals State
const selectedChampionId = ref<string | null>(null);
const championModalVisible = ref(false);

const selectedItem = ref<ItemDto | null>(null);
const itemModalVisible = ref(false);

// Filter Categories
const selectedChampionRole = ref("all");
const championRoles = [
  { id: "all", label: "All Roles" },
  { id: "Assassin", label: "Assassin" },
  { id: "Fighter", label: "Fighter" },
  { id: "Mage", label: "Mage" },
  { id: "Marksman", label: "Marksman" },
  { id: "Support", label: "Support" },
  { id: "Tank", label: "Tank" },
];

const selectedItemCategory = ref("all");
const itemCategories = [
  { id: "all", label: "All Items" },
  { id: "Damage", label: "Attack Damage" },
  { id: "SpellDamage", label: "Ability Power" },
  { id: "Armor", label: "Armor" },
  { id: "SpellBlock", label: "Magic Resist" },
  { id: "Health", label: "Health" },
  { id: "AttackSpeed", label: "Attack Speed" },
  { id: "Boots", label: "Boots" },
];

// Computed Filtered Champions
const filteredChampions = computed(() => {
  return championsList.value.filter((champ) => {
    const matchesSearch =
      !searchQuery.value ||
      champ.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      champ.title.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesRole =
      selectedChampionRole.value === "all" || champ.tags.includes(selectedChampionRole.value);

    return matchesSearch && matchesRole;
  });
});

// Computed Filtered Items
const filteredItems = computed(() => {
  return itemsList.value.filter((item) => {
    const matchesSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.plaintext.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory =
      selectedItemCategory.value === "all" || item.tags.includes(selectedItemCategory.value);

    return matchesSearch && matchesCategory;
  });
});

// Modal Handlers
const openChampion = (id: string) => {
  selectedChampionId.value = id;
  championModalVisible.value = true;
};

const openItem = (item: ItemDto) => {
  selectedItem.value = item;
  itemModalVisible.value = true;
};

const handleSubItemSelect = (sub: ItemDto) => {
  selectedItem.value = sub;
};

const checkRouteQuery = () => {
  if (route.query.tab === "items") activeTab.value = "items";
  if (route.query.tab === "champions") activeTab.value = "champions";
  if (route.query.champion) {
    openChampion(route.query.champion as string);
  }
  if (route.query.item) {
    const it = itemsList.value.find((i) => i.id === route.query.item);
    if (it) openItem(it);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    const [champs, items] = await Promise.all([fetchAllChampions(), fetchAllItems()]);
    championsList.value = champs;
    itemsList.value = items;
    checkRouteQuery();
  } catch (err) {
    console.error("Failed to load codex data:", err);
  } finally {
    loading.value = false;
  }
});

watch(
  () => [route.query.tab, route.query.champion, route.query.item],
  () => {
    checkRouteQuery();
  },
);
</script>

<style scoped>
.codex-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  padding: 24px 20px 80px 20px;
}

/* Celestial background rings */
.celestial-ring {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  border: 1px solid rgba(10, 200, 185, 0.08);
}

.ring-1 {
  width: 900px;
  height: 900px;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
}

.ring-2 {
  width: 1400px;
  height: 1400px;
  top: -400px;
  left: 50%;
  transform: translateX(-50%);
  border-color: rgba(200, 170, 110, 0.06);
}

.codex-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 2;
}

/* Header */
.codex-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  padding: 12px 0 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
}

.back-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.back-link-btn:hover {
  background: rgba(10, 200, 185, 0.15);
  border-color: #0ac8b9;
  color: #00f0ff;
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.codex-emblem-beacon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(10, 200, 185, 0.25) 0%, transparent 70%);
  border: 1px solid rgba(10, 200, 185, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.beacon-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 6px #00f0ff);
}

.codex-title {
  font-family: var(--font-heading);
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 3px;
  background: linear-gradient(180deg, #fff9e6 0%, #c8aa6e 65%, #8c6a28 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
  margin: 0;
}

.codex-subtitle {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.tab-switcher {
  display: flex;
  background: rgba(8, 12, 22, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px;
  border-radius: 30px;
  gap: 4px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  padding: 7px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #fff;
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(10, 200, 185, 0.25) 0%, rgba(0, 240, 255, 0.1) 100%);
  border: 1px solid #0ac8b9;
  color: #00f0ff;
  box-shadow: 0 0 12px rgba(10, 200, 185, 0.3);
}

/* Controls Capsule */
.controls-capsule {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(8, 12, 22, 0.28);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
}

.search-field {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0 14px;
  transition: all 0.2s;
}

.search-field:focus-within {
  border-color: #0ac8b9;
  box-shadow: 0 0 14px rgba(10, 200, 185, 0.25);
}

.search-icon {
  color: #c8aa6e;
  font-size: 14px;
}

.codex-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 12px 10px;
  color: #fff;
  font-size: 14px;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.filter-chips-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--color-text-secondary);
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: rgba(10, 200, 185, 0.1);
  color: #fff;
}

.filter-chip.active {
  background: rgba(200, 170, 110, 0.15);
  border-color: var(--color-gold);
  color: var(--color-gold);
  box-shadow: 0 0 10px rgba(200, 170, 110, 0.25);
}

/* Loading */
.codex-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  gap: 16px;
}

.loader-beacon {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(200, 170, 110, 0.2);
  border-top-color: #00f0ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-family: var(--font-heading);
  color: var(--color-gold);
  font-size: 14px;
}

/* Grid Layouts */
.champions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.champion-card {
  position: relative;
  height: 240px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(8, 12, 22, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.champion-card:hover {
  transform: translateY(-4px);
  border-color: #0ac8b9;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 16px rgba(10, 200, 185, 0.3);
}

.card-splash-art {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 20%;
  transition: transform 0.4s ease;
}

.champion-card:hover .card-splash-art {
  transform: scale(1.05);
}

.card-ambient-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(6, 9, 16, 0.2) 0%,
    rgba(6, 9, 16, 0.85) 75%,
    rgba(6, 9, 16, 0.95) 100%
  );
}

.card-foreground {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
}

.champ-badges-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.role-tag {
  background: rgba(10, 200, 185, 0.2);
  border: 1px solid rgba(10, 200, 185, 0.4);
  color: #00f0ff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.champ-info-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.champ-name {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
  margin: 0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
}

.champ-title {
  font-size: 11px;
  color: var(--color-gold);
  text-transform: capitalize;
  font-weight: 600;
}

.card-cta-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #00f0ff;
  font-weight: 700;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.2s ease;
}

.champion-card:hover .card-cta-hint {
  opacity: 1;
  transform: translateY(0);
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.item-card {
  border-radius: 12px;
  padding: 12px;
  background: rgba(8, 12, 22, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.07);
  cursor: pointer;
  transition: all 0.25s;
}

.item-card:hover {
  transform: translateY(-3px);
  border-color: var(--color-gold);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 14px rgba(200, 170, 110, 0.25);
}

.item-card-inner {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-avatar-box {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}

.item-thumb {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 1px solid rgba(200, 170, 110, 0.3);
}

.item-gold-pill {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #090e18;
  color: #ffd700;
  font-size: 8.5px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.item-text-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.item-grid-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-grid-plain {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Empty Box */
.empty-results-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 10px;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 32px;
  color: var(--color-gold);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .codex-header {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 16px;
  }
  .header-left,
  .header-right {
    justify-content: center;
  }
}
</style>
