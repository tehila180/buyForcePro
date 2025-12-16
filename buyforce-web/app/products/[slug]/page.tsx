'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  slug: string;
  priceRegular: number;
  priceGroup: number;
  category: {
    name: string;
    slug: string;
  };
};

type Group = {
  id: number;
  status: string;
  members: any[];
  target: number;
};
function isUserInGroup(group: Group) {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.sub;

  return group.members.some((m: any) => m.userId === userId);
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 טעינת מוצר
  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiFetch(`/products/${slug}`);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'שגיאה בטעינת מוצר');
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProduct();
  }, [slug]);

  // 🔹 טעינת קבוצות למוצר
  useEffect(() => {
    async function loadGroups() {
      if (!product) return;
      const data = await apiFetch(`/groups/product/${product.id}`);
      setGroups(data);
    }

    loadGroups();
  }, [product]);

  // ✅ יצירת קבוצה חדשה
  async function createGroup() {
    const token = localStorage.getItem('token');
     if (!token) {
      const goLogin = confirm(
        'עליך להתחבר או להירשם כדי להמשיך.\n\nלעבור להתחברות?'
      );
      if (goLogin) router.push('/login');
      return;
    }

    await apiFetch('/groups', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: product!.id }),
    });

    alert('קבוצה נוצרה בהצלחה');
    window.location.reload();
  }

  // ✅ הצטרפות לקבוצה
  async function joinGroup(groupId: number) {
    const token = localStorage.getItem('token');
     if (!token) {
      const goLogin = confirm(
        'עליך להתחבר או להירשם כדי להמשיך.\n\nלעבור להתחברות?'
      );
      if (goLogin) router.push('/login');
      return;
    }

    await apiFetch(`/groups/${groupId}/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert('הצטרפת לקבוצה!');
    window.location.reload();
  }

  if (loading) return <p style={{ padding: 20 }}>טוען מוצר...</p>;
  if (error) return <p style={{ padding: 20, color: 'red' }}>{error}</p>;
  if (!product) return <p>המוצר לא נמצא</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>{product.name}</h1>

      <p>
         קטגוריה:{' '}
        <a href={`/categories/${product.category.slug}`}>
          {product.category.name}
        </a>
      </p>

      <p>מחיר רגיל: ₪{product.priceRegular}</p>
      <p style={{ fontWeight: 'bold' }}>
        מחיר קבוצתי: ₪{product.priceGroup}
      </p>

      <hr style={{ margin: '24px 0' }} />

      {/* ✅ יצירת קבוצה */}
      <button onClick={createGroup} style={{ marginBottom: 16 }}>
        ➕ פתח קבוצה חדשה
      </button>

      {/* ✅ קבוצות פעילות */}
      <h2>קבוצות פעילות</h2>

      {groups.length === 0 && <p>אין קבוצות פעילות כרגע</p>}

     {groups.map((group) => {
  const alreadyJoined = isUserInGroup(group);
  const progressPercent = Math.min(
    100,
    Math.round((group.members.length / group.target) * 100)
  );

  return (
    <div
      key={group.id}
      style={{
        border: '1px solid #ddd',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        background: '#fff',
      }}
    >
      <p style={{ fontWeight: 600 }}>
        👥 חברים: {group.members.length} / {group.target}
      </p>

      {/* 🔹 פס התקדמות */}
      <div
        style={{
          background: '#eee',
          borderRadius: 8,
          overflow: 'hidden',
          height: 10,
          margin: '8px 0 12px',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background:
              progressPercent >= 100 ? '#16a34a' : '#4f46e5',
          }}
        />
      </div>

      <p>סטטוס: {group.status}</p>

      {/* ✅ לוגיקת הצטרפות */}
      {group.status !== 'open' ? (
        <p style={{ color: 'gray' }}>🔒 הקבוצה סגורה</p>
      ) : alreadyJoined ? (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          ✅ כבר הצטרפת לקבוצה הזו
        </p>
      ) : (
        <button
          onClick={() => joinGroup(group.id)}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            background: '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          הצטרף לקבוצה
        </button>
      )}
    </div>
  );
})}
    </div>
  );
}
