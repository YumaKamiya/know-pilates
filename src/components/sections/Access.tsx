import { SectionTitle } from "@/components/ui";
import { studioInfo } from "@/data/content";

export function Access() {
  return (
    <section id="access" className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <SectionTitle
          title="アクセス"
          subtitle="静岡市中心部、駅から徒歩圏内の好立地です。"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Map */}
          <div className="aspect-square md:aspect-auto md:h-full min-h-[300px] rounded-2xl overflow-hidden bg-primary-100">
            {studioInfo.mapUrl ? (
              <iframe
                src={studioInfo.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="スタジオ所在地"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-primary-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-primary-600">地図を読み込み中...</p>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <h3 className="font-serif text-2xl font-semibold text-primary-800 mb-6">
              {studioInfo.name}
            </h3>

            <dl className="space-y-4">
              {/* Address */}
              <div>
                <dt className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
                  所在地
                </dt>
                <dd className="text-neutral-700 leading-relaxed">
                  {studioInfo.address}
                </dd>
              </div>

              {/* Phone */}
              {studioInfo.phone && (
                <div>
                  <dt className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
                    電話番号
                  </dt>
                  <dd>
                    <a
                      href={`tel:${studioInfo.phone.replace(/-/g, "")}`}
                      className="text-neutral-700 hover:text-accent-600 transition-colors"
                    >
                      {studioInfo.phone}
                    </a>
                  </dd>
                </div>
              )}

              {/* Email */}
              {studioInfo.email && (
                <div>
                  <dt className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
                    メール
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${studioInfo.email}`}
                      className="text-neutral-700 hover:text-accent-600 transition-colors"
                    >
                      {studioInfo.email}
                    </a>
                  </dd>
                </div>
              )}

              {/* Hours */}
              <div>
                <dt className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
                  営業時間
                </dt>
                <dd className="text-neutral-700">
                  <ul className="space-y-1">
                    {studioInfo.hours.map((hour, index) => (
                      <li key={index}>{hour}</li>
                    ))}
                  </ul>
                </dd>
              </div>

              {/* Parking */}
              <div>
                <dt className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
                  駐車場
                </dt>
                <dd className="text-neutral-700">
                  専用駐車場2台分あり（要予約）
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
