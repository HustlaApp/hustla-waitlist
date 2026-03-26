"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa6";
import { InteractiveWarpGrid } from "../../components/InteractiveWarpGrid";
import { WaitlistFeedbackDialog } from "../../components/waitlist/WaitlistFeedbackDialog";
import { WaitlistFooter } from "../../components/waitlist/WaitlistFooter";
import {
  type FeedbackStatus,
  type SubmitState,
  type UserType,
  isValidEmail,
  WAITLIST_SURVEY_URL,
} from "../../lib/waitlist/shared";

const FEEDBACK_COPY = {
  success: {
    customer: {
      title: "You are in",
      message:
        "You’re on the Hustla waitlist. We’ll let you know when we go live.",
    },
    provider: {
      title: "You are in",
      message:
        "You’re on the Hustla waitlist. We’ll let you know when we go live.",
    },
  },
  duplicate: {
    title: "Already on the list",
      message:
      "This email is already on the Hustla waitlist.",
  },
  serverError: {
    title: "Something went wrong",
    message:
      "We couldn’t complete your signup. Try again shortly.",
  },
  networkError: {
    title: "Connection issue",
    message:
      "Your signup didn’t go through. Check your connection and try again.",
  },
} satisfies Record<string, unknown>;

export default function WaitlistPage() {
  const [userType, setUserType] = useState<UserType | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitState>("idle");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [website, setWebsite] = useState("");
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!feedbackOpen) {
      return;
    }

    const durationMs = 4000;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeoutId = window.setTimeout(() => {
      setFeedbackOpen(false);
    }, durationMs);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timeoutId);
    };
  }, [feedbackOpen]);

  const showModal = (
    nextStatus: FeedbackStatus,
    title: string,
    message: string,
  ) => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }

    setStatus(nextStatus);
    setModalTitle(title);
    setModalMessage(message);
    setFeedbackOpen(true);
  };

  const handleFieldKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    void handleSubmit();
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current || status === "loading") {
      return;
    }

    if (!userType) {
      showModal(
        "error",
        "Choose a user type",
        "Please select Customer or Provider before submitting.",
      );
      return;
    }

    if (!name.trim()) {
      showModal("error", "Name required", "Please enter your name.");
      return;
    }

    if (!email.trim()) {
      showModal(
        "error",
        "Email required",
        "Please enter your email address.",
      );
      return;
    }

    if (!isValidEmail(email)) {
      showModal(
        "error",
        "Invalid email",
        "Please enter a valid email address.",
      );
      return;
    }

    isSubmittingRef.current = true;
    setStatus("loading");
    setFeedbackOpen(false);

    try {
      const payload = {
        userType,
        name,
        email,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
        website,
      };

      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 409) {
          showModal(
            "error",
            FEEDBACK_COPY.duplicate.title,
            FEEDBACK_COPY.duplicate.message,
          );
          return;
        }

        showModal(
          "error",
          FEEDBACK_COPY.serverError.title,
          FEEDBACK_COPY.serverError.message,
        );
        return;
      }

      showModal(
        "success",
        FEEDBACK_COPY.success[userType].title,
        FEEDBACK_COPY.success[userType].message,
      );
      setUserType("");
      setName("");
      setEmail("");
      setWebsite("");
    } catch {
      showModal(
        "error",
        FEEDBACK_COPY.networkError.title,
        FEEDBACK_COPY.networkError.message,
      );
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FFFFFF]">
      <div className="hidden sm:block">
        <InteractiveWarpGrid />
      </div>

      <header className="absolute left-1/2 top-6 z-20 -translate-x-1/2 sm:top-7">
        <Link href="/" aria-label="Go to homepage">
          <Image
            src="/logo-wordmark.png"
            alt="hustla"
            width={182}
            height={62}
            priority
            className="h-auto w-[130px] object-contain sm:w-[182px]"
            style={{ height: "auto" }}
          />
        </Link>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-10 pt-24 sm:px-6 sm:pb-14 lg:pt-28">
        <div className="relative flex w-full max-w-xl flex-col items-center gap-6 lg:gap-8">
          <section className="mx-auto w-full max-w-xl rounded-[26px] border border-black/8 bg-white/96 p-7 shadow-[0_18px_45px_rgba(0,0,0,0.09)] backdrop-blur-sm sm:p-8">
            <p className="[font-family:var(--font-inter)] text-sm font-semibold tracking-[-0.01em] text-[#666666]">
              Join the Waitlist.
            </p>
            <h1 className="mt-2 [font-family:var(--font-display)] text-4xl font-extrabold leading-tight tracking-[-0.02em] text-[#111111] sm:text-5xl">
              Get early access.
            </h1>

            <div className="mt-5 rounded-2xl border border-black/8 bg-gradient-to-b from-white to-[#FAFAFA] p-2.5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/8 bg-white px-3.5 py-2 text-center shadow-[0_6px_16px_rgba(0,0,0,0.05)] sm:justify-center">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#F97316]"
                  />
                  <span className="[font-family:var(--font-inter)] text-xs font-semibold tracking-[-0.01em] text-[#111111] sm:text-sm">
                    Find professionals
                  </span>
                </span>
                <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/8 bg-white px-3.5 py-2 text-center shadow-[0_6px_16px_rgba(0,0,0,0.05)] sm:justify-center">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#F97316]"
                  />
                  <span className="[font-family:var(--font-inter)] text-xs font-semibold tracking-[-0.01em] text-[#111111] sm:text-sm">
                    Be a professional
                  </span>
                </span>
              </div>
            </div>

            <div
              className="mt-8 space-y-5"
              role="group"
              aria-label="Waitlist form"
            >
              <div className="space-y-2">
                <label
                  htmlFor="userType"
                  className="[font-family:var(--font-inter)] text-sm font-semibold text-[#5F5F5F]"
                >
                  I am a...
                </label>
                <div className="relative">
                  <select
                    id="userType"
                    value={userType}
                    onChange={(event) =>
                      setUserType(event.target.value as UserType)
                    }
                    onKeyDown={handleFieldKeyDown}
                    className="h-12 w-full appearance-none rounded-lg border border-black/10 bg-[#F6F6F6] px-4 pr-14 [font-family:var(--font-inter)] text-[15px] font-medium text-[#111111] outline-none transition focus:border-[#F97316]/55 focus:ring-2 focus:ring-[#F97316]/20"
                  >
                    <option value="" disabled>
                      Select user type
                    </option>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#666666]">
                    <FaChevronDown className="text-sm" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="[font-family:var(--font-inter)] text-sm font-semibold text-[#5F5F5F]"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  placeholder="Jane Smith"
                  className="h-12 w-full rounded-lg border border-black/10 bg-[#F6F6F6] px-4 [font-family:var(--font-inter)] text-[15px] font-medium text-[#111111] outline-none transition focus:border-[#F97316]/55 focus:ring-2 focus:ring-[#F97316]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="[font-family:var(--font-inter)] text-sm font-semibold text-[#5F5F5F]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  enterKeyHint="send"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  placeholder="jane@example.com"
                  className="h-12 w-full rounded-lg border border-black/10 bg-[#F6F6F6] px-4 [font-family:var(--font-inter)] text-[15px] font-medium text-[#111111] outline-none transition focus:border-[#F97316]/55 focus:ring-2 focus:ring-[#F97316]/20"
                />
              </div>

              <div
                aria-hidden="true"
                className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={status === "loading"}
                className="relative z-30 mt-2 inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#F97316] [font-family:var(--font-inter)] text-base font-bold text-white shadow-[0_8px_20px_rgba(249,115,22,0.2)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(249,115,22,0.24)] active:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "loading" ? "Submitting..." : "Submit"}
              </button>
              <a
                href={WAITLIST_SURVEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center rounded-[12px] border-2 border-[#111111] bg-white px-4 text-center [font-family:var(--font-inter)] text-base font-bold text-[#111111] transition duration-200 hover:-translate-y-0.5 hover:bg-[#F7F7F7]"
              >
                Take Our Survey
              </a>
            </div>
          </section>

          <WaitlistFooter />
        </div>
      </main>

      <WaitlistFeedbackDialog
        open={feedbackOpen}
        status={status === "success" ? "success" : "error"}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
