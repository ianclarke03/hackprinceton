from flask import Flask, render_template, request, session, jsonify
from flask_session import Session
from openai import OpenAI# For chatbot functionality (requires OpenAI API key)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Initialize OpenAI API
open_ai_api_key = ''
client = OpenAI(api_key=open_ai_api_key)

@app.route('/')
def index():
    return render_template('index.html')

# Handle form submission
@app.route('/submit_form', methods=['POST'])
def submit_form():
    user_data = {
        'name': request.form.get('name'),
        'experience': request.form.get('experience'),
        'risk_level': request.form.get('risk_level'),
        'tenure': request.form.get('tenure'),
        'capital': request.form.get('capital')
    }
    session['user_data'] = user_data

    # Construct the system prompt with user data
    system_prompt = (
        f"You are an investment assistant chatbot.\n"
        f"User Name: {user_data.get('name', 'User')}\n"
        f"Experience Level: {user_data.get('experience', 'Unknown')}\n"
        f"Risk Level: {user_data.get('risk_level', 'Unknown')}\n"
        f"Investment Tenure: {user_data.get('tenure', 'Unknown')} years\n"
        f"Capital: ${user_data.get('capital', 'Unknown')}\n"
        "Provide personalized investment advice based on the above information. Be thorough. Walk me through the intricacies and "
        "benefits of the investment. Weigh options, and mathematically deduce and prove why this investment is good right now."
    )

    # Initial conversation messages with no token limit
    messages = [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': 'I am seeking investment advice.'}
    ]

    try:
        # Generate initial response without a token limit
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=messages
        )
        bot_message = response.choices[0].message.content.strip()
        bot_message += "\n\nDo you have any questions?"
    except Exception as e:
        bot_message = f"An error occurred: {str(e)}"

    # Initialize chat history with the initial interaction
    chat_history = [
        {'role': 'user', 'content': 'I am seeking investment advice.'},
        {'role': 'assistant', 'content': bot_message}
    ]
    session['chat_history'] = chat_history

    return jsonify(status='success', initial_message=bot_message)

# Chatbot route
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    chat_history = session.get('chat_history', [])

    # Append user's message to chat history
    chat_history.append({'role': 'user', 'content': user_message})

    # Prepare the conversation messages with previous context
    messages = chat_history.copy()

    try:
        # Generate response for subsequent messages with a 200-token limit
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=messages,
            max_tokens=200,  # Limit response tokens to 200
            temperature=0.7
        )
        bot_message = response.choices[0].message.content.strip()
    except Exception as e:
        bot_message = f"An error occurred: {str(e)}"

    # Append bot's message to chat history
    chat_history.append({'role': 'assistant', 'content': bot_message})
    session['chat_history'] = chat_history

    return jsonify(message=bot_message)

if __name__ == '__main__':
    app.run(debug=True)