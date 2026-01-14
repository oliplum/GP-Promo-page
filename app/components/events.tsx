'use client';

import { useState, useEffect } from 'react';
import EventCard from './event-card';

interface EventsProps {
  selectedEvents: Set<number>;
  toggleEventSelection: (eventId: number, price: number, currency: string) => void;
  onEventsLoaded: (events: any[]) => void;
}

export default function Events({ selectedEvents, toggleEventSelection, onEventsLoaded }: EventsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const loadedEvents = data.events || [];
        setEvents(loadedEvents);
        onEventsLoaded(loadedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [onEventsLoaded]);
  
  if (loading) {
    return <div>Loading events...</div>;
  }
  
  if (!events || events.length === 0) {
    return <div>No events found</div>;
  }
  
  return (
    <div>
      {events.map((eventData) => (
        <EventCard 
          key={eventData.event.id} 
          eventData={eventData}
          isSelected={selectedEvents.has(eventData.event.id)}
          onToggleSelection={() => toggleEventSelection(
            eventData.event.id,
            parseFloat(eventData.ticketPrice),
            eventData.currency
          )}
        />
      ))}
    </div>
  );
}
