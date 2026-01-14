'use client';

import { useState } from 'react';
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Handle form submission
        console.log('Checkout data:', formData, { selectedEvents, total, currency });
        alert('Form submitted! Check console for details.');
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
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>

            <Dialog
                isOpen={showCheckoutForm}
                onClose={() => setShowCheckoutForm(false)}
                title="Checkout Information"
            >
                <form onSubmit={handleSubmit} className="checkout-form">
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
                        <p><strong>Total: {currency} {total.toFixed(2)}</strong></p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{selectedCount} workshop{selectedCount !== 1 ? 's' : ''} selected</p>
                    </div>
                    <button type="submit" className="checkout-submit-btn">
                        Complete Checkout
                    </button>
                </form>
            </Dialog>
        </>
    );
}
