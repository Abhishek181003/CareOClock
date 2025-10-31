"""
CareOClock Predictive Analytics Engine - Flask Prediction Service
Author: AI Assistant
Description: Flask API for real-time health risk predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import pickle
from datetime import datetime, timedelta
import logging
from pymongo import MongoClient
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


class PredictionService:
    def __init__(self, mongodb_uri='mongodb+srv://abhishekranjan18oct:UFuaT9muVQnDadJB@cluster0.bpqrwno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'):
        self.client = MongoClient(mongodb_uri)
        self.db = self.client.test
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_metadata = None
        self.load_models()

    def load_models(self):
        try:
            model_path = './'
            self.model = joblib.load(f'{model_path}best_model.pkl')
            self.scaler = joblib.load(f'{model_path}scaler.pkl')
            with open(f'{model_path}feature_names.pkl', 'rb') as f:
                self.feature_names = pickle.load(f)
            with open(f'{model_path}model_metadata.pkl', 'rb') as f:
                self.model_metadata = pickle.load(f)
            logger.info(f"Models loaded successfully. Best model: {self.model_metadata['best_model']}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise e

    def get_recent_history(self, user_id, days=7):
        start_date = datetime.utcnow() - timedelta(days=days)
        cursor = self.db.healthrecords.find({
            "userId": ObjectId(user_id),
            "date": {"$gte": start_date}
        })
        records = list(cursor)
        if not records:
            return None
        return pd.DataFrame(records)

    def compute_rolling_features(self, current_data, user_id):
        df_hist = self.get_recent_history(user_id, days=7)
        features = {}
        # Extract current measurement features with default fallbacks
        def safe_get(d, key, default=np.nan):
            return d.get(key, default) if isinstance(d, dict) else default

        features['heart_rate'] = float(current_data.get('heart_rate', 75))
        features['bp_systolic'] = float(current_data.get('bp_systolic', 120))
        features['bp_diastolic'] = float(current_data.get('bp_diastolic', 80))
        features['glucose'] = float(current_data.get('glucose', 100))
        features['sleep_hours'] = float(current_data.get('sleep_hours', 7))
        features['temperature'] = float(current_data.get('temperature', 98.6))
        features['oxygen_level'] = float(current_data.get('oxygen_level', 98))
        features['age'] = float(current_data.get('age', 65))

        if df_hist is not None and not df_hist.empty:
            df_hist['date'] = pd.to_datetime(df_hist['date'])
            cutoff_3d = datetime.utcnow() - timedelta(days=3)
            window3d = df_hist[df_hist['date'] >= cutoff_3d]

            def mean_feat(df, col_path):
                keys = col_path.split('.')
                s = df
                for k in keys:
                    s = s.apply(lambda x: x.get(k) if isinstance(x, dict) else np.nan)
                s = pd.to_numeric(s, errors='coerce')
                return s.mean()

            mean_sys_3d = mean_feat(window3d, 'bloodPressure.systolic')
            mean_dia_3d = mean_feat(window3d, 'bloodPressure.diastolic')
            mean_sugar_3d = mean_feat(window3d, 'bloodSugar.value')
            mean_hr_3d = mean_feat(window3d, 'heartRate.value')

            features['delta_sys_3d'] = features['bp_systolic'] - mean_sys_3d if not pd.isna(mean_sys_3d) else 0
            features['delta_dia_3d'] = features['bp_diastolic'] - mean_dia_3d if not pd.isna(mean_dia_3d) else 0
            features['delta_sugar_3d'] = features['glucose'] - mean_sugar_3d if not pd.isna(mean_sugar_3d) else 0
            features['delta_hr_3d'] = features['heart_rate'] - mean_hr_3d if not pd.isna(mean_hr_3d) else 0

            df_hist_systolic = df_hist['bloodPressure'].apply(lambda x: x.get('systolic') if isinstance(x, dict) else np.nan)
            features['std_sys_7d'] = df_hist_systolic.std() if not df_hist_systolic.dropna().empty else 0
        else:
            features['delta_sys_3d'] = 0
            features['delta_dia_3d'] = 0
            features['delta_sugar_3d'] = 0
            features['delta_hr_3d'] = 0
            features['std_sys_7d'] = 0

        # Derived features
        features['bp_ratio'] = features['bp_systolic'] / features['bp_diastolic'] if features['bp_diastolic'] else 1.0

        hr = features['heart_rate']
        if hr < 60:
            features['heart_rate_category'] = 0
        elif hr <= 100:
            features['heart_rate_category'] = 1
        else:
            features['heart_rate_category'] = 2

        return features

    def preprocess_input(self, health_data, user_id=None):
        try:
            if user_id:
                features = self.compute_rolling_features(health_data, user_id)
            else:
                def to_float_or_default(key, default):
                    val = health_data.get(key, default)
                    try:
                        return float(val)
                    except Exception:
                        return default

                features = {
                    'heart_rate': to_float_or_default('heart_rate', 75),
                    'bp_systolic': to_float_or_default('bp_systolic', 120),
                    'bp_diastolic': to_float_or_default('bp_diastolic', 80),
                    'glucose': to_float_or_default('glucose', 100),
                    'sleep_hours': to_float_or_default('sleep_hours', 7),
                    'temperature': to_float_or_default('temperature', 98.6),
                    'oxygen_level': to_float_or_default('oxygen_level', 98),
                    'age': to_float_or_default('age', 65),
                    'bmi_estimate': to_float_or_default('bmi_estimate', 25),
                    'delta_sys_3d': 0,
                    'delta_dia_3d': 0,
                    'delta_sugar_3d': 0,
                    'delta_hr_3d': 0,
                    'std_sys_7d': 0,
                    'bp_ratio': 120 / 80,
                    'heart_rate_category': 1
                }

            feature_vector = [features.get(name, 0) for name in self.feature_names]
            feature_df = pd.DataFrame([feature_vector], columns=self.feature_names)
            scaled_features = self.scaler.transform(feature_df)
            return scaled_features, features

        except Exception as e:
            logger.error(f"Error preprocessing input: {e}")
            raise e

    def _identify_risk_factors(self, features):
        risk_factors = []

        if features['heart_rate'] > 100:
            risk_factors.append('High heart rate (tachycardia)')
        elif features['heart_rate'] < 60:
            risk_factors.append('Low heart rate (bradycardia)')

        if features['bp_systolic'] > 140:
            risk_factors.append('High systolic blood pressure')
        if features['bp_diastolic'] > 90:
            risk_factors.append('High diastolic blood pressure')

        if features['glucose'] > 140:
            risk_factors.append('Elevated blood glucose')
        elif features['glucose'] < 70:
            risk_factors.append('Low blood glucose')

        if features['sleep_hours'] < 6:
            risk_factors.append('Insufficient sleep')
        elif features['sleep_hours'] > 10:
            risk_factors.append('Excessive sleep')

        if features['temperature'] > 100:
            risk_factors.append('Fever detected')
        elif features['temperature'] < 97:
            risk_factors.append('Low body temperature')

        if features['oxygen_level'] < 95:
            risk_factors.append('Low oxygen saturation')

        if features['age'] > 65:
            risk_factors.append('Advanced age')

        return risk_factors

    def _generate_explanation(self, risk_level, risk_factors):
        if risk_level == 'High':
            if len(risk_factors) > 2:
                return f"High risk detected due to multiple factors: {', '.join(risk_factors[:3])}. Immediate medical attention recommended."
            else:
                return f"High risk detected. Key concerns: {', '.join(risk_factors)}. Please consult healthcare provider."

        elif risk_level == 'Medium':
            if risk_factors:
                return f"Moderate risk identified. Monitor: {', '.join(risk_factors[:2])}. Consider lifestyle adjustments."
            else:
                return "Moderate risk level. Continue monitoring health parameters regularly."

        else:
            return "Low risk level. Health parameters appear normal. Continue healthy lifestyle practices."

    def predict_risk(self, health_data, user_id=None):
        RISK_LEVEL_MAP = {0: 'Low', 1: 'Medium', 2: 'High'}
        scaled_features, raw_features = self.preprocess_input(health_data, user_id)
        risk_prediction_numeric = self.model.predict(scaled_features)[0]
        risk_prediction = RISK_LEVEL_MAP.get(risk_prediction_numeric, "Unknown")
        risk_probability = self.model.predict_proba(scaled_features)[0]
        confidence = float(max(risk_probability))
        risk_factors = self._identify_risk_factors(raw_features)
        explanation = self._generate_explanation(risk_prediction, risk_factors)
        
        
        
        
        return {
            'risk_level': risk_prediction,
            'confidence': confidence,
            'risk_factors': risk_factors,
            'explanation': explanation,
            'probabilities': {
                'Low': float(risk_probability[0]),
                'Medium': float(risk_probability[1]),
                'High': float(risk_probability[2])
            },
            'timestamp': datetime.now().isoformat()
        }


prediction_service = PredictionService()

@app.route('/health', methods=['GET'])
def health_check():
    try:
        return jsonify({
            'status': 'healthy',
            'model_version': prediction_service.model_metadata['model_version'],
            'model_type': prediction_service.model_metadata['best_model'],
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400

        health_data = request.json
        user_id = health_data.get('userId')
        if user_id and not ObjectId.is_valid(user_id):
            return jsonify({'error': 'Invalid userId'}), 400

        required_fields = ['heart_rate', 'bp_systolic', 'bp_diastolic', 'glucose', 'sleep_hours']
        missing_fields = [field for field in required_fields if field not in health_data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        result = prediction_service.predict_risk(health_data, user_id)
        logger.info(f"Prediction made: {result['risk_level']} (confidence: {result['confidence']:.3f})")
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Starting CareOClock Prediction Service...")
    print(f"Model loaded: {prediction_service.model_metadata['best_model']}")
    print(f"Features: {len(prediction_service.feature_names)}")
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
