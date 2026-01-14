import Events from "./events";

interface ContentAreaProps {
  selectedEvents: Set<number>;
  toggleEventSelection: (eventId: number, price: number, currency: string) => void;
  onEventsLoaded: (events: any[]) => void;
}

export default function ContentArea({ selectedEvents, toggleEventSelection, onEventsLoaded }: ContentAreaProps) {
    return (
        <div className="content-area">
          <Events 
            selectedEvents={selectedEvents}
            toggleEventSelection={toggleEventSelection}
            onEventsLoaded={onEventsLoaded}
          />
        </div>
    );
}