-- GrowTogether Database Schema

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL, -- 'youth', 'mentor'
    preferred_languages TEXT[], -- e.g., {'en', 'es'}
    location VARCHAR(100),
    skills TEXT[],
    interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources Table (for Food & Nutrition Hub)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'food bank', 'community kitchen'
    address VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    contact_info JSONB, -- e.g., {'phone': '123-456-7890', 'email': 'info@example.com'}
    description TEXT,
    availability JSONB, -- e.g., {'days': ['Mon', 'Wed'], 'hours': '9am-5pm'}
    languages_supported TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food Items Table
CREATE TABLE food_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- e.g., 'vegetable', 'fruit', 'grain'
    nutrition_info JSONB, -- e.g., {'calories': 100, 'protein': 5, 'carbs': 20}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal Suggestions Table
CREATE TABLE meal_suggestions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    ingredients_ids INTEGER[], -- Array of food_item_ids
    resource_id INTEGER REFERENCES resources(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentors Table (extends users table)
CREATE TABLE mentors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[], -- e.g., {'coding', 'gardening'}
    availability JSONB, -- e.g., {'days': ['Tue', 'Thu'], 'hours': '10am-2pm'}
    rating DECIMAL(2, 1) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities Table (for Job & Mentorship Hub)
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'job', 'apprenticeship', 'skill_building'
    description TEXT,
    requirements TEXT[],
    location VARCHAR(100), -- 'remote' or specific address
    mentor_id INTEGER REFERENCES mentors(id) ON DELETE SET NULL,
    duration VARCHAR(50),
    compensation VARCHAR(100),
    application_link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Progress Table (for Job & Mentorship Hub)
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
    status VARCHAR(50), -- 'started', 'in_progress', 'completed'
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, opportunity_id)
);

-- Farms Table (for Micro-Farming Entrepreneurship System)
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    location VARCHAR(100),
    size_sqft INTEGER,
    plan JSONB, -- e.g., {'beds': [{'crop': 'tomatoes', 'area': 50}]}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Farm Crops Table (details of crops in a farm)
CREATE TABLE farm_crops (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    planting_date DATE,
    expected_harvest_date DATE,
    status VARCHAR(50), -- 'planted', 'growing', 'harvested'
    yield_estimate_lbs DECIMAL(10, 2),
    actual_yield_lbs DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community Posts Table (for Micro-Farming and general sharing)
CREATE TABLE community_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image_url VARCHAR(255),
    post_type VARCHAR(50), -- 'farming_tip', 'question', 'success_story', 'mentorship_request'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments on Community Posts
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

