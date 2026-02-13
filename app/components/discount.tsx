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
                <h2 className="text-xl font-bold mb-3">New Year Sale Has Ended</h2>
                <div className="flex flex-col items-center gap-4 text-xs">
                    <div className="text-center">
                        <p className="mb-3">All workshops are now at regular price.</p>
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