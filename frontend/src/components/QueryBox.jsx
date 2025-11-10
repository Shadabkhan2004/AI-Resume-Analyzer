import { useState } from "react";
import { Send } from "lucide-react";

const backendURL = "http://localhost:8000"; // replace with Render URL

export default function QueryBox({ setResult, defaultQuery }) {
  const [query, setQuery] = useState(defaultQuery || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${backendURL}/ask-question/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Query the Resume</h2>
      <textarea
        rows={3}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Ask something like: Extract the full candidate profile"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : <>Analyze Resume <Send className="w-4 h-4" /></>}
      </button>
    </div>
  );
}
