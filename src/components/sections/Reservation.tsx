import { SectionTitle } from "@/components/ui";
import { ReservationForm } from "@/components/reservation";
import { ctaContent } from "@/data/content";

export function Reservation() {
  return (
    <section id="reservation" className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <SectionTitle title={ctaContent.title} subtitle={ctaContent.description} />

        {/* Reservation Form */}
        <div className="bg-gradient-to-br from-primary-100 to-accent-50 rounded-2xl p-6 md:p-12">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-primary-800 mb-2">
                体験レッスン予約
              </h3>
              <p className="text-accent-600 font-bold text-xl">
                3,000円 <span className="text-sm font-normal text-neutral-600">（50分）</span>
              </p>
            </div>
            <ReservationForm />
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
