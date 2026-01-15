'use client';

import { useState } from 'react';
import Header from "./components/header";
import Title from "./components/title";
import ContentArea from "./components/content";
import Footer from "./components/footer";
import Info from "./components/info";
import Discount from "./components/discount";
import Cart from "./components/cart";

export default function Home() {
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [allEvents, setAllEvents] = useState<any[]>([]);

  const toggleEventSelection = (eventId: number, price: number, currency: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="left"></div>
      <div className="shadow"></div>
      <Header />
      <Title />
      <Discount 
        selectedEvents={selectedEvents} 
        allEvents={allEvents}
        onSelectAll={() => {
          const allIds = allEvents.map(e => e.event.id);
          setSelectedEvents(new Set(allIds));
        }}
        onDeselectAll={() => setSelectedEvents(new Set())}
      />
      <ContentArea 
        selectedEvents={selectedEvents}
        toggleEventSelection={toggleEventSelection}
        onEventsLoaded={setAllEvents}
      />
      <Cart 
        selectedEvents={selectedEvents}
        allEvents={allEvents}
      />
      <Footer />
      <Info />
      <div className="right"></div>
    </>
  );
}
