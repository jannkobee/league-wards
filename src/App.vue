<template>
  <Toast />
  <router-view />
</template>

<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { registerToast } from "@/composables/useToast";

const toast = useToast();

registerToast((msg) => toast.add(msg));
</script>
