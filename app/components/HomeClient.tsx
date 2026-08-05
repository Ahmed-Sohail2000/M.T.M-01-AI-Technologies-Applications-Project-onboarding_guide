"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { DepartmentInfo } from "../api/backend";
import ChatBox from "./ChatBox";

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

export default function HomeClient({ departments }: HomeClientProps) {
    const router = useRouter();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeOnboardingStep, setActiveOnboardingStep] = useState(0);
    const [auth, setAuth] = useState<AuthState | null>(null);

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
        setIsChatOpen(false);
        router.refresh();
    }

    const onboardingSteps = [
        {
            title: "Meet VaultMind",
            description: "Search your company knowledge with guided prompts and grounded answers.",
        },
        {
            title: "Choose a workspace",
            description: "Open your department context and focus on role-specific onboarding guidance.",
        },
        {
            title: "Get source-backed help",
            description: "Ask questions and act confidently using evidence pulled from your internal docs.",
        },
    ] as const;

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveOnboardingStep((prev) => (prev + 1) % onboardingSteps.length);
        }, 3200);

        return () => window.clearInterval(interval);
    }, [onboardingSteps.length]);

    const currentStep = onboardingSteps[activeOnboardingStep];

    const navLinks = [
        { href: "/documents", label: "Documents" },
        { href: "/integrations", label: "Integrations" },
        { href: "/docs", label: "User Guide" },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Nav */}
            <header className="sticky top-0 z-20 border-b border-black/[.06] dark:border-white/[.08] bg-background/80 backdrop-blur-md">
                <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="h-3 w-3 rounded-full bg-accent" />
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

                    <div className="flex items-center gap-3">
                        {auth ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold select-none">
                                        {auth.displayName.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="hidden sm:inline text-sm font-medium">{auth.displayName}</span>
                                    {auth.role === "ADMIN" && (
                                        <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent/40 px-1.5 py-0.5 rounded-full">
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
                                className="px-4 py-2 text-sm font-semibold rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            <main className="max-w-6xl mx-auto px-6 md:px-8">
                {/* Hero */}
                <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center py-16 md:py-24">
                    <div>
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent mb-5">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            Private knowledge AI
                        </p>
                        <h1 className="text-4xl md:text-5xl font-semibold leading-[1.08] tracking-tight">
                            Your company&apos;s knowledge,
                            <br className="hidden md:block" /> answered instantly.
                        </h1>
                        <p className="text-lg leading-7 text-muted mt-5 max-w-xl">
                            A private AI assistant for internal knowledge, backed by NVIDIA NIM or a local LM
                            Studio model — never public LLM APIs. Explore department workspaces and get
                            grounded, cited answers from your own documents.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-8">
                            <button
                                onClick={() => setIsChatOpen((prev) => !prev)}
                                className="px-6 py-3 bg-foreground text-background rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                            >
                                {isChatOpen ? "Hide assistant" : "Ask VaultMind"}
                            </button>
                            <Link
                                href="/documents"
                                className="px-6 py-3 border border-black/10 dark:border-white/15 rounded-full font-semibold text-sm hover:border-black/25 dark:hover:border-white/30 transition-colors"
                            >
                                Upload documents
                            </Link>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-sm">
                        <div className="rounded-2xl border border-black/[.06] dark:border-white/[.08] bg-card shadow-sm p-6">
                            <p className="text-xs uppercase tracking-[0.14em] text-muted font-semibold">Onboarding</p>
                            <h3 className="text-xl font-semibold mt-2 transition-all duration-300">{currentStep.title}</h3>
                            <p className="text-sm text-muted mt-2 leading-relaxed min-h-10">
                                {currentStep.description}
                            </p>

                            <div className="mt-6 flex items-center gap-2">
                                {onboardingSteps.map((step, idx) => (
                                    <span
                                        key={step.title}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeOnboardingStep ? "w-8 bg-accent" : "w-1.5 bg-black/10 dark:bg-white/15"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {isChatOpen && (
                    <section className="pb-16">
                        <ChatBox title="VaultMind Assistant" />
                    </section>
                )}

                {/* How it works */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
                    {[
                        { step: "01", title: "Discover", body: "Browse department workspaces and locate relevant internal domains quickly." },
                        { step: "02", title: "Ask", body: "Ask context-aware questions and iterate using conversation history." },
                        { step: "03", title: "Act", body: "Use source-backed answers for onboarding, compliance, and operations tasks." },
                    ].map((item) => (
                        <div key={item.step} className="rounded-2xl border border-black/[.06] dark:border-white/[.08] bg-card p-6">
                            <span className="text-xs font-semibold text-accent tracking-[0.14em]">{item.step}</span>
                            <h3 className="text-base font-semibold mt-2">{item.title}</h3>
                            <p className="mt-2 text-sm text-muted leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </section>

                {/* Departments */}
                {departments.length > 0 && (
                    <section className="pb-20">
                        <div className="flex items-end justify-between mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight">Department workspaces</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {departments.map((department) => (
                                <Link
                                    key={department.id}
                                    href={`/departments/${department.id}`}
                                    className="group block rounded-2xl border border-black/[.06] dark:border-white/[.08] bg-card p-6 hover:border-accent/50 hover:shadow-sm transition-all"
                                >
                                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">{department.name}</h3>
                                    <p className="text-sm text-muted mt-1.5">{department.description}</p>
                                    <p className="text-xs text-muted/80 mt-2">{department.info}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Who it's for */}
                <section className="pb-20">
                    <div className="rounded-3xl border border-black/[.06] dark:border-white/[.08] bg-card p-8 md:p-10">
                        <h2 className="text-2xl font-semibold tracking-tight mb-3">Who is VaultMind for?</h2>
                        <p className="text-muted mb-8 max-w-2xl">
                            Built for organizations that manage sensitive internal knowledge and need private AI
                            workflows with secure, role-aware access.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Operations teams", body: "Get consistent answers from policies, SOPs, and internal docs." },
                                { title: "Compliance and IT", body: "Keep documents local with secure infrastructure and governance." },
                                { title: "New employee onboarding", body: "Help hires find internal knowledge faster through guided Q&A." },
                            ].map((item) => (
                                <div key={item.title}>
                                    <span className="font-semibold block mb-1.5">{item.title}</span>
                                    <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Feature highlights */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
                    {[
                        { title: "Local-first AI", body: "Data stays inside your environment across ingestion, retrieval, and answer generation." },
                        { title: "Grounded responses", body: "RAG answers are anchored to indexed company documents and source context." },
                        { title: "Department workspaces", body: "Dedicated spaces provide focused prompts and assistant behavior per business unit." },
                    ].map((item) => (
                        <div key={item.title} className="rounded-2xl border border-black/[.06] dark:border-white/[.08] bg-card p-6">
                            <span className="h-2 w-2 rounded-full bg-accent inline-block mb-4" />
                            <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </section>

                {/* Secondary links */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                    <Link
                        href="/documents"
                        className="group flex flex-col gap-3 rounded-2xl border border-black/[.06] dark:border-white/[.08] bg-card p-7 hover:border-accent/50 hover:shadow-sm transition-all"
                    >
                        <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">Document ingestion</h3>
                        <p className="text-sm text-muted leading-relaxed">
                            Upload PDFs, Word documents, Markdown files, and CSVs. Each document is automatically
                            chunked, embedded, and stored in the knowledge base for instant retrieval.
                        </p>
                        <span className="text-sm font-semibold text-accent mt-auto">Open upload panel →</span>
                    </Link>
                    <Link
                        href="/integrations"
                        className="group flex flex-col gap-3 rounded-2xl border border-black/[.06] dark:border-white/[.08] bg-card p-7 hover:border-accent/50 hover:shadow-sm transition-all"
                    >
                        <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">Integrations</h3>
                        <p className="text-sm text-muted leading-relaxed">
                            Connect email (SMTP), Jira, Google Calendar, Slack, Microsoft Teams, GitHub, and
                            Notion to enrich the knowledge base and enable automated workflows.
                        </p>
                        <span className="text-sm font-semibold text-accent mt-auto">Manage integrations →</span>
                    </Link>
                </section>
            </main>

            <footer className="border-t border-black/[.06] dark:border-white/[.08]">
                <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
                    <span>© {new Date().getFullYear()} VaultMind. Private knowledge, kept private.</span>
                    <div className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
