from flask import Flask, render_template, request, session, jsonify, send_file
from flask_session import Session
from openai import OpenAI
import os
from dotenv import load_dotenv 

# Load environment variables 
load_dotenv()
 
app = Flask(__name__, static_folder='.', static_url_path='')
 
# Configure Flask app
app.config.update(
    SECRET_KEY=os.getenv('SECRET_KEY', 'your_secret_key_here'),
    SESSION_TYPE='filesystem',
    TEMPLATES_AUTO_RELOAD=True
)
Session(app)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', ''))

@app.route('/')
def title():
    return send_file('title.html')

@app.route('/index.html')
def index():
    session.clear()
    return send_file('index.html')

@app.route('/title.css')
def serve_title_css():
    return send_file('title.css')

@app.route('/title.js')
def serve_title_js():
    return send_file('title.js')

@app.route('/styles.css')
def serve_css():
    return send_file('styles.css')

@app.route('/chat.js')
def serve_js():
    return send_file('chat.js')

@app.route('/submit_form', methods=['POST'])
def submit_form():
    try:
        user_data = {
            'name': request.form.get('name'),
            'experience': request.form.get('experience'),
            'risk_level': request.form.get('risk_level'),
            'tenure': request.form.get('tenure'),
            'capital': request.form.get('capital')
        }
        
        # Validate required fields
        if not all(user_data.values()):
            return jsonify(status='error', message='All fields are required'), 400
            
        session['user_data'] = user_data

        system_prompt = (
            f"You are an investment assistant chatbot.\n"
            f"User Name: {user_data['name']}\n"
            f"Experience Level: {user_data['experience']}\n"
            f"Risk Level: {user_data['risk_level']}\n"
            f"Investment Tenure: {user_data['tenure']} years\n"
            f"Capital: ${user_data['capital']}\n"
            "Provide personalized investment advice based on the above information. "
            "Walk through investment options and benefits in detail."
        )

        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': 'I am seeking investment advice.'}
        ]

        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=messages
        )
        bot_message = response.choices[0].message.content.strip()
        bot_message += "\n\nDo you have any questions?"

        chat_history = [
            {'role': 'user', 'content': 'I am seeking investment advice.'},
            {'role': 'assistant', 'content': bot_message}
        ]
        session['chat_history'] = chat_history

        return jsonify(status='success', initial_message=bot_message)

    except Exception as e:
        return jsonify(status='error', message=str(e)), 500

@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_message = request.json.get('message')
        if not user_message:
            return jsonify(message="Message cannot be empty"), 400

        chat_history = session.get('chat_history', [])
        if not chat_history:
            return jsonify(message="Session expired. Please refresh the page."), 400

        chat_history.append({'role': 'user', 'content': user_message})

        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=chat_history,
            max_tokens=200,
            temperature=0.7
        )
        bot_message = response.choices[0].message.content.strip()

        chat_history.append({'role': 'assistant', 'content': bot_message})
        session['chat_history'] = chat_history

        return jsonify(message=bot_message)

    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}"), 500

if __name__ == '__main__':
    app.run(debug=True)