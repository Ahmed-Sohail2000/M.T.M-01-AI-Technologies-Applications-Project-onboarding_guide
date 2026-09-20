"use client";

import { useEffect, useRef, useState } from "react";
import { DEPARTMENT_DEMO, DEFAULT_DEMO, type DemoExchange } from "./departmentDemoData";
import { IconBrain, IconBook } from "./icons";

interface Message {
    role: "user" | "assistant";
    text: string;
    source?: string;
}

interface DepartmentChatDemoProps {
    departmentId: string;
    departmentName: string;
}

// Generic question words that would otherwise "match" almost any typed
// question and misfire against an unrelated suggestion.
const STOPWORDS = new Set([
    "what", "when", "where", "which", "who", "whom", "whose", "why", "how",
    "does", "do", "did", "is", "are", "was", "were", "have", "has", "had",
    "the", "this", "that", "with", "from", "your", "you", "for", "and",
]);

function findAnswer(demo: typeof DEFAULT_DEMO, question: string): DemoExchange {
    const normalized = question.trim().toLowerCase();
    const match = demo.suggestions.find((s) => {
        const words = s.question
            .toLowerCase()
            .split(/\W+/)
            .filter((w) => w.length > 4 && !STOPWORDS.has(w));
        return words.some((w) => normalized.includes(w));
    });
    return match ?? { ...demo.fallback, question };
}

export default function DepartmentChatDemo({ departmentId, departmentName }: DepartmentChatDemoProps) {
    const demo = DEPARTMENT_DEMO[departmentId] ?? DEFAULT_DEMO;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current && typeof bottomRef.current.scrollIntoView === "function") {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, thinking]);

    function ask(question: string) {
        if (!question.trim() || thinking) return;
        setMessages((prev) => [...prev, { role: "user", text: question }]);
        setInput("");
        setThinking(true);

        const { answer, source } = findAnswer(demo, question);
        window.setTimeout(() => {
            setMessages((prev) => [...prev, { role: "assistant", text: answer, source }]);
            setThinking(false);
        }, 600 + Math.random() * 500);
    }

    return (
        <div className="w-full max-w-3xl mx-auto rounded-2xl border border-border bg-card shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                        <IconBrain className="h-4 w-4" />
                    </span>
                    <h2 className="text-lg font-semibold tracking-tight">{departmentName} — Main Chat Agent</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted bg-surface border border-border px-2 py-1 rounded-full shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Preview
                </span>
            </div>

            <p className="text-xs text-muted mb-4 leading-relaxed">
                This workspace shows example answers instead of a live model call, so it always works.
                Ask one of the suggested questions below, or type your own — matching questions get a
                realistic preview response.
            </p>

            {/* Suggested prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
                {demo.suggestions.map((s) => (
                    <button
                        key={s.question}
                        type="button"
                        onClick={() => ask(s.question)}
                        disabled={thinking}
                        className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface text-foreground hover:border-accent/50 hover:text-accent transition-colors disabled:opacity-50"
                    >
                        {s.question}
                    </button>
                ))}
            </div>

            <div className="space-y-4 mb-4 h-80 overflow-y-auto p-2 rounded-xl bg-background/60 border border-border">
                {messages.length === 0 && (
                    <div className="text-center text-muted py-16">
                        <p className="text-base font-medium text-foreground">Ask {departmentName} anything</p>
                        <p className="text-sm mt-1">Try a suggested question above to see how it responds.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-card text-foreground rounded-bl-md border border-border accent-border"
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.source && (
                                <p className="mt-2 pt-2 border-t border-border/80 inline-flex items-center gap-1 text-xs text-accent font-medium">
                                    <IconBook className="h-3 w-3" />
                                    {msg.source}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {thinking && (
                    <div className="flex justify-start">
                        <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-md animate-pulse text-sm text-muted">
                            {departmentName} assistant is thinking…
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form
                className="flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                }}
            >
                <input
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${departmentName} a question…`}
                    disabled={thinking}
                />
                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                    disabled={thinking || !input.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
}
