# GrowTogether Backend API

This is the Python Flask backend for the GrowTogether mobile application.

## Setup and Run

1.  **Navigate to the project directory:**
    ```bash
    cd ~/backend
    ```

2.  **Install dependencies:**
    ```bash
    pip3 install Flask gunicorn flask-cors
    ```

3.  **Run the Flask application using Gunicorn:**
    ```bash
    gunicorn -w 4 -b 0.0.0.0:8000 app:app
    ```

    The API will be accessible at `http://<your-server-ip>:8000`.

## Database

The application uses an SQLite database named `growtogether.db`. The schema is defined in `schema.sql` and sample data is loaded from `sample_data.json` upon initial database creation.

## API Endpoints

-   `/`: Basic API info
-   `/resources`: Food resources, food banks, community kitchens
-   `/food_items`: Food items for meal suggestions
-   `/meal_suggestions`: Meal suggestions based on available food
-   `/mentors`: Mentors for job and mentorship hub
-   `/opportunities`: Job, skill-building, and apprenticeship opportunities
-   `/user_progress`: User progress tracking for opportunities
-   `/farms`: Micro-farming details
-   `/farm_crops`: Crops being grown in farms
-   `/community_posts`: Community sharing posts
-   `/comments`: Comments on community posts
-   `/food_rescue`: Food rescue and redistribution listings
-   `/skills_exchange`: Skills-to-food exchange listings
-   `/emergency_alerts`: Emergency alerts for community crises
-   `/marketplace`: Community co-op marketplace items
-   `/urban_gardens`: Urban micro-gardens network information
-   `/recipes`: Nutritional education recipes

## Project Structure

```
backend/
├── app.py
├── schema.sql
├── sample_data.json
└── README.md
```

