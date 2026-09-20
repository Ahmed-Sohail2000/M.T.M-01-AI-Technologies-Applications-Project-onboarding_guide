"use client";
import { useEffect, useRef, useState } from "react";
import { sendChat } from "../api/backend";

interface ChatBoxProps {
    department?: string;
    title?: string;
    onSend?: (question: string, history: string[]) => Promise<{ answer: string }>;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: any[];
}

export default function ChatBox({ department, title, onSend }: ChatBoxProps) {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    async function handleSend() {
        const currentQuestion = question.trim();
        if (!currentQuestion) return;

        setMessages((prev) => [...prev, { role: "user", content: currentQuestion }]);
        setQuestion("");
        setLoading(true);
        setError(null);

        try {
            const deptQuestion = department ? `[${department}] ${currentQuestion}` : currentQuestion;
            const questionToSend = onSend ? currentQuestion : deptQuestion;
            const token = typeof window !== 'undefined' ? localStorage.getItem('vaultmind_token') ?? undefined : undefined;
            const res = await (onSend
                ? onSend(questionToSend, history)
                : sendChat(questionToSend, history, token));
            setMessages((prev) => [...prev, { role: "assistant", content: res.answer, sources: res.sources }]);
            setHistory((prev) => [...prev, questionToSend]);
        } catch (e: any) {
            setError(e.message || "Failed to fetch response from VaultMind");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-3xl mx-auto rounded-2xl border border-border bg-card shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-6 border-b border-border pb-4">
                <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="h-3 w-3 rounded-full bg-accent" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight">{title ?? "Chat with RAG Agent"}</h2>
            </div>

            <div className="space-y-4 mb-6 h-96 overflow-y-auto p-2 rounded-xl bg-background/60 border border-border">
                {messages.length === 0 && (
                    <div className="text-center text-muted py-20">
                        <p className="text-base font-medium text-foreground">Welcome to VaultMind</p>
                        <p className="text-sm mt-1">Ask any question about company documents.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user"
                            ? "bg-foreground text-background rounded-br-md"
                            : "bg-card text-foreground rounded-bl-md border border-border accent-border"
                            }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>

                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-border">
                                    <p className="text-xs font-semibold text-accent mb-1 uppercase tracking-wide">Sources</p>
                                    <div className="grid gap-2">
                                        {msg.sources.map((src, idx) => (
                                            <div key={idx} className="text-[11px] p-2 bg-background rounded-lg border border-border">
                                                <span className="font-semibold text-foreground">[{idx + 1}] {src.source}</span>
                                                <p className="italic text-muted">{src.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-md animate-pulse text-sm text-muted">
                            VaultMind is searching documents…
                        </div>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-500 text-xs mt-2 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={department ? `Ask about ${department}...` : "Type your question..."}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                />
                <button
                    className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    onClick={handleSend}
                    disabled={loading || !question.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
