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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center text-left">
                <div>
                    <h2 className="text-xl font-bold">Discounts for the winter sale</h2>
                </div>
                <div>
                    <ul className="text-sm list-disc list-inside space-y-1 mb-3">
                        <li>All workshops 50% off</li>
                        <li>Buy 10 or more workshops for an additional 10% off (total 60%)</li>
                        <li>Buy all workshops for another 10% off (total 70%)</li>
                    </ul>
                    <div className="text-right">
                        <button 
                            onClick={handleToggleAll}
                            className="select-all-button"
                        >
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}