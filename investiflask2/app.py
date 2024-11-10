from flask import Flask, render_template, request, session, jsonify
from flask_session import Session
import os
from openai import OpenAI
import requests
from dotenv import load_dotenv
import logging
import json
import time
from requests.exceptions import RequestException, HTTPError

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask application
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key_here')
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Initialize OpenAI API key
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    logger.error("OpenAI API key not found. Please set OPENAI_API_KEY in your environment.")
    raise ValueError("OpenAI API key not found")

client = OpenAI(api_key=openai_api_key)

# Initialize YouTube API key
youtube_api_key = os.getenv('YOUTUBE_API_KEY')
if not youtube_api_key:
    logger.error("YouTube API key not found. Please set YOUTUBE_API_KEY in your environment.")
    raise ValueError("YouTube API key not found")

def fetch_youtube_videos(query, max_results=3, retries=3, backoff_factor=2):
    """Fetch unique YouTube videos based on a query with retry mechanism."""
    url = (
        "https://www.googleapis.com/youtube/v3/search"
        f"?part=snippet&q={requests.utils.quote(query + ' investment education')}&type=video"
        f"&maxResults={max_results * 2}&key={youtube_api_key}&relevanceLanguage=en"
        "&videoDuration=medium"  # Filter for medium length videos
    )

    attempt = 0
    unique_videos = set()
    while attempt < retries and len(unique_videos) < max_results:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            for item in data.get('items', []):
                video_url = f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                if video_url not in unique_videos:
                    unique_videos.add(video_url)
                if len(unique_videos) >= max_results:
                    break  # Stop if we reach the required number of unique videos

            logger.info(f"Fetched {len(unique_videos)} unique videos for query '{query}'")
            return list(unique_videos)
            
        except Exception as e:
            logger.error(f"YouTube API attempt {attempt + 1} failed: {str(e)}")
            attempt += 1
            if attempt < retries:
                time.sleep(backoff_factor ** attempt)
    
    return list(unique_videos)


def generate_investment_content(prompt, max_retries=3):
    """Generate detailed investment information using OpenAI."""
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo-16k",
                messages=[
                    {"role": "system", "content": (
                        "You are a knowledgeable investment educator providing detailed, educational "
                        "information about investment sectors. Focus on educational content, market "
                        "analysis, and strategic considerations. Avoid specific investment advice or "
                        "portfolio allocations. Structure your response in clear sections with "
                        "comprehensive explanations."
                    )},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2500
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    
    return None

@app.route('/')
def title_page():
    """Render the welcome page."""
    return render_template('title.html')

@app.route('/main')
def main_page():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/submit_form', methods=['POST'])
def submit_form():
    """Handle form submission and generate investment information."""
    try:
        data = request.get_json()
        if not data:
            return jsonify(status='error', message='No data provided.'), 400

        # Validate user input
        required_fields = ['name', 'experience', 'risk_level', 'tenure', 'capital', 'sectors']
        if not all(field in data for field in required_fields):
            return jsonify(status='error', message='Missing required fields.'), 400

        if len(data['sectors']) > 3:
            return jsonify(status='error', message='Maximum 3 sectors allowed.'), 400

        # Store user data in session
        session['user_data'] = data
        
        # Generate investment information for each sector
        investment_advice = []
        for sector in data['sectors']:
            # Use raw string to avoid format specifier issues
            prompt = (
                f"Provide comprehensive educational information about {sector} investing for a {data['experience'].lower()}-level "
                f"investor with {data['tenure']} years investment horizon and {data['risk_level'].lower()} risk tolerance.\n\n"
                "Include the following sections:\n"
                "1. Overview: General introduction and key concepts\n"
                "2. Market Analysis: Current market conditions and historical context\n"
                "3. Investment Strategies: Common approaches and methodologies\n"
                "4. Key Considerations: Important factors to understand\n"
                "5. Future Outlook: Industry trends and potential developments\n"
                "6. Educational Resources: Recommended learning materials\n\n"
                "Structure the response in this exact JSON format:\n"
                "{\n"
                f'    "sector": "{sector}",\n'
                f'    "title": "Understanding {sector} Investment",\n'
                '    "overview": "detailed overview text",\n'
                '    "market_analysis": "market analysis text",\n'
                '    "strategies": "investment strategies text",\n'
                '    "considerations": "key considerations text",\n'
                '    "outlook": "future outlook text",\n'
                '    "resources": ["Resource 1", "Resource 2", "Resource 3"]\n'
                "}"
            )
            
            content = generate_investment_content(prompt)
            if content:
                try:
                    # Strip any potential leading/trailing whitespace or newlines
                    content = content.strip()
                    # Find the first '{' and last '}' to ensure we only parse the JSON object
                    start = content.find('{')
                    end = content.rfind('}') + 1
                    if start != -1 and end != 0:
                        content = content[start:end]
                    sector_info = json.loads(content)
                    investment_advice.append(sector_info)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON for {sector}: {str(e)}")
                    logger.error(f"Content received: {content}")
                    continue

        # Generate educational video recommendations
        video_recommendations = {}
        for sector in data['sectors']:
            unique_videos = set()  # Track unique videos across all keywords for this sector
            educational_keywords = [
                f"{sector} investment fundamentals",
                f"{sector} market analysis",
                f"How to invest in {sector}"
            ]
            
            # Try each keyword until we get 3 unique videos or run out of keywords
            for keyword in educational_keywords:
                if len(unique_videos) >= 3:
                    break
                    
                fetched_videos = fetch_youtube_videos(
                    keyword, 
                    max_results=3 - len(unique_videos)  # Only fetch what we still need
                )
                
                # Add new unique videos
                unique_videos.update(fetched_videos)
            
            video_recommendations[sector] = list(unique_videos)
            logger.info(f"Found {len(unique_videos)} unique videos for sector {sector}")

        return jsonify(
            status='success',
            investment_advice=investment_advice,
            video_recommendations=video_recommendations
        )

    except Exception as e:
        logger.error(f"Error in /submit_form: {str(e)}")
        return jsonify(status='error', message='Server error. Please try again.'), 500

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chatbot interactions with educational focus."""
    try:
        data = request.get_json()
        if not data or not data.get('message'):
            return jsonify(message="No message provided."), 400

        chat_history = session.get('chat_history', [])
        user_data = session.get('user_data', {})

        system_prompt = (
            "You are an educational investment chatbot focused on providing clear, "
            "informative responses about investment concepts and market understanding. "
            "Avoid giving specific investment advice. Instead, focus on explaining concepts, "
            "providing educational resources, and helping users understand investment principles.\n\n"
            f"Context:\n"
            f"User Experience Level: {user_data.get('experience', 'Unknown')}\n"
            f"Areas of Interest: {', '.join(user_data.get('sectors', []))}\n"
        )

        messages = [{'role': 'system', 'content': system_prompt}]
        messages.extend(chat_history[-4:])
        messages.append({'role': 'user', 'content': data['message']})

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            bot_message = response.choices[0].message.content.strip()

            chat_history.append({'role': 'user', 'content': data['message']})
            chat_history.append({'role': 'assistant', 'content': bot_message})
            session['chat_history'] = chat_history

            return jsonify(message=bot_message)

        except Exception as e:
            logger.error(f"OpenAI ChatCompletion failed: {str(e)}")
            return jsonify(message='Connection error. Please try again.'), 500

    except Exception as e:
        logger.error(f"Error in /chat: {str(e)}")
        return jsonify(message='Server error. Please try again.'), 500

if __name__ == '__main__':
    app.run(debug=True)