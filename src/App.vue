<template>
  <Toast />
  <router-view />

  <!-- Global Codex Inspection Modals -->
  <ChampionModal
    :champion-id="selectedChampionId"
    :visible="championModalVisible"
    @update:visible="championModalVisible = $event"
    @close="closeChampionModal"
  />

  <ItemModal
    :item="selectedItem"
    :all-items="allItemsCache"
    :visible="itemModalVisible"
    @update:visible="itemModalVisible = $event"
    @select-item="selectedItem = $event"
  />
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { registerToast } from "@/composables/useToast";
import ChampionModal from "@/components/Codex/ChampionModal.vue";
import ItemModal from "@/components/Codex/ItemModal.vue";
import { useCodexModal } from "@/composables/useCodexModal";

const toast = useToast();
registerToast((msg) => toast.add(msg));

const {
  championModalVisible,
  selectedChampionId,
  itemModalVisible,
  selectedItem,
  allItemsCache,
  closeChampionModal,
} = useCodexModal();
</script>
