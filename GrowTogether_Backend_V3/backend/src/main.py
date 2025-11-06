
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime
import hashlib
from openai import OpenAI

app = Flask(__name__)
CORS(app)
DATABASE = 'growtogether_v3.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with open('src/schema_v3.sql', 'r') as f:
            schema_sql = f.read()
            db.executescript(schema_sql)
        db.commit()

def insert_sample_data():
    with app.app_context():
        db = get_db()
        
        # Sample users
        users = [
            (1, 'john_doe', hashlib.sha256('password123'.encode()).hexdigest(), 'john@example.com', 'user', 17, 'Los Angeles, CA', 34.0522, -118.2437),
            (2, 'jane_smith', hashlib.sha256('password456'.encode()).hexdigest(), 'jane@example.com', 'user', 22, 'San Francisco, CA', 37.7749, -122.4194),
            (3, 'mentor_mike', hashlib.sha256('mentor123'.encode()).hexdigest(), 'mike@example.com', 'mentor', 35, 'Oakland, CA', 37.8044, -122.2712),
        ]
        for user in users:
            db.execute(
                "INSERT OR IGNORE INTO users (id, username, password_hash, email, role, age, location, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                user
            )
        db.commit()

        # Sample user preferences (more detailed for V3)
        preferences = [
            (1, 1, json.dumps(['vegetarian']), json.dumps(['italian', 'mexican']), json.dumps(['cooking', 'gardening']), 
             json.dumps(['food service', 'agriculture']), 'beginner', json.dumps(['weekends']), 'public_transit', 
             json.dumps(['find_food', 'learn_skills']), '2', 'low', 'student', 'high_school', 'rent', json.dumps([]), 
             json.dumps(['English']), json.dumps(['community_gardening']), json.dumps(['food_distribution']), 'None', True),
            (2, 2, json.dumps(['gluten-free']), json.dumps(['asian', 'mediterranean']), json.dumps(['tech', 'cooking']), 
             json.dumps(['retail', 'tech']), 'intermediate', json.dumps(['weekdays', 'evenings']), 'car', 
             json.dumps(['earn_income', 'learn_skills']), '1', 'medium', 'employed', 'college', 'own', json.dumps(['diabetes']), 
             json.dumps(['English', 'Spanish']), json.dumps(['tech_workshops']), json.dumps(['mentoring']), 'None', True),
        ]
        for pref in preferences:
            db.execute(
                "INSERT OR IGNORE INTO user_preferences (id, user_id, dietary_restrictions, favorite_cuisines, skill_interests, job_interests, experience_level, availability, transportation, goals, household_size, monthly_income_range, employment_status, education_level, housing_situation, health_conditions, language_preferences, community_interests, volunteer_interests, additional_notes, onboarding_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                pref
            )
        db.commit()

        # Sample resources
        resources = [
            (1, 'Downtown Food Bank', 'food_bank', '123 Main St, Los Angeles, CA', 34.0522, -118.2437, 
             json.dumps({'phone': '555-1234', 'email': 'info@dtfoodbank.org'}), 'Provides fresh produce and groceries', 
             json.dumps({'monday': '9am-5pm', 'tuesday': '9am-5pm', 'wednesday': '9am-5pm'}), json.dumps(['English', 'Spanish']), 'https://via.placeholder.com/300x200?text=Food+Bank'),
            (2, 'Community Kitchen', 'community_kitchen', '456 Oak Ave, Los Angeles, CA', 34.0622, -118.2537, 
             json.dumps({'phone': '555-5678'}), 'Hot meals served daily', 
             json.dumps({'monday': '11am-2pm', 'tuesday': '11am-2pm', 'wednesday': '11am-2pm'}), json.dumps(['English']), 'https://via.placeholder.com/300x200?text=Community+Kitchen'),
            (3, 'Hope Shelter', 'shelter', '789 Pine St, Los Angeles, CA', 34.0722, -118.2637, 
             json.dumps({'phone': '555-9012', 'hotline': '555-HELP'}), 'Emergency shelter and support services', 
             json.dumps({'24/7': 'Open'}), json.dumps(['English', 'Spanish', 'Mandarin']), 'https://via.placeholder.com/300x200?text=Hope+Shelter'),
        ]
        for resource in resources:
            db.execute(
                "INSERT OR IGNORE INTO resources (id, name, type, address, latitude, longitude, contact_info, description, availability, languages_supported, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                resource
            )
        db.commit()

        # Sample resource details
        resource_details = [
            (1, 1, json.dumps(['Food pantry', 'Nutrition counseling', 'Cooking classes']), 
             'Open to all community members', json.dumps(['ID', 'Proof of address']), 'First-come, first-served basis'),
            (2, 2, json.dumps(['Hot meals', 'Nutrition education', 'Community events']), 
             'No restrictions', json.dumps([]), 'Meals served at 12pm daily'),
            (3, 3, json.dumps(['Emergency shelter', 'Case management', 'Job assistance']), 
             'Must be 18+ or accompanied by adult', json.dumps(['ID']), 'Intake available 24/7'),
        ]
        for detail in resource_details:
            db.execute(
                "INSERT OR IGNORE INTO resource_details (id, resource_id, services_offered, eligibility_requirements, documents_needed, additional_info) VALUES (?, ?, ?, ?, ?, ?)",
                detail
            )
        db.commit()

        # Sample meal suggestions
        meals = [
            (1, 'Vegetarian Pasta Primavera', 'Fresh vegetables with pasta', 'https://via.placeholder.com/300x200?text=Pasta+Primavera', 
             json.dumps([1, 2, 3]), 'italian', json.dumps(['vegetarian']), 30, 'easy', 8.50, 
             json.dumps({'calories': 450, 'protein': 15, 'carbs': 60}), 'Cook pasta. Sauté vegetables. Mix together.', 1),
            (2, 'Mexican Bean Bowl', 'Hearty bean and rice bowl', 'https://via.placeholder.com/300x200?text=Bean+Bowl', 
             json.dumps([4, 5]), 'mexican', json.dumps(['vegetarian', 'vegan']), 25, 'easy', 6.00, 
             json.dumps({'calories': 400, 'protein': 18, 'carbs': 55}), 'Cook rice. Heat beans. Assemble bowl.', 1),
        ]
        for meal in meals:
            db.execute(
                "INSERT OR IGNORE INTO meal_suggestions (id, name, description, image_url, ingredients_ids, cuisine_type, dietary_tags, prep_time, difficulty, cost_estimate, nutrition_info, instructions, resource_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                meal
            )
        db.commit()

        # Sample mentors (with LinkedIn data)
        mentors = [
            (1, 3, 'Experienced chef and community organizer', json.dumps(['cooking', 'food service', 'entrepreneurship']), 
             json.dumps({'weekdays': '6pm-9pm', 'weekends': '10am-4pm'}), 4.8, json.dumps(['16-18', '19-25']), 'https://www.linkedin.com/in/mikementor'),
        ]
        for mentor in mentors:
            db.execute(
                "INSERT OR IGNORE INTO mentors (id, user_id, bio, expertise, availability, rating, age_groups, linkedin_profile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                mentor
            )
        db.commit()

        # Sample opportunities
        opportunities = [
            (1, 'Kitchen Assistant', 'job', 'Help prepare meals at community kitchen', json.dumps(['Food handler certification helpful']), 
             'Los Angeles, CA', 34.0622, -118.2537, 1, '3 months', '$15/hour', 16, 'https://example.com/apply', json.dumps(['cooking', 'food safety']), 'https://via.placeholder.com/300x200?text=Kitchen+Job'),
            (2, 'Garden Apprentice', 'apprenticeship', 'Learn urban farming techniques', json.dumps(['Interest in agriculture']), 
             'Los Angeles, CA', 34.0722, -118.2637, 1, '6 months', 'Stipend + produce', 16, 'https://example.com/apply', json.dumps(['gardening', 'agriculture']), 'https://via.placeholder.com/300x200?text=Garden+Apprenticeship'),
        ]
        for opp in opportunities:
            db.execute(
                "INSERT OR IGNORE INTO opportunities (id, title, type, description, requirements, location, latitude, longitude, mentor_id, duration, compensation, min_age, application_link, skills_offered, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                opp
            )
        db.commit()

        # Sample food rescue items (with images)
        food_rescue_items = [
            (1, 1, 'Fresh bread and pastries', '20 loaves', '123 Main St, Los Angeles, CA', 34.0522, -118.2437, '2025-10-12', 'available', None, None, 'https://via.placeholder.com/300x200?text=Fresh+Bread'),
            (2, 2, 'Vegetables', '50 lbs', '456 Oak Ave, Los Angeles, CA', 34.0622, -118.2537, '2025-10-11', 'available', None, None, 'https://via.placeholder.com/300x200?text=Mixed+Vegetables'),
        ]
        for item in food_rescue_items:
            db.execute(
                "INSERT OR IGNORE INTO food_rescue (id, donor_id, food_type, quantity, pickup_location, latitude, longitude, expiry_date, status, claimed_by, claimed_at, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                item
            )
        db.commit()

        # Sample marketplace items (with images and location)
        marketplace_items = [
            (1, 1, 'Fresh Tomatoes', 'Homegrown organic tomatoes', 'produce', 5.00, None, 'https://via.placeholder.com/200?text=Tomatoes', 
             'Los Angeles, CA', 34.0522, -118.2437, 'available'),
            (2, 2, 'Handmade Baskets', 'Woven baskets for storage', 'crafts', 15.00, 'Fresh produce', 'https://via.placeholder.com/200?text=Baskets', 
             'San Francisco, CA', 37.7749, -122.4194, 'available'),
        ]
        for item in marketplace_items:
            db.execute(
                "INSERT OR IGNORE INTO marketplace_items (id, seller_id, item_name, description, category, price, trade_for, image_url, location, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                item
            )
        db.commit()

        # Sample marketplace chats
        chats = [
            (1, 1),
            (2, 2),
        ]
        for chat in chats:
            db.execute(
                "INSERT OR IGNORE INTO marketplace_chats (id, item_id) VALUES (?, ?)",
                chat
            )
        db.commit()

        # Sample chat messages
        messages = [
            (1, 1, 2, 'Hi! Are these tomatoes still available?'),
            (2, 1, 1, 'Yes, they are! When would you like to pick them up?'),
        ]
        for msg in messages:
            db.execute(
                "INSERT OR IGNORE INTO chat_messages (id, chat_id, user_id, message) VALUES (?, ?, ?, ?)",
                msg
            )
        db.commit()

        # Sample SeedBuddy plots
        plots = [
            (1, 1, 'My First Garden', 'Backyard', 100, json.dumps({'crops': ['tomatoes', 'lettuce'], 'layout': 'raised beds'}), 
             'https://via.placeholder.com/300x200?text=Garden+Plot', 1, 100),
        ]
        for plot in plots:
            db.execute(
                "INSERT OR IGNORE INTO seed_buddy_plots (id, user_id, name, location, size_sqft, plan, image_url, gamification_level, xp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                plot
            )
        db.commit()

        # Sample SeedBuddy crops
        crops = [
            (1, 1, 'Tomatoes', '2025-09-01', '2025-11-15', 'growing', 20.0, None, 'Looking healthy!'),
            (2, 1, 'Lettuce', '2025-09-15', '2025-10-30', 'ready', 5.0, None, 'Ready to harvest'),
        ]
        for crop in crops:
            db.execute(
                "INSERT OR IGNORE INTO seed_buddy_crops (id, plot_id, crop_name, planting_date, expected_harvest_date, status, yield_estimate_lbs, actual_yield_lbs, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                crop
            )
        db.commit()

        # Sample urban gardens
        gardens = [
            (1, 'Riverside Community Garden', '789 Garden Ln, Los Angeles, CA', 34.0822, -118.2737, 5000, 12, 
             json.dumps(['water', 'tools', 'compost']), json.dumps({'phone': '555-GARDEN'}), 'https://via.placeholder.com/300x200?text=Community+Garden'),
        ]
        for garden in gardens:
            db.execute(
                "INSERT OR IGNORE INTO urban_gardens (id, name, location, latitude, longitude, size_sqft, available_plots, amenities, contact_info, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                garden
            )
        db.commit()

        # Sample user settings
        settings = [
            (1, 1, True, True, True, 'en', 'light'),
            (2, 2, True, False, True, 'en', 'dark'),
        ]
        for setting in settings:
            db.execute(
                "INSERT OR IGNORE INTO user_settings (id, user_id, notifications_enabled, email_notifications, location_sharing, language, theme) VALUES (?, ?, ?, ?, ?, ?, ?)",
                setting
            )
        db.commit()

        # Sample resource requests
        resource_requests = [
            (1, 1, 'food', 'Fresh vegetables', '10 lbs', 'high', 'Los Angeles, CA', 34.0522, -118.2437, None, None),
            (2, 2, 'tools', 'Gardening tools', '1 set', 'medium', 'San Francisco, CA', 37.7749, -122.4194, None, None),
        ]
        for req in resource_requests:
            db.execute(
                "INSERT OR IGNORE INTO resource_requests (id, user_id, request_type, item_description, quantity, urgency, location, latitude, longitude, fulfilled_by, fulfilled_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                req
            )
        db.commit()

        # Sample SeedBuddy achievements
        achievements = [
            (1, 1, 'First Harvest', 'Harvested first crop from SeedBuddy plot', 50),
            (2, 1, 'Green Thumb', 'Successfully grew 3 different crops', 100),
        ]
        for ach in achievements:
            db.execute(
                "INSERT OR IGNORE INTO seed_buddy_achievements (id, user_id, achievement_name, description, reward_xp) VALUES (?, ?, ?, ?, ?)",
                ach
            )
        db.commit()


@app.route('/')
def index():
    return jsonify({'message': 'GrowTogether Backend API V3', 'version': '3.0'})

# --- Authentication --- #
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    db = get_db()
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    try:
        cursor = db.execute(
            "INSERT INTO users (username, password_hash, email, age, location, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['username'], password_hash, data['email'], data.get('age'), data.get('location'), data.get('latitude'), data.get('longitude'))
        )
        db.commit()
        user_id = cursor.lastrowid
        return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 400

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    db = get_db()
    password_hash = hashlib.sha256(data['password'].encode()).hexdigest()
    cursor = db.execute(
        "SELECT * FROM users WHERE username = ? AND password_hash = ?",
        (data['username'], password_hash)
    )
    user = cursor.fetchone()
    if user:
        return jsonify({'message': 'Login successful', 'user': dict(user)}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# --- User Preferences (Onboarding) --- #
@app.route('/preferences/<int:user_id>', methods=['GET', 'POST', 'PUT'])
def user_preferences(user_id):
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
        prefs = cursor.fetchone()
        if prefs:
            prefs_dict = dict(prefs)
            # Parse JSON fields
            for field in ['dietary_restrictions', 'favorite_cuisines', 'skill_interests', 'job_interests', 'availability', 'goals', 'health_conditions', 'language_preferences', 'community_interests', 'volunteer_interests']:
                if prefs_dict.get(field):
                    prefs_dict[field] = json.loads(prefs_dict[field])
            return jsonify(prefs_dict)
        else:
            return jsonify({'message': 'No preferences found'}), 404
    elif request.method in ['POST', 'PUT']:
        data = request.json
        # Check if preferences exist
        cursor = db.execute("SELECT id FROM user_preferences WHERE user_id = ?", (user_id,))
        existing = cursor.fetchone()
        
        # Prepare all fields for update/insert
        fields = {
            'dietary_restrictions': json.dumps(data.get('dietary_restrictions', [])),
            'favorite_cuisines': json.dumps(data.get('favorite_cuisines', [])),
            'skill_interests': json.dumps(data.get('skill_interests', [])),
            'job_interests': json.dumps(data.get('job_interests', [])),
            'experience_level': data.get('experience_level'),
            'availability': json.dumps(data.get('availability', [])),
            'transportation': data.get('transportation'),
            'goals': json.dumps(data.get('goals', [])),
            'household_size': data.get('household_size'),
            'monthly_income_range': data.get('monthly_income_range'),
            'employment_status': data.get('employment_status'),
            'education_level': data.get('education_level'),
            'housing_situation': data.get('housing_situation'),
            'health_conditions': json.dumps(data.get('health_conditions', [])),
            'language_preferences': json.dumps(data.get('language_preferences', [])),
            'community_interests': json.dumps(data.get('community_interests', [])),
            'volunteer_interests': json.dumps(data.get('volunteer_interests', [])),
            'additional_notes': data.get('additional_notes'),
            'onboarding_complete': data.get('onboarding_complete', False)
        }

        if existing:
            # Update
            set_clause = ', '.join([f'{key} = ?' for key in fields.keys()])
            values = list(fields.values()) + [user_id]
            db.execute(
                f"UPDATE user_preferences SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                values
            )
        else:
            # Insert
            columns = ', '.join(['user_id'] + list(fields.keys()))
            placeholders = ', '.join(['?'] * (len(fields) + 1))
            values = [user_id] + list(fields.values())
            db.execute(
                f"INSERT INTO user_preferences ({columns}) VALUES ({placeholders})",
                values
            )
        db.commit()
        return jsonify({'message': 'User preferences saved successfully'}), 200

# --- Resources --- #
@app.route('/resources', methods=['GET'])
def get_resources():
    db = get_db()
    cursor = db.execute("SELECT * FROM resources")
    resources = [dict(row) for row in cursor.fetchall()]
    for res in resources:
        if res.get('contact_info'):
            res['contact_info'] = json.loads(res['contact_info'])
        if res.get('availability'):
            res['availability'] = json.loads(res['availability'])
        if res.get('languages_supported'):
            res['languages_supported'] = json.loads(res['languages_supported'])
    return jsonify(resources)

@app.route('/resources/<int:resource_id>', methods=['GET'])
def get_resource_detail(resource_id):
    db = get_db()
    cursor = db.execute("SELECT * FROM resources WHERE id = ?", (resource_id,))
    resource = cursor.fetchone()
    if resource:
        resource_dict = dict(resource)
        if resource_dict.get('contact_info'):
            resource_dict['contact_info'] = json.loads(resource_dict['contact_info'])
        if resource_dict.get('availability'):
            resource_dict['availability'] = json.loads(resource_dict['availability'])
        if resource_dict.get('languages_supported'):
            resource_dict['languages_supported'] = json.loads(resource_dict['languages_supported'])
        
        detail_cursor = db.execute("SELECT * FROM resource_details WHERE resource_id = ?", (resource_id,))
        details = detail_cursor.fetchone()
        if details:
            details_dict = dict(details)
            if details_dict.get('services_offered'):
                details_dict['services_offered'] = json.loads(details_dict['services_offered'])
            if details_dict.get('documents_needed'):
                details_dict['documents_needed'] = json.loads(details_dict['documents_needed'])
            resource_dict['details'] = details_dict

        return jsonify(resource_dict)
    return jsonify({'error': 'Resource not found'}), 404

# --- Meal Suggestions --- #
@app.route('/meals', methods=['GET'])
def get_meals():
    db = get_db()
    cursor = db.execute("SELECT * FROM meal_suggestions")
    meals = [dict(row) for row in cursor.fetchall()]
    for meal in meals:
        if meal.get('ingredients_ids'):
            meal['ingredients_ids'] = json.loads(meal['ingredients_ids'])
        if meal.get('dietary_tags'):
            meal['dietary_tags'] = json.loads(meal['dietary_tags'])
        if meal.get('nutrition_info'):
            meal['nutrition_info'] = json.loads(meal['nutrition_info'])
    return jsonify(meals)

# --- Mentors & Opportunities --- #
@app.route('/mentors', methods=['GET'])
def get_mentors():
    db = get_db()
    cursor = db.execute("SELECT * FROM mentors")
    mentors = [dict(row) for row in cursor.fetchall()]
    for mentor in mentors:
        if mentor.get('expertise'):
            mentor['expertise'] = json.loads(mentor['expertise'])
        if mentor.get('availability'):
            mentor['availability'] = json.loads(mentor['availability'])
        if mentor.get('age_groups'):
            mentor['age_groups'] = json.loads(mentor['age_groups'])
    return jsonify(mentors)

@app.route('/opportunities', methods=['GET'])
def get_opportunities():
    db = get_db()
    cursor = db.execute("SELECT * FROM opportunities")
    opportunities = [dict(row) for row in cursor.fetchall()]
    for opp in opportunities:
        if opp.get('requirements'):
            opp['requirements'] = json.loads(opp['requirements'])
        if opp.get('skills_offered'):
            opp['skills_offered'] = json.loads(opp['skills_offered'])
    return jsonify(opportunities)

# --- Food Rescue --- #
@app.route('/food-rescue', methods=['GET'])
def get_food_rescue_items():
    db = get_db()
    cursor = db.execute("SELECT * FROM food_rescue WHERE status = 'available'")
    items = [dict(row) for row in cursor.fetchall()]
    return jsonify(items)

@app.route('/food-rescue/<int:item_id>/claim', methods=['POST'])
def claim_food_item(item_id):
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    db = get_db()
    cursor = db.execute("SELECT * FROM food_rescue WHERE id = ? AND status = 'available'", (item_id,))
    item = cursor.fetchone()

    if item:
        db.execute(
            "UPDATE food_rescue SET status = 'claimed', claimed_by = ?, claimed_at = CURRENT_TIMESTAMP WHERE id = ?",
            (user_id, item_id)
        )
        db.commit()
        return jsonify({'message': 'Food item claimed successfully'}), 200
    return jsonify({'error': 'Food item not found or already claimed'}), 404

# --- Marketplace --- #
@app.route('/marketplace/items', methods=['GET'])
def get_marketplace_items():
    db = get_db()
    cursor = db.execute("SELECT * FROM marketplace_items WHERE status = 'available'")
    items = [dict(row) for row in cursor.fetchall()]
    return jsonify(items)

@app.route('/marketplace/items', methods=['POST'])
def add_marketplace_item():
    data = request.json
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO marketplace_items (seller_id, item_name, description, category, price, trade_for, image_url, location, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (data['seller_id'], data['item_name'], data.get('description'), data['category'], data.get('price'), 
             data.get('trade_for'), data.get('image_url'), data.get('location'), data.get('latitude'), data.get('longitude'), 'available')
        )
        db.commit()
        return jsonify({'message': 'Item added to marketplace', 'item_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/marketplace/chats/<int:item_id>', methods=['GET'])
def get_marketplace_chat(item_id):
    db = get_db()
    chat_cursor = db.execute("SELECT id FROM marketplace_chats WHERE item_id = ?", (item_id,))
    chat = chat_cursor.fetchone()
    if chat:
        chat_id = chat['id']
        messages_cursor = db.execute("SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC", (chat_id,))
        messages = [dict(row) for row in messages_cursor.fetchall()]
        return jsonify(messages)
    return jsonify({'error': 'Chat not found for this item'}), 404

@app.route('/marketplace/chats/<int:item_id>/message', methods=['POST'])
def send_marketplace_message(item_id):
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    if not user_id or not message:
        return jsonify({'error': 'User ID and message are required'}), 400

    db = get_db()
    chat_cursor = db.execute("SELECT id FROM marketplace_chats WHERE item_id = ?", (item_id,))
    chat = chat_cursor.fetchone()
    chat_id = None
    if chat:
        chat_id = chat['id']
    else:
        # Create a new chat if it doesn't exist
        new_chat_cursor = db.execute("INSERT INTO marketplace_chats (item_id) VALUES (?) RETURNING id", (item_id,))
        chat_id = new_chat_cursor.fetchone()[0]
        db.commit()

    db.execute(
        "INSERT INTO chat_messages (chat_id, user_id, message) VALUES (?, ?, ?)",
        (chat_id, user_id, message)
    )
    db.commit()
    return jsonify({'message': 'Message sent successfully'}), 201

# --- SeedBuddy --- #
@app.route('/seedbuddy/plots', methods=['GET'])
def get_seedbuddy_plots():
    db = get_db()
    cursor = db.execute("SELECT * FROM seed_buddy_plots")
    plots = [dict(row) for row in cursor.fetchall()]
    for plot in plots:
        if plot.get('plan'):
            plot['plan'] = json.loads(plot['plan'])
    return jsonify(plots)

@app.route('/seedbuddy/plots', methods=['POST'])
def create_seedbuddy_plot():
    data = request.json
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO seed_buddy_plots (user_id, name, location, size_sqft, plan, image_url, gamification_level, xp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (data['user_id'], data['name'], data.get('location'), data.get('size_sqft'), 
             json.dumps(data.get('plan', {})), data.get('image_url'), 1, 0)
        )
        db.commit()
        return jsonify({'message': 'SeedBuddy plot created', 'plot_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/seedbuddy/plots/<int:plot_id>/crops', methods=['GET'])
def get_seedbuddy_crops(plot_id):
    db = get_db()
    cursor = db.execute("SELECT * FROM seed_buddy_crops WHERE plot_id = ?", (plot_id,))
    crops = [dict(row) for row in cursor.fetchall()]
    return jsonify(crops)

@app.route('/seedbuddy/plots/<int:plot_id>/crops', methods=['POST'])
def add_seedbuddy_crop(plot_id):
    data = request.json
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO seed_buddy_crops (plot_id, crop_name, planting_date, expected_harvest_date, status, yield_estimate_lbs, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (plot_id, data['crop_name'], data.get('planting_date'), data.get('expected_harvest_date'), 
             data.get('status', 'planted'), data.get('yield_estimate_lbs'), data.get('notes'))
        )
        db.commit()
        return jsonify({'message': 'Crop added to plot', 'crop_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/seedbuddy/achievements/<int:user_id>', methods=['GET'])
def get_seedbuddy_achievements(user_id):
    db = get_db()
    cursor = db.execute("SELECT * FROM seed_buddy_achievements WHERE user_id = ?", (user_id,))
    achievements = [dict(row) for row in cursor.fetchall()]
    return jsonify(achievements)

# --- Settings --- #
@app.route('/settings/<int:user_id>', methods=['GET', 'PUT'])
def user_settings(user_id):
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
        settings = cursor.fetchone()
        if settings:
            return jsonify(dict(settings))
        return jsonify({'error': 'Settings not found'}), 404
    elif request.method == 'PUT':
        data = request.json
        db.execute(
            "UPDATE user_settings SET notifications_enabled = ?, email_notifications = ?, location_sharing = ?, language = ?, theme = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
            (data.get('notifications_enabled'), data.get('email_notifications'), data.get('location_sharing'), 
             data.get('language'), data.get('theme'), user_id)
        )
        db.commit()
        return jsonify({'message': 'Settings updated successfully'}), 200

# --- Resource Requests --- #
@app.route('/resource-requests', methods=['POST'])
def create_resource_request():
    data = request.json
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO resource_requests (user_id, request_type, item_description, quantity, urgency, location, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['user_id'], data['request_type'], data['item_description'], data.get('quantity'), 
             data.get('urgency'), data.get('location'), data.get('latitude'), data.get('longitude'))
        )
        db.commit()
        return jsonify({'message': 'Resource request created', 'request_id': cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/resource-requests', methods=['GET'])
def get_resource_requests():
    db = get_db()
    cursor = db.execute("SELECT * FROM resource_requests WHERE status = 'pending'")
    requests = [dict(row) for row in cursor.fetchall()]
    return jsonify(requests)

# --- Chatbot --- #
@app.route('/chatbot', methods=['POST'])
def chatbot():
    """Handle chatbot conversations using OpenAI API"""
    try:
        # Ensure OpenAI API key is set as an environment variable for security
        openai_api_key = os.environ.get("OPENAI_API_KEY")
        if not openai_api_key:
            # Fallback to hardcoded key if not in env (for sandbox testing only, not recommended for production)
            openai_api_key = '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'

        client = OpenAI(api_key=openai_api_key)
        
        data = request.json
        message = data.get('message', '')
        user_id = data.get('user_id') # Not directly used by OpenAI, but useful for logging/context
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        system_message = """You are a helpful assistant for GrowTogether, a community support platform that helps low-income youth and communities access resources, mentorship, and opportunities. 

Your role is to:
- Help users find food resources, housing, healthcare, and other essential services
- Connect users with mentors and job opportunities
- Provide guidance on using the platform's features
- Offer encouragement and support
- Answer questions about community programs and resources

Be compassionate, supportive, and practical in your responses. Keep answers concise and actionable."""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        bot_response = response.choices[0].message.content
        
        return jsonify({
            'response': bot_response,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        return jsonify({'error': 'Failed to process chatbot request', 'details': str(e)}), 500


# --- Database Initialization on App Context --- #
with app.app_context():
    if not os.path.exists(DATABASE):
        init_db()
        insert_sample_data()
    else:
        # Check if schema needs migration or update if DATABASE exists
        # For now, we'll just re-init if it's an old schema, or ensure it's up-to-date
        # A more robust solution would involve schema versioning and migration scripts
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(user_preferences)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'onboarding_complete' not in columns:
            print("Migrating old schema to V3...")
            init_db() # Re-initialize for simplicity in sandbox
            insert_sample_data()
        conn.close()


