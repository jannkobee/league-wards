import type { ToastMessageOptions } from "primevue/toast";

let toastInstance: ((msg: ToastMessageOptions) => void) | null = null;

export function registerToast(fn: (msg: ToastMessageOptions) => void) {
  toastInstance = fn;
}

export function showToast(msg: ToastMessageOptions) {
  if (toastInstance) {
    toastInstance(msg);
  }
}
