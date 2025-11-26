import { SectionTitle } from "@/components/ui";
import { instructor, usePlaceholders } from "@/data/content";

export function Instructor() {
  return (
    <section id="instructor" className="py-20 md:py-28 bg-primary-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <SectionTitle
          title="インストラクター紹介"
          subtitle="あなたの体と向き合い、最適なレッスンをご提案します。"
        />

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {usePlaceholders ? (
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-accent-600 font-medium mb-2">
                {instructor.role}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-primary-800 mb-4">
                {instructor.name}
              </h3>

              <p className="text-neutral-600 leading-relaxed mb-6">
                {instructor.bio}
              </p>

              {/* Qualifications */}
              <div>
                <h4 className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-3">
                  保有資格
                </h4>
                <ul className="space-y-2">
                  {instructor.qualifications.map((qual, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-neutral-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                      {qual}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
