import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  issues?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (data?.issues?.fieldErrors) {
      const fieldErrorMsgs = Object.entries(data.issues.fieldErrors)
        .flatMap(([field, errs]) => errs.map((e) => `${field}: ${e}`))
        .join(" | ");
      if (fieldErrorMsgs) return fieldErrorMsgs;
    }
    return data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
