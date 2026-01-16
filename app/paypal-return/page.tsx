'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PayPalReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      const token = searchParams.get('token');
      
      console.log('=== PAYPAL RETURN PAGE ===');
      console.log('Token (Order ID):', token);
      
      if (!token) {
        setStatus('error');
        setMessage('Payment information missing');
        return;
      }

      try {
        // Try to get from sessionStorage first (for backwards compatibility)
        let checkoutData;
        const checkoutDataStr = sessionStorage.getItem('checkoutData');
        
        if (checkoutDataStr) {
          console.log('✓ Found checkout data in sessionStorage');
          checkoutData = JSON.parse(checkoutDataStr);
        } else {
          console.log('Fetching checkout data from database...');
          // Fetch from database using the token (PayPal order ID)
          const response = await fetch(`/api/checkout?orderID=${token}`);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Failed to fetch checkout data:', errorData);
            throw new Error('Checkout data not found. Please contact support.');
          }
          const data = await response.json();
          checkoutData = data.checkoutData;
          console.log('✓ Checkout data retrieved from database');
        }

        console.log('Checkout data:', checkoutData);

        // Capture the payment
        console.log('Attempting to capture PayPal payment...');
        const captureResponse = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: token })
        });

        const captureResult = await captureResponse.json();
        
        console.log('Capture response status:', captureResponse.status);
        console.log('Capture result:', captureResult);

        if (!captureResponse.ok) {
          console.error('❌ Payment capture failed:', captureResult);
          throw new Error(captureResult.error || captureResult.details || 'Payment capture failed');
        }

        console.log('✓ Payment captured successfully');

        // Extract the actual capture ID from PayPal response
        const captureId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id || captureResult.id;
        console.log('Capture ID:', captureId);

        // Record the sale
        console.log('Recording sale in database...');
        const saleResponse = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...checkoutData,
            paypalOrderId: token,
            paypalCaptureId: captureId
          })
        });

        if (!saleResponse.ok) {
          const saleResult = await saleResponse.json();
          console.error('❌ Sale recording failed:', saleResult);
          throw new Error(saleResult.error || saleResult.details || 'Failed to record sale');
        }

        console.log('✓ Sale recorded successfully');

        // Clear checkout data
        sessionStorage.removeItem('checkoutData');

        setStatus('success');
        setMessage('Payment successful! You will receive a confirmation email shortly.');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (error) {
        console.error('❌ Payment processing error:', error);
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
      width: '100vw',
      padding: '2rem',
      textAlign: 'center',
      margin: 0,
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
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

export default function PayPalReturn() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <PayPalReturnContent />
    </Suspense>
  );
}
