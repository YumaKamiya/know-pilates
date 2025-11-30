import { createClient } from '@/lib/supabase/server';
import AdminLayout from '@/components/admin/AdminLayout';
import { Users, ClipboardList, Calendar, CreditCard } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 統計情報を取得
  const [
    { count: memberCount },
    { count: reservationCount },
    { count: slotCount },
  ] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
    supabase
      .from('slots')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available')
      .gte('start_at', new Date().toISOString()),
  ]);

  const stats = [
    { name: '登録会員数', value: memberCount || 0, icon: Users },
    { name: '確定予約数', value: reservationCount || 0, icon: ClipboardList },
    { name: '空き枠数', value: slotCount || 0, icon: Calendar },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-neutral-900" style={{ fontSize: 'var(--font-size-heading-1)', lineHeight: 'var(--line-height-heading-1)', fontWeight: '700' }}>ダッシュボード</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-3xl font-semibold text-neutral-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/slots"
              className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Calendar className="w-6 h-6 text-primary-600 mb-2" />
              <div className="font-medium">予約枠を作成</div>
              <div className="text-sm text-neutral-500">新しい予約枠を追加</div>
            </a>
            <a
              href="/admin/members"
              className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Users className="w-6 h-6 text-primary-600 mb-2" />
              <div className="font-medium">会員を登録</div>
              <div className="text-sm text-neutral-500">新規会員を追加</div>
            </a>
            <a
              href="/admin/reservations"
              className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ClipboardList className="w-6 h-6 text-primary-600 mb-2" />
              <div className="font-medium">予約を確認</div>
              <div className="text-sm text-neutral-500">予約一覧を表示</div>
            </a>
            <a
              href="/admin/plans"
              className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <CreditCard className="w-6 h-6 text-primary-600 mb-2" />
              <div className="font-medium">プランを管理</div>
              <div className="text-sm text-neutral-500">料金プランを設定</div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
