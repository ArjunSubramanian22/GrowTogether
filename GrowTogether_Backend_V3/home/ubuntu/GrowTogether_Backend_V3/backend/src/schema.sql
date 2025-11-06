-- GrowTogether Database Schema V2
-- Updated schema with onboarding, personalized features, chat, and settings

-- Users table with enhanced fields for onboarding
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    age INTEGER,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences from onboarding questionnaire
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    dietary_restrictions TEXT[], -- e.g., ['vegetarian', 'gluten-free']
    favorite_cuisines TEXT[], -- e.g., ['italian', 'mexican', 'asian']
    skill_interests TEXT[], -- e.g., ['cooking', 'gardening', 'tech']
    job_interests TEXT[], -- e.g., ['retail', 'food service', 'agriculture']
    experience_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    availability TEXT[], -- e.g., ['weekdays', 'weekends', 'evenings']
    transportation VARCHAR(50), -- 'car', 'bike', 'public_transit', 'walking'
    goals TEXT[], -- e.g., ['find_food', 'learn_skills', 'earn_income']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources (food banks, community kitchens, etc.)
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'food_bank', 'community_kitchen', 'shelter'
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_info JSONB,
    description TEXT,
    availability JSONB, -- e.g., {"monday": "9am-5pm", "tuesday": "9am-5pm"}
    languages_supported TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food items available at resources
CREATE TABLE IF NOT EXISTS food_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'produce', 'dairy', 'protein', 'grains'
    nutrition_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personalized meal suggestions based on user preferences
CREATE TABLE IF NOT EXISTS meal_suggestions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    ingredients_ids INTEGER[],
    cuisine_type VARCHAR(100),
    dietary_tags TEXT[], -- 'vegetarian', 'vegan', 'gluten-free'
    prep_time INTEGER, -- minutes
    difficulty VARCHAR(50), -- 'easy', 'medium', 'hard'
    cost_estimate DECIMAL(10, 2),
    nutrition_info JSONB,
    instructions TEXT,
    resource_id INTEGER REFERENCES resources(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    bio TEXT,
    expertise TEXT[],
    availability JSONB,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    age_groups TEXT[], -- e.g., ['16-18', '19-25', '26+']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job and apprenticeship opportunities (for 16+)
CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- 'job', 'apprenticeship', 'volunteer'
    description TEXT,
    requirements TEXT[],
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    mentor_id INTEGER REFERENCES mentors(id),
    duration VARCHAR(100),
    compensation VARCHAR(255),
    min_age INTEGER DEFAULT 16,
    application_link TEXT,
    skills_offered TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    opportunity_id INTEGER REFERENCES opportunities(id),
    status VARCHAR(50), -- 'interested', 'applied', 'in_progress', 'completed'
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SeedBuddy (formerly Farms) - micro-farming system
CREATE TABLE IF NOT EXISTS seed_buddy_plots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    size_sqft INTEGER,
    plan JSONB, -- e.g., {"crops": ["tomatoes", "lettuce"], "layout": "..."}
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crops in SeedBuddy plots
CREATE TABLE IF NOT EXISTS seed_buddy_crops (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES seed_buddy_plots(id) ON DELETE CASCADE,
    crop_name VARCHAR(255) NOT NULL,
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(50), -- 'planted', 'growing', 'ready', 'harvested'
    yield_estimate_lbs DECIMAL(10, 2),
    actual_yield_lbs DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food rescue items
CREATE TABLE IF NOT EXISTS food_rescue (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER REFERENCES users(id),
    food_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'claimed', 'completed'
    claimed_by INTEGER REFERENCES users(id),
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace items
CREATE TABLE IF NOT EXISTS marketplace_items (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id),
    item_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10, 2),
    trade_for TEXT,
    image_url TEXT,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace chat rooms (group chat for items)
CREATE TABLE IF NOT EXISTS marketplace_chats (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES marketplace_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES marketplace_chats(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Urban gardens
CREATE TABLE IF NOT EXISTS urban_gardens (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    size_sqft INTEGER,
    available_plots INTEGER,
    amenities TEXT[],
    contact_info JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    location_sharing BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resource details (for when user clicks on a resource)
CREATE TABLE IF NOT EXISTS resource_details (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    services_offered TEXT[],
    eligibility_requirements TEXT,
    documents_needed TEXT[],
    additional_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

