import axios from "axios";
import { showToast } from "@/composables/useToast";

const axiosRequest = axios.create({
  baseURL: "/.netlify/functions",
  headers: {
    Accept: "application/json",
  },
});

axiosRequest.interceptors.response.use(
  async (res) => res,
  async (error) => {
    const { data } = error.response || {};

    if (data?.status?.status_code) {
      showToast({
        severity: "error",
        summary: `Error ${data.status.status_code}`,
        detail: data.status.message,
        life: 3000,
      });
    } else {
      showToast({
        severity: "error",
        summary: "API Error",
        detail: "An error occurred while processing your request.",
        life: 3000,
      });
    }

    return Promise.reject(error);
  },
);

export default axiosRequest;
