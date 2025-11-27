import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

interface TableauView {
    id: string;
    name: string;
    contentUrl: string;
    createdAt?: string;
    updatedAt?: string;
    project?: { name: string };
    workbook?: { name: string };
    owner?: { name: string };
    tags?: { tag: Array<{ label: string }> };
    previewImage?: string;
}

interface ViewCardProps {
    view: TableauView;
    baseUrl: string;
    siteId: string;
    onViewClick?: (view: TableauView) => void;
}

export default async function ViewCard({ view }: ViewCardProps) {
    // Use pre-fetched image from view object instead of making individual API calls
    const previewImageUrl = view.previewImage;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const viewPath = `/views/${view.id}?contentUrl=${encodeURIComponent(view.contentUrl.replace('/sheets/', '/'))}`;

    return (
        <Link href={viewPath}>
            <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-gray-100/50 dark:hover:shadow-gray-900/50">
                {/* Preview Image with Gradient Overlay */}
                <div className="relative h-48 w-full overflow-hidden">
                    {previewImageUrl ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewImageUrl}
                                alt={`Preview of ${view.name}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
                            <div className="text-center space-y-2">
                                <ImageIcon className="h-12 w-12 text-slate-400 mx-auto" />
                                <p className="text-sm text-slate-500">No Preview</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Corner Badge */}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg backdrop-blur-sm font-medium">
                            <FileText className="h-3 w-3 mr-1" />
                            View
                        </Badge>
                    </div>
                    
                    {/* Hover Action */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                            <ExternalLink className="h-4 w-4 text-gray-700" />
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-4">
                    {/* Title and Project */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {view.name}
                        </h3>
                        {/* {view.project?.name && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Folder className="h-4 w-4" />
                                <span className="font-medium">{view.project.name}</span>
                            </div>
                        )} */}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        {/* Workbook */}
                        {/* {view.workbook?.name && (
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Workbook</p>
                                    <p className="text-gray-600 dark:text-gray-400 truncate">{view.workbook.name}</p>
                                </div>
                            </div>
                        )} */}

                        {/* Owner */}
                        {/* {view.owner?.name && (
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                                    <span className="text-sm font-semibold text-white">
                                        {view.owner.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">Owner</p>
                                    <p className="text-gray-600 dark:text-gray-400 truncate">{view.owner.name}</p>
                                </div>
                            </div>
                        )} */}
                    </div>

                    {/* Footer with Date and Tags */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            {/* Last Updated */}
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar className="h-3 w-3" />
                                <span>{view.updatedAt ? formatDate(view.updatedAt) : formatDate(view.createdAt)}</span>
                            </div>
                            
                            {/* Tag Count */}
                            {view.tags?.tag && view.tags.tag.length > 0 && (
                                <Badge variant="outline" className="text-xs font-medium">
                                    {view.tags.tag.length} tag{view.tags.tag.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}