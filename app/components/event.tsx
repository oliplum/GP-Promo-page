'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import Dialog from './dialog';

interface EventCardProps {
  eventData: any;
}

export default function EventCard({ eventData }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPresenterDialogOpen, setIsPresenterDialogOpen] = useState(false);
  const [currentPresenterIndex, setCurrentPresenterIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  
  if (!eventData) {
    return null;
  }
  
  const { event, presenterName, presenterImage, cpdHours, ticketPrice, currency, synopsis } = eventData;
  const presenters = eventData?.presenterDetails || [];
  const hasMultiplePresenters = presenters.length > 1;
  
  // Rotate presenter images if there are multiple presenters
  useEffect(() => {
    if (!hasMultiplePresenters) return;
    
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentPresenterIndex((prev) => (prev + 1) % presenters.length);
        setFadeIn(true);
      }, 300); // Fade out duration
    }, 5000);
    
    return () => clearInterval(interval);
  }, [hasMultiplePresenters, presenters.length]);
  
  const currentPresenterImage = hasMultiplePresenters 
    ? (presenters[currentPresenterIndex]?.image_url || presenters[currentPresenterIndex]?.s3_url || '/barney-dunn.jpg')
    : presenterImage;
  
  return (
    <>
      <div className="event-card">
        <div className="event-section-image">
          <Image 
            src={currentPresenterImage} 
            alt={presenterName} 
            width={80} 
            height={80} 
            className="rounded-corners shadow-lg" 
            style={{
              transition: 'opacity 0.3s ease-in-out',
              opacity: fadeIn ? 1 : 0,
              cursor: 'pointer'
            }}
            onClick={() => setIsPresenterDialogOpen(true)}
          />
        </div>
        <div className="event-section-title">
          <div>
            <div className="title-with-arrow">
              <h3 className="capitalize">{event?.title || 'Event title not found'}</h3>
              <button 
                className="expand-arrow" 
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
            <p className="event-subtitle">
              Presented by:  
              <button 
                className="presenter-link" 
                onClick={() => setIsPresenterDialogOpen(true)}
              >
                {presenterName}
              </button>
            </p>
          </div>
        </div>
        <div className="event-section-info">
          <ul>
            <li>CPD Hours: {cpdHours}</li>
            <li>Price: {currency} {ticketPrice}</li>
          </ul>
        </div>
        <div className="event-section-interact">
          <Link 
            href={`http://app-4.globalpodium.com/watch/${event?.event_no}`} 
            className="event-access-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Access Event <FaArrowRight style={{ display: 'inline', marginLeft: '0.3rem' }} />
          </Link>
          <div className="purchase-section">
            <input type="checkbox" id="purchase-checkbox" />
            <label htmlFor="purchase-checkbox">Purchase</label>
          </div>
        </div>
      </div>
      {isExpanded && synopsis && (
        <div className="bg-gray-50 p-3 mb-2 border border-t-0 border-gray-300 text-sm leading-relaxed">
          <h4 className="font-bold text-sm mb-2">Event Synopsis</h4>
          <p className="m-0 text-sm">{synopsis}</p>
        </div>
      )}
      
      <Dialog 
        isOpen={isPresenterDialogOpen} 
        onClose={() => setIsPresenterDialogOpen(false)}
        title="About the Presenter"
      >
        <div className="presenter-bio">
          {eventData?.presenterDetails && eventData.presenterDetails.map((presenter: any, index: number) => (
            <div key={index} style={{ marginBottom: index < eventData.presenterDetails.length - 1 ? '2rem' : '0' }}>
              <div className="presenter-bio-header">
                {(presenter?.image_url || presenter?.s3_url) && (
                  <Image 
                    src={presenter.image_url || presenter.s3_url} 
                    alt={[
                      presenter.title,
                      presenter.first_name,
                      presenter.last_name,
                      presenter.honors
                    ].filter(Boolean).join(' ')} 
                    width={120} 
                    height={120} 
                    className="presenter-bio-image"
                  />
                )}
                <div className="presenter-bio-info">
                  <h3>
                    {[
                      [presenter.title, presenter.first_name, presenter.last_name].filter(Boolean).join(' '),
                      presenter.honors
                    ].filter(Boolean).join(', ')}
                  </h3>
                  {(presenter?.job_title || presenter?.jobtitle) && (
                    <p className="presenter-job-title">
                      {presenter.job_title || presenter.jobtitle}
                    </p>
                  )}
                </div>
              </div>
              {presenter?.bio && (
                <div className="presenter-bio-text" dangerouslySetInnerHTML={{ __html: presenter.bio }} />
              )}
            </div>
          ))}
        </div>
      </Dialog>
    </>
    );
}