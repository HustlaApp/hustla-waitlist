import Link from "next/link";
import Image from "next/image";
import { InteractiveWarpGrid } from "../components/InteractiveWarpGrid";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFFFF]">
      <InteractiveWarpGrid />

      <header className="absolute left-1/2 top-6 z-20 -translate-x-1/2 sm:top-7">
        <Image
          src="/logo-wordmark.png"
          alt="hustla"
          width={182}
          height={62}
          priority
          className="h-auto w-[130px] object-contain sm:w-[182px]"
          style={{ height: "auto" }}
        />
      </header>

      <main className="absolute inset-0 z-10 flex items-center justify-center px-6 pb-16 pt-24 sm:px-10 sm:pb-20 sm:pt-28">
        <section className="mx-auto max-w-[980px] text-center">
          <p className="[font-family:var(--font-inter-tight)] text-[18px] font-medium leading-tight tracking-[-0.01em] text-[#666666] sm:text-[30px]">
            Find Skilled Professionals Near You.
          </p>
          <h1 className="mt-4 [font-family:var(--font-display)] text-[30px] font-bold leading-[1.02] tracking-[-0.03em] text-[#111111] sm:mt-4 sm:text-[42px] lg:text-[60px]">
            Connect with verified service providers ready to deliver quality
            work, quickly, reliably, and securely.
          </h1>
          <Link
            href="/waitlist-form"
            prefetch={false}
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#FF4F00] px-9 py-3 [font-family:var(--font-inter-tight)] text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(255,79,0,0.2)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,79,0,0.24)] sm:mt-9"
          >
            Join Our Waitlist
          </Link>
        </section>
      </main>
    </div>
  );
}
