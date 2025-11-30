'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

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
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-neutral-100 text-neutral-800',
    };
    const labels: Record<string, string> = {
      confirmed: '確定',
      cancelled: 'キャンセル',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-neutral-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      member: 'bg-blue-100 text-blue-800',
      trial: 'bg-purple-100 text-purple-800',
    };
    const labels: Record<string, string> = {
      member: '会員',
      trial: '体験',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[type] || 'bg-neutral-100'}`}>
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
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
          予約一覧
        </h1>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              inputMode="search"
              placeholder="会員名・メールで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">すべてのステータス</option>
              <option value="confirmed">確定</option>
              <option value="cancelled">キャンセル</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 min-h-[48px] border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">すべての予約タイプ</option>
              <option value="member">会員予約</option>
              <option value="trial">体験予約</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-3 w-full sm:w-auto px-6 py-3 min-h-[48px] bg-primary text-white rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
          >
            検索
          </button>
        </form>

        {/* デスクトップ: テーブル */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">会員名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">メール</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">予約日時</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">ステータス</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">タイプ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">操作</th>
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
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    予約がありません
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-neutral-50">
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
            <div className="bg-white rounded-lg shadow p-6 text-center text-neutral-500">
              読み込み中...
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-neutral-500">
              予約がありません
            </div>
          ) : (
            reservations.map((r) => (
              <div key={r.id} className="bg-white rounded-lg shadow p-4">
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
