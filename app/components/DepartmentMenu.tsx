"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DepartmentInfo } from "../api/backend";
import { IconChevronLeft } from "./icons";

interface DepartmentMenuProps {
    departments: DepartmentInfo[];
}

export default function DepartmentMenu({ departments }: DepartmentMenuProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile: horizontal scrollable chip strip, no fixed-width sidebar to crush the content */}
            <nav className="md:hidden sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
                    <Link
                        href="/"
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap bg-primary text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <IconChevronLeft className="h-3.5 w-3.5" />
                        Overview
                    </Link>
                    <span className="w-px h-5 bg-border shrink-0" />
                    {departments.map((dept) => {
                        const href = `/departments/${dept.id}`;
                        const active = pathname === href;
                        return (
                            <Link
                                key={dept.id}
                                href={href}
                                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${active
                                    ? "bg-primary text-white"
                                    : "bg-surface text-foreground border border-border"
                                    }`}
                            >
                                {dept.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* md+: full vertical sidebar */}
            <aside className="hidden md:flex w-72 shrink-0 min-h-screen bg-card border-r border-border p-5 flex-col gap-3">
                <h2 className="text-base font-semibold tracking-tight">Departments</h2>
                <p className="text-xs text-muted leading-relaxed">
                    Open a department workspace to try the main chat agent for that team.
                </p>
                <ul className="flex-1 space-y-1.5">
                    {departments.map((dept) => {
                        const href = `/departments/${dept.id}`;
                        const active = pathname === href;
                        return (
                            <li key={dept.id}>
                                <Link
                                    className={`block w-full text-left px-3 py-2.5 rounded-xl transition-all ${active
                                        ? "bg-primary text-white"
                                        : "text-foreground hover:bg-background border border-transparent hover:border-border"
                                        }`}
                                    href={href}
                                >
                                    <div className="text-sm font-semibold">{dept.name}</div>
                                    <div className={`text-xs mt-0.5 ${active ? "text-white/75" : "text-muted"}`}>{dept.description}</div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <div className="pt-3 border-t border-border">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-3 text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <IconChevronLeft className="h-4 w-4" />
                        Back to overview
                    </Link>
                </div>
            </aside>
        </>
    );
}
