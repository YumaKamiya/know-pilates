import Link from "next/link";
import { studioInfo } from "@/data/content";

export function Footer() {
  return (
    <>
      {/* Floating CTA - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 p-4 bg-white/90 backdrop-blur-sm border-t border-primary-100">
        <Link
          href="#reservation"
          className="flex items-center justify-center w-full min-h-[52px] bg-accent-500 text-white rounded-lg font-semibold text-lg hover:bg-accent-600 transition-colors shadow-lg"
        >
          体験レッスンを予約する
        </Link>
      </div>

      {/* Main Footer */}
      <footer className="bg-primary-900 text-primary-100 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Studio Info */}
            <div>
              <h3 className="font-serif text-2xl text-white mb-4">
                {studioInfo.name}
              </h3>
              <address className="not-italic leading-relaxed text-primary-200">
                <p>{studioInfo.address}</p>
                {studioInfo.phone && (
                  <p className="mt-2">
                    <a
                      href={`tel:${studioInfo.phone.replace(/-/g, "")}`}
                      className="hover:text-white transition-colors"
                    >
                      TEL: {studioInfo.phone}
                    </a>
                  </p>
                )}
                {studioInfo.email && (
                  <p className="mt-1">
                    <a
                      href={`mailto:${studioInfo.email}`}
                      className="hover:text-white transition-colors"
                    >
                      {studioInfo.email}
                    </a>
                  </p>
                )}
              </address>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-semibold text-white mb-4">営業時間</h4>
              <ul className="space-y-1 text-primary-200">
                {studioInfo.hours.map((hour, index) => (
                  <li key={index}>{hour}</li>
                ))}
              </ul>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">リンク</h4>
              <nav className="flex flex-col gap-2 text-primary-200">
                <Link
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  特徴
                </Link>
                <Link
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  料金
                </Link>
                <Link
                  href="#faq"
                  className="hover:text-white transition-colors"
                >
                  よくある質問
                </Link>
                <Link
                  href="#access"
                  className="hover:text-white transition-colors"
                >
                  アクセス
                </Link>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 pt-8 border-t border-primary-800 text-center text-primary-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {studioInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
