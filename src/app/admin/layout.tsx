import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理画面 | know（ノウ）ピラティス',
  description: 'know（ノウ）ピラティススタジオ 管理画面',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
