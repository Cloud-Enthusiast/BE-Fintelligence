
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export const TourGuide: React.FC = () => {
    const { activeTour, currentStepIndex, isVisible, nextStep, prevStep, skipTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const activeStep = activeTour?.steps[currentStepIndex];

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isVisible && activeStep) {
            const updateTargetRect = () => {
                const element = document.querySelector(activeStep.target);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    setTargetRect(null);
                }
            };

            updateTargetRect();
            // Polling for layout changes
            const interval = setInterval(updateTargetRect, 500);
            return () => clearInterval(interval);
        } else {
            setTargetRect(null);
        }
    }, [isVisible, activeStep, windowSize]);

    if (!isVisible || !activeTour || !activeStep) return null;

    const spotlightPadding = 8;
    const isLastStep = currentStepIndex === activeTour.steps.length - 1;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Dimmed Overlay with Spotlight */}
            <AnimatePresence>
                {targetRect && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 pointer-events-auto"
                        style={{
                            clipPath: `polygon(
                0% 0%, 0% 100%, 100% 100%, 100% 0%, 
                ${targetRect.left - spotlightPadding}px 0%, 
                ${targetRect.left - spotlightPadding}px ${targetRect.top - spotlightPadding}px, 
                ${targetRect.right + spotlightPadding}px ${targetRect.top - spotlightPadding}px, 
                ${targetRect.right + spotlightPadding}px ${targetRect.bottom + spotlightPadding}px, 
                ${targetRect.left - spotlightPadding}px ${targetRect.bottom + spotlightPadding}px, 
                ${targetRect.left - spotlightPadding}px 0%
              )`
                        }}
                        onClick={skipTour}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${activeTour.id}-${currentStepIndex}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        left: targetRect ? calculateLeft(targetRect, activeStep.position) : '50%',
                        top: targetRect ? calculateTop(targetRect, activeStep.position) : '50%',
                        translateX: targetRect ? 0 : '-50%',
                        translateY: targetRect ? 0 : '-50%'
                    }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute z-[101] pointer-events-auto w-80 shadow-2xl"
                >
                    <Card className="border-none bg-white">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base font-bold text-finance-900">
                                {activeStep.title}
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={skipTour}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {activeStep.content}
                            </p>
                            <div className="mt-4 flex items-center gap-1">
                                {activeTour.steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all ${i === currentStepIndex ? 'w-4 bg-finance-600' : 'w-2 bg-gray-200'}`}
                                    />
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 flex justify-between bg-gray-50/50 rounded-b-lg border-t border-gray-100 italic text-xs text-gray-400">
                            <span>Step {currentStepIndex + 1} of {activeTour.steps.length}</span>
                            <div className="flex gap-2">
                                {currentStepIndex > 0 && (
                                    <Button variant="outline" size="sm" className="h-8" onClick={prevStep}>
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Back
                                    </Button>
                                )}
                                <Button variant="default" size="sm" className="h-8 bg-finance-600 hover:bg-finance-700" onClick={nextStep}>
                                    {isLastStep ? 'Finish' : 'Next'}
                                    {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Tooltip positioning helpers
function calculateTop(rect: DOMRect, position?: string): number {
    const gap = 12;
    const cardHeight = 200; // rough estimate
    if (position === 'top') return rect.top - cardHeight - gap;
    if (position === 'bottom') return rect.bottom + gap;
    if (position === 'left' || position === 'right') return rect.top + (rect.height / 2) - (cardHeight / 2);
    // Default to bottom if too close to top
    if (rect.top < cardHeight + gap) return rect.bottom + gap;
    return rect.top - cardHeight - gap;
}

function calculateLeft(rect: DOMRect, position?: string): number {
    const gap = 12;
    const cardWidth = 320;
    if (position === 'left') return rect.left - cardWidth - gap;
    if (position === 'right') return rect.right + gap;
    if (position === 'top' || position === 'bottom') return rect.left + (rect.width / 2) - (cardWidth / 2);

    // Adjust if out of bounds
    let left = rect.left + (rect.width / 2) - (cardWidth / 2);
    if (left < 10) left = 10;
    if (left + cardWidth > window.innerWidth - 10) left = window.innerWidth - cardWidth - 10;
    return left;
}
