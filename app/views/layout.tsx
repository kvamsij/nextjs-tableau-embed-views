import { ReactNode } from 'react';

interface ViewsLayoutProps {
    children: ReactNode;
}

export default function ViewsLayout({ children }: ViewsLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}