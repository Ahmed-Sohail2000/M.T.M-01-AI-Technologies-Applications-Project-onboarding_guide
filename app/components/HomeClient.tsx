"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { DepartmentInfo } from "../api/backend";
import ThemeToggle from "./ThemeToggle";
import {
    IconArrowRight,
    IconBook,
    IconBrain,
    IconCheck,
    IconChat,
    IconClock,
    IconLock,
    IconMenu,
    IconPlug,
    IconSearch,
    IconServer,
    IconShield,
    IconTrendingDown,
    IconTrendingUp,
    IconUpload,
    IconUsers,
    IconX,
} from "./icons";

interface HomeClientProps {
    departments: DepartmentInfo[];
}

interface AuthState {
    token: string;
    username: string;
    displayName: string;
    role: string;
    dept: string;
}

const CARD = "rounded-2xl border border-border bg-card";
const CARD_HOVER = "hover:border-accent/40 hover:shadow-md transition-all duration-200";
const SECTION_LABEL = "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent";

const HOW_IT_WORKS = [
    {
        step: "Step 1",
        icon: IconSearch,
        title: "Open a workspace",
        body: "Pick your department from the navigation bar. Each workspace already knows your role, so you only see what's relevant to you.",
    },
    {
        step: "Step 2",
        icon: IconChat,
        title: "Ask in plain language",
        body: "Type a question the way you'd ask a colleague — \"how do I file expenses\" or \"who approves vendor contracts.\" No search syntax to learn.",
    },
    {
        step: "Step 3",
        icon: IconCheck,
        title: "Get a cited answer",
        body: "VaultMind answers from your own documents and shows exactly which source it used, so you can trust it and verify it in one click.",
    },
] as const;

const OUTCOMES = [
    {
        icon: IconTrendingDown,
        metric: "Fewer repeat questions",
        title: "Cut interruptions to your team",
        body: "New hires and employees self-serve answers instead of pinging HR, IT, or their manager for things that are already documented.",
    },
    {
        icon: IconClock,
        metric: "Faster time-to-productive",
        title: "Shorten onboarding ramp-up",
        body: "Day-one questions get answered in seconds instead of waiting on a teammate, so new employees contribute sooner.",
    },
    {
        icon: IconShield,
        metric: "Lower compliance risk",
        title: "One source of truth, always current",
        body: "Answers are grounded in the latest uploaded policies and SOPs, with citations — reducing the risk of outdated or informal guidance.",
    },
    {
        icon: IconServer,
        metric: "Data stays private",
        title: "Nothing leaves your environment",
        body: "Runs on your own NVIDIA NIM or local LM Studio deployment — no public LLM API ever sees your internal documents.",
    },
] as const;

const HOOK_POINTS = [
    { icon: IconBrain, label: "Remembers everything you've documented" },
    { icon: IconBook, label: "Every answer cited and traceable" },
    { icon: IconShield, label: "Never leaves your infrastructure" },
] as const;

// Illustrative only — this hero card is a dummy, always-works preview, not a
// live call to the backend. One static exchange, revealed once on mount —
// deliberately not a cycling slideshow, so it reads like a real message
// thread you could screenshot, not a rotating ad.
const DEMO_MESSAGE = {
    question: "How many vacation days carry over?",
    answer: "Up to 5 days, into the next calendar year.",
    source: "Employee_Handbook.pdf · §4.2",
};

const AUDIENCES = [
    {
        icon: IconUsers,
        title: "People & Operations leaders",
        body: "Give every employee a consistent, always-on answer to policy and process questions — without adding headcount.",
    },
    {
        icon: IconShield,
        title: "Compliance & IT",
        body: "Keep sensitive documents on infrastructure you control, with role- and department-scoped access baked in.",
    },
    {
        icon: IconTrendingUp,
        title: "New employees",
        body: "Ask questions in plain language from day one and get sourced, trustworthy answers instead of guessing or waiting.",
    },
] as const;

export default function HomeClient({ departments }: HomeClientProps) {
    const router = useRouter();
    const [auth, setAuth] = useState<AuthState | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(true);
    const previewRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLElement>(null);

    // Reveal the reply once, ~900ms after mount, so the message window feels
    // alive on first load — deliberately not a repeating cycle, so it reads
    // as a real conversation you'd screenshot rather than a slideshow.
    useEffect(() => {
        const timer = window.setTimeout(() => setIsTyping(false), 900);
        return () => window.clearTimeout(timer);
    }, []);

    function handleTryQuestion() {
        const firstDept = departments[0]?.id;
        if (firstDept) {
            router.push(`/departments/${firstDept}`);
        } else {
            previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function scrollToHowItWorks() {
        howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    useEffect(() => {
        const token = localStorage.getItem("vaultmind_token");
        if (token) {
            setAuth({
                token,
                username: localStorage.getItem("vaultmind_user") ?? "",
                displayName: localStorage.getItem("vaultmind_display_name") ?? localStorage.getItem("vaultmind_user") ?? "",
                role: localStorage.getItem("vaultmind_role") ?? "USER",
                dept: localStorage.getItem("vaultmind_dept") ?? "",
            });
        }
    }, []);

    function handleLogout() {
        ["vaultmind_token", "vaultmind_role", "vaultmind_user", "vaultmind_display_name", "vaultmind_dept"]
            .forEach((k) => localStorage.removeItem(k));
        setAuth(null);
        setIsMobileMenuOpen(false);
        router.refresh();
    }

    const navLinks = [
        { href: "#how-it-works", label: "How it works" },
        { href: "/documents", label: "Documents" },
        { href: "/integrations", label: "Integrations" },
        { href: "/docs", label: "User guide" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Nav */}
            <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
                <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                            <IconShield className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-base font-semibold tracking-tight">VaultMind</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle className="hidden sm:inline-flex" />

                        <div className="hidden md:block">
                            {auth ? (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2">
                                        <span className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold select-none">
                                            {auth.displayName.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="text-sm font-medium">{auth.displayName}</span>
                                        {auth.role === "ADMIN" && (
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent-soft px-1.5 py-0.5 rounded-full">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:opacity-90 transition-opacity"
                                >
                                    Sign in
                                </Link>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen((v) => !v)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isMobileMenuOpen}
                            className="md:hidden h-9 w-9 rounded-full border border-border flex items-center justify-center text-foreground"
                        >
                            {isMobileMenuOpen ? <IconX className="h-4.5 w-4.5" /> : <IconMenu className="h-4.5 w-4.5" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile menu panel */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="py-2.5 text-sm font-medium text-foreground border-b border-border last:border-b-0"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="flex items-center justify-between pt-4">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Theme</span>
                            <ThemeToggle />
                        </div>

                        <div className="pt-4">
                            {auth ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold select-none">
                                            {auth.displayName.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="text-sm font-medium">{auth.displayName}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm font-semibold text-accent"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-center px-4 py-2.5 text-sm font-semibold rounded-full bg-primary text-white"
                                >
                                    Sign in
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* Hero */}
                <section className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center py-16 md:py-24">
                    <div>
                        <p className={`${SECTION_LABEL} mb-6`}>
                            <IconBrain className="h-3.5 w-3.5" />
                            Auditable AI for organizational knowledge
                        </p>
                        <h1 className="text-5xl md:text-[3.75rem] font-bold leading-[1.05] tracking-tight text-foreground">
                            An organizational memory
                            <br className="hidden md:block" /> that shows its work.
                        </h1>
                        <p className="text-xl leading-9 text-muted mt-8 max-w-xl">
                            VaultMind turns your handbooks, SOPs, and policies into a shared source of
                            truth — every answer traced back to the exact document and section it came
                            from, so nothing is a black box.
                        </p>

                        {/* Hook row — the visual "why this matters" cue */}
                        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8">
                            {HOOK_POINTS.map(({ icon: Icon, label }) => (
                                <li key={label} className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <span className="h-6 w-6 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                    {label}
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-wrap items-center gap-3 mt-10">
                            <button
                                type="button"
                                onClick={handleTryQuestion}
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                            >
                                Try asking a question
                                <IconArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={scrollToHowItWorks}
                                className="px-6 py-3.5 border border-border rounded-xl font-semibold text-sm text-foreground hover:border-accent/50 hover:bg-surface transition-colors"
                            >
                                See how it works
                            </button>
                        </div>

                        {/* Trust / outcome strip */}
                        <dl className="grid grid-cols-3 gap-6 mt-14 max-w-lg">
                            <div>
                                <dt className="text-2xl font-bold tracking-tight">100%</dt>
                                <dd className="text-xs text-muted mt-1 leading-snug">Answers grounded in your own documents</dd>
                            </div>
                            <div>
                                <dt className="text-2xl font-bold tracking-tight">0</dt>
                                <dd className="text-xs text-muted mt-1 leading-snug">Queries sent to public LLM APIs</dd>
                            </div>
                            <div>
                                <dt className="text-2xl font-bold tracking-tight">24/7</dt>
                                <dd className="text-xs text-muted mt-1 leading-snug">Available without waiting on a teammate</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Dummy, always-works preview — a static message-app window, not a slideshow */}
                    <div ref={previewRef} className="relative mx-auto w-full max-w-sm scroll-mt-24">
                        <div className="rounded-[1.75rem] border border-border bg-card shadow-lg overflow-hidden">
                            {/* App header bar */}
                            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-surface border-b border-border">
                                <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                    <IconBrain className="h-4.5 w-4.5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold leading-tight truncate">VaultMind Assistant</p>
                                    <p className="text-xs text-success leading-tight">Online</p>
                                </div>
                            </div>

                            {/* Message thread */}
                            <div className="px-4 py-5 bg-background flex flex-col gap-3 min-h-[16rem] justify-end">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="max-w-[80%] bg-primary text-white text-sm leading-snug rounded-2xl rounded-br-md px-4 py-2.5">
                                        {DEMO_MESSAGE.question}
                                    </div>
                                    <span className="text-[11px] text-muted pr-1">You · 9:41 AM</span>
                                </div>

                                {isTyping ? (
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="max-w-[85%] bg-surface border border-border text-sm leading-snug rounded-2xl rounded-bl-md px-4 py-2.5">
                                            {DEMO_MESSAGE.answer}
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-[11px] text-accent font-medium pl-1">
                                            <IconCheck className="h-3 w-3" />
                                            {DEMO_MESSAGE.source}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Decorative compose bar */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-surface border-t border-border">
                                <div className="flex-1 rounded-full bg-background border border-border px-4 py-2 text-sm text-muted">
                                    Message VaultMind…
                                </div>
                                <span className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                    <IconArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </div>
                        <p className="text-center text-xs text-muted mt-3">Example preview — not a live conversation</p>
                        <div className="absolute -z-10 inset-x-10 -bottom-4 h-10 bg-accent/10 blur-2xl rounded-full" />
                    </div>
                </section>

                {/* How it works — static 3-step, always visible, scannable */}
                <section
                    id="how-it-works"
                    ref={howItWorksRef}
                    className="scroll-mt-20 border-t border-border bg-surface"
                >
                    <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
                        <div className="max-w-2xl mb-10">
                            <p className={SECTION_LABEL}>How it works</p>
                            <h2 className="text-3xl font-bold tracking-tight mt-3">
                                From question to a trustworthy answer in three steps
                            </h2>
                            <p className="text-muted mt-3 leading-relaxed">
                                No training required. If your team can send a chat message, they already know how to use VaultMind.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }) => (
                                <div key={step} className={`${CARD} p-6 relative`}>
                                    <div className="flex items-center justify-between mb-5">
                                        <span className="h-11 w-11 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{step}</span>
                                    </div>
                                    <h3 className="text-base font-semibold">{title}</h3>
                                    <p className="mt-2 text-sm text-muted leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Business outcomes — this is the "why", framed for a business owner */}
                <section id="why-adopt" className="scroll-mt-20 border-t border-border bg-background">
                    <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
                        <div className="max-w-2xl mb-10">
                            <p className={SECTION_LABEL}>Why teams adopt VaultMind</p>
                            <h2 className="text-3xl font-bold tracking-tight mt-3">
                                Measured in fewer interruptions, not features
                            </h2>
                            <p className="text-muted mt-3 leading-relaxed">
                                VaultMind is built to change day-to-day outcomes for the business, not just add another chat window.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {OUTCOMES.map(({ icon: Icon, metric, title, body }) => (
                                <div key={title} className={`${CARD} p-6 flex gap-4`}>
                                    <span className="h-11 w-11 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-success">{metric}</span>
                                        <h3 className="text-base font-semibold mt-1">{title}</h3>
                                        <p className="mt-1.5 text-sm text-muted leading-relaxed">{body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Departments */}
                {departments.length > 0 && (
                    <section id="get-started" className="scroll-mt-20 border-t border-border bg-surface">
                        <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
                            <div className="flex items-end justify-between mb-6">
                                <div>
                                    <p className={SECTION_LABEL}>Get started</p>
                                    <h2 className="text-2xl font-bold tracking-tight mt-2">Open a department workspace</h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {departments.map((department) => (
                                    <Link
                                        key={department.id}
                                        href={`/departments/${department.id}`}
                                        className={`group flex items-start gap-4 ${CARD} p-6 ${CARD_HOVER}`}
                                    >
                                        <span className="h-10 w-10 shrink-0 rounded-lg bg-primary text-white flex items-center justify-center font-semibold text-sm">
                                            {department.name.charAt(0)}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold group-hover:text-accent transition-colors">{department.name}</h3>
                                            <p className="text-sm text-muted mt-1">{department.description}</p>
                                            <p className="text-xs text-muted/70 mt-2">{department.info}</p>
                                        </div>
                                        <IconArrowRight className="h-4 w-4 text-muted shrink-0 ml-auto mt-1 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Who it's for */}
                <section id="who-for" className="scroll-mt-20 border-t border-border bg-background">
                    <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
                        <div className="rounded-3xl border border-border bg-surface p-8 md:p-10">
                            <p className={SECTION_LABEL}>Who is VaultMind for?</p>
                            <h2 className="text-2xl font-bold tracking-tight mt-3 mb-8 max-w-2xl">
                                Built for organizations that manage sensitive internal knowledge and need
                                private, role-aware AI workflows.
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {AUDIENCES.map(({ icon: Icon, title, body }) => (
                                    <div key={title} className="bg-card rounded-2xl border border-border p-5">
                                        <span className="h-9 w-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-3">
                                            <Icon className="h-4.5 w-4.5" />
                                        </span>
                                        <span className="font-semibold block mb-1.5">{title}</span>
                                        <p className="text-sm text-muted leading-relaxed">{body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Where to go next — direct navigation guidance */}
                <section className="border-t border-border bg-surface">
                  <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
                    <div className="max-w-2xl mb-6">
                        <p className={SECTION_LABEL}>Where to go next</p>
                        <h2 className="text-2xl font-bold tracking-tight mt-3">Set up your knowledge base</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Link href="/documents" className={`group flex flex-col gap-3 ${CARD} p-6 ${CARD_HOVER}`}>
                            <span className="h-10 w-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                                <IconUpload className="h-5 w-5" />
                            </span>
                            <h3 className="text-base font-semibold group-hover:text-accent transition-colors">Upload documents</h3>
                            <p className="text-sm text-muted leading-relaxed flex-1">
                                Add PDFs, Word docs, or text files. Each one is chunked, embedded, and made
                                instantly searchable by the assistant.
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                                Open upload panel <IconArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </Link>
                        <Link href="/integrations" className={`group flex flex-col gap-3 ${CARD} p-6 ${CARD_HOVER}`}>
                            <span className="h-10 w-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                                <IconPlug className="h-5 w-5" />
                            </span>
                            <h3 className="text-base font-semibold group-hover:text-accent transition-colors">Connect integrations</h3>
                            <p className="text-sm text-muted leading-relaxed flex-1">
                                Link email, Jira, Slack, Teams, GitHub, or Notion so more of your company
                                knowledge feeds into the assistant.
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                                Manage integrations <IconArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </Link>
                        <Link href="/docs" className={`group flex flex-col gap-3 ${CARD} p-6 ${CARD_HOVER}`}>
                            <span className="h-10 w-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                                <IconBook className="h-5 w-5" />
                            </span>
                            <h3 className="text-base font-semibold group-hover:text-accent transition-colors">Read the user guide</h3>
                            <p className="text-sm text-muted leading-relaxed flex-1">
                                A short walkthrough of accounts, roles, document upload, and what runs
                                where — useful for admins setting things up.
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                                Open user guide <IconArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </Link>
                    </div>
                  </div>
                </section>
            </main>

            <footer className="border-t border-border">
                <div className="max-w-6xl mx-auto px-6 md:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <IconLock className="h-3.5 w-3.5" />
                        <span>© {new Date().getFullYear()} VaultMind. Private knowledge, kept private.</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="text-muted hover:text-foreground transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
