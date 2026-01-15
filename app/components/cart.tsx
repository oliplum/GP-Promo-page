'use client';

import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Dialog from './dialog';

interface CartProps {
    selectedEvents: Set<number>;
    allEvents: any[];
}

export default function Cart({ selectedEvents, allEvents }: CartProps) {
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

    const selectedCount = selectedEvents.size;

    if (selectedCount === 0) {
        return null;
    }

    // Calculate pricing
    const selectedEventData = allEvents.filter(e => selectedEvents.has(e.event.id));
    const subtotal = selectedEventData.reduce((sum, e) => sum + parseFloat(e.ticketPrice || 0), 0);

    // Calculate discount tier
    let discountPercent = 50; // Base 50% off
    const totalEvents = allEvents.length;
    if (selectedCount === totalEvents) {
        discountPercent = 70; // All workshops: 70% off
    } else if (selectedCount >= 10) {
        discountPercent = 60; // 10+ workshops: 60% off
    }

    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    const currency = allEvents.length > 0 ? allEvents[0].currency : 'USD';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutError(null);
        
        // Validate form
        if (!formData.firstName || !formData.lastName || !formData.email) {
            setCheckoutError('Please fill in all fields');
            return;
        }
        
        setIsProcessing(true);

        try {
            // Store checkout data in sessionStorage
            sessionStorage.setItem('checkoutData', JSON.stringify({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                selectedEvents: Array.from(selectedEvents),
                subtotal,
                discountPercent,
                discountAmount,
                total,
                currency
            }));

            // Create PayPal order
            const response = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    currency: currency === '£' ? 'GBP' : currency
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create order');
            }

            // Redirect to PayPal
            const approveLink = data.links?.find((link: any) => link.rel === 'approve')?.href;
            if (approveLink) {
                window.location.href = approveLink;
            } else {
                throw new Error('PayPal approval link not found');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            setCheckoutError(error instanceof Error ? error.message : 'Failed to process payment');
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="cart-section">
                <div className="cart-horizontal">
                    <div className="cart-info">
                        <h3 className="cart-title">Shopping Cart</h3>
                        <span className="cart-items">{selectedCount} workshop{selectedCount !== 1 ? 's' : ''} selected</span>
                    </div>
                    <div className="cart-pricing">
                        <div className="cart-pricing-item">
                            <span className="cart-label">Subtotal:</span>
                            <span className="cart-amount">{currency} {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-pricing-item cart-discount-item">
                            <span className="cart-label">Discount ({discountPercent}%):</span>
                            <span className="cart-amount">-{currency} {discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="cart-pricing-item cart-total-item">
                            <span className="cart-label">Total:</span>
                            <span className="cart-amount">{currency} {total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button 
                        className="cart-checkout-btn"
                        onClick={() => setShowCheckoutForm(true)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>

            <Dialog
                isOpen={showCheckoutForm}
                onClose={() => {
                    setShowCheckoutForm(false);
                    setCheckoutError(null);
                    setCheckoutSuccess(false);
                }}
                title={checkoutSuccess ? "Purchase Complete" : "Checkout Information"}
            >
                {checkoutSuccess ? (
                    <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#16a34a'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>✓ Purchase Complete!</h3>
                        <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="checkout-form">
                        {checkoutError && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: '4px',
                                color: '#c00',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                {checkoutError}
                            </div>
                        )}
                        <div className="form-group">
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="checkout-summary">
                        <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Selected Workshops:</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            {selectedEventData.map((eventData) => (
                                <div key={eventData.event.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem', color: '#000' }}>
                                        {eventData.event.title}
                                    </div>
                                    {eventData.presenters && eventData.presenters.length > 0 && (
                                        <div style={{ fontSize: '0.85rem', color: '#333' }}>
                                            {eventData.presenters.map((p: any) => `${p.title} ${p.first_name} ${p.last_name}${p.honors ? ` ${p.honors}` : ''}`).join(', ')}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                                        <span style={{ textDecoration: 'line-through', marginRight: '0.5rem', color: '#fff' }}>
                                            {currency} {parseFloat(eventData.ticketPrice).toFixed(2)}
                                        </span>
                                        <span style={{ color: '#22c55e', fontWeight: '600' }}>
                                            {currency} {(parseFloat(eventData.ticketPrice) * (1 - discountPercent / 100)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            <span style={{ textDecoration: 'line-through', marginRight: '0.5rem', color: '#fff' }}>
                                Original: {currency} {subtotal.toFixed(2)}
                            </span>
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>
                                ({discountPercent}% off)
                            </span>
                        </p>
                        <p><strong>Total: {currency} {total.toFixed(2)}</strong></p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{selectedCount} workshop{selectedCount !== 1 ? 's' : ''} selected</p>
                    </div>
                    <button type="submit" className="checkout-submit-btn" disabled={isProcessing}>
                        {isProcessing ? 'Redirecting to PayPal...' : 'Proceed to PayPal'}
                    </button>
                </form>
                )}
            </Dialog>
        </>
    );
}
