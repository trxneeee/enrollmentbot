# backend/app.py
from flask import Flask, request, jsonify
import csv
import os

app = Flask(__name__)
CSV_FILE = 'threads.csv'
FIELDS = ['threadNumber', 'messages']

def load_threads():
    if not os.path.exists(CSV_FILE):
        return []
    with open(CSV_FILE, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return [{**row, 'messages': eval(row['messages'])} for row in reader]

def save_threads(threads):
    with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        for thread in threads:
            writer.writerow({
                'threadNumber': thread['threadNumber'],
                'messages': str(thread['messages'])
            })

@app.route('/threads', methods=['GET'])
def get_threads():
    return jsonify(load_threads())

@app.route('/threads', methods=['POST'])
def post_thread():
    data = request.json
    threads = load_threads()
    threads.insert(0, data)
    save_threads(threads)
    return jsonify({"success": True})

@app.route('/threads/<thread_id>', methods=['DELETE'])
def delete_thread(thread_id):
    threads = load_threads()
    threads = [t for t in threads if t['threadNumber'] != thread_id]
    save_threads(threads)
    return jsonify({"success": True})

@app.route('/threads/<thread_id>/message', methods=['POST'])
def add_message(thread_id):
    msg = request.json
    threads = load_threads()
    for thread in threads:
        if thread['threadNumber'] == thread_id:
            thread['messages'].append(msg)
    save_threads(threads)
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True)