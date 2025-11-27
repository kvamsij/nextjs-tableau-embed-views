
'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

interface EmbedViewProps {
    url: string;
    token: string;
}

const TableauEmbedClientComponent = dynamic(() => import('@/components/TableauEmbedClient'), { ssr: false });

export default function EmbedView({ url, token }: EmbedViewProps) {
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
            />
        </>
    );
}