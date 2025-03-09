export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        
        // Serve static assets from the assets namespace
        if (url.pathname.startsWith('/static/')) {
            return env.ASSETS.fetch(request);
        }
        
        // Otherwise, serve the Next.js application
        return env.NEXT_APP.fetch(request);
    }
}; 