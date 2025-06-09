from flask import Flask, request, jsonify
from recommender import calculate_match_scores, generate_recommendation
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.route("/api/match-resumes", methods=["POST"])
def match_multiple_resumes():
    data = request.json
    jd = data.get("job_description", "")
    cvs = data.get("cvs", [])

    # Giới hạn số lượng CV (an toàn cho server)
    if len(cvs) > 1000:
        return jsonify({"error": "Vui lòng gửi tối đa 1000 CV mỗi lần."}), 400

    resume_texts = [cv["content"] for cv in cvs]
    scores = calculate_match_scores(resume_texts, jd)

    results = []
    for cv, score in zip(cvs, scores):
        results.append({
            "_id": cv["_id"],
            "originalName": cv["originalName"],
            "score": score,
            "recommendation": generate_recommendation(score)
        })

    return jsonify({"results": results})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
