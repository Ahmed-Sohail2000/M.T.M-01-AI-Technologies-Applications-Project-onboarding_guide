/**
 * Canned demo Q&A per department, used by DepartmentChatDemo instead of a
 * real backend call. This exists because department chat requires a live
 * NVIDIA NIM / LM Studio endpoint that isn't guaranteed to be configured —
 * rather than surface "LLM not connected" to every visitor, each workspace
 * shows a realistic, clearly-labeled preview of what the assistant would
 * say for a handful of common questions in that department.
 */

export interface DemoExchange {
    question: string;
    answer: string;
    source: string;
}

export interface DepartmentDemo {
    suggestions: DemoExchange[];
    fallback: DemoExchange;
}

export const DEPARTMENT_DEMO: Record<string, DepartmentDemo> = {
    hr: {
        suggestions: [
            {
                question: "How many vacation days carry over?",
                answer: "You can carry over up to 5 unused vacation days into the next calendar year. Anything beyond that is forfeited unless your manager approves an exception.",
                source: "Employee_Handbook.pdf, §4.2",
            },
            {
                question: "How do I enroll in health benefits?",
                answer: "Open enrollment runs each November via the HR portal. New hires can enroll within 30 days of their start date — after that you'll need a qualifying life event.",
                source: "Benefits_Guide.pdf, §2.1",
            },
            {
                question: "What's the parental leave policy?",
                answer: "Full-time employees get 12 weeks of paid parental leave, taken within 12 months of the birth or adoption date.",
                source: "Employee_Handbook.pdf, §5.4",
            },
        ],
        fallback: {
            question: "",
            answer: "I'd pull that from the employee handbook and benefits guide, with the exact policy and page cited. Try one of the example questions above to see a full response.",
            source: "Employee_Handbook.pdf",
        },
    },
    it: {
        suggestions: [
            {
                question: "How do I request VPN access?",
                answer: "Submit a request via the IT Service Desk portal under \"Network Access.\" Approval usually takes under 4 business hours during working days.",
                source: "IT_Access_Guide.pdf, p.2",
            },
            {
                question: "My laptop won't connect to Wi-Fi, what do I do?",
                answer: "Forget and rejoin the \"Corp-Secure\" network, then restart the machine. If that fails, file a ticket tagged \"Hardware — Network\" for same-day support.",
                source: "IT_Troubleshooting.pdf, §1.3",
            },
            {
                question: "How do I get access to GitHub or AWS?",
                answer: "Access to GitHub, AWS, and Salesforce all route through the IT Service Desk — select the specific system and your manager approves the request.",
                source: "IT_Access_Guide.pdf, p.2",
            },
        ],
        fallback: {
            question: "",
            answer: "I'd check the access and troubleshooting guides for the exact steps and any approval chain. Try one of the example questions above to see a full response.",
            source: "IT_Access_Guide.pdf",
        },
    },
    finance: {
        suggestions: [
            {
                question: "Who approves a new vendor contract?",
                answer: "Your department lead approves contracts under $5,000. Anything above that also needs Finance sign-off before it's countersigned.",
                source: "Finance_Policy.pdf, §7",
            },
            {
                question: "How do I submit an expense report?",
                answer: "Submit within 30 days of the expense using Form FR-12, with a PDF receipt attached for anything over £50.",
                source: "Finance_Policy.pdf, p.7-8",
            },
            {
                question: "What's the process for a budget increase request?",
                answer: "Budget increase requests go through your department lead, then Finance review during the monthly planning cycle — submit at least 2 weeks before quarter close.",
                source: "Finance_Policy.pdf, §9",
            },
        ],
        fallback: {
            question: "",
            answer: "I'd ground that in the finance policy doc, with the specific approval threshold and form cited. Try one of the example questions above to see a full response.",
            source: "Finance_Policy.pdf",
        },
    },
    marketing: {
        suggestions: [
            {
                question: "What's the brand approval process for new assets?",
                answer: "New creative goes through the brand team for a style-guide check before it's approved for external use — typically a 2 business day turnaround.",
                source: "Brand_Guidelines.pdf, §3",
            },
            {
                question: "How do I request a campaign budget?",
                answer: "Campaign budgets are requested via the marketing ops tracker and approved by the marketing lead during the quarterly planning review.",
                source: "Marketing_Ops.pdf, §2",
            },
            {
                question: "Where do I find the latest logo and brand assets?",
                answer: "All current logos, colors, and templates live in the shared brand asset library — always pull from there rather than an old local copy.",
                source: "Brand_Guidelines.pdf, §1",
            },
        ],
        fallback: {
            question: "",
            answer: "I'd point you to the brand guidelines or marketing ops docs with the exact process cited. Try one of the example questions above to see a full response.",
            source: "Brand_Guidelines.pdf",
        },
    },
    sales: {
        suggestions: [
            {
                question: "What's the discount approval threshold?",
                answer: "Reps can approve discounts up to 10% directly. Anything higher needs sales lead sign-off, and above 25% needs Finance too.",
                source: "Sales_Playbook.pdf, §4",
            },
            {
                question: "How do I log a new opportunity?",
                answer: "New opportunities go into the CRM under the account record, with stage and expected close date set within 24 hours of the first qualified call.",
                source: "Sales_Playbook.pdf, §2",
            },
            {
                question: "What's our standard contract length?",
                answer: "Standard contracts are 12 months. Multi-year terms are available but need sales lead approval before they go to the customer.",
                source: "Sales_Playbook.pdf, §6",
            },
        ],
        fallback: {
            question: "",
            answer: "I'd ground that in the sales playbook, with the specific threshold or step cited. Try one of the example questions above to see a full response.",
            source: "Sales_Playbook.pdf",
        },
    },
};

export const DEFAULT_DEMO: DepartmentDemo = DEPARTMENT_DEMO.hr;
