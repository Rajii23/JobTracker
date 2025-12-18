import { createRoot } from 'react-dom/client';
import React from 'react';
import Sidebar from './Sidebar';
import sidebarStyles from './Sidebar.css?inline';

console.log('----------------------------------------');
console.log('🚀 Job Tracker Extension Script Starting');
console.log('----------------------------------------');

try {
    // Check if we are already injected
    if (document.getElementById('job-tracker-extension-root')) {
        console.log('Extension already injected, skipping.');
    } else {
        // Create Host Element
        const host = document.createElement('div');
        host.id = 'job-tracker-extension-root';
        host.style.position = 'fixed';
        host.style.top = '0';
        host.style.right = '0';
        host.style.zIndex = '2147483647'; // Max integer
        host.style.pointerEvents = 'none'; // Passthrough

        // Debug: Visual indicator that script ran (Temporary)
        // host.style.border = '5px solid red'; 

        document.body.appendChild(host);
        console.log('✅ Host element appended to body');

        // Create Shadow Root
        const shadow = host.attachShadow({ mode: 'open' });
        console.log('✅ Shadow DOM attached');

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = sidebarStyles;
        shadow.appendChild(style);
        console.log('✅ Styles injected into shadow root');

        // Mount React App
        const mountPoint = document.createElement('div');
        mountPoint.id = 'root';
        shadow.appendChild(mountPoint);

        const root = createRoot(mountPoint);
        root.render(React.createElement(Sidebar));
        console.log('✅ React Root rendered');
    }
} catch (err) {
    console.error('❌ Job Tracker Injection Error:', err);
}
