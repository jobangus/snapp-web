import random
from datetime import datetime, timedelta
import json

def generate_and_save_geojson(
    start_date_str,
    num_weeks=10,
    entries_per_week=10,
    location=(114.072227,22.502035),
    filename="output.geojson"
):
    """
    Generate synthetic environmental data at fixed coordinates with:
    - Dates spaced 6 weeks apart
    - 10 data points per date
    - Realistic measurement ranges
    - Save to GeoJSON file
    
    Args:
        start_date_str (str): Starting date in 'YYYY-MM-DD' format
        num_weeks (int): Number of date groups (each 6 weeks apart)
        entries_per_week (int): Data points per date (default 10)
        location (tuple): (longitude, latitude)
        filename (str): Output GeoJSON filename
    """
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
    features = []
    
    for week in range(num_weeks):
        # Calculate current date (6 weeks = 42 days between groups)
        current_date = start_date + timedelta(days=42 * week)
        date_str = current_date.strftime('%Y-%m-%d')
        
        # Generate 10 entries for this date
        for _ in range(entries_per_week):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": list(location)
                },
                "properties": {
                    "date": date_str,
                    "temperature": round(random.uniform(15, 30), 2),
                    "pH": round(random.uniform(6.5, 8.5), 2),
                    "dissolvedOxygen": round(random.uniform(4, 10), 2),
                    "EC": round(random.uniform(1.1, 1.25), 2),
                    "turbidity": round(random.uniform(0.35, 0.45), 2),
                    "orp": round(random.uniform(-1.8, -1.9), 2)
                }
            })
    
    # Create GeoJSON structure
    geojson_data = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Save to file
    with open(filename, 'w') as f:
        json.dump(geojson_data, f, indent=2)
    
    print(f"Generated {num_weeks} date groups with {entries_per_week} entries each")
    print(f"Saved to {filename}")

# Example usage:
generate_and_save_geojson(
    start_date_str="2024-12-09",
    num_weeks=10,
    entries_per_week=10,
    filename="data.json"
)

    