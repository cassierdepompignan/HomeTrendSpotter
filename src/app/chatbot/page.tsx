"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `Tu es un expert en décoration d'intérieur et en tendances déco. Tu t'appuies sur des données analysées de magazines (Elle Décoration, Cabana, Côté Sud, Architectural Digest, Dezeen) pour donner des conseils personnalisés.

Tu peux conseiller sur:
- Les couleurs tendance par saison
- Les styles (japandi, wabi-sabi, art déco, scandinave, etc.)
- Les matériaux et textures
- Le mobilier et art de la table
- Les thèmes (biophilie, quiet luxury, dopamine décor, etc.)
- Les combinaisons de couleurs
- L'aménagement d'espace

Sois concis, chaleureux et donne des conseils concrets. Utilise des emojis avec parcimonie.`;

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Bonjour ! Je suis votre expert IA en décoration d'intérieur. Posez-moi vos questions sur les tendances, les couleurs, les matériaux ou l'aménagement de vos espaces.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Désolé, je n'ai pas pu répondre." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion. Réessayez." },
      ]);
    }
    setLoading(false);
  };

  const suggestions = [
    "Quelles couleurs sont tendance cet automne ?",
    "Comment créer une ambiance wabi-sabi ?",
    "Je veux un salon scandinave, par où commencer ?",
    "Quels matériaux mixer avec le velours ?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col h-[80vh]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">💬 Chatbot Déco</h1>
        <p className="text-zinc-500 mt-1">Votre expert IA en tendances intérieures</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-amber-500 text-white rounded-br-sm"
                  : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-zinc-400 animate-pulse">
              Réflexion...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-full border border-amber-100 hover:bg-amber-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Posez votre question déco..."
          className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
