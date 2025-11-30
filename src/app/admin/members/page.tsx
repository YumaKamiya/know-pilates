'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import MemberCard from '@/components/admin/MemberCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Users } from 'lucide-react';

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
    plans: {
      name: string;
    };
  }>;
  ticket_balance: Array<{ balance: number }>;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
    password: '',
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/members?${params}`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', phone: '', note: '', password: '' });
        fetchMembers();
      } else {
        const error = await res.json();
        alert(error.error || '作成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to create member:', error);
      alert('作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);

    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.emailSent) {
          setInviteResult({ success: true, message: '招待メールを送信しました' });
        } else {
          setInviteResult({
            success: true,
            message: `招待を作成しましたが、メール送信に失敗しました: ${data.emailError || '不明なエラー'}`,
          });
        }
        setInviteEmail('');
      } else {
        setInviteResult({ success: false, message: data.error || '招待に失敗しました' });
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      setInviteResult({ success: false, message: '招待に失敗しました' });
    } finally {
      setInviting(false);
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">会員管理</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              onClick={() => {
                setShowInviteModal(true);
                setInviteResult(null);
              }}
              className="flex-1 sm:flex-none"
            >
              招待する
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex-1 sm:flex-none"
            >
              + 登録
            </Button>
          </div>
        </div>

        {/* 検索 */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="search"
              placeholder="名前またはメールで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 min-h-[48px] border border-neutral-300 rounded-lg text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 min-h-[48px] bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 active:bg-neutral-300 font-medium"
            >
              検索
            </button>
          </div>
        </form>

        {/* 会員一覧 */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-neutral-500">
            読み込み中...
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="px-4 py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500 text-lg mb-2">会員がまだいません</p>
              <p className="text-neutral-400 text-sm mb-4">
                「招待する」または「+ 登録」から最初の会員を追加しましょう
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* モバイル: カードリスト */}
            <div className="block md:hidden space-y-4">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>

            {/* デスクトップ: テーブル */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">名前</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">メール</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">プラン</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">チケット残</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">ステータス</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {members.map((member) => {
                    const activePlan = member.member_plans?.find((mp) => mp.status === 'active');
                    const balance = member.ticket_balance?.[0]?.balance || 0;
                    return (
                      <tr key={member.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-neutral-900">{member.name}</div>
                          {member.phone && (
                            <div className="text-sm text-neutral-500">{member.phone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-500">{member.email}</td>
                        <td className="px-4 py-3 text-sm">
                          {activePlan ? (
                            <span className="text-primary-600">{activePlan.plans.name}</span>
                          ) : (
                            <span className="text-neutral-400">未設定</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{balance}枚</td>
                        <td className="px-4 py-3">{getStatusBadge(member.status)}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/members/${member.id}`}
                            className="inline-flex items-center min-h-[44px] px-3 py-2 text-primary-600 hover:underline text-sm"
                          >
                            詳細
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 作成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">会員を登録</h2>
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">電話番号</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    パスワード（ログイン用）
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    placeholder="設定しない場合は空欄"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    会員がログインする場合は設定してください
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700">備考</label>
                  <textarea
                    value={createForm.note}
                    onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creating ? '登録中...' : '登録'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 招待モーダル */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">会員を招待</h2>
              <p className="text-sm text-neutral-600 mb-4">
                メールアドレスを入力して招待メールを送信します。
                受信した会員がリンクをクリックして登録を完了できます。
              </p>

              {inviteResult && (
                <div
                  className={`mb-4 px-4 py-3 rounded text-sm ${
                    inviteResult.success
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {inviteResult.message}
                </div>
              )}

              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md"
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1"
                  >
                    閉じる
                  </Button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 disabled:opacity-50"
                  >
                    {inviting ? '送信中...' : '招待メールを送信'}
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
