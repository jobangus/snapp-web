import json
import pandas as pd
from collections import defaultdict
from supabase import create_client
url = "https://jyjxvjqpadeumirhezog.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5anh2anFwYWRldW1pcmhlem9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTQ5ODEsImV4cCI6MjA2MjAzMDk4MX0.1Ij8gkghm9yEs7m2WMqon7Ohu6wZ_QUuhYXlbSiosLM"
supabase = create_client(url, key)
def load_geojson():
    """Load GeoJSON data from a file."""
    """Fetch data from Supabase and return GeoJSON-like structure"""
    response = supabase.table("ocean_data").select("*").execute()

    features = []
    for record in response.data:
        # Convert database record to GeoJSON-like feature
        feature = {
            "type": "Feature",
            "geometry":record['geom'],
            "properties": {
                "date": record['date'],
                "temperature": record['temperature'],
                "pH": record['ph'],
                "dissolvedOxygen": record['dissolvedoxygen'],
                "EC": record['ec'],
                "turbidity": record['turbidity'],
                "orp": record['orp']
            }
        }
        features.append(feature)
    return {"type": "FeatureCollection", "features": features}

def geojson_to_df(data):
    """Convert GeoJSON to DataFrame."""
    features = data.get('features', []) if not isinstance(data, list) else data
    rows = []
    for feature in features:
        props = feature.get('properties', {})
        if isinstance(props, dict):
            geometry = feature.get('geometry', {})
            if geometry.get('type') == 'Point':
                coords = geometry.get('coordinates', [None, None])
                props['longitude'] = coords[0]
                props['latitude'] = coords[1]
            rows.append(props)
    return pd.DataFrame(rows)

def aggregate_and_convert(df, group_by, metrics, agg_specs, coord_cols=['longitude', 'latitude']):
    """
    Aggregate data and convert to GeoJSON with specified statistics.
    
    Args:
        df (pd.DataFrame): Input data.
        group_by (list): Columns to group by.
        metrics (list): Numeric columns to aggregate.
        agg_specs (dict): Aggregation specifications per metric.
        coord_cols (list): Coordinate column names.
    
    Returns:
        dict: GeoJSON FeatureCollection.
    """
    has_coords = all(col in group_by for col in coord_cols)
    agg_dict = {}

    # Handle coordinates if not in group_by
    if not has_coords:
        agg_dict['longitude'] = (coord_cols[0], 'last')
        agg_dict['latitude'] = (coord_cols[1], 'last')

    # Add metric aggregations
    for metric in metrics:
        if metric in agg_specs:
            for stat_name, func in agg_specs[metric]:
                agg_dict[f'{metric}_{stat_name}'] = (metric, func)

    grouped = df.groupby(group_by, as_index=False).agg(**agg_dict)

    features = []
    for _, row in grouped.iterrows():
        coords = [row[coord_cols[0]], row[coord_cols[1]]] if has_coords else [row['longitude'], row['latitude']]
        properties = {col: row[col] for col in group_by if col not in coord_cols}
        
        for metric in metrics:
            stats = {stat: row[f'{metric}_{stat}'] for stat, _ in agg_specs.get(metric, [])}
            properties[metric] = stats

        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': coords},
            'properties': properties
        })

    return {'type': 'FeatureCollection', 'features': features}

def data_for_boxplot(df):
    """Generate GeoJSON for boxplot visualization."""
    date_col = 'date'
    group_by = ['longitude', 'latitude', 'date']
    metrics = [col for col in df.columns if col != date_col and col != 'longitude' and col != 'latitude' and pd.api.types.is_numeric_dtype(df[col])]
    agg_specs = {
        metric: [
            ('min', 'min'),
            ('q1', lambda x: x.quantile(0.25)),
            ('median', 'median'),
            ('q3', lambda x: x.quantile(0.75)),
            ('max', 'max')
        ] for metric in metrics
    }
    return aggregate_and_convert(df, group_by=group_by, metrics=metrics, agg_specs=agg_specs)

def process_data():
    """Process GeoJSON data for time-series statistics."""
    geojson = load_geojson()
    df = geojson_to_df(geojson)
    group_by = ['longitude', 'latitude', 'date']
    metrics = [col for col in df.columns if col != 'date' and col != 'longitude' and col != 'latitude' and pd.api.types.is_numeric_dtype(df[col])]
    agg_specs = {
        metric: [
            ('mean', 'mean'),
            ('min', 'min'),
            ('max', 'max')
        ] for metric in metrics
    }
    return aggregate_and_convert(df, group_by=group_by, metrics=metrics, agg_specs=agg_specs)