from flask import Flask, jsonify, request
from flask_cors import CORS
import aggregator  # Your Python data processing script

app = Flask(__name__)
CORS(app, origins=["http://3.26.232.39"])  # Enable Cross-Origin Requests

@app.route('/aggregated-data', methods=['GET'])
def get_aggregated_data():
    # Call your data processing script here
    processed_data = aggregator.process_data()
    print(jsonify(processed_data))
    return jsonify(processed_data)

@app.route('/boxplot-data', methods=['GET'])
def get_boxplot_data():
    
    geojson = aggregator.load_geojson() 
    df = aggregator.geojson_to_df(geojson)
    return jsonify(aggregator.data_for_boxplot(df))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)