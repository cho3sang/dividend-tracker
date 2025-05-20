from flask import Flask, request, jsonify
import yfinance as yf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow access from your React frontend

@app.route("/dividend", methods=["GET"])
def get_dividend():
    symbol = request.args.get("symbol", "").upper()
    if not symbol:
        return jsonify({"error": "Missing symbol"}), 400

    try:
        stock = yf.Ticker(symbol)
        info = stock.info

        return jsonify({
            "symbol": symbol,
            "dividendYield": info.get("dividendYield", 0),
            "forwardEps": info.get("forwardEps", "N/A"),
            "dividendRate": info.get("dividendRate", "N/A")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
