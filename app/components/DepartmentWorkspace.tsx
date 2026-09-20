"use client";

import DepartmentChatDemo from "./DepartmentChatDemo";

interface DepartmentWorkspaceProps {
    id: string;
    name: string;
    description: string;
    info: string;
}

export default function DepartmentWorkspace({ id, name, description, info }: DepartmentWorkspaceProps) {
    return (
        <div className="w-full max-w-4xl flex flex-col gap-6 mx-auto">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">{name} Workspace</h1>
                <p className="text-base leading-7 text-muted mt-2">{info}</p>
            </div>

            <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-base font-semibold mb-2">Department Overview</h2>
                <p className="text-sm text-muted leading-relaxed">{description}</p>
            </section>

            <DepartmentChatDemo departmentId={id} departmentName={name} />
        </div>
    );
}
