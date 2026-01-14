'use client';

import { useState, useEffect } from 'react';
import EventCard from './event-card';

export default function Events() {
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
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, []);
  
  if (loading) {
    return <div>Loading events...</div>;
  }
  
  if (!events || events.length === 0) {
    return <div>No events found</div>;
  }
  
  return (
    <div>
      {events.map((eventData) => (
        <EventCard key={eventData.event.id} eventData={eventData} />
      ))}
    </div>
  );
}
