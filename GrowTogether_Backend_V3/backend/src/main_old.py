from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)
DATABASE = 'growtogether.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        with open('src/schema.sql', 'r') as f:
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
        
        # Add new tables for enhanced features
        db.execute('''
            CREATE TABLE IF NOT EXISTS food_rescue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donor_id INTEGER REFERENCES users(id),
                food_type TEXT NOT NULL,
                quantity TEXT NOT NULL,
                pickup_location TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                expiry_date DATE,
                status TEXT DEFAULT 'available',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.execute('''
            CREATE TABLE IF NOT EXISTS skills_exchange (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id),
                skill_offered TEXT NOT NULL,
                skill_description TEXT,
                exchange_for TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                rating REAL DEFAULT 0.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.execute('''
            CREATE TABLE IF NOT EXISTS emergency_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reporter_id INTEGER REFERENCES users(id),
                alert_type TEXT NOT NULL,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                severity TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.execute('''
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
                status TEXT DEFAULT 'available',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.execute('''
            CREATE TABLE IF NOT EXISTS urban_gardens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                size_sqft INTEGER,
                available_plots INTEGER,
                amenities TEXT,
                contact_info TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.execute('''
            CREATE TABLE IF NOT EXISTS nutritional_recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                ingredients TEXT NOT NULL,
                instructions TEXT NOT NULL,
                nutrition_info TEXT,
                cost_estimate REAL,
                difficulty TEXT DEFAULT 'easy',
                prep_time INTEGER,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        db.commit()

def insert_sample_data():
    with app.app_context():
        db = get_db()
        with open('src/sample_data.json', 'r') as f:
            sample_data = json.load(f)

        # Insert existing sample data
        for user in sample_data['users']:
            db.execute(
                "INSERT INTO users (id, username, password_hash, email, role, preferred_languages, location, skills, interests, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (user['id'], user['username'], user['password_hash'], user['email'], user['role'],
                 json.dumps(user['preferred_languages']), user['location'], json.dumps(user['skills']), json.dumps(user['interests']), user['created_at'])
            )
        db.commit()

        for resource in sample_data['resources']:
            db.execute(
                "INSERT INTO resources (id, name, type, address, latitude, longitude, contact_info, description, availability, languages_supported, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (resource['id'], resource['name'], resource['type'], resource['address'], resource['latitude'], resource['longitude'],
                 json.dumps(resource['contact_info']), resource['description'], json.dumps(resource['availability']), json.dumps(resource['languages_supported']), resource['created_at'])
            )
        db.commit()

        for item in sample_data['food_items']:
            db.execute(
                "INSERT INTO food_items (id, name, category, nutrition_info, created_at) VALUES (?, ?, ?, ?, ?)",
                (item['id'], item['name'], item['category'], json.dumps(item['nutrition_info']), item['created_at'])
            )
        db.commit()

        for meal in sample_data['meal_suggestions']:
            db.execute(
                "INSERT INTO meal_suggestions (id, name, description, image_url, ingredients_ids, resource_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (meal['id'], meal['name'], meal['description'], meal['image_url'], json.dumps(meal['ingredients_ids']), meal['resource_id'], meal['created_at'])
            )
        db.commit()

        for mentor in sample_data['mentors']:
            db.execute(
                "INSERT INTO mentors (id, user_id, bio, expertise, availability, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (mentor['id'], mentor['user_id'], mentor['bio'], json.dumps(mentor['expertise']), json.dumps(mentor['availability']), mentor['rating'], mentor['created_at'])
            )
        db.commit()

        for opp in sample_data['opportunities']:
            db.execute(
                "INSERT INTO opportunities (id, title, type, description, requirements, location, mentor_id, duration, compensation, application_link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (opp['id'], opp['title'], opp['type'], opp['description'], json.dumps(opp['requirements']), opp['location'], opp['mentor_id'], opp['duration'], opp['compensation'], opp['application_link'], opp['created_at'])
            )
        db.commit()

        for progress in sample_data['user_progress']:
            db.execute(
                "INSERT INTO user_progress (id, user_id, opportunity_id, status, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (progress['id'], progress['user_id'], progress['opportunity_id'], progress['status'], progress['notes'], progress['updated_at'])
            )
        db.commit()

        for farm in sample_data['farms']:
            db.execute(
                "INSERT INTO farms (id, user_id, name, location, size_sqft, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (farm['id'], farm['user_id'], farm['name'], farm['location'], farm['size_sqft'], json.dumps(farm['plan']), farm['created_at'])
            )
        db.commit()

        for crop in sample_data['farm_crops']:
            db.execute(
                "INSERT INTO farm_crops (id, farm_id, crop_name, planting_date, expected_harvest_date, status, yield_estimate_lbs, actual_yield_lbs, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (crop['id'], crop['farm_id'], crop['crop_name'], crop['planting_date'], crop['expected_harvest_date'], crop['status'], crop['yield_estimate_lbs'], crop['actual_yield_lbs'], crop['created_at'])
            )
        db.commit()

        for post in sample_data['community_posts']:
            db.execute(
                "INSERT INTO community_posts (id, user_id, title, content, image_url, post_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (post['id'], post['user_id'], post['title'], post['content'], post['image_url'], post['post_type'], post['created_at'])
            )
        db.commit()

        for comment in sample_data['comments']:
            db.execute(
                "INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
                (comment['id'], comment['post_id'], comment['user_id'], comment['content'], comment['created_at'])
            )
        db.commit()

        # Insert sample data for new features
        sample_food_rescue = [
            (1, 'Surplus bread and pastries', '20 loaves', '123 Main St, Springfield', 33.5, -118.2, '2025-10-12', 'available'),
            (2, 'Fresh vegetables', '50 lbs', '456 Oak Ave, Riverside', 34.1, -117.8, '2025-10-11', 'available'),
        ]
        for item in sample_food_rescue:
            db.execute(
                "INSERT INTO food_rescue (donor_id, food_type, quantity, pickup_location, latitude, longitude, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                item
            )
        db.commit()

        sample_skills = [
            (1, 'Tutoring (Math & English)', 'Help with homework and test prep', 'Meals or groceries', 'active', 4.5),
            (2, 'Home repairs', 'Basic plumbing and electrical work', 'Food or supplies', 'active', 4.8),
        ]
        for skill in sample_skills:
            db.execute(
                "INSERT INTO skills_exchange (user_id, skill_offered, skill_description, exchange_for, status, rating) VALUES (?, ?, ?, ?, ?, ?)",
                skill
            )
        db.commit()

        sample_gardens = [
            ('Riverside Community Garden', '789 Garden Ln, Riverside', 34.0, -117.9, 5000, 12, json.dumps(['water', 'tools', 'compost']), json.dumps({'phone': '555-GARDEN'})),
            ('Springfield Urban Farm', '321 Farm Rd, Springfield', 33.6, -118.1, 8000, 20, json.dumps(['water', 'shed', 'parking']), json.dumps({'email': 'info@springfieldfarm.org'})),
        ]
        for garden in sample_gardens:
            db.execute(
                "INSERT INTO urban_gardens (name, location, latitude, longitude, size_sqft, available_plots, amenities, contact_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                garden
            )
        db.commit()

        sample_recipes = [
            ('Budget Bean Soup', 'Hearty and nutritious soup', json.dumps(['beans', 'carrots', 'onions', 'broth']), 
             'Soak beans overnight. Sauté vegetables. Add beans and broth. Simmer for 1 hour.', 
             json.dumps({'calories': 250, 'protein': 15, 'fiber': 12}), 3.50, 'easy', 75),
            ('Veggie Stir-Fry', 'Quick and healthy meal', json.dumps(['rice', 'mixed vegetables', 'soy sauce', 'garlic']), 
             'Cook rice. Stir-fry vegetables with garlic. Add soy sauce. Serve over rice.', 
             json.dumps({'calories': 300, 'protein': 8, 'fiber': 6}), 4.00, 'easy', 25),
        ]
        for recipe in sample_recipes:
            db.execute(
                "INSERT INTO nutritional_recipes (name, description, ingredients, instructions, nutrition_info, cost_estimate, difficulty, prep_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                recipe
            )
        db.commit()

@app.route('/')
def index():
    return jsonify({'message': 'GrowTogether Backend API', 'version': '2.0'})

# --- Resource Hub (Food & Nutrition Matching) --- #
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

@app.route('/food_items', methods=['GET'])
def get_food_items():
    db = get_db()
    cursor = db.execute("SELECT * FROM food_items")
    food_items = [dict(row) for row in cursor.fetchall()]
    for item in food_items:
        item['nutrition_info'] = json.loads(item['nutrition_info']) if item['nutrition_info'] else None
    return jsonify(food_items)

@app.route('/meal_suggestions', methods=['GET'])
def get_meal_suggestions():
    db = get_db()
    cursor = db.execute("SELECT * FROM meal_suggestions")
    meal_suggestions = [dict(row) for row in cursor.fetchall()]
    for meal in meal_suggestions:
        meal['ingredients_ids'] = json.loads(meal['ingredients_ids']) if meal['ingredients_ids'] else []
    return jsonify(meal_suggestions)

# --- Job & Mentorship Hub --- #
@app.route('/mentors', methods=['GET'])
def get_mentors():
    db = get_db()
    cursor = db.execute("SELECT m.*, u.username, u.email FROM mentors m JOIN users u ON m.user_id = u.id")
    mentors = [dict(row) for row in cursor.fetchall()]
    for m in mentors:
        m['expertise'] = json.loads(m['expertise']) if m['expertise'] else []
        m['availability'] = json.loads(m['availability']) if m['availability'] else None
    return jsonify(mentors)

@app.route('/opportunities', methods=['GET'])
def get_opportunities():
    db = get_db()
    cursor = db.execute("SELECT * FROM opportunities")
    opportunities = [dict(row) for row in cursor.fetchall()]
    for opp in opportunities:
        opp['requirements'] = json.loads(opp['requirements']) if opp['requirements'] else []
    return jsonify(opportunities)

@app.route('/user_progress', methods=['GET'])
def get_user_progress():
    user_id = request.args.get('user_id')
    db = get_db()
    if user_id:
        cursor = db.execute("SELECT * FROM user_progress WHERE user_id = ?", (user_id,))
    else:
        cursor = db.execute("SELECT * FROM user_progress")
    progress = [dict(row) for row in cursor.fetchall()]
    return jsonify(progress)

# --- Micro-Farming Entrepreneurship System --- #
@app.route('/farms', methods=['GET'])
def get_farms():
    db = get_db()
    cursor = db.execute("SELECT * FROM farms")
    farms = [dict(row) for row in cursor.fetchall()]
    for farm in farms:
        farm['plan'] = json.loads(farm['plan']) if farm['plan'] else None
    return jsonify(farms)

@app.route('/farm_crops', methods=['GET'])
def get_farm_crops():
    db = get_db()
    cursor = db.execute("SELECT * FROM farm_crops")
    farm_crops = [dict(row) for row in cursor.fetchall()]
    return jsonify(farm_crops)

@app.route('/community_posts', methods=['GET'])
def get_community_posts():
    db = get_db()
    cursor = db.execute("SELECT cp.*, u.username FROM community_posts cp JOIN users u ON cp.user_id = u.id ORDER BY cp.created_at DESC")
    posts = [dict(row) for row in cursor.fetchall()]
    return jsonify(posts)

@app.route('/comments', methods=['GET'])
def get_comments():
    post_id = request.args.get('post_id')
    db = get_db()
    if post_id:
        cursor = db.execute("SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ?", (post_id,))
    else:
        cursor = db.execute("SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id")
    comments = [dict(row) for row in cursor.fetchall()]
    return jsonify(comments)

# --- Food Rescue & Redistribution --- #
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

# --- Skills-to-Food Exchange --- #
@app.route('/skills_exchange', methods=['GET', 'POST'])
def skills_exchange():
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT se.*, u.username FROM skills_exchange se JOIN users u ON se.user_id = u.id WHERE se.status = 'active' ORDER BY se.created_at DESC")
        skills = [dict(row) for row in cursor.fetchall()]
        return jsonify(skills)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO skills_exchange (user_id, skill_offered, skill_description, exchange_for, status) VALUES (?, ?, ?, ?, ?)",
            (data['user_id'], data['skill_offered'], data.get('skill_description'), data['exchange_for'], 'active')
        )
        db.commit()
        return jsonify({'message': 'Skill exchange listing added successfully'}), 201

# --- Emergency Alerts --- #
@app.route('/emergency_alerts', methods=['GET', 'POST'])
def emergency_alerts():
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT ea.*, u.username FROM emergency_alerts ea JOIN users u ON ea.reporter_id = u.id WHERE ea.status = 'active' ORDER BY ea.created_at DESC")
        alerts = [dict(row) for row in cursor.fetchall()]
        return jsonify(alerts)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO emergency_alerts (reporter_id, alert_type, description, location, latitude, longitude, severity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (data['reporter_id'], data['alert_type'], data['description'], data['location'], 
             data.get('latitude'), data.get('longitude'), data.get('severity', 'medium'), 'active')
        )
        db.commit()
        return jsonify({'message': 'Emergency alert created successfully'}), 201

# --- Community Co-op Marketplace --- #
@app.route('/marketplace', methods=['GET', 'POST'])
def marketplace():
    db = get_db()
    if request.method == 'GET':
        cursor = db.execute("SELECT m.*, u.username FROM marketplace_items m JOIN users u ON m.seller_id = u.id WHERE m.status = 'available' ORDER BY m.created_at DESC")
        items = [dict(row) for row in cursor.fetchall()]
        return jsonify(items)
    elif request.method == 'POST':
        data = request.json
        db.execute(
            "INSERT INTO marketplace_items (seller_id, item_name, description, category, price, trade_for, location, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (data['seller_id'], data['item_name'], data.get('description'), data['category'], 
             data.get('price'), data.get('trade_for'), data.get('location'), 'available')
        )
        db.commit()
        return jsonify({'message': 'Marketplace item added successfully'}), 201

# --- Urban Micro-Gardens Network --- #
@app.route('/urban_gardens', methods=['GET'])
def urban_gardens():
    db = get_db()
    cursor = db.execute("SELECT * FROM urban_gardens")
    gardens = [dict(row) for row in cursor.fetchall()]
    for garden in gardens:
        garden['amenities'] = json.loads(garden['amenities']) if garden['amenities'] else []
        garden['contact_info'] = json.loads(garden['contact_info']) if garden['contact_info'] else None
    return jsonify(gardens)

# --- Nutritional Education --- #
@app.route('/recipes', methods=['GET'])
def recipes():
    db = get_db()
    cursor = db.execute("SELECT * FROM nutritional_recipes ORDER BY created_at DESC")
    recipes = [dict(row) for row in cursor.fetchall()]
    for recipe in recipes:
        recipe['ingredients'] = json.loads(recipe['ingredients']) if recipe['ingredients'] else []
        recipe['nutrition_info'] = json.loads(recipe['nutrition_info']) if recipe['nutrition_info'] else None
    return jsonify(recipes)

# Initialize database and insert sample data only if the database file doesn't exist
if not os.path.exists(DATABASE):
    with app.app_context():
        init_db()
        insert_sample_data()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)

