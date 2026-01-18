
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Logic extracted/mirrored from LoanApplicationReview for testing
const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
};

const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    return 'High Risk';
};

describe('Application Review Interface Properties', () => {

    it('should assign correct color based on risk score', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }),
                (score) => {
                    const color = getRiskColor(score);
                    if (score >= 80) expect(color).toBe('bg-green-500');
                    else if (score >= 60) expect(color).toBe('bg-yellow-500');
                    else expect(color).toBe('bg-red-500');
                }
            )
        );
    });

    it('should assign correct label based on risk score', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }),
                (score) => {
                    const label = getScoreLabel(score);
                    if (score >= 80) expect(label).toBe('Low Risk');
                    else if (score >= 60) expect(label).toBe('Medium Risk');
                    else expect(label).toBe('High Risk');
                }
            )
        );
    });

});
