# Python-based analytics microservice for ProjectShelf
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Environment variables
API_URL = os.environ.get('API_URL', 'http://backend:5000/api')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Set debug mode based on environment
app.debug = DEBUG

# In-memory cache for analytics data to reduce database queries
analytics_cache = {
    'last_update': datetime.now() - timedelta(hours=1),  # Initialize to force refresh
    'data': {}
}

# Routes
@app.route('/', methods=['GET'])
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'ProjectShelf Analytics Service',
        'version': '1.0.0'
    })

@app.route('/api/analytics/summary/<username>', methods=['GET'])
def get_analytics_summary(username):
    """Get summary analytics for a user's portfolio"""
    try:
        # Check if we need to refresh cache
        if (datetime.now() - analytics_cache['last_update']).total_seconds() > 300:  # 5 minute cache
            logger.info(f"Cache expired, fetching new data for {username}")
            refresh_analytics_cache(username)
        
        # Return cached data if available
        if username in analytics_cache['data']:
            return jsonify(analytics_cache['data'][username])
        
        # If not in cache, fetch data
        analytics_data = fetch_user_analytics(username)
        
        # Process raw analytics data
        processed_data = process_analytics_data(analytics_data)
        
        # Cache the results
        analytics_cache['data'][username] = processed_data
        analytics_cache['last_update'] = datetime.now()
        
        return jsonify(processed_data)
    
    except Exception as e:
        logger.error(f"Error getting analytics summary: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/case-study/<username>/<case_study_id>', methods=['GET'])
def get_case_study_analytics(username, case_study_id):
    """Get detailed analytics for a specific case study"""
    try:
        # Fetch case study analytics from main API
        response = requests.get(f"{API_URL}/analytics/case-study/{case_study_id}")
        response.raise_for_status()
        
        raw_data = response.json()
        
        # Add advanced metrics
        enhanced_data = enhance_case_study_analytics(raw_data)
        
        return jsonify(enhanced_data)
    
    except Exception as e:
        logger.error(f"Error getting case study analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/trends/<username>', methods=['GET'])
def get_analytics_trends(username):
    """Get trends and predictions for a user's portfolio"""
    try:
        # Get time range from query params (default to 30 days)
        days = int(request.args.get('days', 30))
        
        # Fetch analytics data
        analytics_data = fetch_user_analytics(username)
        
        # Calculate trends
        trends = calculate_trends(analytics_data, days)
        
        return jsonify(trends)
    
    except Exception as e:
        logger.error(f"Error getting analytics trends: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Helper functions
def refresh_analytics_cache(username):
    """Refresh the analytics cache for a user"""
    try:
        analytics_data = fetch_user_analytics(username)
        processed_data = process_analytics_data(analytics_data)
        
        analytics_cache['data'][username] = processed_data
        analytics_cache['last_update'] = datetime.now()
        
        logger.info(f"Analytics cache refreshed for {username}")
    except Exception as e:
        logger.error(f"Error refreshing analytics cache: {str(e)}")

def fetch_user_analytics(username):
    """Fetch analytics data from the main API"""
    try:
        # Get user's analytics data
        response = requests.get(f"{API_URL}/analytics/{username}")
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching user analytics: {str(e)}")
        raise

def process_analytics_data(data):
    """Process raw analytics data into summary statistics"""
    try:
        # Convert visit data to pandas DataFrame for easier analysis
        visits_data = data.get('visitsChartData', [])
        if not visits_data:
            return {
                'totalVisits': 0,
                'recentVisits': 0,
                'avgVisitsPerDay': 0,
                'visitsChartData': [],
                'topSources': [],
                'topCaseStudies': [],
                'trends': {
                    'direction': 'neutral',
                    'percentage': 0
                }
            }
        
        df = pd.DataFrame(visits_data)
        
        # Convert date strings to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Sort by date
        df = df.sort_values('date')
        
        # Calculate statistics
        total_visits = data.get('totalVisits', 0)
        recent_visits = data.get('recentVisits', 0)
        
        # Calculate average visits per day
        if len(df) > 0:
            date_range = (df['date'].max() - df['date'].min()).days + 1
            avg_visits = round(df['visits'].sum() / max(1, date_range), 1)
        else:
            avg_visits = 0
        
        # Calculate trend (comparing last 7 days to previous 7 days)
        if len(df) >= 14:
            last_7_days = df.tail(7)['visits'].sum()
            prev_7_days = df.iloc[-14:-7]['visits'].sum()
            
            if prev_7_days > 0:
                trend_pct = ((last_7_days - prev_7_days) / prev_7_days) * 100
                trend_direction = 'up' if trend_pct > 0 else 'down' if trend_pct < 0 else 'neutral'
            else:
                trend_pct = 100 if last_7_days > 0 else 0
                trend_direction = 'up' if last_7_days > 0 else 'neutral'
        else:
            trend_pct = 0
            trend_direction = 'neutral'
        
        # Get top sources
        top_sources = data.get('referrerChartData', [])
        
        # Get top case studies
        top_case_studies = data.get('caseStudyChartData', [])
        
        # Prepare enhanced data
        enhanced_data = {
            'totalVisits': total_visits,
            'recentVisits': recent_visits,
            'avgVisitsPerDay': avg_visits,
            'visitsChartData': visits_data,
            'topSources': top_sources,
            'topCaseStudies': top_case_studies,
            'trends': {
                'direction': trend_direction,
                'percentage': round(trend_pct, 1)
            }
        }
        
        return enhanced_data
    
    except Exception as e:
        logger.error(f"Error processing analytics data: {str(e)}")
        return {
            'error': str(e),
            'totalVisits': data.get('totalVisits', 0),
            'recentVisits': data.get('recentVisits', 0)
        }

def enhance_case_study_analytics(data):
    """Add advanced metrics to case study analytics"""
    try:
        case_study = data.get('caseStudy', {})
        visits_data = data.get('visitsChartData', [])
        
        # Calculate engagement score (fictional metric for demo)
        total_visits = data.get('totalVisits', 0)
        recent_visits = data.get('recentVisits', 0)
        
        # Simple algorithm: based on ratio of recent to total visits
        if total_visits > 0:
            recency_ratio = recent_visits / total_visits
            engagement_score = min(100, int(recency_ratio * 100) + 50)
        else:
            engagement_score = 0
        
        # Add to the data
        enhanced_data = data.copy()
        enhanced_data['engagementScore'] = engagement_score
        
        # Calculate visit growth rate
        if len(visits_data) > 1:
            df = pd.DataFrame(visits_data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Split into two halves
            half_point = len(df) // 2
            first_half = df.iloc[:half_point]['visits'].sum()
            second_half = df.iloc[half_point:]['visits'].sum()
            
            if first_half > 0:
                growth_rate = ((second_half - first_half) / first_half) * 100
            else:
                growth_rate = 100 if second_half > 0 else 0
            
            enhanced_data['growthRate'] = round(growth_rate, 1)
        else:
            enhanced_data['growthRate'] = 0
        
        return enhanced_data
    
    except Exception as e:
        logger.error(f"Error enhancing case study analytics: {str(e)}")
        return data

def calculate_trends(data, days=30):
    """Calculate trends and make simple predictions"""
    try:
        visits_data = data.get('visitsChartData', [])
        
        if not visits_data:
            return {
                'trend': 'neutral',
                'prediction': {
                    'nextWeek': 0,
                    'nextMonth': 0
                }
            }
        
        df = pd.DataFrame(visits_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Keep only requested days
        df = df.tail(days)
        
        # Calculate trend with linear regression
        if len(df) >= 3:
            x = np.arange(len(df))
            y = df['visits'].values
            
            # Simple linear regression
            slope, intercept = np.polyfit(x, y, 1)
            
            # Predict next week (7 days) and next month (30 days)
            next_week = intercept + slope * (len(df) + 7)
            next_month = intercept + slope * (len(df) + 30)
            
            # Determine trend direction
            trend = 'up' if slope > 0.1 else 'down' if slope < -0.1 else 'neutral'
        else:
            # Not enough data for regression
            avg = df['visits'].mean() if len(df) > 0 else 0
            next_week = avg * 7
            next_month = avg * 30
            trend = 'neutral'
        
        # Ensure predictions are not negative
        next_week = max(0, int(next_week))
        next_month = max(0, int(next_month))
        
        return {
            'trend': trend,
            'prediction': {
                'nextWeek': next_week,
                'nextMonth': next_month
            }
        }
    
    except Exception as e:
        logger.error(f"Error calculating trends: {str(e)}")
        return {
            'trend': 'neutral',
            'prediction': {
                'nextWeek': 0,
                'nextMonth': 0
            },
            'error': str(e)
        }

if __name__ == '__main__':
    # Get port from environment or default to 8000
    port = int(os.environ.get('PORT', 8000))
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=port)
