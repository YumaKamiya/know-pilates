import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-primary-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl md:text-3xl font-semibold text-primary-800 hover:text-primary-700 transition-colors"
          >
            know
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-neutral-600 hover:text-primary-700 transition-colors"
            >
              特徴
            </Link>
            <Link
              href="#pricing"
              className="text-neutral-600 hover:text-primary-700 transition-colors"
            >
              料金
            </Link>
            <Link
              href="#instructor"
              className="text-neutral-600 hover:text-primary-700 transition-colors"
            >
              インストラクター
            </Link>
            <Link
              href="#access"
              className="text-neutral-600 hover:text-primary-700 transition-colors"
            >
              アクセス
            </Link>
            <Link
              href="#reservation"
              className="inline-flex items-center justify-center min-h-[44px] px-6 bg-accent-500 text-white rounded-lg font-semibold hover:bg-accent-600 transition-colors"
            >
              体験予約
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
