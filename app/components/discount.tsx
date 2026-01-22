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
                <div className="flex flex-col items-center gap-4 text-xs">
                    <div className="text-left">
                        <h3 className="font-semibold mb-2 underline">Multiple Workshops</h3>
                        <ul className="list-disc list-inside space-y-1">
                            <li>All workshops 50% off</li>
                            <li>Buy 10 or more for another 10% off (total 60%)</li>
                            <li>Buy all for another 10% off (total 70%)</li>
                        </ul>
                    </div>
                    <div className="text-center">
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