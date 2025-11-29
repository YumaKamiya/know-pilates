'use client';

import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  member_plans: Array<{
    id: string;
    status: string;
    plans: {
      name: string;
    };
  }>;
  ticket_balance: Array<{ balance: number }>;
}

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  const activePlan = member.member_plans?.find((mp) => mp.status === 'active');
  const balance = member.ticket_balance?.[0]?.balance || 0;

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
    <div className="bg-white rounded-lg shadow p-4">
      {/* ヘッダー: 名前とステータス */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 truncate">{member.name}</h3>
          <p className="text-sm text-neutral-500 truncate">{member.email}</p>
          {member.phone && (
            <p className="text-sm text-neutral-500">{member.phone}</p>
          )}
        </div>
        <div className="ml-2 flex-shrink-0">
          {getStatusBadge(member.status)}
        </div>
      </div>

      {/* 情報グリッド */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 mb-1">プラン</div>
          <div className="text-sm font-medium text-primary-700">
            {activePlan ? activePlan.plans.name : '未設定'}
          </div>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="text-xs text-neutral-500 mb-1">チケット残</div>
          <div className="text-sm font-bold text-neutral-900">{balance}枚</div>
        </div>
      </div>

      {/* 詳細ボタン */}
      <Link
        href={`/admin/members/${member.id}`}
        className="block w-full px-4 py-3 min-h-[44px] bg-primary-100 text-primary-700 rounded-lg font-medium text-center hover:bg-primary-200 active:bg-primary-300 transition-colors"
      >
        詳細を見る
      </Link>
    </div>
  );
}
