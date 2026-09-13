import { ref } from "vue";
import type { ItemDto } from "@/types/league";
import { useDataDragon } from "./useDataDragon";

const championModalVisible = ref(false);
const selectedChampionId = ref<string | null>(null);

const itemModalVisible = ref(false);
const selectedItem = ref<ItemDto | null>(null);
const allItemsCache = ref<ItemDto[]>([]);

export const useCodexModal = () => {
  const { fetchAllItems, normalizeChampionName } = useDataDragon();

  const openChampionModal = (championName: string) => {
    if (!championName) return;
    const normalized = normalizeChampionName(championName);
    selectedChampionId.value = normalized;
    championModalVisible.value = true;
  };

  const openItemModal = async (itemId: number | string) => {
    const strId = itemId.toString();
    if (!strId || strId === "0") return;

    if (allItemsCache.value.length === 0) {
      allItemsCache.value = await fetchAllItems();
    }
    const found = allItemsCache.value.find((it) => it.id === strId);
    if (found) {
      selectedItem.value = found;
      itemModalVisible.value = true;
    }
  };

  const closeChampionModal = () => {
    championModalVisible.value = false;
    selectedChampionId.value = null;
  };

  const closeItemModal = () => {
    itemModalVisible.value = false;
    selectedItem.value = null;
  };

  return {
    championModalVisible,
    selectedChampionId,
    itemModalVisible,
    selectedItem,
    allItemsCache,
    openChampionModal,
    openItemModal,
    closeChampionModal,
    closeItemModal,
  };
};
