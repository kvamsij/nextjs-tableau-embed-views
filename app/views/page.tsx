import getSession from "@/actions/utils/session";
import { Card, CardContent } from "@/components/ui/card";
import ViewCard from "@/components/ViewCard";
import { TableauService, TableauView } from "@/lib/services/tableau-service";
import { ImageEnhancementService } from "@/lib/services/image-enhancement-service";
import { TableauViewsRepository } from "@/lib/repositories/views-repository";
import { TableauConfigFactory } from "@/lib/config/tableau-config";

// Factory function to create dependencies (Dependency Injection)
function createViewsRepository() {
    const config = TableauConfigFactory.createDefaultConfig();
    const imageOptions = TableauConfigFactory.createImageEnhancementOptions();
    
    const tableauService = new TableauService(config);
    const imageService = new ImageEnhancementService(imageOptions);
    
    return new TableauViewsRepository(tableauService, imageService);
}

// Main component with single responsibility
export default async function Views() {
    try {
        // Get user session
        const session = await getSession();
        
        if (!session.siteId || !session.token) {
            throw new Error('Authentication required');
        }

        // Create repository using dependency injection
        const viewsRepository = createViewsRepository();
        
        // Fetch views with images using the repository
        const processedViews = await viewsRepository.getAllViewsWithImages(session);
        const config = TableauConfigFactory.createDefaultConfig();

        return (
            <div className="container mx-auto p-6">
                <ViewsHeader />
                <ViewsGrid 
                    views={processedViews} 
                    baseUrl={config.baseUrl}
                    siteId={session.siteId}
                />
                <EmptyState views={processedViews} />
            </div>
        );
    } catch (error) {
        return <ErrorDisplay error={error} />;
    }
}

// Separate components for better maintainability (Single Responsibility)
function ViewsHeader() {
    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold">Tableau Views</h1>
            <p className="text-muted-foreground">Browse and access your Tableau views</p>
        </div>
    );
}

interface ViewsGridProps {
    views: TableauView[];
    baseUrl: string;
    siteId: string;
}

function ViewsGrid({ views, baseUrl, siteId }: ViewsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {views?.map((view) => (
                <ViewCard
                    key={view.id} 
                    view={view} 
                    baseUrl={baseUrl}
                    siteId={siteId}
                />
            ))}
        </div>
    );
}

interface EmptyStateProps {
    views: TableauView[];
}

function EmptyState({ views }: EmptyStateProps) {
    if (views && views.length > 0) {
        return null;
    }

    return (
        <Card className="text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">No views found.</p>
            </CardContent>
        </Card>
    );
}

interface ErrorDisplayProps {
    error: unknown;
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return (
        <div className="container mx-auto p-6">
            <Card className="text-center py-12 border-red-200">
                <CardContent>
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Views</h2>
                    <p className="text-muted-foreground">{errorMessage}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Please check your authentication and try again.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}