import { SectionTitle } from "@/components/ui";
import { problems } from "@/data/content";

export function Problems() {
  return (
    <section id="problems" className="py-20 md:py-28 bg-primary-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <SectionTitle
          title="こんなお悩みありませんか？"
          subtitle="一つでも当てはまる方は、ぜひピラティスを体験してみてください。"
        />

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm">
          <ul className="space-y-4 md:space-y-5">
            {problems.map((problem, index) => (
              <li key={index} className="flex items-start gap-4">
                {/* Checkbox icon - 24px以上 */}
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span className="text-lg md:text-xl text-neutral-700 leading-relaxed">
                  {problem.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Encouraging message */}
        <p className="text-center mt-8 text-lg text-neutral-600">
          ピラティスなら、これらのお悩みを
          <span className="text-accent-600 font-semibold">根本から改善</span>
          できます。
        </p>
      </div>
    </section>
  );
}
