'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarX2 } from 'lucide-react';

interface Reservation {
  id: string;
  type: 'member' | 'trial';
  status: 'confirmed' | 'cancelled';
  created_at: string;
  cancelled_at: string | null;
  members: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  slots: {
    id: string;
    start_at: string;
    end_at: string;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (type) params.set('type', type);

      const res = await fetch(`/api/admin/reservations?${params}`);
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleCancel = async (id: string) => {
    if (!confirm('この予約をキャンセルしますか？')) return;

    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('キャンセルしました');
        fetchReservations();
      } else {
        const error = await res.json();
        alert(error.error || 'キャンセルに失敗しました');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('キャンセルに失敗しました');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 shadow-sm',
      cancelled: 'bg-gradient-to-r from-neutral-50 to-neutral-100 text-neutral-700 border border-neutral-200 shadow-sm',
    };
    const labels: Record<string, string> = {
      confirmed: '確定',
      cancelled: 'キャンセル',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 shadow-sm'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      member: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm',
      trial: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm',
    };
    const labels: Record<string, string> = {
      member: '会員',
      trial: '体験',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${styles[type] || 'bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 shadow-sm'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'M月d日(E) HH:mm', { locale: ja });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* タイトル */}
        <h1 className="text-neutral-900" style={{ fontSize: 'var(--font-size-heading-1)', lineHeight: 'var(--line-height-heading-1)', fontWeight: '700' }}>
          予約一覧
        </h1>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="bg-gradient-to-br from-white via-primary-50/10 to-white rounded-2xl shadow-md shadow-primary-100/20 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              inputMode="search"
              placeholder="会員名・メールで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
            >
              <option value="">すべてのステータス</option>
              <option value="confirmed">確定</option>
              <option value="cancelled">キャンセル</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-primary-100/50 rounded-xl bg-gradient-to-br from-white to-primary-50/5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-300"
            >
              <option value="">すべての予約タイプ</option>
              <option value="member">会員予約</option>
              <option value="trial">体験予約</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 w-full sm:w-auto px-6 py-3 min-h-[48px] bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-base font-medium transition-all duration-300"
          >
            検索
          </button>
        </form>

        {/* デスクトップ: テーブル */}
        <div className="hidden md:block bg-gradient-to-br from-white via-primary-50/10 to-white rounded-2xl shadow-md shadow-primary-100/20 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-50/30 via-white to-primary-50/30">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-primary-100/30">会員名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-primary-100/30">メール</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-primary-100/30">予約日時</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-primary-100/30">ステータス</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-primary-100/30">タイプ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 border-b border-primary-100/30">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    読み込み中...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="px-4 py-16 text-center">
                      <CalendarX2 className="w-16 h-16 mx-auto text-neutral-300 mb-6" />
                      <p className="text-heading-2 text-neutral-700 mb-3">予約がありません</p>
                      <p className="text-body text-neutral-500 max-w-md mx-auto">
                        検索条件を変更するか、会員からの新しい予約をお待ちください
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="border-t border-primary-100/30 hover:bg-primary-50/20 transition-colors duration-300">
                    <td className="px-4 py-4 text-base">
                      {r.members?.name || '体験予約'}
                    </td>
                    <td className="px-4 py-4 text-base">
                      {r.members?.email || '-'}
                    </td>
                    <td className="px-4 py-4 text-base">
                      {formatDateTime(r.slots.start_at)}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="px-4 py-4">
                      {getTypeBadge(r.type)}
                    </td>
                    <td className="px-4 py-4">
                      {r.status === 'confirmed' && (
                        <Button
                          variant="destructive"
                          size="default"
                          onClick={() => handleCancel(r.id)}
                          className="px-3 py-2 text-sm"
                        >
                          キャンセル
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* モバイル: カード */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="bg-gradient-to-br from-white via-primary-50/10 to-white rounded-2xl shadow-md shadow-primary-100/20 p-6 text-center text-neutral-500">
              読み込み中...
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-gradient-to-br from-white via-primary-50/10 to-white rounded-2xl shadow-md shadow-primary-100/20 p-8 text-center">
              <CalendarX2 className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
              <p className="text-heading-2 text-neutral-700 mb-2">予約がありません</p>
              <p className="text-body text-neutral-500">
                検索条件を変更するか、会員からの新しい予約をお待ちください
              </p>
            </div>
          ) : (
            reservations.map((r) => (
              <div key={r.id} className="bg-gradient-to-br from-white via-primary-50/10 to-white rounded-2xl shadow-md shadow-primary-100/20 p-5">
                <div className="space-y-3">
                  <div className="font-medium text-lg">
                    {r.members?.name || '体験予約'}
                  </div>
                  <div className="text-base text-neutral-600">
                    {r.members?.email || '-'}
                  </div>
                  <div className="text-base">
                    {formatDateTime(r.slots.start_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(r.status)}
                    {getTypeBadge(r.type)}
                  </div>
                  {r.status === 'confirmed' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancel(r.id)}
                      className="w-full"
                    >
                      キャンセル
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
