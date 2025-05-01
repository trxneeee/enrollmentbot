from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import re  # Import regex module
import csv
import os
from rapidfuzz import process as fuzz_process

app = Flask(__name__)
CORS(app)

# Load spaCy NLP model
nlp = spacy.load("en_core_web_sm")

THREADS_CSV = "chat_threads.csv"

synonyms = {
    "funds": "money",
    "cash": "money",
    "balance": "account balance",
    "loan": "credit",
    "withdraw": "cash withdrawal",
    "deposit": "cash deposit",
}

def replace_synonyms(text):
    """Replace synonyms in user input with their standardized terms."""
    doc = nlp(text.lower())  # Process text with spaCy
    words = [synonyms.get(token.text, token.text) for token in doc]  # Replace words if in synonyms dict
    return " ".join(words)

# Ensure thread CSV exists
if not os.path.exists(THREADS_CSV):
    with open(THREADS_CSV, mode="w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file, delimiter="^")
        writer.writerow(["thread_number", "message_number", "user_message", "bot_response"])

def load_responses_from_csv(filename="responses.csv"):
    """Load chatbot responses from a CSV file using ^ as the delimiter."""
    responses = {}
    try:
        with open(filename, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="^")
            for row in reader:
                keyword = row["keyword"].strip().lower()
                response = row["response"].strip().replace("\\n", "\n")
                responses[keyword] = response
    except Exception as e:
        print(f"Error loading CSV: {e}")
    return responses

responses = load_responses_from_csv()

def get_next_message_number(thread_number):
    """Get the next message number for a given thread."""
    try:
        with open(THREADS_CSV, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file, delimiter="^")
            messages = [int(row["message_number"]) for row in reader if row["thread_number"] == thread_number]
            return max(messages) + 1 if messages else 1
    except Exception:
        return 1

def save_message(thread_number, message_number, user_message, bot_response):
    """Save chat message to CSV."""
    with open(THREADS_CSV, mode="a", encoding="utf-8", newline="") as file:
        writer = csv.writer(file, delimiter="^")
        writer.writerow([thread_number, message_number, user_message, bot_response])

def process_message(user_message):
    """Process user message with synonym handling and keyword detection."""
    user_message_normalized = replace_synonyms(user_message)

    if len(user_message_normalized) < 3:
        return "I'm not sure I understand. Can you provide more details?"

    matched_responses = []
    correction_message = ""

    for key in responses:
        if re.search(rf"\b{re.escape(key.lower())}\b", user_message_normalized):
            matched_responses.append(responses[key])

    if not matched_responses:
        match_result = fuzz_process.extractOne(user_message_normalized, responses.keys(), score_cutoff=80)
        if match_result:
            best_match = match_result[0]
            matched_responses.append(responses[best_match])
            correction_message = f"💡 Did you mean **'{best_match}'**?"

    if matched_responses:
        response_text = "\n\n".join(matched_responses)
        return f"{correction_message}\n\n{response_text}".strip()

    return "I'm not sure I understand. Can you rephrase your question?"

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get("message", "").strip()
    thread_number = data.get("thread_number", "1")

    if not user_message:
        return jsonify({"reply": "Please enter a valid message."})

    message_number = get_next_message_number(thread_number)
    bot_reply = process_message(user_message)
    save_message(thread_number, message_number, user_message, bot_reply)

    return jsonify({"reply": bot_reply.replace("\n", "<br>")})

if __name__ == '__main__':
    app.run(debug=True)
