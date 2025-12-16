// app/admin/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Product = {
  id: number;
  name: string;
  priceRegular: number;
  priceGroup: number;
  categoryId: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await apiFetch('/admin/products');
      setProducts(data);
    } catch (e: any) {
      alert(e.message || 'שגיאה בטעינת מוצרים');
    }
  }

  async function createProduct() {
    if (!name || !priceRegular || !priceGroup || !categoryId) {
      alert('נא למלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      await apiFetch('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          priceRegular: Number(priceRegular),
          priceGroup: Number(priceGroup),
          categoryId: Number(categoryId),
        }),
      });

      alert('המוצר נוצר בהצלחה');
      setName('');
      setPriceRegular('');
      setPriceGroup('');
      setCategoryId('');
      await load();
    } catch (e: any) {
      alert(e.message || 'שגיאה ביצירת מוצר');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('למחוק מוצר זה?')) return;
    try {
      await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) {
      alert(e.message || 'שגיאה במחיקת מוצר');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>📦 ניהול מוצרים</h1>

      <h3 style={{ marginTop: 24 }}>➕ יצירת מוצר חדש</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="שם מוצר"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <input
          placeholder="מחיר רגיל"
          value={priceRegular}
          onChange={e => setPriceRegular(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <input
          placeholder="מחיר קבוצתי"
          value={priceGroup}
          onChange={e => setPriceGroup(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <input
          placeholder="קטגוריה (ID)"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <button
          onClick={createProduct}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            background: loading ? '#888' : '#4f46e5',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'יוצר...' : 'צור'}
        </button>
      </div>

      <h3>📋 רשימת מוצרים</h3>
      {products.length === 0 && <p>אין מוצרים</p>}

      {products.map(p => (
        <div
          key={p.id}
          style={{
            padding: 12,
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong>{p.name}</strong> — ₪{p.priceGroup}{' '}
            <span style={{ color: '#666', fontSize: 12 }}>
              ( מחיר רגיל: ₪{p.priceRegular}, קטגוריה #{p.categoryId})
            </span>
          </div>

          <div>
            {/* אם תרצי מסך עריכה נפרד: */}
            { <a href={`/admin/products/${p.id}`} style={{ marginLeft: 12, color: 'blue'}}>
              עריכה
            </a> }

            <button
              onClick={() => deleteProduct(p.id)}
              style={{
                marginLeft: 12,
                padding: '4px 10px',
                borderRadius: 999,
                border: 'none',
                background: '#fee2e2',
                color: '#bb0f0fff',
                cursor: 'pointer',
              }}
            >
              מחיקה
            </button>
            
          </div>
        </div>
      ))}
    </div>
  );
}
