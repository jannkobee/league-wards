import axios from "axios";
import { ref } from "vue";
import type { ChampionOverviewDto, ChampionDetailDto, ItemDto } from "@/types/league";

// Module-level cache to share across all component instances
const dataDragonLatestVersion = ref("14.24.1");
const summonerSpellMap = ref<Record<string, string>>({});
const runeIconMap = ref<Record<number, string>>({});
const championsCache = ref<ChampionOverviewDto[]>([]);
const championDetailsCache = new Map<string, ChampionDetailDto>();
const itemsCache = ref<ItemDto[]>([]);
let initialized = false;

export const useDataDragon = () => {
  const fetchLatestDataDragonVersion = async () => {
    if (initialized) return;

    try {
      const response = await axios.get<string[]>(
        "https://ddragon.leagueoflegends.com/api/versions.json",
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        dataDragonLatestVersion.value = response.data[0];
      }

      // Fetch summoner spells and runes concurrently
      await Promise.allSettled([
        fetchSummonerSpells(dataDragonLatestVersion.value),
        fetchRunes(dataDragonLatestVersion.value),
      ]);

      initialized = true;
    } catch (error) {
      console.error("Failed to fetch Data Dragon assets:", error);
    }
  };

  const fetchSummonerSpells = async (version: string) => {
    try {
      const res = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
      );
      const spells = res.data?.data;
      if (spells) {
        const mapping: Record<string, string> = {};
        for (const key in spells) {
          const spell = spells[key];
          if (spell.key && spell.image?.full) {
            mapping[spell.key] = spell.image.full;
          }
        }
        summonerSpellMap.value = mapping;
      }
    } catch (err) {
      console.error("Failed to load summoner spells:", err);
    }
  };

  const fetchRunes = async (version: string) => {
    try {
      const res = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`,
      );
      const runes = res.data;
      if (Array.isArray(runes)) {
        const mapping: Record<number, string> = {};
        for (const tree of runes) {
          if (tree.id && tree.icon) {
            mapping[tree.id] = tree.icon;
          }
          if (Array.isArray(tree.slots)) {
            for (const slot of tree.slots) {
              if (Array.isArray(slot.runes)) {
                for (const rune of slot.runes) {
                  if (rune.id && rune.icon) {
                    mapping[rune.id] = rune.icon;
                  }
                }
              }
            }
          }
        }
        runeIconMap.value = mapping;
      }
    } catch (err) {
      console.error("Failed to load runes:", err);
    }
  };

  const normalizeChampionName = (name: string): string => {
    if (!name) return "";
    const cleaned = name.replace(/['\s]/g, "");
    const specialMap: Record<string, string> = {
      wukong: "MonkeyKing",
      fiddlesticks: "Fiddlesticks",
      renataglasc: "Renata",
      nunuwillump: "Nunu",
      nunu: "Nunu",
      leblanc: "Leblanc",
      chogath: "Chogath",
      kaisa: "Kaisa",
      khazix: "Khazix",
      velkoz: "Velkoz",
      belveth: "Belveth",
      ksante: "KSante",
    };
    return specialMap[cleaned.toLowerCase()] || cleaned;
  };

  const getChampionIcon = (championName: string): string => {
    if (!championName) return "";
    const formattedName = normalizeChampionName(championName);
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/champion/${formattedName}.png`;
  };

  const getChampionSplash = (championName: string): string => {
    if (!championName) return "";
    const formattedName = normalizeChampionName(championName);
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formattedName}_0.jpg`;
  };

  const getItemIcon = (itemId: number): string => {
    if (!itemId || itemId === 0) return "";
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/item/${itemId}.png`;
  };

  const getSummonerSpellIcon = (spellId: number): string => {
    const filename = summonerSpellMap.value[spellId.toString()];
    if (!filename) {
      const fallbackMap: Record<number, string> = {
        4: "SummonerFlash.png",
        14: "SummonerDot.png",
        12: "SummonerTeleport.png",
        11: "SummonerSmite.png",
        3: "SummonerExhaust.png",
        7: "SummonerHeal.png",
        6: "SummonerHaste.png",
        1: "SummonerBoost.png",
        21: "SummonerBarrier.png",
        32: "SummonerSnowball.png",
      };
      const fallbackName = fallbackMap[spellId];
      if (fallbackName) {
        return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/spell/${fallbackName}`;
      }
      return "";
    }
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/spell/${filename}`;
  };

  const getRuneIcon = (runeId: number): string => {
    const iconPath = runeIconMap.value[runeId];
    if (!iconPath) return "";
    return `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`;
  };

  const getProfileIcon = (iconId: number): string => {
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/profileicon/${iconId}.png`;
  };

  const fetchAllChampions = async (): Promise<ChampionOverviewDto[]> => {
    if (championsCache.value.length > 0) return championsCache.value;
    try {
      await fetchLatestDataDragonVersion();
      const res = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/data/en_US/champion.json`,
      );
      if (res.data?.data) {
        const list = Object.values(res.data.data) as ChampionOverviewDto[];
        list.sort((a, b) => a.name.localeCompare(b.name));
        championsCache.value = list;
        return list;
      }
    } catch (err) {
      console.error("Failed to fetch all champions:", err);
    }
    return [];
  };

  const fetchChampionDetail = async (championId: string): Promise<ChampionDetailDto | null> => {
    if (championDetailsCache.has(championId)) {
      return championDetailsCache.get(championId)!;
    }
    try {
      await fetchLatestDataDragonVersion();
      const res = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/data/en_US/champion/${championId}.json`,
      );
      if (res.data?.data?.[championId]) {
        const detail = res.data.data[championId] as ChampionDetailDto;
        championDetailsCache.set(championId, detail);
        return detail;
      }
    } catch (err) {
      console.error(`Failed to fetch champion detail for ${championId}:`, err);
    }
    return null;
  };

  const fetchAllItems = async (): Promise<ItemDto[]> => {
    if (itemsCache.value.length > 0) return itemsCache.value;
    try {
      await fetchLatestDataDragonVersion();
      const res = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/data/en_US/item.json`,
      );
      if (res.data?.data) {
        const items: ItemDto[] = [];
        const rawItems = res.data.data as Record<string, Partial<ItemDto>>;
        for (const [id, itemData] of Object.entries(rawItems)) {
          // Exclude placeholder or obsolete non-purchasable items with no name
          if (!itemData.name) continue;
          items.push({
            id,
            name: itemData.name,
            description: itemData.description || "",
            plaintext: itemData.plaintext || "",
            colloq: itemData.colloq || "",
            into: itemData.into || [],
            from: itemData.from || [],
            image: itemData.image || { full: `${id}.png` },
            gold: itemData.gold || { base: 0, total: 0, sell: 0, purchasable: false },
            tags: itemData.tags || [],
            stats: itemData.stats || {},
            depth: itemData.depth,
          });
        }
        items.sort((a, b) => a.name.localeCompare(b.name));
        itemsCache.value = items;
        return items;
      }
    } catch (err) {
      console.error("Failed to fetch all items:", err);
    }
    return [];
  };

  const getSpellIcon = (imageFull: string): string => {
    if (!imageFull) return "";
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/spell/${imageFull}`;
  };

  const getPassiveIcon = (imageFull: string): string => {
    if (!imageFull) return "";
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonLatestVersion.value}/img/passive/${imageFull}`;
  };

  const getChampionSkinSplash = (championId: string, skinNum: number): string => {
    if (!championId) return "";
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
  };

  const getChampionLoadingArt = (championId: string, skinNum: number): string => {
    if (!championId) return "";
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_${skinNum}.jpg`;
  };

  return {
    dataDragonLatestVersion,
    fetchLatestDataDragonVersion,
    fetchAllChampions,
    fetchChampionDetail,
    fetchAllItems,
    getChampionIcon,
    getChampionSplash,
    getItemIcon,
    getSummonerSpellIcon,
    getRuneIcon,
    getProfileIcon,
    getSpellIcon,
    getPassiveIcon,
    getChampionSkinSplash,
    getChampionLoadingArt,
    normalizeChampionName,
  };
};
