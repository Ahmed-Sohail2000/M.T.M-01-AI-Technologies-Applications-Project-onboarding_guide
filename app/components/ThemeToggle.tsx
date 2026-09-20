"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./icons";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem("vaultmind_theme", theme);
    } catch {
        // ignore — theme just won't persist across visits in this browser
    }
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        const current = document.documentElement.getAttribute("data-theme");
        setTheme(current === "dark" ? "dark" : "light");
    }, []);

    if (theme === null) {
        // Avoid a hydration mismatch: render a fixed-size placeholder until
        // we've read the theme the pre-paint script already applied.
        return <span className={`h-9 w-9 inline-block ${className}`} aria-hidden="true" />;
    }

    function toggle() {
        const next: Theme = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={`h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-accent/50 transition-colors ${className}`}
        >
            {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
        </button>
    );
}
