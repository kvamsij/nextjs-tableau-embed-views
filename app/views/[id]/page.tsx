import { Suspense } from 'react';
import EmbedView from '@/components/EmbedView';
import getSession from '@/actions/utils/session';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ViewDetailOrchestrator } from '@/lib/orchestrators/view-detail-orchestrator';
import { ViewDetailDataService } from '@/lib/services/view-detail-data-service';
import { TableauDataRepository } from '@/lib/repositories/tableau-data-repository';
import { TableauService } from '@/lib/services/tableau-service';
import { TableauConfigFactory } from '@/lib/config/tableau-config';

interface PageProps {
    params: {
        id: string;
    };
    searchParams: {
        contentUrl?: string;
    };
}

// Dependency injection container - Single Responsibility for service creation
class ViewDetailContainer {
    private static instance: ViewDetailContainer;
    private orchestrator: ViewDetailOrchestrator;

    private constructor() {
        const config = TableauConfigFactory.createDefaultConfig();
        const tableauService = new TableauService(config);
        const dataRepository = new TableauDataRepository(tableauService);
        const dataService = new ViewDetailDataService(dataRepository);
        this.orchestrator = new ViewDetailOrchestrator(dataService);
    }

    static getInstance(): ViewDetailContainer {
        if (!ViewDetailContainer.instance) {
            ViewDetailContainer.instance = new ViewDetailContainer();
        }
        return ViewDetailContainer.instance;
    }

    getOrchestrator(): ViewDetailOrchestrator {
        return this.orchestrator;
    }
}

// Main component - Single Responsibility: UI orchestration only
export default async function ViewDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { contentUrl } = await searchParams;

    try {
        const session = await getSession();
        const orchestrator = ViewDetailContainer.getInstance().getOrchestrator();

        // Use orchestrator for business logic - Dependency Inversion
        const result = await orchestrator.executeViewDetailFlow(id, contentUrl, session);

        if (!result.success) {
            throw new Error(result.error);
        }

        return (
            <div className="container mx-auto p-6">
                <ViewDetailHeader />
                <ViewDetailContent
                    url={result.data!.embeddingUrl}
                    token={result.data!.token}
                    params={result.data!.params}
                />
            </div>
        );
    } catch (error) {
        return <ViewDetailError error={error} />;
    }
}

// Separated UI components for better maintainability (Single Responsibility)
function ViewDetailHeader() {
    return (
        <div className="mb-6 flex items-center gap-4">
            <Link href="/views">
                <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Views
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold">Tableau View</h1>
                <p className="text-muted-foreground">Interactive Tableau visualization</p>
            </div>
        </div>
    );
}

interface ViewDetailContentProps {
    url: string;
    token: string;
    params: {[key:string]: string};
}

function ViewDetailContent({ url, token, params }: ViewDetailContentProps) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <EmbedView 
                url={url}
                token={token}
                params={params}
            />
        </Suspense>
    );
}

function LoadingFallback() {
    return (
        <Card className="w-full h-[600px] flex items-center justify-center">
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading Tableau view...</p>
                </div>
            </CardContent>
        </Card>
    );
}

interface ViewDetailErrorProps {
    error: unknown;
}

function ViewDetailError({ error }: ViewDetailErrorProps) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Link href="/views">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Views
                    </Button>
                </Link>
            </div>
            
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-semibold text-destructive">
                            Error Loading View
                        </h2>
                        <p className="text-muted-foreground">
                            {errorMessage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Please check your authentication and try again.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}