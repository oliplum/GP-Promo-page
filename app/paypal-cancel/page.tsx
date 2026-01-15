'use client';

import { useRouter } from 'next/navigation';

export default function PayPalCancel() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ marginBottom: '1rem' }}>Payment Cancelled</h2>
        <p>You cancelled the payment. No charges have been made.</p>
        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 2rem',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
