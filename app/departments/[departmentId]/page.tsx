import { getDepartment, getDepartments } from "../../api/backend";
import DepartmentMenu from "../../components/DepartmentMenu";
import DepartmentWorkspace from "../../components/DepartmentWorkspace";

interface DepartmentPageProps {
    params: Promise<{ departmentId: string }>;
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
    const { departmentId } = await params;
    const [department, allDepartments] = await Promise.all([
        getDepartment(departmentId).catch(() => null),
        getDepartments().catch(() => []),
    ]);

    if (!department) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-8">
                <div className="rounded-2xl border border-border bg-card shadow-sm p-8 max-w-md text-center">
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">Department Not Found</h1>
                    <p className="text-sm text-muted">
                        The requested department workspace does not exist.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground font-sans">
            <DepartmentMenu departments={allDepartments} />
            <main className="flex flex-1 flex-col py-8 px-4 sm:py-12 sm:px-8">
                <DepartmentWorkspace
                    id={department.id}
                    name={department.name}
                    description={department.description}
                    info={department.info}
                />
            </main>
        </div>
    );
}
