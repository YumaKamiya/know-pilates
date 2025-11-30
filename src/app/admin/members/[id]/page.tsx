'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  note: string | null;
  created_at: string;
  member_plans: Array<{
    id: string;
    status: string;
    started_at: string;
    plans: {
      id: string;
      name: string;
      tickets_per_month: number;
    };
  }>;
  ticket_balance: Array<{ balance: number }>;
}

interface Plan {
  id: string;
  name: string;
  tickets_per_month: number;
  is_active: boolean;
}

interface TicketLog {
  id: string;
  type: string;
  amount: number;
  reason: string | null;
  created_at: string;
}

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ticketLogs, setTicketLogs] = useState<TicketLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    note: '',
  });
  const [saving, setSaving] = useState(false);

  // チケット付与モーダル
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    type: 'grant',
    amount: 1,
    reason: '',
  });

  // プラン付与モーダル
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/admin/members/${id}`);
      if (!res.ok) {
        console.error('Failed to fetch member');
        return;
      }
      const data = await res.json();
      setMember(data);
      setEditForm({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        status: data.status,
        note: data.note || '',
      });
    } catch (error) {
      console.error('Failed to fetch member:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      setPlans(data.filter((p: Plan) => p.is_active));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchTicketLogs = async () => {
    try {
      const res = await fetch(`/api/admin/tickets?member_id=${id}`);
      const data = await res.json();
      setTicketLogs(data);
    } catch (error) {
      console.error('Failed to fetch ticket logs:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchMember(), fetchPlans(), fetchTicketLogs()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });

      if (res.ok) {
        setEditing(false);
        fetchMember();
      } else {
        const error = await res.json();
        alert(error.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleGrantTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: id,
          ...ticketForm,
        }),
      });

      if (res.ok) {
        setShowTicketModal(false);
        setTicketForm({ type: 'grant', amount: 1, reason: '' });
        fetchMember();
        fetchTicketLogs();
      } else {
        const error = await res.json();
        alert(error.error || 'チケット操作に失敗しました');
      }
    } catch (error) {
      console.error('Failed to grant tickets:', error);
      alert('チケット操作に失敗しました');
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    try {
      const res = await fetch('/api/admin/member-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: id,
          plan_id: selectedPlanId,
        }),
      });

      if (res.ok) {
        setShowPlanModal(false);
        setSelectedPlanId('');
        fetchMember();
      } else {
        const error = await res.json();
        alert(error.error || 'プラン付与に失敗しました');
      }
    } catch (error) {
      console.error('Failed to assign plan:', error);
      alert('プラン付与に失敗しました');
    }
  };

  const getTicketTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      grant: '付与',
      consume: '消費',
      refund: '返却',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      withdrawn: 'bg-neutral-100 text-neutral-800',
    };
    const labels: Record<string, string> = {
      active: '有効',
      suspended: '休会',
      withdrawn: '退会',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-neutral-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-neutral-500">読み込み中...</div>
      </AdminLayout>
    );
  }

  if (!member) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-neutral-500">会員が見つかりません</div>
      </AdminLayout>
    );
  }

  const balance = member.ticket_balance?.[0]?.balance || 0;
  const activePlan = member.member_plans?.find((mp) => mp.status === 'active');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/members')}
              className="text-neutral-500 hover:text-neutral-700"
            >
              &larr; 戻る
            </button>
            <h1 className="text-2xl font-bold text-neutral-900">{member.name}</h1>
            {getStatusBadge(member.status)}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              チケット操作
            </button>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 min-h-[48px] bg-accent-500 text-white border-2 border-accent-500 hover:bg-accent-600 rounded-lg font-medium"
            >
              プラン付与
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本情報 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">基本情報</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-primary hover:underline text-sm"
                >
                  編集
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">名前</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">メール</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">電話番号</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">ステータス</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                  >
                    <option value="active">有効</option>
                    <option value="suspended">休会</option>
                    <option value="withdrawn">退会</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">備考</label>
                  <textarea
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-md"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <div className="flex">
                  <dt className="w-24 text-sm text-neutral-500">メール</dt>
                  <dd className="text-sm text-neutral-900">{member.email}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-sm text-neutral-500">電話番号</dt>
                  <dd className="text-sm text-neutral-900">{member.phone || '-'}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-sm text-neutral-500">プラン</dt>
                  <dd className="text-sm text-neutral-900">
                    {activePlan ? activePlan.plans.name : '未設定'}
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-sm text-neutral-500">登録日</dt>
                  <dd className="text-sm text-neutral-900">
                    {format(new Date(member.created_at), 'yyyy/MM/dd', { locale: ja })}
                  </dd>
                </div>
                {member.note && (
                  <div className="flex">
                    <dt className="w-24 text-sm text-neutral-500">備考</dt>
                    <dd className="text-sm text-neutral-900 whitespace-pre-wrap">{member.note}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {/* チケット残高 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">チケット残高</h2>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{balance}</div>
              <div className="text-neutral-500 mt-1">枚</div>
            </div>
          </div>
        </div>

        {/* チケット履歴 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">チケット履歴</h2>
          {ticketLogs.length === 0 ? (
            <div className="text-center py-4 text-neutral-500">履歴がありません</div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">日時</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">種別</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">枚数</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">理由</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {ticketLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-sm text-neutral-500">
                      {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </td>
                    <td className="px-4 py-2 text-sm">{getTicketTypeLabel(log.type)}</td>
                    <td className="px-4 py-2 text-sm font-medium">
                      <span className={log.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                        {log.amount > 0 ? '+' : ''}
                        {log.amount}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-neutral-500">{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* チケット操作モーダル */}
        {showTicketModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">チケット操作</h2>
              <form onSubmit={handleGrantTickets} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">操作種別</label>
                  <select
                    value={ticketForm.type}
                    onChange={(e) => setTicketForm({ ...ticketForm, type: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                  >
                    <option value="grant">付与</option>
                    <option value="consume">消費</option>
                    <option value="refund">返却</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">枚数</label>
                  <input
                    type="number"
                    value={ticketForm.amount}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, amount: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">理由</label>
                  <input
                    type="text"
                    value={ticketForm.reason}
                    onChange={(e) => setTicketForm({ ...ticketForm, reason: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    placeholder="例: 月間付与、キャンセル返却など"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-md"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    実行
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* プラン付与モーダル */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">プラン付与</h2>
              <form onSubmit={handleAssignPlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">プラン</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    required
                  >
                    <option value="">選択してください</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}（月{plan.tickets_per_month}枚）
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-md"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    付与
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
