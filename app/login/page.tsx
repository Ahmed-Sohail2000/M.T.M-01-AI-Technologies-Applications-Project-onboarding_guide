"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerEmployee } from "../api/backend";

type Mode = "signin" | "signup";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signin");

    // Sign in
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Create account
    const [email, setEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [dept, setDept] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Already logged in → redirect home
    useEffect(() => {
        if (typeof window !== "undefined" && localStorage.getItem("vaultmind_token")) {
            router.replace("/");
        }
    }, [router]);

    function storeSession(result: { access_token: string; role: string; username: string; display_name: string; dept: string }) {
        localStorage.setItem("vaultmind_token", result.access_token);
        localStorage.setItem("vaultmind_role", result.role);
        localStorage.setItem("vaultmind_user", result.username);
        localStorage.setItem("vaultmind_display_name", result.display_name);
        localStorage.setItem("vaultmind_dept", result.dept);
    }

    async function handleSignIn(e: FormEvent) {
        e.preventDefault();
        if (!username.trim() || !password) return;
        setError("");
        setLoading(true);
        try {
            const result = await loginUser(username.trim(), password);
            storeSession(result);
            router.replace("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    async function handleSignUp(e: FormEvent) {
        e.preventDefault();
        if (!email.trim() || signupPassword.length < 8) return;
        setError("");
        setLoading(true);
        try {
            // Every self-service signup is a plain USER — admin accounts are
            // provisioned separately, never granted through this form.
            await registerEmployee({
                email: email.trim(),
                password: signupPassword,
                role: "USER",
                dept: dept.trim() || "General",
            });
            // Registration doesn't return a token — sign the new account in
            // immediately so "create account" feels like one real step.
            const result = await loginUser(email.trim(), signupPassword);
            storeSession(result);
            router.replace("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Account creation failed");
        } finally {
            setLoading(false);
        }
    }

    function switchMode(next: Mode) {
        setMode(next);
        setError("");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-12">
            <div className="relative w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="mb-8 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Private knowledge AI
                    </span>
                    <h1 className="text-4xl font-semibold tracking-tight">VaultMind</h1>
                    <p className="text-sm text-muted mt-2">
                        {mode === "signin" ? "Sign in to your workspace" : "Create your workspace account"}
                    </p>
                </div>

                {/* Mode switcher */}
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface border border-border mb-5">
                    <button
                        type="button"
                        onClick={() => switchMode("signin")}
                        className={`py-2 text-sm font-semibold rounded-lg transition-colors ${mode === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
                            }`}
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className={`py-2 text-sm font-semibold rounded-lg transition-colors ${mode === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted hover:text-foreground"
                            }`}
                    >
                        Create account
                    </button>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border bg-card shadow-sm px-8 py-9">
                    {mode === "signin" ? (
                        <form onSubmit={handleSignIn} noValidate className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="vm-username" className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    Username or email
                                </label>
                                <input
                                    id="vm-username"
                                    type="text"
                                    autoComplete="username"
                                    autoFocus
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="vm-password" className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="vm-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition text-xs font-medium select-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {error && <ErrorBanner message={error} />}

                            <button
                                type="submit"
                                disabled={loading || !username.trim() || !password}
                                className="mt-1 w-full rounded-full bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? <Spinner label="Signing in…" /> : "Sign In"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="vm-email" className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    Work email
                                </label>
                                <input
                                    id="vm-email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    required
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="vm-dept" className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    Department <span className="normal-case text-muted/70">(optional)</span>
                                </label>
                                <input
                                    id="vm-dept"
                                    type="text"
                                    value={dept}
                                    onChange={(e) => setDept(e.target.value)}
                                    placeholder="e.g. Finance"
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="vm-signup-password" className="text-xs font-semibold uppercase tracking-widest text-muted">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="vm-signup-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        placeholder="At least 8 characters"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder-muted/70 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition text-xs font-medium select-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {error && <ErrorBanner message={error} />}

                            <button
                                type="submit"
                                disabled={loading || !email.trim() || signupPassword.length < 8}
                                className="mt-1 w-full rounded-full bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? <Spinner label="Creating account…" /> : "Create account"}
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-5 text-center text-xs text-muted/80">
                    {mode === "signin" ? (
                        <>New here? <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-accent hover:underline">Create an account</button></>
                    ) : (
                        <>Already have an account? <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-accent hover:underline">Sign in</button></>
                    )}
                </p>
            </div>
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-500">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {message}
        </div>
    );
}

function Spinner({ label }: { label: string }) {
    return (
        <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {label}
        </span>
    );
}
