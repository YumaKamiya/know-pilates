import Link from "next/link";
import { SectionTitle } from "@/components/ui";
import { ctaContent } from "@/data/content";

export function Reservation() {
  return (
    <section id="reservation" className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <SectionTitle title={ctaContent.title} subtitle={ctaContent.description} />

        {/* Reservation CTA */}
        <div className="bg-gradient-to-br from-primary-100 to-accent-50 rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-lg mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-primary-800 mb-4">
              体験レッスン
            </h3>
            <p className="text-4xl md:text-5xl font-bold text-accent-600 mb-2">
              3,000
              <span className="text-xl font-normal text-neutral-600">円</span>
            </p>
            <p className="text-neutral-600 mb-8">
              60分のプライベートレッスン（カウンセリング込み）
            </p>

            {/* Phase 1: 仮ボタン - Phase 2で予約システム実装 */}
            <Link
              href="mailto:info@know-pilates.jp?subject=体験レッスンのご予約"
              className="inline-flex items-center justify-center w-full md:w-auto min-h-[56px] px-12 py-4 bg-accent-500 text-white text-xl font-semibold rounded-xl hover:bg-accent-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {ctaContent.buttonText}
            </Link>

            <p className="mt-6 text-sm text-neutral-500">
              ※ 現在メールでのご予約を受け付けております
            </p>
          </div>
        </div>

        {/* Contact alternative */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600 mb-4">
            お電話でのご予約・お問い合わせも承っております
          </p>
          <a
            href="tel:0540000000"
            className="inline-flex items-center gap-2 text-xl text-primary-800 font-semibold hover:text-accent-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            054-000-0000
          </a>
        </div>
      </div>
    </section>
  );
}
