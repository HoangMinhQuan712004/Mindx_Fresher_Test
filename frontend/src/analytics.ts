// Google Analytics manual integration helpers
// Explicitly define gtag on window
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

export const initGA = () => {
    // Manual script in index.html handles initialization
    console.log("✅ Google Analytics 4 (Manual) active.");
};

export const logPageView = () => {
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: window.location.pathname,
        });
    }
};

export const logEvent = (category: string, action: string, label?: string) => {
    if (window.gtag) {
        window.gtag('event', action, {
            'event_category': category,
            'event_label': label,
        });
    }
};
