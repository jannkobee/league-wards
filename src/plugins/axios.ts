import axios from "axios";
import { showToast } from "@/composables/useToast";

const apiKey = import.meta.env.VITE_API_KEY;

const axiosRequest = axios.create({
  headers: {
    "X-Riot-Token": apiKey,
    Accept: "application/json",
  },
});

axiosRequest.interceptors.response.use(
  async (res) => {
    return res;
  },
  async (error) => {
    const { data } = error.response;

    showToast({
      severity: "error",
      summary: `Error ${data.status.status_code}`,
      detail: data.status.message,
      life: 3000,
    });

    return Promise.reject(error);
  },
);

export default axiosRequest;
