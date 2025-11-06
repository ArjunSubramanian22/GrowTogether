from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)
DATABASE = 'growtogether_v2.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with open('src/schema_v2.sql', 'r') as f:
            schema_sql = f.read()
            # SQLite adaptations
            schema_sql = schema_sql.replace('TEXT[]', 'TEXT')
            schema_sql = schema_sql.replace('JSONB', 'TEXT')
            schema_sql = schema_sql.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
            schema_sql = schema_sql.replace('TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
            schema_sql = schema_sql.replace('DECIMAL(10, 8)', 'REAL')
            schema_sql = schema_sql.replace('DECIMAL(11, 8)', 'REAL')
            schema_sql = schema_sql.replace('DECIMAL(2, 1)', 'REAL')
            schema_sql = schema_sql.replace('DECIMAL(10, 2)', 'REAL')
            schema_sql = schema_sql.replace('INTEGER[]', 'TEXT')
            schema_sql = schema_sql.replace('user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE', 'user_id INTEGER REFERENCES users(id) ON DELETE CASCADE')
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

        # Sample user preferences
        preferences = [
            (1, 1, json.dumps(['vegetarian']), json.dumps(['italian', 'mexican']), json.dumps(['cooking', 'gardening']), 
             json.dumps(['food service', 'agriculture']), 'beginner', json.dumps(['weekends']), 'public_transit', json.dumps(['find_food', 'learn_skills'])),
            (2, 2, json.dumps(['gluten-free']), json.dumps(['asian', 'mediterranean']), json.dumps(['tech', 'cooking']), 
             json.dumps(['retail', 'tech']), 'intermediate', json.dumps(['weekdays', 'evenings']), 'car', json.dumps(['earn_income', 'learn_skills'])),
        ]
        for pref in preferences:
            db.execute(
                "INSERT OR IGNORE INTO user_preferences (id, user_id, dietary_restrictions, favorite_cuisines, skill_interests, job_interests, experience_level, availability, transportation, goals) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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

        # Sample mentors
        mentors = [
            (1, 3, 'Experienced chef and community organizer', json.dumps(['cooking', 'food service', 'entrepreneurship']), 
             json.dumps({'weekdays': '6pm-9pm', 'weekends': '10am-4pm'}), 4.8, json.dumps(['16-18', '19-25'])),
        ]
        for mentor in mentors:
            db.execute(
                "INSERT OR IGNORE INTO mentors (id, user_id, bio, expertise, availability, rating, age_groups) VALUES (?, ?, ?, ?, ?, ?, ?)",
                mentor
            )
        db.commit()

        # Sample opportunities
        opportunities = [
            (1, 'Kitchen Assistant', 'job', 'Help prepare meals at community kitchen', json.dumps(['Food handler certification helpful']), 
             'Los Angeles, CA', 34.0622, -118.2537, 1, '3 months', '$15/hour', 16, 'https://example.com/apply', json.dumps(['cooking', 'food safety'])),
            (2, 'Garden Apprentice', 'apprenticeship', 'Learn urban farming techniques', json.dumps(['Interest in agriculture']), 
             'Los Angeles, CA', 34.0722, -118.2637, 1, '6 months', 'Stipend + produce', 16, 'https://example.com/apply', json.dumps(['gardening', 'agriculture'])),
        ]
        for opp in opportunities:
            db.execute(
                "INSERT OR IGNORE INTO opportunities (id, title, type, description, requirements, location, latitude, longitude, mentor_id, duration, compensation, min_age, application_link, skills_offered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                opp
            )
        db.commit()

        # Sample food rescue items
        food_rescue_items = [
            (1, 1, 'Fresh bread and pastries', '20 loaves', '123 Main St, Los Angeles, CA', 34.0522, -118.2437, '2025-10-12', 'available', None, None),
            (2, 2, 'Vegetables', '50 lbs', '456 Oak Ave, Los Angeles, CA', 34.0622, -118.2537, '2025-10-11', 'available', None, None),
        ]
        for item in food_rescue_items:
            db.execute(
                "INSERT OR IGNORE INTO food_rescue (id, donor_id, food_type, quantity, pickup_location, latitude, longitude, expiry_date, status, claimed_by, claimed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                item
            )
        db.commit()

        # Sample marketplace items
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
             'https://via.placeholder.com/300x200?text=Garden+Plot'),
        ]
        for plot in plots:
            db.execute(
                "INSERT OR IGNORE INTO seed_buddy_plots (id, user_id, name, location, size_sqft, plan, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
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

@app.route('/')
def index():
    return jsonify({'message': 'GrowTogether Backend API V2', 'version': '2.0'})

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
            for field in ['dietary_restrictions', 'favorite_cuisines', 'skill_interests', 'job_interests', 'availability', 'goals']:
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
        
        if existing:
            # Update
            db.execute(
                "UPDATE user_preferences SET dietary_restrictions = ?, favorite_cuisines = ?, skill_interests = ?, job_interests = ?, experience_level = ?, availability = ?, transportation = ?, goals = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                (json.dumps(data.get('dietary_restrictions', [])), json.dumps(data.get('favorite_cuisines', [])), 
                 json.dumps(data.get('skill_interests', [])), json.dumps(data.get('job_interests', [])), 
                 data.get('experience_level'), json.dumps(data.get('availability', [])), 
                 data.get('transportation'), json.dumps(data.get('goals', [])), user_id)
            )
        else:
            # Insert
            db.execute(
                "INSERT INTO user_preferences (user_id, dietary_restrictions, favorite_cuisines, skill_interests, job_interests, experience_level, availability, transportation, goals) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user_id, json.dumps(data.get('dietary_restrictions', [])), json.dumps(data.get('favorite_cuisines', [])), 
                 json.dumps(data.get('skill_interests', [])), json.dumps(data.get('job_interests', [])), 
                 data.get('experience_level'), json.dumps(data.get('availability', [])), 
                 data.get('transportation'), json.dumps(data.get('goals', [])))
            )
        db.commit()
        return jsonify({'message': 'Preferences saved successfully'}), 200

# --- Resources --- #
@app.route('/resources', methods=['GET'])
def get_resources():
    db = get_db()
    cursor = db.execute("SELECT * FROM resources")
    resources = [dict(row) for row in cursor.fetchall()]
    for r in resources:
        r['contact_info'] = json.loads(r['contact_info']) if r['contact_info'] else None
        r['availability'] = json.loads(r['availability']) if r['availability'] else None
        r['languages_supported'] = json.loads(r['languages_supported']) if r['languages_supported'] else None
    return jsonify(resources)

@app.route('/resources/<int:resource_id>', methods=['GET'])
def get_resource_detail(resource_id):
    db = get_db()
    cursor = db.execute("SELECT * FROM resources WHERE id = ?", (resource_id,))
    resource = cursor.fetchone()
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404
    
    resource_dict = dict(resource)
    resource_dict['contact_info'] = json.loads(resource_dict['contact_info']) if resource_dict['contact_info'] else None
    resource_dict['availability'] = json.loads(resource_dict['availability']) if resource_dict['availability'] else None
    resource_dict['languages_supported'] = json.loads(resource_dict['languages_supported']) if resource_dict['languages_supported'] else None
    
    # Get additional details
    cursor = db.execute("SELECT * FROM resource_details WHERE resource_id = ?", (resource_id,))
    details = cursor.fetchone()
    if details:
        details_dict = dict(details)
        details_dict['services_offered'] = json.loads(details_dict['services_offered']) if details_dict['services_offered'] else []
        details_dict['documents_needed'] = json.loads(details_dict['documents_needed']) if details_dict['documents_needed'] else []
        resource_dict['details'] = details_dict
    
    return jsonify(resource_dict)

# --- Personalized Meal Suggestions --- #
@app.route('/meals/personalized/<int:user_id>', methods=['GET'])
def get_personalized_meals(user_id):
    db = get_db()
    # Get user preferences
    cursor = db.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
    prefs = cursor.fetchone()
    
    if not prefs:
        # Return all meals if no preferences
        cursor = db.execute("SELECT * FROM meal_suggestions")
    else:
        prefs_dict = dict(prefs)
        dietary_restrictions = json.loads(prefs_dict['dietary_restrictions']) if prefs_dict['dietary_restrictions'] else []
        favorite_cuisines = json.loads(prefs_dict['favorite_cuisines']) if prefs_dict['favorite_cuisines'] else []
        
        # Filter meals based on preferences
        cursor = db.execute("SELECT * FROM meal_suggestions")
        all_meals = [dict(row) for row in cursor.fetchall()]
        filtered_meals = []
        
        for meal in all_meals:
            dietary_tags = json.loads(meal['dietary_tags']) if meal['dietary_tags'] else []
            # Check if meal matches dietary restrictions
            if dietary_restrictions:
                if any(tag in dietary_tags for tag in dietary_restrictions):
                    filtered_meals.append(meal)
            # Check if meal matches favorite cuisines
            elif favorite_cuisines:
                if meal['cuisine_type'] in favorite_cuisines:
                    filtered_meals.append(meal)
            else:
                filtered_meals.append(meal)
        
        return jsonify(filtered_meals)
    
    meals = [dict(row) for row in cursor.fetchall()]
    for meal in meals:
        meal['ingredients_ids'] = json.loads(meal['ingredients_ids']) if meal['ingredients_ids'] else []
        meal['dietary_tags'] = json.loads(meal['dietary_tags']) if meal['dietary_tags'] else []
        meal['nutrition_info'] = json.loads(meal['nutrition_info']) if meal['nutrition_info'] else None
    return jsonify(meals)

# --- Mentors --- #
@app.route('/mentors', methods=['GET'])
def get_mentors():
    db = get_db()
    cursor = db.execute("SELECT m.*, u.username, u.email FROM mentors m JOIN users u ON m.user_id = u.id")
    mentors = [dict(row) for row in cursor.fetchall()]
    for m in mentors:
        m['expertise'] = json.loads(m['expertise']) if m['expertise'] else []
        m['availability'] = json.loads(m['availability']) if m['availability'] else None
        m['age_groups'] = json.loads(m['age_groups']) if m['age_groups'] else []
    return jsonify(mentors)

# --- Opportunities (Jobs for 16+) --- #
@app.route('/opportunities', methods=['GET'])
def get_opportunities():
    db = get_db()
    user_age = request.args.get('user_age', type=int)
    
    if user_age:
        cursor = db.execute("SELECT * FROM opportunities WHERE min_age <= ?", (user_age,))
    else:
        cursor = db.execute("SELECT * FROM opportunities")
    
    opportunities = [dict(row) for row in cursor.fetchall()]
    for opp in opportunities:
        opp['requirements'] = json.loads(opp['requirements']) if opp['requirements'] else []
        opp['skills_offered'] = json.loads(opp['skills_offered']) if opp['skills_offered'] else []
    return jsonify(opportunities)

@app.route('/opportunities/personalized/<int:user_id>', methods=['GET'])
def get_personalized_opportunities(user_id):
    db = get_db()
    # Get user info and preferences
    cursor = db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_age = dict(user)['age']
    
    cursor = db.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
    prefs = cursor.fetchone()
    
    # Get opportunities matching user age
    cursor = db.execute("SELECT * FROM opportunities WHERE min_age <= ?", (user_age,))
    all_opps = [dict(row) for row in cursor.fetchall()]
    
    if not prefs:
        # Return all age-appropriate opportunities if no preferences
        for opp in all_opps:
            opp['requirements'] = json.loads(opp['requirements']) if opp['requirements'] else []
            opp['skills_offered'] = json.loads(opp['skills_offered']) if opp['skills_offered'] else []
        return jsonify(all_opps)
    
    prefs_dict = dict(prefs)
    job_interests = json.loads(prefs_dict['job_interests']) if prefs_dict['job_interests'] else []
    skill_interests = json.loads(prefs_dict['skill_interests']) if prefs_dict['skill_interests'] else []
    
    # Filter opportunities based on interests
    filtered_opps = []
    for opp in all_opps:
        opp['requirements'] = json.loads(opp['requirements']) if opp['requirements'] else []
        opp['skills_offered'] = json.loads(opp['skills_offered']) if opp['skills_offered'] else []
        
        # Check if opportunity matches job or skill interests
        if job_interests or skill_interests:
            if any(interest.lower() in opp['title'].lower() or interest.lower() in opp['description'].lower() 
                   for interest in job_interests + skill_interests):
                filtered_opps.append(opp)
        else:
            filtered_opps.append(opp)
    
    return jsonify(filtered_opps if filtered_opps else all_opps)

# --- Food Rescue --- #
@app.route('/food_rescue', methods=['GET', 'POST'])
def food_rescue():
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT * FROM food_rescue WHERE status = 'available' ORDER BY created_at DESC")
        items = [dict(row) for row in cursor.fetchall()]
        return jsonify(items)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO food_rescue (donor_id, food_type, quantity, pickup_location, latitude, longitude, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (data.get('donor_id'), data['food_type'], data['quantity'], data['pickup_location'], 
             data.get('latitude'), data.get('longitude'), data.get('expiry_date'), 'available')
        )
        db.commit()
        return jsonify({'message': 'Food rescue item added successfully'}), 201

@app.route('/food_rescue/<int:item_id>/claim', methods=['POST'])
def claim_food(item_id):
    data = request.json
    user_id = data.get('user_id')
    
    db = get_db()
    # Check if item exists and is available
    cursor = db.execute("SELECT * FROM food_rescue WHERE id = ? AND status = 'available'", (item_id,))
    item = cursor.fetchone()
    
    if not item:
        return jsonify({'error': 'Item not found or already claimed'}), 404
    
    # Claim the item
    db.execute(
        "UPDATE food_rescue SET status = 'claimed', claimed_by = ?, claimed_at = CURRENT_TIMESTAMP WHERE id = ?",
        (user_id, item_id)
    )
    db.commit()
    
    return jsonify({'message': 'Food claimed successfully'}), 200

# --- Marketplace --- #
@app.route('/marketplace', methods=['GET', 'POST'])
def marketplace():
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT m.*, u.username FROM marketplace_items m JOIN users u ON m.seller_id = u.id WHERE m.status = 'available' ORDER BY m.created_at DESC")
        items = [dict(row) for row in cursor.fetchall()]
        return jsonify(items)
    elif request.method == 'POST':
        data = request.json
        cursor = db.execute(
            "INSERT INTO marketplace_items (seller_id, item_name, description, category, price, trade_for, image_url, location, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (data['seller_id'], data['item_name'], data.get('description'), data['category'], 
             data.get('price'), data.get('trade_for'), data.get('image_url'), data.get('location'), 
             data.get('latitude'), data.get('longitude'), 'available')
        )
        db.commit()
        item_id = cursor.lastrowid
        
        # Create chat room for this item
        db.execute("INSERT INTO marketplace_chats (item_id) VALUES (?)", (item_id,))
        db.commit()
        
        return jsonify({'message': 'Marketplace item added successfully', 'item_id': item_id}), 201

# --- Marketplace Chat --- #
@app.route('/marketplace/<int:item_id>/chat', methods=['GET', 'POST'])
def marketplace_chat(item_id):
    db = get_db()
    
    # Get or create chat room
    cursor = db.execute("SELECT id FROM marketplace_chats WHERE item_id = ?", (item_id,))
    chat = cursor.fetchone()
    
    if not chat:
        cursor = db.execute("INSERT INTO marketplace_chats (item_id) VALUES (?)", (item_id,))
        db.commit()
        chat_id = cursor.lastrowid
    else:
        chat_id = dict(chat)['id']
    
    if request.method == 'GET':
        cursor = db.execute(
            "SELECT cm.*, u.username FROM chat_messages cm JOIN users u ON cm.user_id = u.id WHERE cm.chat_id = ? ORDER BY cm.created_at ASC",
            (chat_id,)
        )
        messages = [dict(row) for row in cursor.fetchall()]
        return jsonify(messages)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO chat_messages (chat_id, user_id, message) VALUES (?, ?, ?)",
            (chat_id, data['user_id'], data['message'])
        )
        db.commit()
        return jsonify({'message': 'Message sent successfully'}), 201

# --- SeedBuddy --- #
@app.route('/seedbuddy/plots', methods=['GET', 'POST'])
def seedbuddy_plots():
    db = get_db()
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        if user_id:
            cursor = db.execute("SELECT * FROM seed_buddy_plots WHERE user_id = ?", (user_id,))
        else:
            cursor = db.execute("SELECT * FROM seed_buddy_plots")
        plots = [dict(row) for row in cursor.fetchall()]
        for plot in plots:
            plot['plan'] = json.loads(plot['plan']) if plot['plan'] else None
        return jsonify(plots)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO seed_buddy_plots (user_id, name, location, size_sqft, plan, image_url) VALUES (?, ?, ?, ?, ?, ?)",
            (data['user_id'], data['name'], data.get('location'), data.get('size_sqft'), 
             json.dumps(data.get('plan', {})), data.get('image_url'))
        )
        db.commit()
        return jsonify({'message': 'Plot created successfully'}), 201

@app.route('/seedbuddy/crops', methods=['GET', 'POST'])
def seedbuddy_crops():
    db = get_db()
    if request.method == 'GET':
        plot_id = request.args.get('plot_id')
        if plot_id:
            cursor = db.execute("SELECT * FROM seed_buddy_crops WHERE plot_id = ?", (plot_id,))
        else:
            cursor = db.execute("SELECT * FROM seed_buddy_crops")
        crops = [dict(row) for row in cursor.fetchall()]
        return jsonify(crops)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO seed_buddy_crops (plot_id, crop_name, planting_date, expected_harvest_date, status, yield_estimate_lbs, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['plot_id'], data['crop_name'], data.get('planting_date'), data.get('expected_harvest_date'), 
             data.get('status', 'planted'), data.get('yield_estimate_lbs'), data.get('notes'))
        )
        db.commit()
        return jsonify({'message': 'Crop added successfully'}), 201

# --- Urban Gardens --- #
@app.route('/urban_gardens', methods=['GET'])
def urban_gardens():
    db = get_db()
    cursor = db.execute("SELECT * FROM urban_gardens")
    gardens = [dict(row) for row in cursor.fetchall()]
    for garden in gardens:
        garden['amenities'] = json.loads(garden['amenities']) if garden['amenities'] else []
        garden['contact_info'] = json.loads(garden['contact_info']) if garden['contact_info'] else None
    return jsonify(gardens)

# --- User Settings --- #
@app.route('/settings/<int:user_id>', methods=['GET', 'PUT'])
def user_settings(user_id):
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
        settings = cursor.fetchone()
        if settings:
            return jsonify(dict(settings))
        else:
            # Create default settings
            db.execute(
                "INSERT INTO user_settings (user_id) VALUES (?)",
                (user_id,)
            )
            db.commit()
            cursor = db.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
            return jsonify(dict(cursor.fetchone()))
    elif request.method == 'PUT':
        data = request.json
        db.execute(
            "UPDATE user_settings SET notifications_enabled = ?, email_notifications = ?, location_sharing = ?, language = ?, theme = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
            (data.get('notifications_enabled'), data.get('email_notifications'), data.get('location_sharing'), 
             data.get('language'), data.get('theme'), user_id)
        )
        db.commit()
        return jsonify({'message': 'Settings updated successfully'}), 200

# Initialize database and insert sample data only if the database file doesn't exist
if not os.path.exists(DATABASE):
    with app.app_context():
        init_db()
        insert_sample_data()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)

