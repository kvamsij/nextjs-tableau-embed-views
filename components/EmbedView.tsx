
'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

interface EmbedViewProps {
    url: string;
    token: string;
    params: {[key:string]: string};
}

const TableauEmbedClientComponent = dynamic(() => import('@/components/TableauEmbedClient'), { ssr: true });

export default function EmbedView({ url, token, params }: EmbedViewProps) {
    useEffect(() => {
        // Verify the element exists when component mounts
        const element = document.getElementById('tableauViz');
        console.log('EmbedView mounted, tableauViz element:', element);
    }, []);

    return (
        <>
            <div 
                id="tableauViz" 
                className="w-full h-[600px] border border-gray-300 rounded-lg bg-white"
                style={{ minHeight: '600px' }}
            >
                {/* Placeholder content while loading */}
                <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                        <div className="animate-pulse mb-2">Loading Tableau View...</div>
                        <div className="text-sm">Initializing embedding API</div>
                    </div>
                </div>
            </div>
            <TableauEmbedClientComponent
                url={url}
                token={token}
                params={params}
            />
        </>
    );
}