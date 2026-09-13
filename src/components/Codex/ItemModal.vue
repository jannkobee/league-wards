<template>
  <teleport to="body">
    <transition name="codex-modal-fade">
      <div v-if="visible && item" class="codex-modal-backdrop" @click.self="handleClose">
        <div class="codex-glass-modal item-modal-container">
          <!-- Header Bar with Item Icon & Summary -->
          <div class="item-header-strip">
            <div class="item-visual-col">
              <div class="item-icon-frame">
                <img :src="getItemIcon(Number(item.id))" :alt="item.name" class="item-main-icon" />
              </div>
            </div>

            <div class="item-title-col">
              <div
                v-if="uniqueFormattedTags.length > 0 || item.gold?.purchasable"
                class="item-tags-row"
              >
                <span v-for="tag in uniqueFormattedTags" :key="tag" class="item-tag-chip">
                  {{ tag }}
                </span>
                <span v-if="item.gold?.purchasable" class="purchasable-chip">
                  <i class="pi pi-check-circle"></i> Purchasable
                </span>
              </div>
              <h2 class="item-name">{{ item.name }}</h2>
              <div class="item-gold-row">
                <span class="gold-stat total-gold">
                  <i class="pi pi-circle-fill coin-icon"></i> {{ item.gold?.total || 0 }} Gold
                </span>
                <span v-if="item.gold?.sell && item.gold.sell > 0" class="gold-stat sell-gold">
                  Sell: {{ item.gold.sell }} G
                </span>
              </div>
            </div>

            <!-- Top Action Buttons -->
            <div class="modal-top-actions">
              <router-link
                :to="{ name: 'codex-view', query: { tab: 'items', item: item.id } }"
                class="modal-codex-link-btn"
                title="Inspect in Codex Armory"
                @click="handleClose"
              >
                <i class="pi pi-book"></i>
                <span>Codex</span>
              </router-link>
              <button class="modal-close-btn" @click="handleClose" title="Close Item Dossier">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <!-- Body Scroll Container -->
          <div class="modal-scroll-body">
            <!-- Plaintext Summary -->
            <div v-if="item.plaintext && item.plaintext.trim()" class="item-plaintext-card">
              <i class="pi pi-info-circle info-icon"></i>
              <span>{{ item.plaintext }}</span>
            </div>

            <!-- Stats List (If item provides flat/percent stats) -->
            <div v-if="formattedStats.length > 0" class="glass-panel stats-panel">
              <div class="panel-eyebrow">
                <i class="pi pi-chart-line"></i>
                <span>ATTRIBUTE BONUSES</span>
              </div>
              <div class="stats-grid">
                <div
                  v-for="stat in formattedStats"
                  :key="stat.name"
                  class="stat-chip"
                  :class="`stat-${stat.category}`"
                >
                  <span class="stat-value">{{ stat.value }}</span>
                  <span class="stat-name">{{ stat.name }}</span>
                </div>
              </div>
            </div>

            <!-- Full Description & Unique Effects -->
            <div v-if="cleanedDescription" class="glass-panel description-panel">
              <div class="panel-eyebrow">
                <i class="pi pi-sparkles"></i> UNIQUE EFFECTS & MECHANICS
              </div>
              <div class="effect-body" v-html="cleanedDescription"></div>
            </div>

            <!-- Build Paths & Recipe Trees -->
            <div
              v-if="buildsFromItems.length > 0 || buildsIntoItems.length > 0"
              class="recipes-container"
            >
              <!-- Builds From -->
              <div v-if="buildsFromItems.length > 0" class="glass-panel recipe-panel">
                <div class="panel-eyebrow">
                  <i class="pi pi-sitemap"></i> BUILDS FROM (COMPONENTS)
                </div>
                <div class="recipe-items-row">
                  <div
                    v-for="sub in buildsFromItems"
                    :key="sub.id"
                    class="recipe-chip"
                    @click="selectSubItem(sub)"
                    :title="`${sub.name} (${sub.gold?.total}G)`"
                  >
                    <img :src="getItemIcon(Number(sub.id))" :alt="sub.name" class="recipe-img" />
                    <div class="recipe-meta">
                      <span class="recipe-name">{{ sub.name }}</span>
                      <span class="recipe-gold">{{ sub.gold?.total }} G</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Builds Into -->
              <div v-if="buildsIntoItems.length > 0" class="glass-panel recipe-panel">
                <div class="panel-eyebrow">
                  <i class="pi pi-arrow-up-right"></i> BUILDS INTO (UPGRADES)
                </div>
                <div class="recipe-items-row">
                  <div
                    v-for="upgrade in buildsIntoItems"
                    :key="upgrade.id"
                    class="recipe-chip"
                    @click="selectSubItem(upgrade)"
                    :title="`${upgrade.name} (${upgrade.gold?.total}G)`"
                  >
                    <img
                      :src="getItemIcon(Number(upgrade.id))"
                      :alt="upgrade.name"
                      class="recipe-img"
                    />
                    <div class="recipe-meta">
                      <span class="recipe-name">{{ upgrade.name }}</span>
                      <span class="recipe-gold">{{ upgrade.gold?.total }} G</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ItemDto } from "@/types/league";
import { useDataDragon } from "@/composables/useDataDragon";

const props = defineProps<{
  item: ItemDto | null;
  visible: boolean;
  allItems: ItemDto[];
}>();

const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "select-item", item: ItemDto): void;
}>();

const { getItemIcon } = useDataDragon();

const handleClose = () => {
  emit("update:visible", false);
};

const selectSubItem = (sub: ItemDto) => {
  emit("select-item", sub);
};

// Map component IDs to full item objects
const buildsFromItems = computed(() => {
  if (!props.item?.from || !props.item.from.length) return [];
  return props.item.from
    .map((id) => props.allItems.find((it) => it.id === id))
    .filter((it): it is ItemDto => it !== undefined);
});

// Map upgrade IDs to full item objects
const buildsIntoItems = computed(() => {
  if (!props.item?.into || !props.item.into.length) return [];
  return props.item.into
    .map((id) => props.allItems.find((it) => it.id === id))
    .filter((it): it is ItemDto => it !== undefined);
});

interface ItemStatDisplay {
  value: string;
  name: string;
  category: "ad" | "ap" | "health" | "mana" | "armor" | "mr" | "speed" | "crit" | "other";
}

// Format raw stats into player-friendly labels and categories
const formattedStats = computed((): ItemStatDisplay[] => {
  if (!props.item?.stats) return [];
  const statConfig: Record<string, { label: string; category: ItemStatDisplay["category"] }> = {
    FlatPhysicalDamageMod: { label: "Attack Damage", category: "ad" },
    FlatMagicDamageMod: { label: "Ability Power", category: "ap" },
    FlatHPPoolMod: { label: "Health", category: "health" },
    FlatSpellBlockMod: { label: "Magic Resist", category: "mr" },
    FlatArmorMod: { label: "Armor", category: "armor" },
    FlatMovementSpeedMod: { label: "Move Speed", category: "speed" },
    PercentMovementSpeedMod: { label: "% Move Speed", category: "speed" },
    PercentAttackSpeedMod: { label: "% Attack Speed", category: "ad" },
    FlatCritChanceMod: { label: "% Critical Strike Chance", category: "crit" },
    PercentLifeStealMod: { label: "% Life Steal", category: "ad" },
    FlatHPRegenMod: { label: "Base Health Regen", category: "health" },
    FlatMPPoolMod: { label: "Mana", category: "mana" },
  };

  const results: ItemStatDisplay[] = [];
  for (const [key, val] of Object.entries(props.item.stats)) {
    if (!val) continue;
    const cfg = statConfig[key] || { label: key, category: "other" };
    const isPercent = key.includes("Percent") || key.includes("Crit") || key.includes("LifeSteal");
    const formattedVal = isPercent ? `+${Math.round(val * 100)}%` : `+${val}`;
    results.push({
      value: formattedVal,
      name: cfg.label.replace("% ", ""),
      category: cfg.category,
    });
  }
  return results;
});

// Clean and translate Data Dragon XML tags to styled spans
const cleanItemDescription = (rawText: string): string => {
  if (!rawText) return "";
  return rawText
    .replace(/<mainText>/gi, "")
    .replace(/<\/mainText>/gi, "")
    .replace(/<stats>(.*?)<\/stats>/gi, "") // We already show stats cleanly above
    .replace(/<attention>(.*?)<\/attention>/gi, '<span class="txt-gold">$1</span>')
    .replace(/<magicDamage>(.*?)<\/magicDamage>/gi, '<span class="txt-magic">$1</span>')
    .replace(/<physicalDamage>(.*?)<\/physicalDamage>/gi, '<span class="txt-phys">$1</span>')
    .replace(/<trueDamage>(.*?)<\/trueDamage>/gi, '<span class="txt-true">$1</span>')
    .replace(/<scaleArmor>(.*?)<\/scaleArmor>/gi, '<span class="txt-armor">$1</span>')
    .replace(/<scaleMR>(.*?)<\/scaleMR>/gi, '<span class="txt-mr">$1</span>')
    .replace(/<scaleHealth>(.*?)<\/scaleHealth>/gi, '<span class="txt-health">$1</span>')
    .replace(/<scaleMana>(.*?)<\/scaleMana>/gi, '<span class="txt-mana">$1</span>')
    .replace(/<scaleAP>(.*?)<\/scaleAP>/gi, '<span class="txt-magic">$1</span>')
    .replace(/<scaleAD>(.*?)<\/scaleAD>/gi, '<span class="txt-phys">$1</span>')
    .replace(/<shield>(.*?)<\/shield>/gi, '<span class="txt-shield">$1</span>')
    .replace(/<healing>(.*?)<\/healing>/gi, '<span class="txt-healing">$1</span>')
    .replace(/<keywordMajor>(.*?)<\/keywordMajor>/gi, '<span class="txt-gold">$1</span>')
    .replace(/<ornnBonus>(.*?)<\/ornnBonus>/gi, '<span class="txt-gold">$1</span>')
    .replace(/<rarityLegendary>(.*?)<\/rarityLegendary>/gi, '<span class="txt-gold">$1</span>')
    .replace(/<rarityMythic>(.*?)<\/rarityMythic>/gi, '<span class="txt-gold">$1</span>')
    .replace(/<passive>(.*?)<\/passive>/gi, (_match, rawTitle) => {
      let title = rawTitle.replace(/^Passive\s*[-:·]?\s*/i, "").trim();
      title = title.replace(/[:\-·.\s]+$/, "").trim();
      if (!title) return '<span class="txt-passive-lead">Passive:</span> ';
      return `<span class="txt-passive-lead">Passive</span> - <strong class="txt-passive-name">${title}:</strong> `;
    })
    .replace(/<active>(.*?)<\/active>/gi, (_match, rawTitle) => {
      let title = rawTitle.replace(/^Active\s*[-:·]?\s*/i, "").trim();
      title = title.replace(/[:\-·.\s]+$/, "").trim();
      if (!title) return '<span class="txt-active-lead">Active:</span> ';
      return `<span class="txt-active-lead">Active</span> - <strong class="txt-active-name">${title}:</strong> `;
    })
    .replace(/<status>(.*?)<\/status>/gi, '<span class="txt-status">$1</span>')
    .replace(/<rules>(.*?)<\/rules>/gi, '<span class="txt-rules">$1</span>')
    .replace(/<speed>(.*?)<\/speed>/gi, '<span class="txt-speed">$1</span>');
};

const cleanedDescription = computed(() => {
  if (!props.item?.description) return "";
  let cleaned = cleanItemDescription(props.item.description).trim();
  cleaned = cleaned.replace(/^(?:\s*<br\s*\/?>)+/gi, "").trim();
  cleaned = cleaned.replace(/(?:<br\s*\/?>\s*)+$/gi, "").trim();
  const textOnly = cleaned.replace(/<[^>]*>/g, "").trim();
  return textOnly.length > 0 ? cleaned : "";
});

// Player-friendly formatting for item tags
const formatItemTag = (tag: string): string => {
  if (!tag) return "";
  const tagLabels: Record<string, string> = {
    SpellBlock: "Magic Resist",
    Damage: "Attack Damage",
    LifeSteal: "Life Steal",
    AttackSpeed: "Attack Speed",
    CriticalStrike: "Critical Strike",
    ArmorPenetration: "Armor Pen",
    MagicPenetration: "Magic Pen",
    AbilityHaste: "Ability Haste",
    ManaRegen: "Mana Regen",
    HealthRegen: "Health Regen",
    Health: "Health",
    Mana: "Mana",
    Armor: "Armor",
    SpellDamage: "Ability Power",
    Movement: "Move Speed",
    Boots: "Boots",
    Consumable: "Consumable",
    Stealth: "Stealth",
    Vision: "Vision",
    NonbootsMovement: "Move Speed",
    OnHit: "On-Hit",
    Trinket: "Trinket",
    Slow: "Slow",
    Aura: "Aura",
    Active: "Active",
    Lane: "Laning",
    Jungle: "Jungle",
    CooldownReduction: "Ability Haste",
    Tenacity: "Tenacity",
    SpellVamp: "Spell Vamp",
    GoldPer: "Gold Income",
  };
  if (tagLabels[tag]) return tagLabels[tag];
  return tag.replace(/([a-z])([A-Z])/g, "$1 $2");
};

const uniqueFormattedTags = computed(() => {
  if (!props.item?.tags) return [];
  const mapped = props.item.tags
    .map((t) => formatItemTag(t))
    .filter((t) => Boolean(t && t.trim().length > 0));
  return Array.from(new Set(mapped)).slice(0, 3);
});
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

.item-modal-container {
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  background: rgba(10, 15, 26, 0.78);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(200, 170, 110, 0.28);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 24px rgba(200, 170, 110, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.item-header-strip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 28px;
  background: linear-gradient(180deg, rgba(20, 32, 54, 0.6) 0%, rgba(10, 16, 28, 0.45) 100%);
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

.item-visual-col {
  flex-shrink: 0;
}

.item-icon-frame {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(200, 170, 110, 0.8) 0%, rgba(0, 240, 255, 0.4) 100%);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.6),
    0 0 16px rgba(0, 240, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-main-icon {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  object-fit: cover;
  display: block;
}

.item-title-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.item-tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.item-tag-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 3px 10px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.item-tag-chip:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.35);
  color: #00f0ff;
  transform: translateY(-1px);
}

.purchasable-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  padding: 3px 10px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
}

.purchasable-chip i {
  font-size: 11px;
}

.item-name {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.8px;
  line-height: 1.2;
  margin: 0;
  background: linear-gradient(135deg, #ffffff 15%, #f5eedb 60%, #c8aa6e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 8px rgba(200, 170, 110, 0.25));
}

.item-gold-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.gold-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
}

.total-gold {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  padding: 3px 10px;
  border-radius: 12px;
  color: #ffd700;
  letter-spacing: 0.3px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
}

.coin-icon {
  font-size: 9px;
  color: #ffd700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.7));
}

.sell-gold {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 3px 10px;
  border-radius: 12px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
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

.modal-codex-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 21, 35, 0.75);
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
  box-shadow: 0 0 12px rgba(200, 170, 110, 0.35);
}

.modal-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(244, 63, 94, 0.25);
  border-color: #f43f5e;
  transform: scale(1.05);
}

/* Body */
.modal-scroll-body {
  overflow-y: auto;
  padding: 22px 28px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.glass-panel {
  background: rgba(12, 18, 30, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 16px 20px;
}

.panel-eyebrow {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-gold);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(200, 170, 110, 0.15);
}

.panel-eyebrow i {
  font-size: 12px;
  color: #00f0ff;
  filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.4));
}

.item-plaintext-card {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  line-height: 1.5;
  color: #e0f2fe;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(12, 18, 30, 0.5) 100%);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-left: 3px solid #38bdf8;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.item-plaintext-card span {
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.info-icon {
  font-size: 16px;
  color: #38bdf8;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5));
}

/* Stats Badges */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.stat-chip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 8px 14px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.stat-chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.stat-name {
  font-size: 11.5px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.stat-mana .stat-value {
  color: #38bdf8;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
}
.stat-ap .stat-value {
  color: #a78bfa;
  text-shadow: 0 0 10px rgba(167, 139, 250, 0.35);
}
.stat-ad .stat-value {
  color: #fb923c;
  text-shadow: 0 0 10px rgba(251, 146, 60, 0.35);
}
.stat-health .stat-value {
  color: #34d399;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.35);
}
.stat-armor .stat-value {
  color: #facc15;
  text-shadow: 0 0 10px rgba(250, 204, 21, 0.35);
}
.stat-mr .stat-value {
  color: #e879f9;
  text-shadow: 0 0 10px rgba(232, 121, 249, 0.35);
}
.stat-speed .stat-value {
  color: #67e8f9;
  text-shadow: 0 0 10px rgba(103, 232, 249, 0.35);
}
.stat-crit .stat-value {
  color: #f87171;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.35);
}
.stat-other .stat-value {
  color: #10b981;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
}

/* Unique Effects Typography */
.effect-body {
  font-family: var(--font-body);
  font-size: 13.5px;
  line-height: 1.75;
  color: #cbd5e1;
  letter-spacing: 0.15px;
}

:deep(ul),
:deep(ol) {
  list-style: none;
  padding: 0;
  margin: 0;
}

:deep(li) {
  list-style: none;
  padding: 0;
  margin: 0 0 14px 0;
  line-height: 1.7;
}

:deep(li:last-child) {
  margin-bottom: 0;
}

:deep(.txt-passive-lead) {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: #00f0ff;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

:deep(.txt-passive-name) {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.25px;
}

:deep(.txt-active-lead) {
  font-family: var(--font-heading);
  font-size: 12.5px;
  font-weight: 800;
  color: #fbbf24;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

:deep(.txt-active-name) {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.25px;
}

:deep(.txt-magic) {
  color: #38bdf8;
  font-weight: 600;
}

:deep(.txt-phys) {
  color: #f87171;
  font-weight: 600;
}

:deep(.txt-true) {
  color: #ffffff;
  font-weight: 700;
}

:deep(.txt-gold) {
  color: #facc15;
  font-weight: 600;
}

:deep(.txt-armor) {
  color: #fbbf24;
  font-weight: 600;
}

:deep(.txt-mr) {
  color: #e879f9;
  font-weight: 600;
}

:deep(.txt-health) {
  color: #34d399;
  font-weight: 600;
}

:deep(.txt-mana) {
  color: #38bdf8;
  font-weight: 600;
}

:deep(.txt-status) {
  color: #c084fc;
  font-weight: 600;
}

:deep(.txt-speed) {
  color: #2dd4bf;
  font-weight: 600;
}

:deep(.txt-shield) {
  color: #f472b6;
  font-weight: 600;
}

:deep(.txt-healing) {
  color: #4ade80;
  font-weight: 600;
}

:deep(.txt-rules) {
  display: block;
  font-size: 12px;
  line-height: 1.55;
  color: #94a3b8;
  font-style: italic;
  margin-top: 10px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 2px solid rgba(200, 170, 110, 0.35);
  border-radius: 0 6px 6px 0;
}

/* Recipes */
.recipes-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recipe-items-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.recipe-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(14, 21, 35, 0.7);
  border: 1px solid rgba(200, 170, 110, 0.2);
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.recipe-chip:hover {
  background: rgba(10, 200, 185, 0.15);
  border-color: #00f0ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 240, 255, 0.25);
}

.recipe-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(200, 170, 110, 0.35);
  transition: transform 0.2s ease;
}

.recipe-chip:hover .recipe-img {
  transform: scale(1.08);
  border-color: #00f0ff;
}

.recipe-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recipe-name {
  font-size: 12px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.2px;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
}

.recipe-chip:hover .recipe-name {
  color: #00f0ff;
}

.recipe-gold {
  font-size: 11px;
  color: #ffd700;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Transition */
.codex-modal-fade-enter-active,
.codex-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.codex-modal-fade-enter-from,
.codex-modal-fade-leave-to {
  opacity: 0;
}
</style>
