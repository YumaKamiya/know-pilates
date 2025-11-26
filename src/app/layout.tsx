import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "know（ノウ） | 静岡市のピラティススタジオ",
  description:
    "静岡市のピラティススタジオ「know（ノウ）」。50代・60代の方も安心して始められる、少人数制のプライベートレッスン。体の不調を根本から改善し、しなやかで美しい姿勢を手に入れませんか？",
  keywords: [
    "ピラティス",
    "静岡市",
    "ピラティススタジオ",
    "50代",
    "60代",
    "姿勢改善",
    "体幹トレーニング",
    "プライベートレッスン",
  ],
  openGraph: {
    title: "know（ノウ） | 静岡市のピラティススタジオ",
    description:
      "静岡市のピラティススタジオ「know（ノウ）」。50代・60代の方も安心して始められる少人数制レッスン。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${notoSerifJP.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
