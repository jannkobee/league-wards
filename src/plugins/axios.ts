import axios from "axios";
import { showToast } from "@/composables/useToast";

const useDirectRiotApi = import.meta.env.VITE_API_MODE === "direct";

const axiosRequest = axios.create({
  headers: {
    "Content-Type": "application/json",
    ...(useDirectRiotApi ? { "X-Riot-Token": import.meta.env.VITE_API_KEY } : {}),
  },
});

axiosRequest.interceptors.response.use(
  async (res) => res,
  async (error) => {
    const { data } = error.response || {};
    if (data?.status?.status_code) {
      showToast({ severity: "error", summary: `Error ${data.status.status_code}`, detail: data.status.message, life: 3000 });
    } else {
      showToast({ severity: "error", summary: "API Error", detail: "An error occurred while processing your request.", life: 3000 });
    }
    return Promise.reject(error);
  },
);

export default axiosRequest;
