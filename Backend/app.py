from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import analyze_url

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Phishing URL Detector API is running."


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({
            "error": "Please provide a URL."
        }), 400

    result = analyze_url(data["url"])

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)