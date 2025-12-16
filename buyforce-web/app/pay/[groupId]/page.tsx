'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function PayPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await apiFetch(`/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroup(data);
      setLoading(false);
    }

    load();
  }, [groupId, router]);

  async function handlePayNow() {
    try {
      setPaying(true);
      const res = await apiFetch('/payments/paypal/create', {
        method: 'POST',
        body: JSON.stringify({ groupId: Number(groupId) }),
      });

      window.location.href = res.redirectUrl;
    } catch (e: any) {
      alert(e.message || 'שגיאה בתשלום');
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <p style={{ padding: 24 }}>טוען תשלום...</p>;
  if (!group) return <p style={{ padding: 24 }}>קבוצה לא נמצאה</p>;

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <h1>💳 תשלום קבוצתי</h1>

      <p><strong>מוצר:</strong> {group.product.name}</p>
      <p><strong>מחיר לתשלום:</strong> ₪{group.product.priceGroup}</p>
      <p>חברים בקבוצה: {group.members.length}</p>

      <button
        onClick={handlePayNow}
        disabled={paying}
        style={{
          marginTop: 20,
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          background: paying ? '#999' : '#16a34a',
          color: '#fff',
          fontWeight: 600,
          border: 'none',
          fontSize: 16,
          cursor: paying ? 'default' : 'pointer',
        }}
      >
        {paying ? 'מעביר ל-PayPal...' : '✅ שלם עכשיו'}
      </button>
    </div>
  );
}
