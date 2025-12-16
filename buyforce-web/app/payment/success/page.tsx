'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const groupId = params.get('group_id');

    if (groupId) {
      // כאן בהמשך נאשר תשלום בשרת
      alert('✅ תשלום התקבל בהצלחה');
      router.push('/my');
    }
  }, []);

  return <p style={{ padding: 24 }}>מעבד תשלום...</p>;
}
