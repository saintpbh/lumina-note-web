'use client';

import { useEffect } from 'react';

export default function OAuthCallback() {
    useEffect(() => {
        // Google returns the access token in the URL hash for response_type=token
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');

            if (accessToken) {
                if (window.opener) {
                    window.opener.postMessage(
                        { type: 'google-token', token: accessToken },
                        window.location.origin
                    );
                    window.close();
                }
            }
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-white font-sans">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Authenticating...</h1>
                <p className="opacity-70">Please wait while we connect to Google Drive.</p>
            </div>
        </div>
    );
}
