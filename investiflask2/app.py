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
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_default_secret_key_here')  # Replace with your secret key
app.config['SESSION_TYPE'] = 'filesystem'  # Use filesystem-based sessions
Session(app)  # Initialize session management

# Initialize OpenAI API key
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    logger.error("OpenAI API key not found. Please set OPENAI_API_KEY in your environment.")
    raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY in your environment.")

# Initialize YouTube API key
youtube_api_key = os.getenv('YOUTUBE_API_KEY')
if not youtube_api_key:
    logger.error("YouTube API key not found. Please set YOUTUBE_API_KEY in your environment.")
    raise ValueError("YouTube API key not found. Please set YOUTUBE_API_KEY in your environment.")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)


def fetch_youtube_videos(query, max_results=3, retries=3, backoff_factor=2):
    """
    Fetch YouTube videos based on a query using YouTube Data API with retry mechanism.

    Parameters:
        query (str): The search query.
        max_results (int): Maximum number of videos to fetch per keyword.
        retries (int): Number of retry attempts in case of failure.
        backoff_factor (int): Factor by which the wait time increases after each retry.

    Returns:
        list: List of YouTube video URLs.
    """
    url = (
        "https://www.googleapis.com/youtube/v3/search"
        f"?part=snippet&q={requests.utils.quote(query)}&type=video&maxResults={max_results}&key={youtube_api_key}"
    )
    attempt = 0
    while attempt < retries:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
            data = response.json()
            videos = [f"https://www.youtube.com/watch?v={item['id']['videoId']}" for item in data.get('items', [])]
            logger.info(f"Fetched {len(videos)} videos for query '{query}'.")
            return videos
        except (RequestException, HTTPError) as e:
            logger.error(f"Attempt {attempt + 1} to fetch YouTube videos failed: {str(e)}")
            attempt += 1
            sleep_time = backoff_factor ** attempt
            logger.info(f"Retrying YouTube API in {sleep_time} seconds...")
            time.sleep(sleep_time)
    logger.error(f"All {retries} attempts to fetch YouTube videos for query '{query}' failed.")
    return []


def generate_openai_response(prompt, max_retries=5):
    """
    Interact with OpenAI's ChatCompletion API to generate a response based on the provided prompt.

    Parameters:
        prompt (str): The prompt to send to OpenAI.
        max_retries (int): Number of retry attempts in case of failure.

    Returns:
        str or None: The response content from OpenAI or None if all attempts fail.
    """
    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",  # You can change the model as needed
                messages=[
                    {"role": "system", "content": "You are a helpful investment assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,  # Increased tokens for more detailed responses
                temperature=0.7
            )
            # Extract and return the content
            content = response.choices[0].message.content.strip()
            logger.info(f"OpenAI response received on attempt {attempt}.")
            return content
        except Exception as e:
            logger.error(f"OpenAI ChatCompletion attempt {attempt} failed: {str(e)}")
            if attempt < max_retries:
                sleep_time = 2 ** attempt  # Exponential backoff
                logger.info(f"Retrying OpenAI request in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                logger.error("All OpenAI ChatCompletion attempts failed.")
                return None


@app.route('/')
def index():
    """
    Render the main page of the application.
    """
    return render_template('index.html')


@app.route('/submit_form', methods=['POST'])
def submit_form():
    """
    Handle the submission of the user information form.

    Expects JSON data containing:
        - name (str)
        - experience (str)
        - risk_level (str)
        - tenure (int)
        - capital (float)
        - sectors (list of str)  # Max 3 sectors

    Returns:
        JSON response containing investment advice, YouTube video recommendations, and portfolio allocation.
    """
    try:
        data = request.get_json()
        if not data:
            logger.error("No data provided in the form submission.")
            return jsonify(status='error', message='No data provided.'), 400

        # Extract and validate user data
        user_data = {
            'name': data.get('name'),
            'experience': data.get('experience'),
            'risk_level': data.get('risk_level'),
            'tenure': data.get('tenure'),
            'capital': data.get('capital'),
            'sectors': data.get('sectors', [])  # List of selected sectors (max 3)
        }

        # Validate required fields
        required_fields = ['name', 'experience', 'risk_level', 'tenure', 'capital', 'sectors']
        for field in required_fields:
            if not user_data.get(field):
                logger.error(f"Missing required field: {field}")
                return jsonify(status='error', message=f'Missing required field: {field}'), 400

        # Validate the number of sectors selected
        if len(user_data['sectors']) > 3:
            logger.error("More than 3 sectors selected.")
            return jsonify(status='error', message='You can select a maximum of 3 sectors.'), 400

        session['user_data'] = user_data  # Store user data in session
        logger.info(f"User Data Submitted: {user_data}")

        # Construct the OpenAI prompt
        sectors_formatted = ', '.join(user_data['sectors']) if user_data['sectors'] else 'none'
        initial_prompt = (
            f"Provide one detailed investment recommendation for each of the selected sectors of interest based on the following user information:\n\n"
            f"Name: {user_data['name']}\n"
            f"Experience Level: {user_data['experience']}\n"
            f"Risk Level: {user_data['risk_level']}\n"
            f"Investment Tenure: {user_data['tenure']} years\n"
            f"Capital: ${user_data['capital']}\n"
            f"Sectors of Interest: {sectors_formatted}\n\n"
            "For each sector, outline the expected returns, potential risks, advantages, and provide a sample portfolio. The portfolio should include the name of the investments (e.g., Bitcoin, Ethereum, trading strategies like straddles, mutual funds like VUSXX, call options for the S&P 500), allocated amounts, notional values, etc., and provide explanations for the allocations. "
            "Please format your response strictly in JSON as shown below:\n\n"
            "{\n"
            '    "investment_advice": [\n'
            '        {\n'
            '            "sector": "Sector Name",\n'
            '            "title": "Investment Option",\n'
            '            "expected_returns": "Description",\n'
            '            "potential_risks": "Description",\n'
            '            "advantages": "Description",\n'
            '            "sample_portfolio": {\n'
            '                "investments": [\n'
            '                    {"name": "Investment Name", "type": "Type", "allocated_amount": "Amount", "notional": "Notional", "explanation": "Description"},\n'
            '                    ...\n'
            '                ]\n'
            '            }\n'
            '        }\n'
            '    ],\n'
            '    "youtube_keywords": {\n'
            '        "Sector1": ["Keyword1", "Keyword2", "Keyword3"],\n'
            '        "Sector2": ["Keyword1", "Keyword2", "Keyword3"],\n'
            '        "Sector3": ["Keyword1", "Keyword2", "Keyword3"]\n'
            '    },\n'
            '    "portfolio_allocation": {\n'
            '        "stocks": 50,\n'
            '        "bonds": 30,\n'
            '        "cryptocurrencies": 20\n'
            '    }\n'
            "}"
        )

        # Generate investment advice using OpenAI with retries
        bot_message = generate_openai_response(initial_prompt, max_retries=5)
        if not bot_message:
            return jsonify(status='error', message='Failed to get response from OpenAI after multiple attempts.'), 500

        # Attempt to parse the JSON response from OpenAI
        try:
            parsed_response = json.loads(bot_message)
            investment_advice = parsed_response.get('investment_advice', [])
            youtube_keywords = parsed_response.get('youtube_keywords', {})
            portfolio_allocation = parsed_response.get('portfolio_allocation', {})
        except json.JSONDecodeError as e:
            logger.error(f"JSON decoding failed: {str(e)}")
            # Attempt to extract JSON from the response if possible
            try:
                json_start = bot_message.index('{')
                json_str = bot_message[json_start:]
                parsed_response = json.loads(json_str)
                investment_advice = parsed_response.get('investment_advice', [])
                youtube_keywords = parsed_response.get('youtube_keywords', {})
                portfolio_allocation = parsed_response.get('portfolio_allocation', {})
            except (ValueError, json.JSONDecodeError) as ex:
                logger.error(f"Failed to extract JSON: {str(ex)}")
                return jsonify(status='error', message='Invalid response format from OpenAI.'), 500

        # Process YouTube video recommendations
        video_recommendations = {}
        for sector in user_data['sectors']:
            keywords = youtube_keywords.get(sector, [])[:3]  # Max 3 keywords per sector
            if not keywords:
                logger.warning(f"No YouTube keywords provided for sector: {sector}")
                continue
            videos = []
            for keyword in keywords:
                fetched_videos = fetch_youtube_videos(keyword, max_results=3)
                videos.extend(fetched_videos)
                if len(videos) >= 3:
                    break  # Limit to 3 videos per sector
            video_recommendations[sector] = videos[:3]  # Ensure max 3 videos

        session['video_recommendations'] = video_recommendations  # Store in session
        logger.info(f"Video Recommendations: {video_recommendations}")

        session['portfolio_allocation'] = portfolio_allocation  # Store in session
        logger.info(f"Portfolio Allocation: {portfolio_allocation}")

        # Initialize chat history with the initial bot message
        if 'chat_history' not in session:
            session['chat_history'] = []
        # Format multiple investment recommendations
        if isinstance(investment_advice, list):
            advice_text = ""
            for idx, advice in enumerate(investment_advice, start=1):
                advice_text += f"**Recommendation {idx} for {advice.get('sector', 'N/A')}: {advice.get('title', 'N/A')}**\n"
                advice_text += f"- **Expected Returns:** {advice.get('expected_returns', 'N/A')}\n"
                advice_text += f"- **Potential Risks:** {advice.get('potential_risks', 'N/A')}\n"
                advice_text += f"- **Advantages:** {advice.get('advantages', 'N/A')}\n"
                advice_text += f"- **Sample Portfolio:**\n"
                for investment in advice.get('sample_portfolio', {}).get('investments', []):
                    advice_text += f"  - **{investment.get('name', 'N/A')}** ({investment.get('type', 'N/A')}): ${investment.get('allocated_amount', 'N/A')} allocated. *{investment.get('explanation', 'N/A')}*\n"
                advice_text += "\n"
            advice_text += "Do you have any questions?"
        else:
            advice_text = investment_advice + " Do you have any questions?"

        session['chat_history'].append({'role': 'assistant', 'content': advice_text})  # Append to chat history

        return jsonify(
            status='success',
            initial_message=advice_text,
            investment_advice=investment_advice,
            video_recommendations=video_recommendations,
            portfolio_allocation=portfolio_allocation
        )
    except Exception as e:
        logger.error(f"Error in /submit_form: {str(e)}")
        return jsonify(message='An unexpected error occurred. Please try again later.'), 500


@app.route('/chat', methods=['POST'])
def chat():
    """
    Handle chatbot interactions.

    Expects JSON data containing:
        - message (str)

    Returns:
        JSON response containing the bot's reply.
    """
    try:
        data = request.get_json()
        if not data:
            logger.error("No data provided in the chat request.")
            return jsonify(message="No data provided."), 400

        message = data.get('message')
        if not message:
            logger.error("No message provided in the chat request.")
            return jsonify(message="No message provided."), 400

        chat_history = session.get('chat_history', [])

        # Append user's message to chat history
        chat_history.append({'role': 'user', 'content': message})

        # Retrieve user data and portfolio allocation for context
        user_data = session.get('user_data', {})
        portfolio_allocation = session.get('portfolio_allocation', {})

        # Construct the system prompt with user data to maintain context
        system_prompt = (
            f"You are an investment assistant chatbot.\n"
            f"User Name: {user_data.get('name', 'User')}\n"
            f"Experience Level: {user_data.get('experience', 'Unknown')}\n"
            f"Risk Level: {user_data.get('risk_level', 'Unknown')}\n"
            f"Investment Tenure: {user_data.get('tenure', 'Unknown')} years\n"
            f"Capital: ${user_data.get('capital', 'Unknown')}\n"
            f"Portfolio Allocation: {json.dumps(portfolio_allocation)}\n"
            "Provide personalized investment advice based on the above information. Be thorough and explain options in simple terms."
        )

        # Prepare the conversation messages
        messages = [{'role': 'system', 'content': system_prompt}]
        messages.extend(chat_history)

        # Generate response using OpenAI API with retries
        # Combine messages into a single string separated by newlines for the prompt
        combined_messages = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        bot_message = generate_openai_response(combined_messages, max_retries=5)
        if not bot_message:
            return jsonify(message='Failed to get response from OpenAI. Please try again later.'), 500

        # Append bot's message to chat history
        chat_history.append({'role': 'assistant', 'content': bot_message})
        session['chat_history'] = chat_history  # Update session

        logger.info(f"User: {message}")
        logger.info(f"Bot: {bot_message}")

        return jsonify(message=bot_message)

    except Exception as e:
        logger.error(f"Error in /chat: {str(e)}")
        return jsonify(message='An unexpected error occurred. Please try again later.'), 500


if __name__ == '__main__':
    app.run(debug=True)
