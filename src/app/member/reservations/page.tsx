'use client';

import { useEffect, useState } from 'react';
import MemberLayout from '@/components/member/MemberLayout';

interface Reservation {
  id: string;
  status: string;
  created_at: string;
  cancelled_at: string | null;
  slots: {
    id: string;
    start_at: string;
    end_at: string;
  };
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReservations = async () => {
    const res = await fetch('/api/member/reservations');
    if (res.ok) {
      const data = await res.json();
      setReservations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId: string) => {
    if (!confirm('この予約をキャンセルしますか？\nチケットは返却されます。')) {
      return;
    }

    setCancelling(reservationId);
    setMessage(null);

    try {
      const res = await fetch(`/api/member/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'キャンセルに失敗しました');
      }

      setMessage({ type: 'success', text: 'キャンセルしました。チケットが返却されました。' });
      fetchReservations();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'キャンセルに失敗しました',
      });
    } finally {
      setCancelling(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = (reservation: Reservation) => {
    if (reservation.status !== 'confirmed') return false;

    const startAt = new Date(reservation.slots.start_at);
    const deadline = new Date(startAt.getTime() - 2 * 60 * 60 * 1000); // 2時間前
    return new Date() < deadline;
  };

  const isPast = (reservation: Reservation) => {
    return new Date(reservation.slots.start_at) < new Date();
  };

  const getStatusBadge = (reservation: Reservation) => {
    if (reservation.status === 'cancelled') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
          キャンセル済み
        </span>
      );
    }
    if (isPast(reservation)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          完了
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        予約済み
      </span>
    );
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-500">読み込み中...</div>
        </div>
      </MemberLayout>
    );
  }

  const upcomingReservations = reservations.filter(
    (r) => r.status === 'confirmed' && !isPast(r)
  );
  const pastReservations = reservations.filter(
    (r) => r.status === 'cancelled' || isPast(r)
  );

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-neutral-900 mb-6" style={{ fontSize: 'var(--font-size-heading-1)', lineHeight: 'var(--line-height-heading-1)', fontWeight: '700' }}>あなたの予約履歴</h1>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 今後の予約 */}
        <section className="mb-8">
          <h2 className="text-neutral-900 mb-4" style={{ fontSize: 'var(--font-size-heading-3)', lineHeight: 'var(--line-height-heading-3)', fontWeight: '600' }}>ご予約いただいているレッスン</h2>
          <div className="bg-white rounded-lg shadow">
            {upcomingReservations.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                予約されたレッスンはまだありません
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-900 font-medium" style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height-body)' }}>
                          {formatDateTime(reservation.slots.start_at)}
                        </p>
                        <p className="text-neutral-500" style={{ fontSize: 'var(--font-size-caption)', lineHeight: 'var(--line-height-caption)' }}>
                          {new Date(reservation.slots.start_at).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(reservation.slots.end_at).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(reservation)}
                        {canCancel(reservation) && (
                          <button
                            onClick={() => handleCancel(reservation.id)}
                            disabled={cancelling === reservation.id}
                            className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50" style={{ fontSize: 'var(--font-size-caption)', lineHeight: 'var(--line-height-caption)' }}
                          >
                            {cancelling === reservation.id ? 'キャンセル中...' : 'キャンセル'}
                          </button>
                        )}
                        {!canCancel(reservation) && reservation.status === 'confirmed' && (
                          <span className="text-neutral-400" style={{ fontSize: 'var(--font-size-caption)' }}>
                            キャンセル期限切れ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 過去の予約 */}
        <section>
          <h2 className="text-neutral-900 mb-4" style={{ fontSize: 'var(--font-size-heading-3)', lineHeight: 'var(--line-height-heading-3)', fontWeight: '600' }}>これまでのレッスン</h2>
          <div className="bg-white rounded-lg shadow">
            {pastReservations.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-500">
                レッスン履歴はまだありません
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {pastReservations.map((reservation) => (
                  <div key={reservation.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-900 font-medium" style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height-body)' }}>
                          {formatDateTime(reservation.slots.start_at)}
                        </p>
                        <p className="text-neutral-500" style={{ fontSize: 'var(--font-size-caption)', lineHeight: 'var(--line-height-caption)' }}>
                          {new Date(reservation.slots.start_at).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(reservation.slots.end_at).toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {getStatusBadge(reservation)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </MemberLayout>
  );
}
