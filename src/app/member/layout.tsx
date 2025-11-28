import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '会員ページ | know（ノウ）ピラティス',
  description: 'know（ノウ）ピラティススタジオ 会員専用ページ',
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
