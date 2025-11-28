'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Plan {
  id: string;
  name: string;
  tickets_per_month: number;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tickets_per_month: 4,
    price: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      price: formData.price ? parseInt(formData.price) : null,
      ...(editingPlan && { id: editingPlan.id }),
    };

    try {
      const res = await fetch('/api/admin/plans', {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setEditingPlan(null);
        setFormData({ name: '', tickets_per_month: 4, price: '' });
        fetchPlans();
      } else {
        const error = await res.json();
        alert(error.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      tickets_per_month: plan.tickets_per_month,
      price: plan.price?.toString() || '',
    });
    setShowCreateModal(true);
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, is_active: !plan.is_active }),
      });

      if (res.ok) {
        fetchPlans();
      }
    } catch (error) {
      console.error('Failed to toggle plan:', error);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingPlan(null);
    setFormData({ name: '', tickets_per_month: 4, price: '' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">プラン管理</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            + プランを作成
          </button>
        </div>

        {/* プラン一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">読み込み中...</div>
          ) : plans.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              プランが登録されていません
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow p-6 ${
                  !plan.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      plan.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.is_active ? '有効' : '無効'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>月間チケット数</span>
                    <span className="font-medium text-gray-900">{plan.tickets_per_month}枚</span>
                  </div>
                  {plan.price && (
                    <div className="flex justify-between">
                      <span>月額料金</span>
                      <span className="font-medium text-gray-900">
                        {plan.price.toLocaleString()}円
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    {plan.is_active ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded"
                  >
                    編集
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 作成/編集モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">
                {editingPlan ? 'プランを編集' : 'プランを作成'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    プラン名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 月4回プラン"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    月間チケット数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.tickets_per_month}
                    onChange={(e) =>
                      setFormData({ ...formData, tickets_per_month: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">月額料金（円）</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="例: 15000"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
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
