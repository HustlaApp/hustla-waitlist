export type SubmitState = "idle" | "loading" | "success" | "error";
export type FeedbackStatus = Exclude<SubmitState, "idle" | "loading">;
export type UserType = "customer" | "provider";

export type ApiResult = {
  message?: string;
};

export const WAITLIST_SURVEY_URL =
  "https://form.jotform.com/260477142096055";
