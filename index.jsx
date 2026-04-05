import { useState } from "react";

const BOOKS = [
  { id: "how-to-win-friends", title: "How to Win Friends & Influence People", author: "Dale Carnegie", emoji: "🤝" },
  { id: "rich-dad-poor-dad", title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", emoji: "💰" },
  { id: "atomic-habits", title: "Atomic Habits", author: "James Clear", emoji: "⚡" },
  { id: "7-habits", title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", emoji: "🌟" },
  { id: "think-grow-rich", title: "Think and Grow Rich", author: "Napoleon Hill", emoji: "🧠" },
];

const AGES = [
  { id: "6-8", label: "Ages 6–8", note: "Simple words, big visuals" },
  { id: "9-12", label: "Ages 9–12", note: "Short sentences,  relatable scenarios" },
  { id: "13-16", label: "Ages 13–16", note: "Teen context, deeper insight" },
];

const PANEL_COLORS = [
  "#FFE566", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
];

const BORDER_COLORS = [
  "#E6A800", "#C0392B", "#1ABC9C", "#2980B9", "#27AE60", "#F39C12",
];

function SpeechBubble({ text, type = "speech" }) {
  return (
    <div style={{
      position: "relative",
      background: type === "thought" ? "#f0f8ff" : "white",
      border: "2.5px solid #111",
      borderRadius: type === "thought" ? "50%" : "12px",
      padding: "8px 12px",
      fontSize: "12px",
      fontFamily: "'Bangers', cursive",
      letterSpacing: "0.5px",
      lineHeight: "1.4",
      maxWidth: "90%",
      margin: "0 auto 6px",
      boxShadow: "2px 2px 0 #111",
      color: "#111",
      textAlign: "center",
    }}>
      {text}
    </div>
  );
}

function Panel({ panel, index }) {
  const bg = PANEL_COLORS[index % PANEL_COLORS.length];
  const border = BORDER_COLORS[index % BORDER_COLORS.length];

  return (
    <div style={{
      border: "3px solid #111",
      borderRadius: "4px",
      overflow: "hidden",
      background: "white",
      boxShadow: "4px 4px 0 #111",
      display: "flex",
      flexDirection: "column",
      minHeight: "220px",
    }}>
      {/* Panel number */}
      <div style={{
        background: "#111",
        color: "white",
        fontFamily: "'Bangers', cursive",
        fontSize: "11px",
        letterSpacing: "2px",
        padding: "3px 8px",
        textTransform: "uppercase",
      }}>
        Panel {index + 1}
      </div>

      {/* Scene illustration area */}
      <div style={{
        background: bg,
        flex: 1,
        padding: "14px",
        position: "relative",
        minHeight: "100px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderBottom: `2px solid ${border}`,
      }}>
        {/* Big emoji as illustration placeholder */}
        <div style={{ fontSize: "52px", lineHeight: 1, marginBottom: "8px" }}>
          {panel.emoji}
        </div>
        {/* Scene description */}
        <div style={{
          fontSize: "10px",
          fontFamily: "'Comic Neue', cursive",
          color: "#333",
          textAlign: "center",
          fontStyle: "italic",
          padding: "0 4px",
        }}>
          {panel.scene}
        </div>
      </div>

      {/* Dialogue / narration */}
      <div style={{ padding: "10px 10px 6px", background: "white" }}>
        {panel.narration && (
          <div style={{
            background: "#FFFDE7",
            border: "2px solid #111",
            borderRadius: "4px",
            padding: "5px 8px",
            fontSize: "10.5px",
            fontFamily: "'Comic Neue', cursive",
            fontWeight: "bold",
            marginBottom: "6px",
            color: "#333",
          }}>
            📖 {panel.narration}
          </div>
        )}
        {panel.dialogue && (
          <SpeechBubble text={panel.dialogue} />
        )}
      </div>
    </div>
  );
}

export default function ComicGenerator() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comic, setComic] = useState(null);
  const [error, setError] = useState(null);

  const generateComic = async () => {
    if (!selectedBook || !selectedAge) return;
    setLoading(true);
    setError(null);
    setComic(null);

    const book = BOOKS.find(b => b.id === selectedBook);
    const age = AGES.find(a => a.id === selectedAge);

    const prompt = `You are a children's comic writer. Create a 6-panel comic strip that teaches one key lesson from "${book.title}" by ${book.author}, adapted for children aged ${age.id} (${age.note}).

Return ONLY a valid JSON object — no explanation, no markdown, no backticks. Format:
{
  "title": "comic episode title (short, exciting)",
  "lesson": "the one core lesson being taught",
  "panels": [
    {
      "emoji": "one emoji representing the scene",
      "scene": "10-15 word visual description of what is happening in this panel",
      "narration": "brief narrator caption (optional, can be null)",
      "dialogue": "what a character says (optional, can be null)"
    }
  ]
}

Rules:
- Exactly 6 panels
- Use simple relatable scenarios (school, home, friends, market)
- Nigerian/African context is welcome
- Each panel should move the story forward
- End with the lesson clearly landing
- Age-appropriate language only`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.map(i => i.text || "").join("").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setComic({ ...parsed, book: book.title, age: age.label });
    } catch (err) {
      setError("Something went wrong generating the comic. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a2e",
      fontFamily: "'Comic Neue', sans-serif",
      padding: "24px 16px",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #FFE566; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          fontFamily: "'Bangers', cursive",
          fontSize: "clamp(36px, 8vw, 64px)",
          color: "#FFE566",
          letterSpacing: "4px",
          lineHeight: 1,
          textShadow: "4px 4px 0 #E6A800, 8px 8px 0 rgba(0,0,0,0.3)",
        }}>
          BOOK2COMIC
        </div>
        <div style={{
          fontFamily: "'Comic Neue', sans-serif",
          color: "#aaa",
          fontSize: "14px",
          marginTop: "6px",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}>
          Turn wisdom into adventures kids love
        </div>
      </div>

      {/* Step 1: Pick Book */}
      <div style={{ maxWidth: "680px", margin: "0 auto 28px" }}>
        <div style={{
          fontFamily: "'Bangers', cursive",
          color: "#FF6B6B",
          fontSize: "20px",
          letterSpacing: "2px",
          marginBottom: "12px",
        }}>
          STEP 1 — CHOOSE A BOOK
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {BOOKS.map(book => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book.id)}
              style={{
                border: selectedBook === book.id ? "3px solid #FFE566" : "2px solid #333",
                borderRadius: "8px",
                padding: "14px 18px",
                cursor: "pointer",
                background: selectedBook === book.id ? "#2a2a1a" : "#16213e",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                transition: "all 0.15s ease",
                transform: selectedBook === book.id ? "translateX(4px)" : "none",
                boxShadow: selectedBook === book.id ? "4px 4px 0 #E6A800" : "none",
              }}
            >
              <span style={{ fontSize: "28px" }}>{book.emoji}</span>
              <div>
                <div style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>{book.title}</div>
                <div style={{ color: "#888", fontSize: "12px" }}>{book.author}</div>
              </div>
              {selectedBook === book.id && (
                <span style={{ marginLeft: "auto", color: "#FFE566", fontFamily: "'Bangers', cursive", fontSize: "18px" }}>✓ SELECTED</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Pick Age */}
      <div style={{ maxWidth: "680px", margin: "0 auto 28px" }}>
        <div style={{
          fontFamily: "'Bangers', cursive",
          color: "#4ECDC4",
          fontSize: "20px",
          letterSpacing: "2px",
          marginBottom: "12px",
        }}>
          STEP 2 — TARGET AGE GROUP
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {AGES.map(age => (
            <div
              key={age.id}
              onClick={() => setSelectedAge(age.id)}
              style={{
                border: selectedAge === age.id ? "3px solid #4ECDC4" : "2px solid #333",
                borderRadius: "8px",
                padding: "14px 10px",
                cursor: "pointer",
                background: selectedAge === age.id ? "#1a2a2a" : "#16213e",
                textAlign: "center",
                transition: "all 0.15s ease",
                boxShadow: selectedAge === age.id ? "4px 4px 0 #1ABC9C" : "none",
              }}
            >
              <div style={{ color: "white", fontWeight: "bold", fontSize: "15px" }}>{age.label}</div>
              <div style={{ color: "#888", fontSize: "11px", marginTop: "4px" }}>{age.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div style={{ maxWidth: "680px", margin: "0 auto 32px", textAlign: "center" }}>
        <button
          onClick={generateComic}
          disabled={!selectedBook || !selectedAge || loading}
          style={{
            background: (!selectedBook || !selectedAge || loading) ? "#333" : "#FFE566",
            color: (!selectedBook || !selectedAge || loading) ? "#666" : "#111",
            border: "3px solid #111",
            borderRadius: "8px",
            padding: "16px 40px",
            fontFamily: "'Bangers', cursive",
            fontSize: "22px",
            letterSpacing: "3px",
            cursor: (!selectedBook || !selectedAge || loading) ? "not-allowed" : "pointer",
            boxShadow: (!selectedBook || !selectedAge || loading) ? "none" : "5px 5px 0 #E6A800",
            transform: (!selectedBook || !selectedAge || loading) ? "none" : "translateY(-2px)",
            transition: "all 0.15s ease",
            width: "100%",
            maxWidth: "360px",
          }}
        >
          {loading ? "✏️  GENERATING COMIC..." : "⚡  GENERATE COMIC STRIP"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          maxWidth: "680px",
          margin: "0 auto 20px",
          background: "#2a1010",
          border: "2px solid #FF6B6B",
          borderRadius: "8px",
          padding: "14px",
          color: "#FF6B6B",
          textAlign: "center",
        }}>
          {error}
        </div>
      )}

      {/* Comic Output */}
      {comic && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* Comic Header */}
          <div style={{
            background: "#FFE566",
            border: "3px solid #111",
            borderRadius: "8px 8px 0 0",
            padding: "18px 20px 14px",
            boxShadow: "5px 5px 0 #111",
            marginBottom: "0",
          }}>
            <div style={{
              fontFamily: "'Bangers', cursive",
              fontSize: "clamp(22px, 5vw, 36px)",
              color: "#111",
              letterSpacing: "2px",
              lineHeight: 1.1,
            }}>
              {comic.title}
            </div>
            <div style={{ fontSize: "12px", color: "#555", marginTop: "6px" }}>
              Based on <strong>{comic.book}</strong> · For {comic.age}
            </div>
            <div style={{
              marginTop: "10px",
              background: "#111",
              color: "#FFE566",
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "4px",
              fontFamily: "'Bangers', cursive",
              fontSize: "13px",
              letterSpacing: "1px",
            }}>
              💡 LESSON: {comic.lesson}
            </div>
          </div>

          {/* Panels Grid */}
          <div style={{
            background: "#222",
            border: "3px solid #111",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            boxShadow: "5px 5px 0 #111",
          }}>
            {comic.panels?.map((panel, i) => (
              <Panel key={i} panel={panel} index={i} />
            ))}
          </div>

          {/* Footer */}
          <div style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#555",
            fontSize: "12px",
            letterSpacing: "1px",
          }}>
            GENERATED BY BOOK2COMIC · POWERED BY AI
          </div>
        </div>
      )}
    </div>
  );
}
