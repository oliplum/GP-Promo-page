'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PayPalReturn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Payment information missing');
        return;
      }

      try {
        // Get checkout data from sessionStorage
        const checkoutDataStr = sessionStorage.getItem('checkoutData');
        if (!checkoutDataStr) {
          throw new Error('Checkout data not found');
        }

        const checkoutData = JSON.parse(checkoutDataStr);

        // Capture the payment
        const captureResponse = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: token })
        });

        const captureResult = await captureResponse.json();

        if (!captureResponse.ok) {
          throw new Error('Payment capture failed');
        }

        // Record the sale
        const saleResponse = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...checkoutData,
            paypalOrderId: token,
            paypalCaptureId: captureResult.id
          })
        });

        const saleResult = await saleResponse.json();

        if (!saleResponse.ok) {
          throw new Error(saleResult.error || 'Failed to record sale');
        }

        // Clear checkout data
        sessionStorage.removeItem('checkoutData');

        setStatus('success');
        setMessage('Payment successful! You will receive a confirmation email shortly.');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Payment processing failed');
      }
    };

    processPayment();
  }, [searchParams, router]);

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
        {status === 'processing' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2 style={{ marginBottom: '1rem' }}>Processing Payment</h2>
            <p>{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#16a34a' }}>✓</div>
            <h2 style={{ marginBottom: '1rem', color: '#16a34a' }}>Payment Successful!</h2>
            <p>{message}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              Redirecting you back...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#dc2626' }}>✗</div>
            <h2 style={{ marginBottom: '1rem', color: '#dc2626' }}>Payment Failed</h2>
            <p>{message}</p>
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
          </>
        )}
      </div>
    </div>
  );
}
