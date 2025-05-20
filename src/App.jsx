import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [symbol, setSymbol] = useState("");
  const [stocks, setStocks] = useState([]);

  // Load stocks from localStorage when app loads
  useEffect(() => {
    const saved = localStorage.getItem("stocks");
    if (saved) setStocks(JSON.parse(saved));
  }, []);

  // Save stocks to localStorage when stocks change
  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  const handleAddStock = async () => {
    if (!symbol) return;
    try {
      // Prevent duplicate stocks
      if (stocks.some((s) => s.symbol === symbol.toUpperCase())) {
        alert("Stock already added!");
        return;
      }

      const res = await axios.get(`http://localhost:5000/dividend?symbol=${symbol}`);
      const data = {
        ...res.data,
        symbol: res.data.symbol.toUpperCase(),
        shares: 1 // default
      };
      setStocks([...stocks, data]);
      setSymbol("");
    } catch (err) {
      alert("Could not fetch dividend data.");
      console.error(err);
    }
  };

  const handleRemoveStock = (index) => {
    const updated = [...stocks];
    updated.splice(index, 1);
    setStocks(updated);
  };

  const handleSharesChange = (index, value) => {
    const updated = [...stocks];
    updated[index].shares = Number(value);
    setStocks(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-blue-600 text-center mb-6">
        Dividend Tracker 💰
      </h1>

      <div className="max-w-md mx-auto flex gap-2">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter stock symbol (e.g. AAPL)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
        />
        <button
          onClick={handleAddStock}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Stock List */}
      <ul className="max-w-md mx-auto mt-6">
        {stocks.map((stock, i) => (
          <li key={i} className="bg-white shadow p-4 mb-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold">{stock.symbol}</p>
              <input
                type="number"
                min="1"
                value={stock.shares}
                onChange={(e) => handleSharesChange(i, e.target.value)}
                className="w-20 border px-2 py-1 rounded text-sm"
                title="Shares Owned"
              />
              <button
                onClick={() => handleRemoveStock(i)}
                className="ml-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                title="Remove stock"
              >
                Remove
              </button>
            </div>
            <p>Dividend Yield: {stock.dividendYield ? (stock.dividendYield * 100).toFixed(2) + "%" : "N/A"}</p>
            <p>Dividend Rate: ${stock.dividendRate ?? "N/A"}</p>
            <p>EPS: {stock.forwardEps ?? "N/A"}</p>
            <p>📈 Est. Income: ${stock.dividendRate && stock.shares ? (stock.dividendRate * stock.shares).toFixed(2) : "N/A"}</p>
          </li>
        ))}
      </ul>

      {/* Bar Chart */}
      {stocks.length > 0 && (
        <div className="max-w-2xl mx-auto mt-10 bg-white shadow p-6 rounded">
          <h2 className="text-2xl font-bold mb-4 text-center">Estimated Annual Income</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stocks.map((stock) => ({
                symbol: stock.symbol,
                income: stock.dividendRate && stock.shares
                  ? parseFloat((stock.dividendRate * stock.shares).toFixed(2))
                  : 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
