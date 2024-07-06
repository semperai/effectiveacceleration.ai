import { toast as t } from "react-hot-toast";

const args = { duration: 5000, style: { maxWidth: 500, overflow: "hidden" } };

export const toast = (message: any, type: "error" | "success") => {
  if (!message) return;

  const normalized = message?.message || message;
  const stringified =
    typeof normalized === "object"
      ? JSON.stringify(normalized)
      : normalized.toString();
  const trimmed = `${stringified}`.substring(0, 80).trim();

  const toasts = {
    success: () => t.success(trimmed, args),
    error: () => t.error(trimmed, args),
  };

  if (message?.message) {
    console.error(message);
  }

  return toasts[type]();
};