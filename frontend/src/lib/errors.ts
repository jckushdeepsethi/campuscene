import axios from "axios";

type ApiErrorResponse = {
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
