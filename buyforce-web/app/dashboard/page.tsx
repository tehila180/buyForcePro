'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
/* ---------- Types ---------- */

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  priceRegular: number;
  priceGroup: number;
};

type ActiveGroup = {
  id: number;
  target: number;
  members: any[];
  product: {
    name: string;
    slug: string;
    priceGroup: number;
  };
};

/* ---------- Helpers ---------- */

function getUserId() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

function isUserInGroup(group: ActiveGroup) {
  const userId = getUserId();
  if (!userId) return false;
  return group.members.some(m => m.userId === userId);
}

/* ---------- Page ---------- */


export default function HomePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ActiveGroup[]>([]);

  useEffect(() => {
    apiFetch('/groups/featured').then(setGroups);
    apiFetch('/categories').then(setCategories);
    apiFetch('/products').then(setFeatured);
  }, []);
   

  function handleJoinClick(productSlug: string) {
    const token = localStorage.getItem('token');

    if (!token) {
      alert("עליך להתחבר כדי להצטרף לקבוצה.");
      return;
    }

    router.push(`/products/${productSlug}`);
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Hero */}
      <h1 style={{ fontSize: 32 }}>BuyForce</h1>
      <p style={{ margin: '8px 0 16px', maxWidth: 420 }}>
        קנייה קבוצתית חכמה – מצטרפים יחד, משלמים פחות 💥
      </p>

      <a
        href="/products"
        style={{
          display: 'inline-block',
          padding: '12px 20px',
          background: '#4f46e5',
          color: '#fff',
          borderRadius: 999,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        התחלת קנייה
      </a>

      {/* Explanation */}
      <div
        style={{
          marginTop: 32,
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 12,
          fontSize: 14,
        }}
      >
        ✅ מצטרפים לקבוצה עם דמי השתתפות של ₪1<br />
        ✅ אם הקבוצה לא מגיעה ליעד – הכסף מוחזר<br />
        ✅ אם הקבוצה נסגרת – משלמים מחיר קבוצתי מוזל
      </div>

      {/* Active Groups */}
      <h2 style={{ marginTop: 40 }}>👥 קבוצות פעילות</h2>

      {groups.length === 0 ? (
        <p style={{ color: '#666' }}>אין קבוצות פעילות כרגע</p>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 12,
            marginTop: 16,
          }}
        >
          {groups.map(group => {
            const percent = Math.min(
              100,
              Math.round((group.members.length / group.target) * 100)
            );

            const alreadyJoined = isUserInGroup(group);

            return (
              <div
                key={group.id}
                style={{
                  minWidth: 260,
                  border: '1px solid #ddd',
                  borderRadius: 16,
                  padding: 16,
                  background: '#fff',
                }}
              >
                <h3>{group.product.name}</h3>

                <p>
                  👥 {group.members.length} / {group.target}
                </p>

                <div
                  style={{
                    background: '#eee',
                    height: 8,
                    borderRadius: 999,
                    overflow: 'hidden',
                    margin: '8px 0',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: '#4f46e5',
                    }}
                  />
                </div>

                <p style={{ fontWeight: 'bold' }}>
                  ₪{group.product.priceGroup}
                </p>

                {/* BUTTONS SECTION */}
                {alreadyJoined ? (
                  <p style={{ color: 'green', fontWeight: 600 }}>
                    ✅ כבר מצורפת לקבוצה
                  </p>
                ) : (
                  <button
                    onClick={() => handleJoinClick(group.product.slug)}
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
                    הצטרפות
                  </button>
                )}

                {/* NEW — nav to group details */}
                <button
                  onClick={() => router.push(`/groups/${group.id}`)}
                  style={{
                    marginTop: 8,
                    padding: '6px 12px',
                    border: '1px solid #4f46e5',
                    background: 'white',
                    color: '#4f46e5',
                    borderRadius: 999,
                    fontSize: 13,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  פרטי הקבוצה →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Categories */}
      <h2 style={{ marginTop: 48 }}>קטגוריות</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
        {categories.map(c => (
          <a
            key={c.id}
            href={`/categories/${c.slug}`}
            style={{
              padding: '8px 14px',
              border: '1px solid #ddd',
              borderRadius: 999,
              textDecoration: 'none',
              color: '#000',
            }}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* Featured Products */}
      <h2 style={{ marginTop: 48 }}>🔥 מוצרים מובילים</h2>

      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        {featured.map(p => (
          <div
            key={p.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: 16,
              background: '#fff',
            }}
          >
            <h3>{p.name}</h3>
            <p style={{ textDecoration: 'line-through', color: '#999' }}>
              ₪{p.priceRegular}
            </p>
            <p style={{ fontWeight: 'bold' }}>
              ₪{p.priceGroup}
            </p>

            <a
              href={`/products/${p.slug}`}
              style={{ color: '#4f46e5', fontWeight: 600 }}
            >
              לצפייה במוצר →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
