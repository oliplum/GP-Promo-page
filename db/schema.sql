-- Create tables for GP_Promo database

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_no VARCHAR(50) UNIQUE,
    title TEXT NOT NULL,
    cpd_hours DECIMAL(4,2),
    ticket_price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT '£',
    event_synopsis TEXT,
    owner_id INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Presenters table
CREATE TABLE IF NOT EXISTS presenters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    honors VARCHAR(100),
    image_url TEXT,
    s3_url TEXT,
    bio TEXT,
    job_title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event_Presenters join table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS event_presenters (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    presenter_id INTEGER NOT NULL REFERENCES presenters(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, presenter_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_owner_status ON events(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_events_event_no ON events(event_no);
CREATE INDEX IF NOT EXISTS idx_event_presenters_event_id ON event_presenters(event_id);
CREATE INDEX IF NOT EXISTS idx_event_presenters_presenter_id ON event_presenters(presenter_id);
