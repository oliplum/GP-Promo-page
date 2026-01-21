'use client';

interface DiscountProps {
    selectedEvents: Set<number>;
    allEvents: Array<{event: {id: number}}>;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}

export default function Discount({ selectedEvents, allEvents, onSelectAll, onDeselectAll }: DiscountProps) {
    const selectedCount = selectedEvents.size;
    const totalEvents = allEvents.length;
    const allSelected = selectedCount === totalEvents && totalEvents > 0;

    const handleToggleAll = () => {
        if (allSelected) {
            onDeselectAll();
        } else {
            onSelectAll();
        }
    };

    return (
        <div className="discount-banner">
            <div className="discount-text">
                <h2 className="text-xl font-bold mb-3">Discounts for the New Year Sale</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="text-left">
                        <h3 className="font-semibold mb-2">Single Workshop</h3>
                        <p>For single workshop purchases, please click 'Access Event' to use the built-in paywall within each event - this will give you immediate access.</p>
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold mb-2">Multiple Workshops</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>All workshops 50% off</li>
                            <li>Buy 10 or more for another 10% off (total 60%)</li>
                            <li>Buy all for another 10% off (total 70%)</li>
                        </ul>
                    </div>
                    <div className="text-center flex items-center justify-center">
                        <button 
                            onClick={handleToggleAll}
                            className="select-all-button discount-select-button"
                        >
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}