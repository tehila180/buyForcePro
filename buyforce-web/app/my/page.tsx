'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/PaymentModal';

type GroupMember = {
  group: {
    id: number;
    status: 'open' | 'completed' | 'paid';
    target: number;
    members: any[];
    product: {
      name: string;
      priceGroup: number;
    };
  };
};

export default function MyGroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payingGroupId, setPayingGroupId] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  // ✅ טעינת כל הקבוצות שלי
  async function loadGroups() {
    try {
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await apiFetch('/groups/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroups(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת הקבוצות');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  // ✅ תשלום Mock
  async function handlePay(groupId: number) {
    try {
      setPaying(true);

      await apiFetch(`/groups/${groupId}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('✅ התשלום בוצע בהצלחה!');
      await loadGroups();
    } catch (e: any) {
      alert(e.message || 'שגיאה בתשלום');
    } finally {
      setPaying(false);
      setPayingGroupId(null);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>טוען קבוצות...</p>;
  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>האזור האישי שלי</h1>

      {groups.length === 0 && <p>עדיין לא הצטרפת לקבוצות</p>}

      {groups.map(({ group }) => {
        const percent = Math.min(
          100,
          Math.round((group.members.length / group.target) * 100),
        );

        return (
          <div
            key={group.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              background: '#fff',
            }}
          >
            <h3>{group.product.name}</h3>

            <p>
              👥 חברים: {group.members.length} / {group.target}
            </p>

            {/* Progress bar */}
            <div
              style={{
                background: '#eee',
                borderRadius: 8,
                height: 10,
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  background:
                    group.status === 'paid'
                      ? '#16a34a'
                      : group.status === 'completed'
                      ? '#22c55e'
                      : '#4f46e5',
                }}
              />
            </div>

            {/* ✅ סטטוס */}
            {group.status === 'open' && (
              <p style={{ color: '#555' }}>⏳ ממתין לחברים נוספים</p>
            )}

            {group.status === 'completed' && (
              <button
                onClick={() => setPayingGroupId(group.id)}
                style={{
                  marginTop: 8,
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#16a34a',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💳 שלם ₪1 והצטרף לקבוצה
              </button>
            )}

            {group.status === 'paid' && (
              <p style={{ color: 'green', fontWeight: 'bold' }}>
                ✅ התשלום בוצע
              </p>
            )}
          </div>
        );
      })}

      {/* ✅ Modal תשלום */}
      <PaymentModal
        open={payingGroupId !== null}
        loading={paying}
        onClose={() => setPayingGroupId(null)}
        onPay={() => handlePay(payingGroupId!)}
      />
    </div>
  );
}
