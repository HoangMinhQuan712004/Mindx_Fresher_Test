import ReactGA from 'react-ga4';

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || '';

export const initGA = () => {
    if (TRACKING_ID) {
        ReactGA.initialize(TRACKING_ID);
        console.log("✅ Google Analytics 4 initialized with ID:", TRACKING_ID);
    } else {
        console.warn("⚠️ Google Analytics ID (VITE_GA_TRACKING_ID) is missing.");
    }
};

export const logPageView = () => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label?: string) => {
    ReactGA.event({ category, action, label });
};
