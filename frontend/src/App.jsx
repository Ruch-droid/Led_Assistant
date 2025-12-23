import { useState } from "react";
import ReactMarkdown from "react-markdown";

const API_URL = "http://127.0.0.1:8000/api/query";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [loading, setLoading] = useState(false);

  const submitQuery = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setTimestamp("");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.response);
    setTimestamp(data.timestamp);
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>💡 LED Manufacturing Assistant</h1>

        <textarea
          style={styles.textarea}
          placeholder="Ask a manufacturing-related question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button style={styles.button} onClick={submitQuery}>
          {loading ? "Analyzing..." : "Ask"}
        </button>

        {answer && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Answer</h2>

            {/* ✅ Proper Markdown rendering */}
            <ReactMarkdown style={styles.markdown}>
              {answer}
            </ReactMarkdown>

            <div style={styles.timestamp}>
              Generated on: {new Date(timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "40px 0",
  },
  container: {
    maxWidth: "800px",
    margin: "auto",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "14px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "15px",
    padding: "10px 24px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  card: {
    marginTop: "30px",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    marginBottom: "15px",
    borderBottom: "1px solid #eee",
    paddingBottom: "8px",
  },
  markdown: {
    lineHeight: "1.7",
    fontSize: "15.5px",
  },
  timestamp: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#666",
    textAlign: "right",
  },
};

export default App;
