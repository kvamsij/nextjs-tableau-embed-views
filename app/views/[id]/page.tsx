import { Suspense } from 'react';
import EmbedView from '@/components/EmbedView';
import getSession from '@/actions/utils/session';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { JWTAuthenticationService } from '@/lib/services/authentication-service';
import { TableauUrlService } from '@/lib/services/tableau-url-service';
import { ViewDetailService } from '@/lib/services/view-detail-service';
import { TableauConfigFactory } from '@/lib/config/tableau-config';
import { TableauUserGroupService } from '@/lib/services/tableau-user-group-service';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface PageProps {
    params: { 
        id: string;
    };
    searchParams: {
        contentUrl?: string;
    };
}

// Factory function for dependency injection
function createViewDetailService() {
    const config = TableauConfigFactory.createDefaultConfig();
    const authService = new JWTAuthenticationService();
    const urlService = new TableauUrlService({
        baseUrl: config.baseUrl,
        siteId: process.env.SITE_ID || 'sandbox-nutritionintegrated' // This should come from config/env
    });
    
    return new ViewDetailService(authService, urlService);
}

// Main component with single responsibility - orchestrating the view detail page
export default async function ViewDetailPage({ params, searchParams }: PageProps) {
    
    const { id } = await params;
    const { contentUrl } = await searchParams;

    try {
        // Get session data
        const session = await getSession();
        
        // Create service using dependency injection
        const viewDetailService = createViewDetailService();
        
        // Prepare view details
        const result = viewDetailService.prepareViewDetail(id, session, contentUrl);
        if (!result.success) {
            throw new Error(result.error);
        }

        const email = jwtDecode<JwtPayload>(session.jwt).sub;
        
        if(!email){
            throw new Error('Invalid JWT token: email not found');
        }

        const domain = getRootDomainFromEmail(email);
         
        const customAttributes = await TableauUserGroupService.getDomainOverride(domain);
        console.log({customAttributes});


        return (
            <div className="container mx-auto p-6">
                <ViewDetailHeader />
                
                <ViewDetailContent 
                    url={result.data!.embeddingUrl}
                    token={result.data!.token}
                    customAttributes={isCustomAttributesEmpty(customAttributes) ? null : customAttributes}
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
    customAttributes: {
    filters: {
        price_group_name: string;
    };
    customParams: {
        price_group_ids: string;
        currency: string;
        tableau_user_group_name: string;
    };
    } | null
}

function ViewDetailContent({ url, token, customAttributes }: ViewDetailContentProps) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            {customAttributes ? <EmbedView 
                url={url}
                token={token}
                customAttributes={customAttributes}
            />: <div>No custom attributes found for this user.</div>}
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

function getRootDomainFromEmail(email: string): string {
  const domain = email.split('@')[1];
  
 if (!domain) {
    throw new Error('Invalid email format');
  }
  
  const parts = domain.split('.');
  
  // Remove TLD (last part) and any country code if present
  // For domain.com -> parts = ['domain', 'com'] -> return 'domain'
  // For domain.co.uk -> parts = ['domain', 'co', 'uk'] -> return 'domain'
  // For us.domain.com -> parts = ['us', 'domain', 'com'] -> return 'domain'
  // For us.domain.co.uk -> parts = ['us', 'domain', 'co', 'uk'] -> return 'domain'
  
  if (parts.length <= 2) {
    // Simple case: domain.com
    return parts[0];
  }
  
  // Check if it's a two-part TLD (co.uk, com.au, etc.)
//   const lastPart = parts[parts.length - 1];
  const secondLastPart = parts[parts.length - 2];
  
  // Two-part TLD pattern: second last part is typically 2-3 chars
  if (secondLastPart.length <= 3) {
    // It's likely domain.co.uk or subdomain.domain.co.uk
    return parts[parts.length - 3];
  }
  
  // Regular TLD: subdomain.domain.com
  return parts[parts.length - 2];
}

function isCustomAttributesEmpty(customAttributes: ViewDetailContentProps['customAttributes']): boolean {
    if (!customAttributes) return true;
    const { filters, customParams } = customAttributes;
    const filtersEmpty = !filters || Object.values(filters).every(v => !v);
    const customParamsEmpty = !customParams || Object.values(customParams).every(v => !v);
    return filtersEmpty && customParamsEmpty;
}