from flask import Flask, render_template, jsonify, request, flash
from flask_login import login_required, current_user
from gee import initialize_earth_engine, EarthEngineDatasets, RiskAnalysis
from models import db, User
from auth import auth, login_manager
import requests
import logging
import os

app = Flask(__name__)


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Register blueprints
app.register_blueprint(auth)

# Create database tables
with app.app_context():
    db.create_all()

# Initialize Earth Engine
ee_initialized = initialize_earth_engine()

@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/get_ip_location', methods=['GET'])
@login_required
def get_ip_location():
    try:
        response = requests.get('http://ip-api.com/json/')
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                # Update user's last known location
                current_user.last_lat = data.get('lat')
                current_user.last_lon = data.get('lon')
                db.session.commit()
                
                return jsonify({
                    'latitude': data.get('lat'),
                    'longitude': data.get('lon')
                })
        return jsonify({
            'error': 'Could not determine location',
            'latitude': 36.1699,
            'longitude': -115.1398
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'latitude': 36.1699,
            'longitude': -115.1398
        })

@app.route('/get_gee_data', methods=['POST'])
def get_gee_data():
    if not ee_initialized:
        return jsonify({'error': 'Earth Engine not initialized'}), 500
        
    try:
        data = request.json
        dataset = data.get('dataset')
        bounds = data.get('bounds')
        
        if not all([dataset, bounds]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        result = EarthEngineDatasets.get_map_id(dataset, bounds)
        
        if result.get('error'):
            return jsonify({
                'error': result['error']
            }), 404
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500
@app.route('/calculate_landslide_risk', methods=['POST'])
def calculate_landslide_risk():
    if not ee_initialized:
        return jsonify({'error': 'Earth Engine not initialized'}), 500
    
    try:
        data = request.get_json()
        if not data or 'bounds' not in data:
            return jsonify({'error': 'Missing bounds parameter'}), 400
        
        bounds = data['bounds']
        logging.debug(f"Received bounds: {bounds}")
        
        result = RiskAnalysis.calculate_landslide_risk(bounds)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 500
            
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in landslide risk endpoint: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/calculate_flood_risk', methods=['POST'])
def calculate_flood_risk():
    if not ee_initialized:
        return jsonify({'error': 'Earth Engine not initialized'}), 500
    
    try:
        data = request.get_json()
        if not data or 'bounds' not in data:
            return jsonify({'error': 'Missing bounds parameter'}), 400
        
        bounds = data['bounds']
        logging.debug(f"Received bounds: {bounds}")
        
        result = RiskAnalysis.calculate_flood_risk(bounds)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 500
            
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in flood risk endpoint: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/generate_risk_report', methods=['POST'])
def generate_risk_report():
    if not ee_initialized:
        return jsonify({'error': 'Earth Engine not initialized'}), 500
    
    try:
        data = request.get_json()
        if not data or 'bounds' not in data:
            return jsonify({'error': 'Missing bounds parameter'}), 400
        
        bounds = data['bounds']
        logging.debug(f"Received bounds: {bounds}")
        
        result = RiskAnalysis.generate_risk_report(bounds)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 500
            
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in risk report endpoint: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
    