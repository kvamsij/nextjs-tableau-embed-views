"use client";

import { useEffect, useRef } from 'react';

export default function TableauEmbedClient({ url, token }: { url: string;  token: string}) {
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;
        
        console.log('Tableau Embed Debug:', { url, token: token.substring(0, 20) + '...' });
        
        const initializeTableau = async () => {
            try {
                // Use dynamic import to ensure proper loading
                const { TableauViz } = await import('@tableau/embedding-api');
                
                const viz = new TableauViz();
                viz.src = url;
                viz.token = token;
                viz.width = '100%';
                viz.height = '600px';

                // Add error handling with more specific error types
                viz.addEventListener('firstinteractive', () => {
                    console.log('Tableau viz loaded successfully');
                    isInitialized.current = true;
                });

                viz.addEventListener('error', (error) => {
                    console.error('Tableau viz error:', error);
                    // Handle version incompatibility specifically
                    if (error.toString().includes('incompatible-version')) {
                        console.warn('Version incompatibility detected, trying fallback...');
                        // Could implement fallback here
                    }
                });

                // Add custom error handling for version issues
                viz.addEventListener('customviewslistloaded', () => {
                    console.log('Custom views loaded successfully');
                });

                // Try to find the element with retries
                const findElement = () => {
                    const element = document.getElementById('tableauViz');
                    console.log('Looking for tableauViz element:', element);
                    console.log('Element children count:', element?.children.length);
                    return element;
                };

                // Wait a bit for the DOM to be ready, then try to append
                const element = findElement();
                if (element) {
                    // Clear any existing children first
                    element.innerHTML = '';
                    element.appendChild(viz);
                    console.log('Successfully appended Tableau viz to element');
                } else {
                    console.error('tableauViz element not found in DOM');
                    // Try again after a small delay
                    setTimeout(() => {
                        const retryElement = findElement();
                        if (retryElement) {
                            retryElement.innerHTML = '';
                            retryElement.appendChild(viz);
                            console.log('Successfully appended Tableau viz on retry');
                        } else {
                            console.error('tableauViz element still not found after retry');
                        }
                    }, 100);
                }
                
            } catch (error) {
                console.error('Failed to initialize Tableau viz:', error);
                
                // Fallback: Show error message in the container
                const element = document.getElementById('tableauViz');
                if (element) {
                    element.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border: 1px dashed #dee2e6; border-radius: 8px;">
                            <div style="color: #6c757d; font-size: 14px; text-align: center; padding: 20px;">
                                <div style="margin-bottom: 10px;">⚠️</div>
                                <div><strong>Embedding API Error</strong></div>
                                <div style="margin-top: 5px; font-size: 12px;">Version compatibility issue detected</div>
                            </div>
                        </div>
                    `;
                }
            }
        };

        initializeTableau();
        
        // Cleanup function
        return () => {
            isInitialized.current = false;
        };
    }, [url, token]);

    return null;
}