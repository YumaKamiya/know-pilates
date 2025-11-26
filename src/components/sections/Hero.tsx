import Link from "next/link";
import { heroContent } from "@/data/content";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20"
    >
      {/* Background - Placeholder gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        {/* Catchphrase */}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-900 leading-tight mb-6 whitespace-pre-line">
          {heroContent.catchphrase}
        </h1>

        {/* Subcopy */}
        <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed mb-10 whitespace-pre-line max-w-2xl mx-auto">
          {heroContent.subcopy}
        </p>

        {/* CTA Button */}
        <Link
          href={heroContent.ctaHref}
          className="inline-flex items-center justify-center min-h-[56px] px-10 py-4 bg-accent-500 text-white text-xl font-semibold rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {heroContent.ctaText}
        </Link>

        {/* Trust signal */}
        <p className="mt-8 text-neutral-500">
          初回体験 3,000円 | 50代・60代の方も安心
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
