'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Group = {
  id: number;
  status: 'open' | 'completed' | 'paid';
  target: number;
  createdAt: string;
  product: {
    name: string;
  };
  members: {
    user: {
      email: string;
      username: string;
    };
  }[];
};

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiFetch('/admin/groups');
      setGroups(data);
    } catch (e: any) {
      alert(e.message || 'שגיאה בטעינת קבוצות');
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: number, status: string) {
    await apiFetch(`/admin/groups/${id}/status/${status}`, {
      method: 'PUT',
    });
    await load();
  }

  async function deleteGroup(id: number) {
    if (!confirm('למחוק קבוצה זו?')) return;
    await apiFetch(`/admin/groups/${id}`, { method: 'DELETE' });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p style={{ padding: 24 }}>טוען קבוצות...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>👥 ניהול קבוצות</h1>

      {groups.length === 0 && <p>אין קבוצות</p>}

      {groups.map(g => (
        <div
          key={g.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            background: '#fff',
          }}
        >
          <h3>{g.product.name}</h3>

          <p>
            👥 {g.members.length}/{g.target}
          </p>

          <p>
            סטטוס:{' '}
            <strong
              style={{
                color:
                  g.status === 'paid'
                    ? 'green'
                    : g.status === 'completed'
                    ? 'orange'
                    : '#555',
              }}
            >
              {g.status}
            </strong>
          </p>

          {/* שינוי סטטוס */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {['open', 'completed', 'paid'].map(s => (
              <button
                key={s}
                disabled={g.status === s}
                onClick={() => changeStatus(g.id, s)}
              >
                {s}
              </button>
            ))}

            <button
              onClick={() => deleteGroup(g.id)}
              style={{ color: 'red', marginLeft: 'auto' }}
            >
              מחיקה
            </button>
          </div>

          {/* משתתפים */}
          <details style={{ marginTop: 10 }}>
            <summary>משתתפים</summary>
            <ul>
              {g.members.map((m, i) => (
                <li key={i}>
                  {m.user.username || m.user.email}
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}
    </div>
  );
}
