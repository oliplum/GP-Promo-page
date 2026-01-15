'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

export default function PayPalProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AViEUUScigRg49bR-0lzrPBy5RcyCvQCWRSdjhdTixCw4rh5K8EWjhI0ZQ92BvwQ-JLTOFpWopt3hVFZ';
  
  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId,
        currency: 'GBP',
        intent: 'capture',
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
