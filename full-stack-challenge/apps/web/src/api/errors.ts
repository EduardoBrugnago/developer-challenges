import axios from "axios";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join("; ");
    if (typeof message === "string") return message;
    if (error.code === "ECONNABORTED")
      return "The server took too long to respond";
    if (!error.response) return "Could not reach the server";
  }
  return error instanceof Error ? error.message : "Unexpected error";
}
