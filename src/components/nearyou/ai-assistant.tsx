"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function AiAssistant() {
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!value.trim()) return;

    const currentMessage = value.trim();
    setValue("");
    setMessages((prev) => [...prev, { role: "user", content: currentMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: currentMessage,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: json.message ?? "Le service IA est indisponible pour le moment.",
          },
        ]);
        return;
      }

      setConversationId(json.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Erreur réseau. Merci de réessayer ou de contacter support@nearyou.ch.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Assistant NearYou</h2>
      <p className="mt-1 text-sm text-slate-600">
        Posez vos questions: catégorie de service, réservation, onboarding prestataire.
      </p>

      <div className="mt-4 max-h-80 space-y-2 overflow-auto rounded-xl bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Exemple: "J'ai besoin d'une visite senior demain à Lausanne"</p>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "ml-8 bg-blue-100 text-blue-900" : "mr-8 bg-white text-slate-700"}`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Écrire votre message"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void sendMessage();
            }
          }}
        />
        <Button type="button" onClick={() => void sendMessage()} disabled={loading} className="rounded-xl bg-blue-700 hover:bg-blue-800">
          {loading ? "Envoi..." : "Envoyer"}
        </Button>
      </div>
    </Card>
  );
}
