'use client';

interface DiscountProps {
    selectedEvents: Set<number>;
    allEvents: any[];
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
                <h2 className="text-xl font-bold mb-3">Discounts for the winter sale</h2>
                <ul className="text-xs list-disc list-inside space-y-1 inline-block text-left">
                    <li>All workshops 50% off</li>
                    <li>Buy 10 or more for an additional 10% off (total 60%)</li>
                    <li>Buy all workshops for another 10% off (total 70%)</li>
                </ul>
                <button 
                    onClick={handleToggleAll}
                    className="select-all-button discount-select-button"
                >
                    {allSelected ? 'Deselect All' : 'Select All'}
                </button>
            </div>
        </div>
    );
}