'use client';

import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  loading?: boolean;
};

export default function PaymentModal({
  open,
  onClose,
  onPay,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: '#fff',
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h2 style={{ marginBottom: 8 }}>💳 תשלום השתתפות</h2>

        <p style={{ color: '#555', marginBottom: 16 }}>
          דמי הצטרפות לקבוצה: <strong>₪1</strong><br />
          במקרה שהקבוצה לא תושלם – הכסף יוחזר.
        </p>

        <button
          onClick={onPay}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 999,
            border: 'none',
            background: '#16a34a',
            color: '#fff',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          {loading ? 'מבצע תשלום…' : 'שלם ₪1'}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 999,
            border: '1px solid #ddd',
            background: '#fff',
          }}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
