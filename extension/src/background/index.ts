/// <reference types="chrome" />

chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.type === 'SAVE_JOB') {
        chrome.identity.getAuthToken({ interactive: true }, async (token: any) => {
            const finalToken = token || 'dev-extension-token';
            if (chrome.runtime.lastError || !token) {
                console.warn('Google Identity failed, using dev bypass:', chrome.runtime.lastError);
            }

            try {
                // 1. Exchange Google Token for App JWT
                const authResponse = await fetch('http://localhost:5000/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: finalToken, isExtension: true })
                });

                if (!authResponse.ok) {
                    throw new Error('Backend authentication failed');
                }

                const { token: jwtToken } = await authResponse.json();

                // 2. Save Job using App JWT
                const response = await fetch('http://localhost:5000/api/jobs/extension/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`
                    },
                    body: JSON.stringify({ job: message.data })
                });

                if (response.ok) {
                    sendResponse({ success: true });
                } else {
                    const err = await response.json();
                    sendResponse({ success: false, error: err.message || 'API error' });
                }
            } catch (error) {
                console.error('Save error:', error);
                sendResponse({ success: false, error: 'Network or Auth error' });
            }
        });
        return true; // Keep channel open
    }

    if (message.type === 'OPEN_DASHBOARD') {
        chrome.tabs.create({ url: 'http://localhost:3000' });
        sendResponse({ success: true });
    }
});
