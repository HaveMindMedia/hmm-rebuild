/**
 * CIRCLE ENGINE - Core Mathematics Module
 * Geometry Math Education Platform
 * Have Mind Media | January 28, 2026 | [1 = -1]
 *
 * All mathematics emerges from rotation.
 * This module provides the fundamental operations.
 */

const CircleEngine = (function() {
    'use strict';

    // ==========================================================================
    // UNIVERSAL CONSTANTS
    // ==========================================================================

    const CONSTANTS = {
        // Epoch closure constant: κ = 2π/180
        KAPPA: 2 * Math.PI / 180,

        // Resonant frequency: κ-shadow = 1/κ = 28.6479 Hz
        KAPPA_SHADOW: 180 / (2 * Math.PI),

        // Golden ratio: φ = (1 + √5) / 2
        PHI: (1 + Math.sqrt(5)) / 2,

        // Boerdijk-Coxeter tetrahelix angle: cos⁻¹(2/3) = 48.19°
        BC_COS: 2 / 3,
        BC_ANGLE: Math.acos(2 / 3),

        // Full rotation
        TAU: 2 * Math.PI,

        // Quarter rotation (90°)
        QUARTER: Math.PI / 2,

        // Half rotation (180°) - this is where 1 becomes -1
        HALF: Math.PI
    };

    // ==========================================================================
    // CORE ROTATION FUNCTIONS
    // ==========================================================================

    /**
     * Rotate a point around the origin.
     * This is the fundamental operation from which all math emerges.
     *
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} angle - Rotation angle in radians
     * @returns {Object} New {x, y} coordinates
     */
    function rotatePoint(x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }

    /**
     * Get the position on a unit circle at a given angle.
     * sin and cos are simply the y and x coordinates.
     *
     * @param {number} angle - Angle in radians
     * @returns {Object} {x: cos(angle), y: sin(angle)}
     */
    function pointOnCircle(angle) {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    /**
     * Get angle from a point (inverse of pointOnCircle).
     *
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} Angle in radians
     */
    function angleFromPoint(x, y) {
        return Math.atan2(y, x);
    }

    /**
     * Convert degrees to radians.
     *
     * @param {number} degrees
     * @returns {number} Radians
     */
    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Convert radians to degrees.
     *
     * @param {number} radians
     * @returns {number} Degrees
     */
    function toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Normalize angle to [0, 2π) range.
     *
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    function normalizeAngle(angle) {
        angle = angle % CONSTANTS.TAU;
        return angle < 0 ? angle + CONSTANTS.TAU : angle;
    }

    // ==========================================================================
    // MULTIPLICATION AS ROTATION (Complex Numbers)
    // ==========================================================================

    /**
     * Multiply two complex numbers.
     * This IS rotation + scaling in the plane.
     *
     * @param {Object} a - {real, imag}
     * @param {Object} b - {real, imag}
     * @returns {Object} Product {real, imag}
     */
    function complexMultiply(a, b) {
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    }

    /**
     * Convert complex number to polar form.
     * Shows the rotation + scaling explicitly.
     *
     * @param {Object} z - {real, imag}
     * @returns {Object} {magnitude, angle}
     */
    function toPolar(z) {
        return {
            magnitude: Math.sqrt(z.real * z.real + z.imag * z.imag),
            angle: Math.atan2(z.imag, z.real)
        };
    }

    /**
     * Convert polar form to complex number.
     *
     * @param {number} magnitude
     * @param {number} angle
     * @returns {Object} {real, imag}
     */
    function fromPolar(magnitude, angle) {
        return {
            real: magnitude * Math.cos(angle),
            imag: magnitude * Math.sin(angle)
        };
    }

    /**
     * Euler's formula: e^(iθ) = cos(θ) + i·sin(θ)
     * Walking around the unit circle.
     *
     * @param {number} angle - Angle in radians
     * @returns {Object} {real, imag} point on unit circle
     */
    function euler(angle) {
        return {
            real: Math.cos(angle),
            imag: Math.sin(angle)
        };
    }

    // ==========================================================================
    // BALANCE AND SYMMETRY
    // ==========================================================================

    /**
     * Verify if a set of values sum to zero (balance).
     * Used in vessel geometry and harmonic balancers.
     *
     * @param {number[]} values - Array of values
     * @param {number} tolerance - Tolerance for floating point
     * @returns {boolean} True if balanced
     */
    function verifyBalance(values, tolerance = 1e-10) {
        const sum = values.reduce((a, b) => a + b, 0);
        return Math.abs(sum) < tolerance;
    }

    /**
     * Verify vector balance (2D or 3D).
     *
     * @param {Object[]} vectors - Array of {x, y} or {x, y, z}
     * @param {number} tolerance
     * @returns {boolean} True if vectors sum to zero
     */
    function verifyVectorBalance(vectors, tolerance = 1e-10) {
        const sum = vectors.reduce((acc, v) => ({
            x: acc.x + v.x,
            y: acc.y + v.y,
            z: (acc.z || 0) + (v.z || 0)
        }), {x: 0, y: 0, z: 0});

        const magnitude = Math.sqrt(sum.x * sum.x + sum.y * sum.y + sum.z * sum.z);
        return magnitude < tolerance;
    }

    /**
     * Generate n evenly-spaced phases around a circle.
     * These naturally balance to zero when summed as vectors.
     *
     * @param {number} n - Number of phases
     * @param {number} offset - Starting offset in radians
     * @returns {number[]} Array of angles in radians
     */
    function generatePhases(n, offset = 0) {
        const phases = [];
        const step = CONSTANTS.TAU / n;
        for (let i = 0; i < n; i++) {
            phases.push(normalizeAngle(offset + i * step));
        }
        return phases;
    }

    /**
     * Get the four quadrature phases (0°, 90°, 180°, 270°).
     * This is the vessel geometry phase arrangement.
     *
     * @returns {number[]} Four phases in radians
     */
    function quadraturePhases() {
        return generatePhases(4, 0);
    }

    // ==========================================================================
    // PROJECTIONS (How we see rotation as waves)
    // ==========================================================================

    /**
     * Project rotation onto the horizontal axis (cosine).
     *
     * @param {number} angle - Current angle
     * @param {number} amplitude - Radius/amplitude
     * @returns {number} X projection
     */
    function projectX(angle, amplitude = 1) {
        return amplitude * Math.cos(angle);
    }

    /**
     * Project rotation onto the vertical axis (sine).
     *
     * @param {number} angle - Current angle
     * @param {number} amplitude - Radius/amplitude
     * @returns {number} Y projection
     */
    function projectY(angle, amplitude = 1) {
        return amplitude * Math.sin(angle);
    }

    /**
     * Generate a wave from rotation (sin or cos over time).
     *
     * @param {number} frequency - Rotations per second
     * @param {number} time - Current time
     * @param {number} phase - Phase offset
     * @param {number} amplitude - Amplitude
     * @returns {number} Wave value at time
     */
    function wave(frequency, time, phase = 0, amplitude = 1) {
        const angle = CONSTANTS.TAU * frequency * time + phase;
        return amplitude * Math.sin(angle);
    }

    /**
     * Sum multiple waves (superposition).
     * Shows how complex patterns emerge from simple rotation.
     *
     * @param {Object[]} waves - Array of {frequency, phase, amplitude}
     * @param {number} time - Current time
     * @returns {number} Combined wave value
     */
    function superposition(waves, time) {
        return waves.reduce((sum, w) =>
            sum + wave(w.frequency, time, w.phase || 0, w.amplitude || 1), 0);
    }

    // ==========================================================================
    // GEOMETRY HELPERS
    // ==========================================================================

    /**
     * Calculate distance between two points.
     *
     * @param {Object} p1 - {x, y}
     * @param {Object} p2 - {x, y}
     * @returns {number} Distance
     */
    function distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate the dot product of two vectors.
     * Measures alignment: 1 = same direction, 0 = perpendicular, -1 = opposite.
     *
     * @param {Object} v1 - {x, y}
     * @param {Object} v2 - {x, y}
     * @returns {number} Dot product
     */
    function dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * Calculate angle between two vectors.
     *
     * @param {Object} v1 - {x, y}
     * @param {Object} v2 - {x, y}
     * @returns {number} Angle in radians
     */
    function angleBetween(v1, v2) {
        const dot = dotProduct(v1, v2);
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        return Math.acos(dot / (mag1 * mag2));
    }

    /**
     * Check if two vectors are perpendicular (orthogonal).
     *
     * @param {Object} v1 - {x, y}
     * @param {Object} v2 - {x, y}
     * @param {number} tolerance
     * @returns {boolean}
     */
    function isOrthogonal(v1, v2, tolerance = 1e-10) {
        return Math.abs(dotProduct(v1, v2)) < tolerance;
    }

    /**
     * Calculate circumference of a circle.
     * C = 2πr = τr
     *
     * @param {number} radius
     * @returns {number} Circumference
     */
    function circumference(radius) {
        return CONSTANTS.TAU * radius;
    }

    /**
     * Calculate area of a circle.
     * A = πr²
     *
     * @param {number} radius
     * @returns {number} Area
     */
    function circleArea(radius) {
        return Math.PI * radius * radius;
    }

    // ==========================================================================
    // ANIMATION HELPERS
    // ==========================================================================

    /**
     * Interpolate between two values.
     *
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Progress (0 to 1)
     * @returns {number} Interpolated value
     */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Smooth step interpolation (ease in-out).
     *
     * @param {number} t - Progress (0 to 1)
     * @returns {number} Smoothed progress
     */
    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    /**
     * Sinusoidal easing (natural motion).
     *
     * @param {number} t - Progress (0 to 1)
     * @returns {number} Eased progress
     */
    function easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    // ==========================================================================
    // EDUCATIONAL HELPERS
    // ==========================================================================

    /**
     * Format an angle for display.
     *
     * @param {number} radians - Angle in radians
     * @param {boolean} showRadians - Also show radian value
     * @returns {string} Formatted string
     */
    function formatAngle(radians, showRadians = false) {
        const degrees = toDegrees(radians).toFixed(1);
        if (showRadians) {
            const rads = radians.toFixed(3);
            return `${degrees}° (${rads} rad)`;
        }
        return `${degrees}°`;
    }

    /**
     * Describe an angle in terms of rotation.
     *
     * @param {number} radians
     * @returns {string} Description
     */
    function describeAngle(radians) {
        const normalized = normalizeAngle(radians);
        const degrees = toDegrees(normalized);

        if (degrees < 1) return "Starting position";
        if (Math.abs(degrees - 90) < 1) return "Quarter turn (90°)";
        if (Math.abs(degrees - 180) < 1) return "Half turn (180°) - opposite side";
        if (Math.abs(degrees - 270) < 1) return "Three-quarter turn (270°)";
        if (degrees > 359) return "Full rotation (360°) - back to start";

        if (degrees < 90) return `${degrees.toFixed(0)}° - first quarter`;
        if (degrees < 180) return `${degrees.toFixed(0)}° - second quarter`;
        if (degrees < 270) return `${degrees.toFixed(0)}° - third quarter`;
        return `${degrees.toFixed(0)}° - fourth quarter`;
    }

    // ==========================================================================
    // PUBLIC API
    // ==========================================================================

    return {
        // Constants
        CONSTANTS,

        // Core rotation
        rotatePoint,
        pointOnCircle,
        angleFromPoint,
        toRadians,
        toDegrees,
        normalizeAngle,

        // Complex numbers (multiplication as rotation)
        complexMultiply,
        toPolar,
        fromPolar,
        euler,

        // Balance and symmetry
        verifyBalance,
        verifyVectorBalance,
        generatePhases,
        quadraturePhases,

        // Projections (waves)
        projectX,
        projectY,
        wave,
        superposition,

        // Geometry
        distance,
        dotProduct,
        angleBetween,
        isOrthogonal,
        circumference,
        circleArea,

        // Animation
        lerp,
        smoothstep,
        easeInOutSine,

        // Educational
        formatAngle,
        describeAngle,

        // ========================================
        // CALCULUS FUNCTIONS
        // ========================================

        /**
         * Get velocity vector on unit circle (derivative of position).
         * Velocity is always perpendicular to position (rotated 90°).
         * @param {number} angle - Angle in radians
         * @returns {Object} {x, y} velocity components
         */
        velocityOnCircle: function(angle) {
            return {
                x: -Math.sin(angle),
                y: Math.cos(angle)
            };
        },

        /**
         * Get acceleration vector on unit circle (second derivative).
         * Acceleration points toward center (rotated 180° from position).
         * @param {number} angle - Angle in radians
         * @returns {Object} {x, y} acceleration components
         */
        accelerationOnCircle: function(angle) {
            return {
                x: -Math.cos(angle),
                y: -Math.sin(angle)
            };
        },

        /**
         * Get the nth derivative of e^(it) at given angle.
         * Each derivative multiplies by i (rotates 90°).
         * @param {number} angle - Base angle in radians
         * @param {number} n - Number of derivatives (default 1)
         * @returns {Object} {real, imag} complex result
         */
        eulerDerivative: function(angle, n) {
            n = n || 1;
            const derivAngle = angle + n * CONSTANTS.QUARTER;
            return euler(derivAngle);
        },

        /**
         * Get position in the Q-cycle (sin derivatives cycle).
         * Q-cycle: sin → cos → -sin → -cos → sin (every 90°)
         * @param {number} angle - Current angle
         * @param {number} derivative - Which derivative (0=sin, 1=cos, 2=-sin, 3=-cos)
         * @returns {number} Value at that derivative
         */
        qCycleValue: function(angle, derivative) {
            derivative = (derivative % 4 + 4) % 4; // Normalize to 0-3
            switch(derivative) {
                case 0: return Math.sin(angle);
                case 1: return Math.cos(angle);
                case 2: return -Math.sin(angle);
                case 3: return -Math.cos(angle);
            }
        },

        /**
         * Get the phase shift (in radians) for nth derivative.
         * Each derivative shifts phase by +90° (π/2).
         * @param {number} n - Number of derivatives
         * @returns {number} Phase shift in radians
         */
        derivativePhaseShift: function(n) {
            return n * CONSTANTS.QUARTER;
        },

        /**
         * Compute definite integral of sin from 0 to t.
         * ∫₀ᵗ sin(x) dx = 1 - cos(t) = -cos(t) + cos(0)
         * @param {number} t - Upper bound
         * @returns {number} Accumulated area
         */
        integrateSin: function(t) {
            return 1 - Math.cos(t);
        },

        /**
         * Compute definite integral of cos from 0 to t.
         * ∫₀ᵗ cos(x) dx = sin(t) - sin(0) = sin(t)
         * @param {number} t - Upper bound
         * @returns {number} Accumulated area
         */
        integrateCos: function(t) {
            return Math.sin(t);
        },

        /**
         * Verify that sin and cos are 90° out of phase.
         * At any angle, sin²(θ) + cos²(θ) = 1 and they're perpendicular.
         * @param {number} angle - Angle to verify
         * @returns {Object} {dotProduct, sumOfSquares, perpendicular}
         */
        verifyPerpendicularity: function(angle) {
            const pos = pointOnCircle(angle, 1);
            const vel = this.velocityOnCircle(angle);
            const dot = pos.x * vel.x + pos.y * vel.y;
            const sumSq = pos.x * pos.x + pos.y * pos.y;
            return {
                dotProduct: dot,
                sumOfSquares: sumSq,
                perpendicular: Math.abs(dot) < 1e-10
            };
        },

        /**
         * Generate Taylor series approximation of e^(it).
         * e^(it) ≈ 1 + it + (it)²/2! + (it)³/3! + ...
         * @param {number} t - Angle in radians
         * @param {number} terms - Number of terms (default 10)
         * @returns {Object} {real, imag, terms: [{real, imag}...]}
         */
        taylorEuler: function(t, terms) {
            terms = terms || 10;
            let real = 0, imag = 0;
            const partials = [];

            for (let n = 0; n < terms; n++) {
                // (it)^n / n! = i^n * t^n / n!
                const tPower = Math.pow(t, n);
                const factorial = this.factorial(n);
                const coeff = tPower / factorial;

                // i^n cycles: 1, i, -1, -i, 1, ...
                const iPhase = n % 4;
                let termReal = 0, termImag = 0;

                switch(iPhase) {
                    case 0: termReal = coeff; break;    // i^0 = 1
                    case 1: termImag = coeff; break;    // i^1 = i
                    case 2: termReal = -coeff; break;   // i^2 = -1
                    case 3: termImag = -coeff; break;   // i^3 = -i
                }

                real += termReal;
                imag += termImag;
                partials.push({ real: real, imag: imag, n: n });
            }

            return { real: real, imag: imag, terms: partials };
        },

        /**
         * Compute factorial.
         * @param {number} n
         * @returns {number} n!
         */
        factorial: function(n) {
            if (n <= 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) result *= i;
            return result;
        },

        /**
         * Generate Fourier series coefficients for a square wave.
         * Square wave = (4/π) * [sin(t) + sin(3t)/3 + sin(5t)/5 + ...]
         * @param {number} harmonics - Number of odd harmonics
         * @returns {Array} Array of {n, coefficient} for each harmonic
         */
        squareWaveFourier: function(harmonics) {
            const coeffs = [];
            for (let k = 0; k < harmonics; k++) {
                const n = 2 * k + 1; // Odd harmonics: 1, 3, 5, 7...
                coeffs.push({
                    n: n,
                    coefficient: 4 / (Math.PI * n)
                });
            }
            return coeffs;
        },

        /**
         * Evaluate Fourier series at angle t.
         * @param {number} t - Angle in radians
         * @param {Array} coeffs - Array from squareWaveFourier
         * @returns {number} Sum of harmonics
         */
        evaluateFourier: function(t, coeffs) {
            let sum = 0;
            for (const c of coeffs) {
                sum += c.coefficient * Math.sin(c.n * t);
            }
            return sum;
        }
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CircleEngine;
}
