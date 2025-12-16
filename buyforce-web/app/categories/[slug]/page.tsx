'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Product = {
  id: number;
  name: string;
  priceRegular: number;
  priceGroup: number;
};

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  async function load() {
    try {
      const data = await apiFetch(`/products/by-category/${slug}`);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'שגיאה בטעינת מוצרים');
    } finally {
      setLoading(false);
    }
  }

  if (slug) load();
}, [slug]);


  if (loading) return <p style={{ padding: 24 }}>טוען מוצרים...</p>;
  if (error) return <p style={{ padding: 24, color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>מוצרים בקטגוריה</h1>

      {products.length === 0 && <p>אין מוצרים בקטגוריה הזו</p>}

      <ul style={{ marginTop: 16 }}>
        {products.map((p) => (
          <li
            key={p.id}
            style={{
              border: '1px solid #ddd',
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <h3>{p.name}</h3>
            <p>מחיר רגיל: ₪{p.priceRegular}</p>
            <p><strong>מחיר קבוצתי: ₪{p.priceGroup}</strong></p>
             
          </li>
        ))}
      </ul>
    </div>
  );
}
