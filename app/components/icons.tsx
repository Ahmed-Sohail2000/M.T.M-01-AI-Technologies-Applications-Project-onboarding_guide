import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export function IconShield(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M12 3l7 3v5c0 4.5-2.9 8.3-7 10-4.1-1.7-7-5.5-7-10V6l7-3z" />
            <path d="M9.5 12l1.8 1.8L14.8 10" />
        </svg>
    );
}

export function IconSearch(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
        </svg>
    );
}

export function IconChat(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 5h16v11H8l-4 4V5z" />
            <path d="M8 9h8M8 12.5h5" />
        </svg>
    );
}

export function IconCheck(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.2l2.4 2.4 4.6-5.2" />
        </svg>
    );
}

export function IconClock(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.2 2" />
        </svg>
    );
}

export function IconUsers(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <circle cx="9" cy="8" r="3.2" />
            <path d="M2.8 19c.6-3.2 3.1-5 6.2-5s5.6 1.8 6.2 5" />
            <circle cx="17" cy="8.5" r="2.4" />
            <path d="M15.6 14.2c2.3.3 4 1.9 4.5 4.8" />
        </svg>
    );
}

export function IconServer(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <rect x="4" y="4" width="16" height="6" rx="1.5" />
            <rect x="4" y="14" width="16" height="6" rx="1.5" />
            <path d="M7.5 7h.01M7.5 17h.01" />
        </svg>
    );
}

export function IconUpload(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M12 15V4M8 8l4-4 4 4" />
            <path d="M4 15v3.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V15" />
        </svg>
    );
}

export function IconPlug(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M9 3v5M15 3v5" />
            <path d="M6.5 8h11v3a5.5 5.5 0 01-11 0V8z" />
            <path d="M12 16.5V21" />
        </svg>
    );
}

export function IconBook(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 5.5A1.5 1.5 0 015.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" />
            <path d="M20 5.5A1.5 1.5 0 0018.5 4H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z" />
        </svg>
    );
}

export function IconArrowRight(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 12h16M13 5l7 7-7 7" />
        </svg>
    );
}

export function IconChevronDown(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

export function IconTrendingDown(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M3 6l7 7 4-4 7 7" />
            <path d="M21 10v6h-6" />
        </svg>
    );
}

export function IconTrendingUp(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M3 17l7-7 4 4 7-7" />
            <path d="M21 4v6h-6" />
        </svg>
    );
}

export function IconLock(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <rect x="5" y="10.5" width="14" height="9" rx="1.8" />
            <path d="M8 10.5V7.5a4 4 0 018 0v3" />
        </svg>
    );
}

export function IconBrain(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M9 4.5a2.5 2.5 0 00-2.5 2.5v.2A2.5 2.5 0 005 9.5v1A2.5 2.5 0 006.2 13a2.7 2.7 0 00-.2 1c0 1.66 1.34 3 3 3v1.5" />
            <path d="M15 4.5a2.5 2.5 0 012.5 2.5v.2A2.5 2.5 0 0119 9.5v1A2.5 2.5 0 0117.8 13c.13.31.2.65.2 1 0 1.66-1.34 3-3 3v1.5" />
            <path d="M9 4.5c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2M9 9h.01M15 9h.01M9.5 13.5h5" />
        </svg>
    );
}

export function IconZap(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M12.5 3L5 13.5h5.5L11 21l7.5-10.5H13L12.5 3z" />
        </svg>
    );
}

export function IconMenu(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

export function IconX(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

export function IconSun(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6L19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4L19 5" />
        </svg>
    );
}

export function IconMoon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z" />
        </svg>
    );
}

export function IconChevronLeft(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M15 6l-6 6 6 6" />
        </svg>
    );
}
