'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [priceGroup, setPriceGroup] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (!id) return;

    apiFetch(`/admin/products/${id}`)
      .then((data) => {
        setProduct(data);
        setName(data.name);
        setPriceRegular(String(data.priceRegular));
        setPriceGroup(String(data.priceGroup));
        setCategoryId(String(data.categoryId));
      })
      .catch(() => alert("שגיאה בטעינת המוצר"));
  }, [id]);

  async function save() {
    await apiFetch(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name,
        priceRegular: Number(priceRegular),
        priceGroup: Number(priceGroup),
        categoryId: Number(categoryId),
      })
    });

    alert("✔ המוצר עודכן בהצלחה");
    router.push('/admin/products');
  }

  if (!product) return <p style={{ padding: 24 }}>טוען...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>✏️ עריכת מוצר: {product.name}</h1>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="שם מוצר" />
        <input value={priceRegular} onChange={e => setPriceRegular(e.target.value)} placeholder="מחיר רגיל" />
        <input value={priceGroup} onChange={e => setPriceGroup(e.target.value)} placeholder="מחיר קבוצתי" />
        <input value={categoryId} onChange={e => setCategoryId(e.target.value)} placeholder="קטגוריה" />

        <button onClick={save} style={{ marginTop: 12 }}>
          💾 שמירת שינויים
        </button>
      </div>
    </div>
  );
}
