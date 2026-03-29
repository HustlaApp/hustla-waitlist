"use client";

import {
  FaCircleCheck,
  FaSpinner,
  FaTriangleExclamation,
} from "react-icons/fa6";
import type { SubmitState } from "../../lib/waitlist/shared";

type WaitlistFeedbackDialogProps = {
  open: boolean;
  status: SubmitState;
  title: string;
  message: string;
  onClose: () => void;
};

export function WaitlistFeedbackDialog({
  open,
  status,
  title,
  message,
  onClose,
}: WaitlistFeedbackDialogProps) {
  if (!open) {
    return null;
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(17,17,17,0.16)] backdrop-blur-[4px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-feedback-title"
        className="relative z-10 w-full max-w-md rounded-[28px] border border-black/8 bg-white/97 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:p-7"
      >
        <div
          className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 ${
            isLoading || isSuccess
              ? "bg-[#111111] text-white"
              : "bg-white text-[#111111]"
          }`}
        >
          {isLoading ? (
            <FaSpinner className="animate-spin text-[18px]" aria-hidden="true" />
          ) : isSuccess ? (
            <FaCircleCheck className="text-[18px]" aria-hidden="true" />
          ) : (
            <FaTriangleExclamation className="text-[18px]" aria-hidden="true" />
          )}
        </div>
        <h2
          id="waitlist-feedback-title"
          className="[font-family:var(--font-display)] text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[#111111]"
        >
          {title}
        </h2>
        <p className="mt-3 [font-family:var(--font-inter)] text-sm font-medium leading-relaxed text-[#666666] sm:text-[15px]">
          {message}
        </p>
        {isLoading ? (
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-black/8">
            <div className="h-full w-2/5 animate-pulse rounded-full bg-[#111111]" />
          </div>
        ) : (
          <>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-black/8">
              <div className="h-full w-full origin-left animate-modal-progress rounded-full bg-[#111111]" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#111111] [font-family:var(--font-inter)] text-sm font-semibold text-white transition hover:bg-black"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
