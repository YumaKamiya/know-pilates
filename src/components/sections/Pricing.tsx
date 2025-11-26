import Link from "next/link";
import { SectionTitle, Card } from "@/components/ui";
import { pricingPlans } from "@/data/content";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <SectionTitle
          title="料金プラン"
          subtitle="ご自身のペースに合わせてお選びください。"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={cn(
                "relative flex flex-col",
                plan.isPopular && "ring-2 ring-accent-500 md:-translate-y-2"
              )}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-sm font-semibold rounded-full">
                  おすすめ
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-semibold text-primary-800 mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-bold text-primary-900">
                    {plan.price}
                  </span>
                  <span className="text-lg text-neutral-600">{plan.unit}</span>
                </div>
                <p className="mt-3 text-neutral-600">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center mt-0.5">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="#reservation"
                className={cn(
                  "w-full min-h-[48px] flex items-center justify-center rounded-lg font-semibold transition-colors",
                  plan.isPopular
                    ? "bg-accent-500 text-white hover:bg-accent-600"
                    : "bg-primary-100 text-primary-800 hover:bg-primary-200"
                )}
              >
                {plan.isPopular ? "体験レッスンを予約" : "詳細を見る"}
              </Link>
            </Card>
          ))}
        </div>

        {/* Note */}
        <p className="text-center mt-8 text-neutral-500 text-sm">
          ※ 料金は全て税込です。入会金はいただいておりません。
        </p>
      </div>
    </section>
  );
}
