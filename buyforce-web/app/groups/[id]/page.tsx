'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import PaymentModal from '@/components/PaymentModal';

// ---------- Types ----------

type Member = {
  id: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
};

type Group = {
  id: number;
  status: 'open' | 'completed' | 'paid';
  target: number;
  members: Member[];
  product: {
    id: number;
    name: string;
    priceRegular: number;
    priceGroup: number;
  };
};

// ---------- Helpers ----------

// לקרוא טוקן מה־localStorage בצורה בטוחה ל-Next
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// להוציא userId מתוך ה-JWT (sub)
function getCurrentUserId() {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub as string;
  } catch {
    return null;
  }
}

// ---------- Page ----------

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // למודל תשלום
  const [payingGroupId, setPayingGroupId] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  const token = getToken();
  const currentUserId = getCurrentUserId();

  // טעינת קבוצה
  async function loadGroup() {
    try {
      setError(null);
      setLoading(true);

      if (!token) {
        setError('כדי לצפות בדף הקבוצה עליך להתחבר למערכת.');
        setGroup(null);
        return;
      }

      const data = await apiFetch(`/groups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroup(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת הקבוצה');
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadGroup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // האם המשתמש הנוכחי חבר בקבוצה
  const isMember = group
    ? group.members.some((m) => m.user.id === currentUserId)
    : false;

  // הצטרפות לקבוצה
  async function handleJoin() {
    if (!group) return;

    if (!token) {
      alert('כדי להצטרף לקבוצה עליך להתחבר או להירשם.');
      return; // לא שולחים אוטומטית ללוגין לפי מה שביקשת
    }

    if (isMember) {
      alert('את כבר מצטרפת לקבוצה הזו 🙂');
      return;
    }

    try {
      await apiFetch(`/groups/${group.id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('הצטרפת לקבוצה!');
      await loadGroup();
    } catch (err: any) {
      alert(err.message || 'שגיאה בהצטרפות לקבוצה');
    }
  }

  // תשלום Mock (₪1) – דרך ה־Modal
  async function handlePay(groupId: number) {
    try {
      setPaying(true);

      if (!token) {
        alert('כדי לשלם עליך להתחבר למערכת.');
        return;
      }

      await apiFetch(`/groups/${groupId}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('✅ התשלום בוצע בהצלחה!');
      setPayingGroupId(null);
      await loadGroup();
    } catch (err: any) {
      alert(err.message || 'שגיאה בתשלום');
    } finally {
      setPaying(false);
    }
  }

  // ---------- Render ----------

  if (loading) {
    return <p style={{ padding: 24 }}>טוען קבוצה...</p>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>
        {!token && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: 'none',
                background: '#4f46e5',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              התחברות
            </button>
            <button
              onClick={() => router.push('/register')}
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid #4f46e5',
                background: '#fff',
                color: '#4f46e5',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              הרשמה
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!group) {
    return <p style={{ padding: 24 }}>הקבוצה לא נמצאה</p>;
  }

  const percent = Math.min(
    100,
    Math.round((group.members.length / group.target) * 100),
  );

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      {/* כותרת + מוצר */}
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>
        קבוצה למוצר: {group.product.name}
      </h1>

      <p style={{ marginBottom: 4 }}>
        מחיר קבוצתי: <strong>₪{group.product.priceGroup}</strong>
      </p>
      <p style={{ marginBottom: 16 }}>
        מחיר רגיל: <span style={{ textDecoration: 'line-through' }}>₪{group.product.priceRegular}</span>
      </p>

      {/* התקדמות */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: '#fff',
        }}
      >
        <p>
          👥 חברים: {group.members.length} / {group.target}
        </p>

        <div
          style={{
            background: '#eee',
            height: 10,
            borderRadius: 999,
            overflow: 'hidden',
            margin: '8px 0 4px',
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

        <p style={{ fontSize: 14, color: '#555' }}>
          סטטוס: {group.status === 'open'
            ? 'פתוחה'
            : group.status === 'completed'
            ? 'הושלם – מחכה לתשלום'
            : 'שולמה'}
        </p>
      </div>

      {/* כפתורי פעולה */}
      <div style={{ marginBottom: 24 }}>
        {group.status === 'open' && (
          <>
            {isMember ? (
              <p style={{ color: 'green', fontWeight: 600 }}>
                ✅ את כבר מצטרפת לקבוצה הזו. מחכים לעוד חברים...
              </p>
            ) : (
              <button
                onClick={handleJoin}
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#4f46e5',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                הצטרפות לקבוצה (דמי השתתפות ₪1)
              </button>
            )}
          </>
        )}

        {group.status === 'completed' && (
          <>
            {isMember ? (
              <button
                onClick={() => setPayingGroupId(group.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#16a34a',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                💳 המשך לתשלום
              </button>
            ) : (
              <p style={{ color: '#555' }}>
                הקבוצה כבר מלאה. לא ניתן להצטרף.
              </p>
            )}
          </>
        )}

        {group.status === 'paid' && isMember && (
          <p style={{ color: 'green', fontWeight: 600, marginTop: 8 }}>
            ✅ התשלום של הקבוצה הושלם. תודה שהצטרפת!
          </p>
        )}
      </div>

      {/* רשימת משתתפים */}
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 16,
          background: '#fff',
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>משתתפים בקבוצה</h2>

        {group.members.length === 0 ? (
          <p style={{ color: '#666' }}>עדיין אין משתתפים.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {group.members.map((m) => (
              <li
                key={m.id}
                style={{
                  padding: '6px 0',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: 14,
                }}
              >
                <strong>{m.user.username || m.user.email}</strong>
                <span style={{ color: '#64748b', marginLeft: 6 }}>
                  ({m.user.email})
                </span>
                {m.user.id === currentUserId && (
                  <span style={{ color: '#16a34a', marginRight: 4 }}>
                    · אני
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal לתשלום Mock ₪1 */}
      <PaymentModal
        open={payingGroupId !== null}
        loading={paying}
        onClose={() => setPayingGroupId(null)}
        onPay={() => payingGroupId && handlePay(payingGroupId)}
      />
    </div>
  );
}
