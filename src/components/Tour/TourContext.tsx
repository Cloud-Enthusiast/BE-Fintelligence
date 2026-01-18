
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TourStep = {
    target: string; // CSS selector
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

export type Tour = {
    id: string;
    steps: TourStep[];
    onComplete?: () => void;
};

interface TourContextType {
    activeTour: Tour | null;
    currentStepIndex: number;
    isVisible: boolean;
    startTour: (tour: Tour) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    completeTour: () => void;
    isTourSeen: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTour, setActiveTour] = useState<Tour | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [seenTours, setSeenTours] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('msme_tours_seen');
        if (stored) {
            try {
                setSeenTours(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse seen tours', e);
            }
        }
    }, []);

    const saveSeenTour = (tourId: string) => {
        const updated = [...seenTours, tourId];
        setSeenTours(updated);
        localStorage.setItem('msme_tours_seen', JSON.stringify(updated));
    };

    const isTourSeen = useCallback((tourId: string) => seenTours.includes(tourId), [seenTours]);

    const startTour = useCallback((tour: Tour) => {
        setActiveTour(tour);
        setCurrentStepIndex(0);
        setIsVisible(true);
    }, []);

    const nextStep = useCallback(() => {
        if (!activeTour) return;
        if (currentStepIndex < activeTour.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            completeTour();
        }
    }, [activeTour, currentStepIndex]);

    const prevStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const skipTour = useCallback(() => {
        setIsVisible(false);
        setActiveTour(null);
    }, []);

    const completeTour = useCallback(() => {
        if (activeTour) {
            saveSeenTour(activeTour.id);
            activeTour.onComplete?.();
        }
        setIsVisible(false);
        setActiveTour(null);
    }, [activeTour]);

    return (
        <TourContext.Provider
            value={{
                activeTour,
                currentStepIndex,
                isVisible,
                startTour,
                nextStep,
                prevStep,
                skipTour,
                completeTour,
                isTourSeen,
            }}
        >
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
