'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    apiFetch('/products')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 24 }}>טוען מוצרים…</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>כל המוצרים</h1>

      <ul style={{ marginTop: 16 }}>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <a href={`/products/${p.slug}`}>
              <strong>{p.name}</strong>
            </a>
            <p>מחיר רגיל: ₪{p.priceRegular}</p>
            <p><strong>מחיר קבוצתי: ₪{p.priceGroup}</strong></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
