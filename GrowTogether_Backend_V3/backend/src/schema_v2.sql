-- GrowTogether Database Schema V3
-- Updated schema with comprehensive onboarding, interactive maps, chatbot, gamification, and resource requests

-- Users table with enhanced fields for onboarding
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    age INTEGER,
    location TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User preferences from comprehensive onboarding questionnaire
CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    -- Personalization Step 1: Dietary & Cuisines
    dietary_restrictions TEXT, -- JSON array e.g., '["vegetarian", "gluten-free"]'
    favorite_cuisines TEXT, -- JSON array e.g., '["italian", "mexican", "asian"]'
    -- Personalization Step 2: Skills & Jobs
    skill_interests TEXT, -- JSON array e.g., '["cooking", "gardening", "tech"]'
    job_interests TEXT, -- JSON array e.g., '["retail", "food service", "agriculture"]'
    experience_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    -- Personalization Step 3: Availability & Transportation
    availability TEXT, -- JSON array e.g., '["weekdays", "weekends", "evenings"]'
    transportation VARCHAR(50), -- 'car', 'bike', 'public_transit', 'walking'
    -- Personalization Step 4: Goals & Household
    goals TEXT, -- JSON array e.g., '["find_food", "learn_skills", "earn_income"]'
    household_size VARCHAR(50),
    monthly_income_range VARCHAR(50),
    employment_status VARCHAR(50),
    education_level VARCHAR(50),
    housing_situation VARCHAR(50),
    health_conditions TEXT, -- JSON array
    language_preferences TEXT, -- JSON array
    community_interests TEXT, -- JSON array
    volunteer_interests TEXT, -- JSON array
    additional_notes TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resources (food banks, community kitchens, etc.)
CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'food_bank', 'community_kitchen', 'shelter'
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    contact_info TEXT, -- JSONB
    description TEXT,
    availability TEXT, -- JSONB e.g., {"monday": "9am-5pm", "tuesday": "9am-5pm"}
    languages_supported TEXT, -- JSON array
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resource details (for when user clicks on a resource)
CREATE TABLE IF NOT EXISTS resource_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    services_offered TEXT, -- JSON array
    eligibility_requirements TEXT,
    documents_needed TEXT, -- JSON array
    additional_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Personalized meal suggestions based on user preferences
CREATE TABLE IF NOT EXISTS meal_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    ingredients_ids TEXT, -- JSON array of ingredient IDs
    cuisine_type VARCHAR(100),
    dietary_tags TEXT, -- JSON array 'vegetarian', 'vegan', 'gluten-free'
    prep_time INTEGER, -- minutes
    difficulty VARCHAR(50), -- 'easy', 'medium', 'hard'
    cost_estimate REAL,
    nutrition_info TEXT, -- JSONB
    instructions TEXT,
    resource_id INTEGER REFERENCES resources(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    bio TEXT,
    expertise TEXT, -- JSON array
    availability TEXT, -- JSONB
    rating REAL DEFAULT 0.0,
    age_groups TEXT, -- JSON array e.g., '["16-18", "19-25", "26+"]'
    linkedin_profile TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job and apprenticeship opportunities (for 16+)
CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- 'job', 'apprenticeship', 'volunteer'
    description TEXT,
    requirements TEXT, -- JSON array
    location TEXT,
    latitude REAL,
    longitude REAL,
    mentor_id INTEGER REFERENCES mentors(id),
    duration VARCHAR(100),
    compensation VARCHAR(255),
    min_age INTEGER DEFAULT 16,
    application_link TEXT,
    skills_offered TEXT, -- JSON array
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking for opportunities
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    opportunity_id INTEGER REFERENCES opportunities(id),
    status VARCHAR(50), -- 'interested', 'applied', 'in_progress', 'completed'
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SeedBuddy (micro-farming system) - plots
CREATE TABLE IF NOT EXISTS seed_buddy_plots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    size_sqft INTEGER,
    plan TEXT, -- JSONB e.g., {"crops": ["tomatoes", "lettuce"], "layout": "..."}
    image_url TEXT,
    gamification_level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crops in SeedBuddy plots
CREATE TABLE IF NOT EXISTS seed_buddy_crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plot_id INTEGER REFERENCES seed_buddy_plots(id) ON DELETE CASCADE,
    crop_name VARCHAR(255) NOT NULL,
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(50), -- 'planted', 'growing', 'ready', 'harvested'
    yield_estimate_lbs REAL,
    actual_yield_lbs REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Food rescue items
CREATE TABLE IF NOT EXISTS food_rescue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER REFERENCES users(id),
    food_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'claimed', 'completed'
    claimed_by INTEGER REFERENCES users(id),
    claimed_at DATETIME,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace items
CREATE TABLE IF NOT EXISTS marketplace_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER REFERENCES users(id),
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price REAL,
    trade_for TEXT,
    image_url TEXT,
    location TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace chat rooms (group chat for items)
CREATE TABLE IF NOT EXISTS marketplace_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER REFERENCES marketplace_items(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER REFERENCES marketplace_chats(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Urban gardens (for resource requests)
CREATE TABLE IF NOT EXISTS urban_gardens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    size_sqft INTEGER,
    available_plots INTEGER,
    amenities TEXT, -- JSON array
    contact_info TEXT, -- JSONB
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    location_sharing BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resource requests (new table for user requests for items/services)
CREATE TABLE IF NOT EXISTS resource_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL, -- e.g., 'food', 'tools', 'land', 'mentorship'
    item_description TEXT NOT NULL,
    quantity TEXT,
    urgency VARCHAR(50), -- 'low', 'medium', 'high'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'fulfilled', 'cancelled'
    location TEXT,
    latitude REAL,
    longitude REAL,
    fulfilled_by INTEGER REFERENCES users(id),
    fulfilled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SeedBuddy Gamification (new table for tracking user achievements/rewards)
CREATE TABLE IF NOT EXISTS seed_buddy_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_name TEXT NOT NULL,
    description TEXT,
    reward_xp INTEGER,
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

