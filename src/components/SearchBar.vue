<template>
  <h1 class="title" @click="$router.push({ name: 'dashboard' })">League Wards</h1>
  <div style="display: flex; gap: 5px">
    <Select
      v-model="form.region"
      :options="regions"
      style="width: 200px"
      placeholder="Select a Region"
      optionLabel="name"
      optionValue="code"
    />

    <InputGroup>
      <InputText
        v-model="form.account"
        style="width: 100%"
        placeholder="Search Summoner (Summoner Name + #Tag Line)"
      />
      <Button :loading="loading" label="Search" icon="pi pi-search" @click="findSummoner" />
    </InputGroup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useApi } from "@/composables/useApi";
import router from "@/router";

const { loading, getAccountByRiotId, getLeagueEntriesInAllQueuesForAGivenPUuid } = useApi();

const form = reactive({
  region: "",
  account: "",
});

const regions = ref([
  { name: "South East Asia", code: "sg2" },
  { name: "Europe West", code: "euw1" },
  { name: "North America", code: "na1" },
  { name: "South Korea", code: "kr" },
]);

const findSummoner = async () => {
  const [username, tag] = form.account.split("#");

  if (!username || !tag || !form.region) return;

  const accountRes = await getAccountByRiotId(username, tag);
  const accountData = accountRes.data;

  if (accountData?.puuid) {
    await getLeagueEntriesInAllQueuesForAGivenPUuid(accountData.puuid, form.region);

    router.push({
      name: "account-view",
      params: {
        account: form.account,
        region: form.region,
      },
    });
  }
};
</script>

<style lang="css" scoped>
.title {
  font-size: 80px;
  font-family: "Cinzel", serif;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffd700;
  text-shadow: 0 0 3px #c69700;
  cursor: pointer;
  user-select: none;
}
</style>
