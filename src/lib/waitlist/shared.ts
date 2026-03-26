export type SubmitState = "idle" | "loading" | "success" | "error";
export type FeedbackStatus = Exclude<SubmitState, "idle" | "loading">;
export type UserType = "customer" | "provider";

export type ApiResult = {
  message?: string;
};

export const WAITLIST_SURVEY_URL =
  "https://form.jotform.com/260477142096055";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}
