<template>
  <teleport to="body">
    <transition name="codex-modal-fade">
      <div v-if="visible" class="codex-modal-backdrop" @click.self="handleClose">
        <div class="codex-glass-modal champion-modal-container">
          <!-- Loading State -->
          <div v-if="loading" class="modal-loading-state">
            <div class="celestial-spinner"></div>
            <p>Consulting the celestial archives...</p>
          </div>

          <!-- Loaded Champion Details -->
          <div v-else-if="champion" class="champion-detail-layout">
            <!-- Full Hero Banner with Active Skin Splash Art -->
            <div class="hero-splash-banner" :style="{ backgroundImage: `url(${activeSplashUrl})` }">
              <div class="banner-glass-vignette"></div>

              <!-- Top Action Buttons -->
              <div class="modal-top-actions" @click.stop>
                <button
                  class="modal-download-btn"
                  :disabled="downloading"
                  :title="`Download ${currentSkinName} Wallpaper (1920x1080)`"
                  @click="downloadWallpaper"
                >
                  <i :class="downloading ? 'pi pi-spin pi-spinner' : 'pi pi-download'"></i>
                  <span>{{ downloading ? "Saving..." : "Download Wallpaper" }}</span>
                </button>

                <router-link
                  :to="{ name: 'codex-view', query: { tab: 'champions', champion: champion.id } }"
                  class="modal-codex-link-btn"
                  title="Explore full champion page in Codex"
                  @click="handleClose"
                >
                  <i class="pi pi-book"></i>
                  <span>Codex</span>
                </router-link>
                <button class="modal-close-btn" @click="handleClose" title="Close Dossier">
                  <i class="pi pi-times"></i>
                </button>
              </div>

              <!-- Header Info Overlay -->
              <div class="banner-header-content">
                <div class="tags-row">
                  <span v-for="tag in champion.tags" :key="tag" class="role-badge">
                    {{ tag }}
                  </span>
                  <span v-if="champion.partype" class="resource-badge">
                    <i class="pi pi-bolt"></i> {{ champion.partype }}
                  </span>
                </div>
                <h1 class="champion-name">{{ champion.name }}</h1>
                <p class="champion-title">{{ champion.title }}</p>
              </div>
            </div>

            <!-- Content Body: Tabs / Sections -->
            <div class="modal-scroll-body">
              <!-- Navigation Subtabs: Lore | Abilities | Skins -->
              <div class="subnav-pills">
                <button
                  class="subnav-btn"
                  :class="{ active: activeSection === 'lore' }"
                  @click="activeSection = 'lore'"
                >
                  <i class="pi pi-book"></i>
                  <span>Lore & Story</span>
                </button>
                <button
                  class="subnav-btn"
                  :class="{ active: activeSection === 'abilities' }"
                  @click="activeSection = 'abilities'"
                >
                  <i class="pi pi-sparkles"></i>
                  <span>Abilities & Spells</span>
                </button>
                <button
                  class="subnav-btn"
                  :class="{ active: activeSection === 'skins' }"
                  @click="activeSection = 'skins'"
                >
                  <i class="pi pi-images"></i>
                  <span>Skins Gallery ({{ displaySkins.length }})</span>
                </button>
              </div>

              <!-- Section 1: Lore & Backstory -->
              <div v-if="activeSection === 'lore'" class="section-pane lore-pane">
                <div class="lore-card glass-panel">
                  <div class="panel-eyebrow"><i class="pi pi-compass"></i> RUNETERRA BIOGRAPHY</div>
                  <div class="lore-text">
                    {{ champion.lore || champion.blurb }}
                  </div>
                </div>

                <!-- Combat Attributes Overview -->
                <div class="attributes-grid">
                  <div class="glass-panel attr-panel">
                    <div class="attr-label"><i class="pi pi-sword"></i> Attack</div>
                    <div class="attr-meter">
                      <div
                        class="attr-fill fill-attack"
                        :style="{ width: `${(champion.info?.attack || 1) * 10}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="glass-panel attr-panel">
                    <div class="attr-label"><i class="pi pi-shield"></i> Defense</div>
                    <div class="attr-meter">
                      <div
                        class="attr-fill fill-defense"
                        :style="{ width: `${(champion.info?.defense || 1) * 10}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="glass-panel attr-panel">
                    <div class="attr-label"><i class="pi pi-star"></i> Magic</div>
                    <div class="attr-meter">
                      <div
                        class="attr-fill fill-magic"
                        :style="{ width: `${(champion.info?.magic || 1) * 10}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="glass-panel attr-panel">
                    <div class="attr-label"><i class="pi pi-sliders-h"></i> Difficulty</div>
                    <div class="attr-meter">
                      <div
                        class="attr-fill fill-diff"
                        :style="{ width: `${(champion.info?.difficulty || 1) * 10}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section 2: Abilities & Mechanics -->
              <div v-if="activeSection === 'abilities'" class="section-pane abilities-pane">
                <!-- Ability Selector Buttons (Passive, Q, W, E, R) -->
                <div class="ability-buttons-strip">
                  <!-- Passive -->
                  <button
                    v-if="champion.passive"
                    class="spell-selector-btn"
                    :class="{ active: selectedSpellIndex === 'passive' }"
                    @click="selectedSpellIndex = 'passive'"
                  >
                    <div class="spell-thumb-wrap">
                      <img
                        :src="getPassiveIcon(champion.passive.image?.full)"
                        :alt="champion.passive.name"
                        class="spell-thumb"
                      />
                      <span class="key-badge">P</span>
                    </div>
                    <span class="btn-name">Passive</span>
                  </button>

                  <!-- Spells Q, W, E, R -->
                  <button
                    v-for="(spell, idx) in champion.spells"
                    :key="spell.id"
                    class="spell-selector-btn"
                    :class="{ active: selectedSpellIndex === idx }"
                    @click="selectedSpellIndex = idx"
                  >
                    <div class="spell-thumb-wrap">
                      <img
                        :src="getSpellIcon(spell.image?.full)"
                        :alt="spell.name"
                        class="spell-thumb"
                      />
                      <span class="key-badge">{{ ["Q", "W", "E", "R"][idx] }}</span>
                    </div>
                    <span class="btn-name">{{ ["Q", "W", "E", "R"][idx] }}</span>
                  </button>
                </div>

                <!-- Active Ability Details Card -->
                <div class="glass-panel ability-spotlight-card">
                  <template v-if="selectedSpellIndex === 'passive' && champion.passive">
                    <div class="ability-header">
                      <div class="ability-title-row">
                        <span class="hotkey-pill">PASSIVE</span>
                        <h3 class="ability-title">{{ champion.passive.name }}</h3>
                      </div>
                    </div>
                    <div
                      class="ability-description"
                      v-html="cleanHtml(champion.passive.description)"
                    ></div>
                  </template>

                  <template v-else-if="currentSelectedSpell">
                    <div class="ability-header">
                      <div class="ability-title-row">
                        <span class="hotkey-pill">{{
                          ["Q", "W", "E", "R"][selectedSpellIndex as number]
                        }}</span>
                        <h3 class="ability-title">{{ currentSelectedSpell.name }}</h3>
                      </div>
                      <div class="ability-costs-row">
                        <span v-if="currentSelectedSpell.cooldownBurn" class="cost-stat">
                          <i class="pi pi-clock"></i> Cooldown:
                          {{ currentSelectedSpell.cooldownBurn }}s
                        </span>
                        <span
                          v-if="
                            currentSelectedSpell.costBurn && currentSelectedSpell.costBurn !== '0'
                          "
                          class="cost-stat"
                        >
                          <i class="pi pi-bolt"></i> Cost: {{ currentSelectedSpell.costBurn }}
                          {{ champion.partype || "Mana" }}
                        </span>
                      </div>
                    </div>
                    <div
                      class="ability-description"
                      v-html="cleanHtml(currentSelectedSpell.description)"
                    ></div>
                  </template>
                </div>
              </div>

              <!-- Section 3: Skins Gallery -->
              <div v-if="activeSection === 'skins'" class="section-pane skins-pane">
                <p class="skins-hint">Click any skin to preview high-resolution artwork</p>

                <div class="skins-grid">
                  <div
                    v-for="skin in displaySkins"
                    :key="skin.id"
                    class="skin-card glass-panel"
                    :class="{ active: currentSkinNum === skin.num }"
                    title="Click to preview artwork"
                    @click="openPreview(skin.num)"
                  >
                    <div class="skin-splash-preview">
                      <img
                        :src="getChampionSkinSplash(champion.id, skin.num)"
                        :alt="skin.name"
                        class="skin-card-thumb-img"
                        loading="lazy"
                      />
                    </div>
                    <div class="skin-name">
                      {{ skin.name === "default" ? champion.name : skin.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Fullscreen High-Definition Lightbox Image Previewer -->
    <transition name="codex-lightbox-fade">
      <div
        v-if="previewModalOpen && previewSkin"
        class="codex-lightbox-backdrop"
        @click.self="closePreview"
      >
        <div class="lightbox-container">
          <!-- Lightbox Top Navigation Bar -->
          <div class="lightbox-header-bar">
            <div class="lightbox-title-wrap">
              <span class="lightbox-champ-name">{{ champion?.name }}</span>
              <span class="lightbox-separator">/</span>
              <span class="lightbox-skin-name">{{ previewSkinName }}</span>
              <span class="lightbox-counter-badge">
                {{ previewSkinIndex + 1 }} of {{ displaySkins.length }}
              </span>
            </div>

            <div class="lightbox-actions">
              <button
                class="lightbox-btn download-btn"
                :disabled="downloading"
                :title="`Download ${previewSkinName} Wallpaper (1920x1080)`"
                @click="downloadSkinWallpaper(previewSkin.num, previewSkin.name)"
              >
                <i :class="downloading ? 'pi pi-spin pi-spinner' : 'pi pi-download'"></i>
                <span>Download (1920x1080)</span>
              </button>
              <button
                class="lightbox-btn close-btn"
                title="Close Preview (Esc)"
                @click="closePreview"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Lightbox Main Stage (Prev, Viewport, Next) -->
          <div class="lightbox-stage">
            <button
              v-if="displaySkins.length > 1"
              class="lightbox-nav-btn prev-btn"
              title="Previous Skin (Left Arrow)"
              @click="prevSkin"
            >
              <i class="pi pi-chevron-left"></i>
            </button>

            <div class="lightbox-viewport">
              <div v-if="previewLoading" class="lightbox-image-spinner">
                <div class="celestial-spinner"></div>
              </div>
              <img
                :src="previewSkinUrl"
                :alt="previewSkinName"
                class="lightbox-full-img"
                :class="{ loaded: !previewLoading }"
                @load="previewLoading = false"
              />
            </div>

            <button
              v-if="displaySkins.length > 1"
              class="lightbox-nav-btn next-btn"
              title="Next Skin (Right Arrow)"
              @click="nextSkin"
            >
              <i class="pi pi-chevron-right"></i>
            </button>
          </div>

          <!-- Bottom Thumbnail Navigation Strip -->
          <div v-if="displaySkins.length > 1" class="lightbox-thumbnails-strip">
            <div
              v-for="s in displaySkins"
              :key="s.id"
              class="lightbox-thumb-item"
              :class="{ active: previewSkinNum === s.num }"
              @click="selectPreviewSkin(s.num)"
            >
              <img
                :src="getChampionSkinSplash(champion?.id || '', s.num)"
                :alt="s.name"
                class="thumb-img"
              />
              <span class="thumb-label">{{ s.name === "default" ? champion?.name : s.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { ChampionDetailDto, ChampionSpellDto, ChampionSkinDto } from "@/types/league";
import { useDataDragon } from "@/composables/useDataDragon";

const props = defineProps<{
  championId: string | null;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "close"): void;
}>();

const { fetchChampionDetail, getChampionSkinSplash, getSpellIcon, getPassiveIcon } =
  useDataDragon();

const loading = ref(false);
const downloading = ref(false);
const champion = ref<ChampionDetailDto | null>(null);
const currentSkinNum = ref(0);
const activeSection = ref<"lore" | "abilities" | "skins">("lore");
const selectedSpellIndex = ref<"passive" | number>(0);

// Filter out chromas, 2022 mythic chromas, and any chroma colorways
const isChroma = (skin: ChampionSkinDto): boolean => {
  if (
    (skin as unknown as { parentSkin?: number }).parentSkin !== undefined &&
    (skin as unknown as { parentSkin?: number }).parentSkin !== null
  )
    return true;
  if (skin.name.includes("(2022)")) return true;
  if (skin.name.toLowerCase().includes("chroma")) return true;
  if (/\(.*\)/.test(skin.name)) return true;
  return false;
};

const displaySkins = computed(() => {
  if (!champion.value?.skins) return [];
  return champion.value.skins.filter((skin) => !isChroma(skin));
});

const currentSkinName = computed(() => {
  if (!champion.value) return "";
  const current = displaySkins.value.find((s) => s.num === currentSkinNum.value);
  return current && current.name !== "default" ? current.name : champion.value.name;
});

const activeSplashUrl = computed(() => {
  if (!champion.value) return "";
  return getChampionSkinSplash(champion.value.id, currentSkinNum.value);
});

// Fullscreen Lightbox Image Preview State
const previewModalOpen = ref(false);
const previewSkinNum = ref(0);
const previewLoading = ref(false);

const previewSkinIndex = computed(() => {
  return displaySkins.value.findIndex((s) => s.num === previewSkinNum.value);
});

const previewSkin = computed(() => {
  if (displaySkins.value.length === 0) return null;
  return displaySkins.value.find((s) => s.num === previewSkinNum.value) || displaySkins.value[0];
});

const previewSkinName = computed(() => {
  if (!previewSkin.value || !champion.value) return "";
  return previewSkin.value.name === "default" ? champion.value.name : previewSkin.value.name;
});

const previewSkinUrl = computed(() => {
  if (!champion.value || previewSkinNum.value === undefined) return "";
  return getChampionSkinSplash(champion.value.id, previewSkinNum.value);
});

const openPreview = (skinNum?: number) => {
  previewSkinNum.value = skinNum !== undefined ? skinNum : currentSkinNum.value;
  previewLoading.value = true;
  previewModalOpen.value = true;
};

const closePreview = () => {
  previewModalOpen.value = false;
};

const selectPreviewSkin = (num: number) => {
  if (previewSkinNum.value === num) return;
  previewLoading.value = true;
  previewSkinNum.value = num;
  currentSkinNum.value = num;
};

const prevSkin = () => {
  if (displaySkins.value.length <= 1) return;
  const currIdx = previewSkinIndex.value;
  const newIdx = currIdx <= 0 ? displaySkins.value.length - 1 : currIdx - 1;
  selectPreviewSkin(displaySkins.value[newIdx].num);
};

const nextSkin = () => {
  if (displaySkins.value.length <= 1) return;
  const currIdx = previewSkinIndex.value;
  const newIdx = currIdx >= displaySkins.value.length - 1 ? 0 : currIdx + 1;
  selectPreviewSkin(displaySkins.value[newIdx].num);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!previewModalOpen.value) return;
  if (e.key === "ArrowLeft") {
    prevSkin();
  } else if (e.key === "ArrowRight") {
    nextSkin();
  } else if (e.key === "Escape") {
    closePreview();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Failed to download wallpaper:", err);
    window.open(url, "_blank");
  }
};

const downloadWallpaper = async () => {
  if (!activeSplashUrl.value || !champion.value) return;
  downloading.value = true;
  const skinNameClean = (currentSkinName.value || champion.value.name).replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  await downloadFile(activeSplashUrl.value, `${skinNameClean}_Wallpaper.jpg`);
  downloading.value = false;
};

const downloadSkinWallpaper = async (skinNum: number, skinName: string) => {
  if (!champion.value) return;
  const url = getChampionSkinSplash(champion.value.id, skinNum);
  const cleanName = (skinName === "default" ? champion.value.name : skinName).replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
  await downloadFile(url, `${cleanName}_Wallpaper.jpg`);
};

const currentSelectedSpell = computed<ChampionSpellDto | null>(() => {
  if (!champion.value || selectedSpellIndex.value === "passive") return null;
  return champion.value.spells?.[selectedSpellIndex.value] || null;
});

const cleanHtml = (text?: string): string => {
  if (!text) return "";
  return text
    .replace(/<font color=['"]([^'"]+)['"]>(.*?)<\/font>/gi, '<span style="color: $1">$2</span>')
    .replace(/<attention>(.*?)<\/attention>/gi, '<span class="txt-gold">$1</span>')
    .replace(/<magicDamage>(.*?)<\/magicDamage>/gi, '<span class="txt-magic">$1</span>')
    .replace(/<physicalDamage>(.*?)<\/physicalDamage>/gi, '<span class="txt-phys">$1</span>')
    .replace(/<trueDamage>(.*?)<\/trueDamage>/gi, '<span class="txt-true">$1</span>')
    .replace(/<rules>(.*?)<\/rules>/gi, '<span class="txt-rules">$1</span>')
    .replace(/<status>(.*?)<\/status>/gi, '<span class="txt-status">$1</span>');
};

const handleClose = () => {
  closePreview();
  emit("update:visible", false);
  emit("close");
};

watch(
  [() => props.championId, () => props.visible],
  async ([newId, isVisible]) => {
    if (!newId || !isVisible) return;
    loading.value = true;
    currentSkinNum.value = 0;
    activeSection.value = "lore";
    selectedSpellIndex.value = 0;
    try {
      const data = await fetchChampionDetail(newId);
      champion.value = data;
      if (data?.skins && data.skins.length > 0) {
        const validSkins = data.skins.filter((s) => !isChroma(s));
        if (validSkins.length > 0) {
          currentSkinNum.value = validSkins[0].num;
        }
      }
    } catch (err) {
      console.error("Failed to fetch champion detail", err);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.codex-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 14, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.champion-modal-container {
  width: 94vw;
  max-width: 1180px;
  max-height: 92vh;
  background: rgba(10, 15, 26, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(200, 170, 110, 0.25);
  border-radius: 20px;
  box-shadow:
    0 16px 50px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 240, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.champion-detail-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.modal-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: var(--color-gold);
  font-family: var(--font-heading);
}

.celestial-spinner {
  width: 44px;
  height: 44px;
  border: 2px solid rgba(200, 170, 110, 0.2);
  border-top-color: #00f0ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Banner Splash */
.hero-splash-banner {
  position: relative;
  width: 100%;
  height: 250px;
  flex-shrink: 0;
  background-size: cover;
  background-position: center 20%;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  padding: 24px;
  transition: background-image 0.4s ease;
}

.banner-glass-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(6, 9, 16, 0.3) 0%, rgba(10, 15, 26, 0.95) 100%),
    linear-gradient(90deg, rgba(6, 9, 16, 0.6) 0%, transparent 60%);
  transition: background 0.3s ease;
}

.modal-top-actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
}

.modal-preview-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 21, 35, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.45);
  color: #00f0ff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-preview-btn:hover {
  background: rgba(0, 240, 255, 0.2);
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
  transform: translateY(-1px);
}

.modal-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 200, 185, 0.18);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(10, 200, 185, 0.45);
  color: #00f0ff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-download-btn:hover:not(:disabled) {
  background: rgba(10, 200, 185, 0.35);
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(10, 200, 185, 0.5);
  transform: translateY(-1px);
}

.modal-download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-codex-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 15, 26, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 170, 110, 0.35);
  color: var(--color-gold);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.modal-codex-link-btn:hover {
  background: rgba(200, 170, 110, 0.25);
  border-color: #ffd700;
  color: #fff;
  box-shadow: 0 0 12px rgba(200, 170, 110, 0.4);
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(10, 15, 26, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(244, 63, 94, 0.3);
  border-color: #f43f5e;
  transform: scale(1.05);
}

.banner-header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tags-row {
  display: flex;
  gap: 8px;
  margin-bottom: 2px;
}

.role-badge {
  background: rgba(10, 200, 185, 0.15);
  border: 1px solid rgba(10, 200, 185, 0.4);
  color: #00f0ff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.resource-badge {
  background: rgba(200, 170, 110, 0.15);
  border: 1px solid rgba(200, 170, 110, 0.4);
  color: var(--color-gold);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.champion-name {
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1.5px;
  line-height: 1.1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
}

.champion-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gold);
  letter-spacing: 0.5px;
  text-transform: capitalize;
}

/* Scroll Body */
.modal-scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 24px 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 240, 255, 0.35) transparent;
}

.modal-scroll-body::-webkit-scrollbar {
  width: 6px;
}

.modal-scroll-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-scroll-body::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 4px;
}

.modal-scroll-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.6);
}

/* Subnav Pills */
.subnav-pills {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(10, 15, 26, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 6px 0 12px 0;
  margin-top: -6px;
}

.subnav-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.subnav-btn:hover {
  background: rgba(10, 200, 185, 0.1);
  color: #fff;
}

.subnav-btn.active {
  background: rgba(10, 200, 185, 0.2);
  border-color: #0ac8b9;
  color: #00f0ff;
  box-shadow: 0 0 12px rgba(10, 200, 185, 0.3);
}

/* Glass Panel helper */
.glass-panel {
  background: rgba(12, 18, 30, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 18px;
}

/* Lore Section */
.lore-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-eyebrow {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--color-gold);
  display: flex;
  align-items: center;
  gap: 6px;
}

.lore-text {
  font-size: 14px;
  line-height: 1.7;
  color: #e2e8f0;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.attr-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
}

.attr-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.attr-meter {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.attr-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.fill-attack {
  background: linear-gradient(90deg, #f59e0b, #ef4444);
}
.fill-defense {
  background: linear-gradient(90deg, #10b981, #059669);
}
.fill-magic {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}
.fill-diff {
  background: linear-gradient(90deg, #6366f1, #a855f7);
}

/* Abilities Section */
.abilities-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ability-buttons-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.spell-selector-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.spell-selector-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.spell-selector-btn.active {
  background: rgba(10, 200, 185, 0.15);
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.25);
}

.spell-thumb-wrap {
  position: relative;
  width: 36px;
  height: 36px;
}

.spell-thumb {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.key-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: #000;
  color: #ffd700;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.btn-name {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.ability-spotlight-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ability-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 10px;
}

.ability-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hotkey-pill {
  background: rgba(200, 170, 110, 0.2);
  color: var(--color-gold);
  font-weight: 800;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.ability-title {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.ability-costs-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.cost-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ability-description {
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.75;
  color: #cbd5e1;
  letter-spacing: 0.2px;
}

:deep(.txt-magic) {
  color: #38bdf8;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.35);
}

:deep(.txt-phys) {
  color: #f87171;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(248, 113, 113, 0.3);
}

:deep(.txt-true) {
  color: #ffffff;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

:deep(.txt-gold) {
  color: #facc15;
  font-weight: 700;
}

:deep(.txt-rules) {
  display: block;
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
  font-style: italic;
  margin-top: 8px;
}

:deep(.txt-status) {
  color: #c084fc;
  font-weight: 700;
}

/* Skins Section */
.skins-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.skins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}

.skin-card {
  padding: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skin-card:hover {
  border-color: #00f0ff;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 240, 255, 0.2);
}

.skin-card.active {
  border-color: #00f0ff;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.35);
}

.skin-splash-preview {
  position: relative;
  width: 100%;
  height: 110px;
  border-radius: 8px;
  overflow: hidden;
  background: #050811;
}

.skin-card-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transition: transform 0.35s ease;
}

.skin-card:hover .skin-card-thumb-img {
  transform: scale(1.06);
}

.skin-name {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.skin-card:hover .skin-name {
  color: #00f0ff;
}

/* Fullscreen Lightbox */
.codex-lightbox-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(3, 6, 12, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.lightbox-container {
  width: 100%;
  max-width: 1320px;
  max-height: 96vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lightbox-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: rgba(10, 16, 28, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(200, 170, 110, 0.3);
  border-radius: 12px;
}

.lightbox-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-heading);
}

.lightbox-champ-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-gold);
}

.lightbox-separator {
  color: rgba(255, 255, 255, 0.3);
}

.lightbox-skin-name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.lightbox-counter-badge {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 240, 255, 0.15);
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: #00f0ff;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
}

.lightbox-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lightbox-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lightbox-btn.download-btn {
  background: rgba(10, 200, 185, 0.2);
  border: 1px solid rgba(10, 200, 185, 0.5);
  color: #00f0ff;
}

.lightbox-btn.download-btn:hover:not(:disabled) {
  background: rgba(10, 200, 185, 0.35);
  box-shadow: 0 0 12px rgba(10, 200, 185, 0.5);
}

.lightbox-btn.close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.lightbox-btn.close-btn:hover {
  background: rgba(255, 75, 75, 0.25);
  border-color: #ff4b4b;
  color: #ff4b4b;
}

.lightbox-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.lightbox-viewport {
  position: relative;
  max-width: 100%;
  max-height: 68vh;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(200, 170, 110, 0.35);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.85),
    0 0 25px rgba(0, 240, 255, 0.2);
  background: #040711;
}

.lightbox-image-spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 7, 17, 0.6);
  z-index: 5;
}

.lightbox-full-img {
  max-width: 100%;
  max-height: 68vh;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lightbox-full-img.loaded {
  opacity: 1;
}

.lightbox-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(10, 16, 28, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 170, 110, 0.4);
  color: #00f0ff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
}

.lightbox-nav-btn.prev-btn {
  left: 12px;
}

.lightbox-nav-btn.next-btn {
  right: 12px;
}

.lightbox-nav-btn:hover {
  background: rgba(10, 200, 185, 0.3);
  border-color: #00f0ff;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.5);
  transform: translateY(-50%) scale(1.08);
}

.lightbox-thumbnails-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 6px 4px;
  scrollbar-width: thin;
  justify-content: center;
}

.lightbox-thumb-item {
  flex-shrink: 0;
  width: 68px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  opacity: 0.55;
  background: #060a14;
}

.lightbox-thumb-item:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.lightbox-thumb-item.active {
  opacity: 1;
  border-color: #00f0ff;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  transform: scale(1.05);
}

.lightbox-thumb-item .thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lightbox-thumb-item .thumb-label {
  display: none;
}

.codex-lightbox-fade-enter-active,
.codex-lightbox-fade-leave-active {
  transition: opacity 0.25s ease;
}

.codex-lightbox-fade-enter-from,
.codex-lightbox-fade-leave-to {
  opacity: 0;
}

/* Modal Transition */
.codex-modal-fade-enter-active,
.codex-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.codex-modal-fade-enter-from,
.codex-modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .attributes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero-splash-banner {
    height: 180px;
  }
}
</style>
