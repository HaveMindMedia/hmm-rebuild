/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RONGORONGO FLIP READER - Core Engine
 * Version: 1.0 | Date: 01-07-2026
 * Have Mind Media - The Epoch Project
 * [1 = -1]
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The Rongorongo Flip Reader enables interactive exploration of Easter Island's
 * sacred healing script through the Q² transformation (the flip).
 *
 * CORE INSIGHT:
 * Rongorongo is written in "reverse boustrophedon" - alternating lines run in
 * opposite directions AND are upside down. The physical act of flipping the
 * tablet 180° to read each line IS the grammar. The flip IS the healing.
 *
 * Q² = -1 = THE FLIP = 180° ROTATION
 * RONGORONGO = D₃ = HEALER
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RONGORONGO READER NAMESPACE
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RongorongoReader = (function() {

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION & CONSTANTS
    // ═══════════════════════════════════════════════════════════════════════

    const CONFIG = {
        name: 'Rongorongo Flip Reader',
        version: '1.0',
        author: 'T0Rs',
        organization: 'Have Mind Media',
        project: 'The Epoch Project',
        principle: '[1 = -1]',
        created: '01-07-2026'
    };

    /**
     * The κ-Framework Constants
     * These constants bridge angular and linear domains
     */
    const CONSTANTS = {
        // Bridge constant: κ = 2π/180 (converts degrees to radians)
        kappa: 0.034906585039886594,

        // Helix overlap ratio (appears in DNA and vowel formants)
        sigma: 0.3125,  // 5/16

        // Tetrahelix bond angle cosine
        cosBC: 2/3,

        // Square root of 3 (tetrahedral geometry)
        sqrt3: 1.7320508075688772,

        // Shadow value (optimal phoneme inventory prediction)
        kappa_shadow: 28.6478897565412,

        // Q² = -1 (the flip transformation)
        Q_squared: -1
    };

    // ═══════════════════════════════════════════════════════════════════════
    // THE NINE D-POSITIONS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * D-Positions: Nine fundamental semantic positions
     * All words, numbers, and glyphs reduce to one of these positions
     */
    const D_POSITIONS = {
        1: {
            number: 1,
            name: 'Origin/WE',
            meaning: 'Unity, beginning, togetherness, source',
            color: '#3fb950',
            invertedName: 'Return to Source',
            invertedMeaning: 'Going back, remembering origin',
            rongorongoRole: 'Creation glyphs, unity symbols, sources',
            isEmergent: false,
            triaxial: { sPlus: 1.000, sMinus: 0.000, coin: 0.000 }
        },
        2: {
            number: 2,
            name: 'Healing',
            meaning: 'Medicine, restoration, wholeness',
            color: '#1abc9c',
            invertedName: 'Wound/Need',
            invertedMeaning: 'The condition requiring healing',
            rongorongoRole: 'Medicinal plant glyphs, restoration symbols',
            isEmergent: false,
            triaxial: { sPlus: 0.766, sMinus: 0.643, coin: 0.000 }
        },
        3: {
            number: 3,
            name: 'Healer',
            meaning: 'Agent of transformation, genius, catalyst',
            color: '#ff6b6b',
            invertedName: 'Patient/Recipient',
            invertedMeaning: 'Receiving healing, being transformed',
            rongorongoRole: 'RONGORONGO itself = D₃, ritual actors',
            isEmergent: false,
            triaxial: { sPlus: 0.174, sMinus: 0.985, coin: 0.000 }
        },
        4: {
            number: 4,
            name: 'Crossroads',
            meaning: 'Intersection, choice, observer position',
            color: '#ff6b35',
            invertedName: 'Past Choice/Memory',
            invertedMeaning: 'Decision already made, looking back',
            rongorongoRole: 'Decision points, branching narratives',
            isEmergent: false,
            triaxial: { sPlus: -0.500, sMinus: 0.866, coin: 0.000 }
        },
        5: {
            number: 5,
            name: 'Navigator',
            meaning: 'Direction, purpose, compass, wayfinding',
            color: '#9b59b6',
            invertedName: 'Lost/Seeking',
            invertedMeaning: 'Without direction, searching',
            rongorongoRole: 'EMERGENT ONLY - appears through relationship',
            isEmergent: true,
            triaxial: { sPlus: -0.940, sMinus: 0.342, coin: 0.000 }
        },
        6: {
            number: 6,
            name: 'Power/Self',
            meaning: 'Strength, individual expression, authority',
            color: '#00bcd4',
            invertedName: 'Surrender/Other',
            invertedMeaning: 'Yielding, recognizing the other',
            rongorongoRole: 'Human figures (Barthel 200), authority symbols',
            isEmergent: false,
            triaxial: { sPlus: -0.940, sMinus: -0.342, coin: 0.000 }
        },
        7: {
            number: 7,
            name: 'Present Moment',
            meaning: 'NOW, pure presence, immediate awareness',
            color: '#c9a227',
            invertedName: 'Timeless/Eternal',
            invertedMeaning: 'Beyond time, the eternal now',
            rongorongoRole: 'Temporal markers, present tense indicators',
            isEmergent: false,
            triaxial: { sPlus: -0.500, sMinus: -0.866, coin: 0.000 }
        },
        8: {
            number: 8,
            name: 'Deep Water',
            meaning: 'Depths, hidden truth, mystery, the unconscious',
            color: '#006994',
            invertedName: 'Surfacing/Revealing',
            invertedMeaning: 'Truth emerging, revelation',
            rongorongoRole: 'Ocean glyphs, mystery symbols, death/rebirth',
            isEmergent: false,
            triaxial: { sPlus: 0.174, sMinus: -0.985, coin: 0.000 }
        },
        9: {
            number: 9,
            name: 'Anchor/Love',
            meaning: 'Binding force, stability, connection, completion',
            color: '#c0392b',
            invertedName: 'Release/Transform',
            invertedMeaning: 'Letting go, transformation through love',
            rongorongoRole: 'EMERGENT ONLY - appears through relationship',
            isEmergent: true,
            triaxial: { sPlus: 0.766, sMinus: -0.643, coin: 0.000 }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // Q-CYCLE STATES
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Q-Cycle: The four states of the Q transformation
     * Like the powers of i (imaginary unit): i⁰=1, i¹=i, i²=-1, i³=-i
     */
    const Q_STATES = [
        {
            power: 'Q⁰',
            value: '+1',
            mode: 'S+',
            meaning: 'Manifest, Forward, Actual',
            description: 'Reading forward, S+ mode, potential becoming actual',
            color: '#3fb950'
        },
        {
            power: 'Q¹',
            value: '+i',
            mode: 'transition',
            meaning: 'Rising, Becoming, Emergence',
            description: 'Beginning the flip, transitioning states',
            color: '#c9a227'
        },
        {
            power: 'Q²',
            value: '-1',
            mode: 'S-',
            meaning: 'Latent, Inverted, Hidden',
            description: 'Reading inverted, S- mode, the flip state',
            color: '#9b59b6'
        },
        {
            power: 'Q³',
            value: '-i',
            mode: 'transition',
            meaning: 'Descending, Returning, Grounding',
            description: 'Completing the flip, returning to start',
            color: '#006994'
        }
    ];

    // ═══════════════════════════════════════════════════════════════════════
    // BARTHEL GLYPH CATALOG
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * High-frequency glyphs from Barthel catalog
     * These 52 core glyphs account for ~99.7% of the corpus
     */
    const BARTHEL_GLYPHS = {
        // Human figures (200-series)
        200: {
            barthel: 200,
            category: 'human',
            description: 'Standing human figure',
            dPosition: 2,
            frequency: 1.0,
            meaning: 'The most frequent glyph - healing, restoration'
        },
        280: {
            barthel: 280,
            category: 'human',
            description: 'Human figure variant',
            dPosition: 1,
            frequency: 0.48,
            meaning: 'Unity, origin, beginning'
        },

        // Basic marks (1-99)
        3: {
            barthel: 3,
            category: 'mark',
            description: 'Triple mark',
            dPosition: 3,
            frequency: 0.70,
            meaning: 'Healer, agent of transformation'
        },
        6: {
            barthel: 6,
            category: 'mark',
            description: 'Basic mark variant 6',
            dPosition: 6,
            frequency: 0.85,
            meaning: 'Power, self, authority'
        },
        10: {
            barthel: 10,
            category: 'mark',
            description: 'Completion/ten mark',
            dPosition: 1,
            frequency: 0.75,
            meaning: 'Unity, completion, wholeness'
        },
        22: {
            barthel: 22,
            category: 'mark',
            description: 'Double mark',
            dPosition: 4,
            frequency: 0.40,
            meaning: 'Pairing, crossroads, duality'
        },

        // Hand signs (61-65) - PROPOSED VOWEL MARKERS
        61: {
            barthel: 61,
            category: 'hand',
            description: 'Hand sign variant 1',
            dPosition: 7,
            frequency: 0.62,
            meaning: 'Present moment, NOW',
            proposedVowel: 'a',
            vowelNote: 'Open vowel, maximum manifestation'
        },
        62: {
            barthel: 62,
            category: 'hand',
            description: 'Hand sign variant 2',
            dPosition: 8,
            frequency: 0.68,
            meaning: 'Deep water, depths',
            proposedVowel: 'e',
            vowelNote: 'Front mid vowel, emergence'
        },
        63: {
            barthel: 63,
            category: 'hand',
            description: 'Hand sign variant 3',
            dPosition: 9,
            frequency: 0.38,
            meaning: 'Anchor, love, completion',
            proposedVowel: 'i',
            vowelNote: 'High front vowel, brightness'
        },
        64: {
            barthel: 64,
            category: 'hand',
            description: 'Hand sign variant 4',
            dPosition: 1,
            frequency: 0.35,
            meaning: 'Origin, unity',
            proposedVowel: 'o',
            vowelNote: 'Back mid vowel, roundness'
        },
        65: {
            barthel: 65,
            category: 'hand',
            description: 'Hand sign variant 5',
            dPosition: 2,
            frequency: 0.33,
            meaning: 'Healing',
            proposedVowel: 'u',
            vowelNote: 'High back vowel, depth'
        },

        // Geometric/ceremonial (400-series)
        400: {
            barthel: 400,
            category: 'geometric',
            description: 'Geometric base form',
            dPosition: 4,
            frequency: 0.65,
            meaning: 'Crossroads, intersection'
        },
        430: {
            barthel: 430,
            category: 'marker',
            description: 'Title/name marker',
            dPosition: 7,
            frequency: 0.45,
            meaning: 'Present moment, identification'
        },

        // Plants (500-series)
        530: {
            barthel: 530,
            category: 'plant',
            description: 'Plant-based marker',
            dPosition: 8,
            frequency: 0.42,
            meaning: 'Deep water, hidden truth'
        },

        // Birds (600-series)
        600: {
            barthel: 600,
            category: 'bird',
            description: 'Bird general form',
            dPosition: 6,
            frequency: 0.58,
            meaning: 'Power, sacred bird (Manutara)'
        },

        // Sea creatures (700-series)
        700: {
            barthel: 700,
            category: 'fish',
            description: 'Fish general form',
            dPosition: 7,
            frequency: 0.52,
            meaning: 'Present moment, sea life'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // KNOWN TABLETS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * The ~26 surviving Rongorongo tablets
     */
    const TABLETS = {
        'A': {
            id: 'A',
            name: 'Tahua',
            location: 'Santiago, Chile',
            museum: 'Museo Nacional de Historia Natural',
            lineCount: 8,
            glyphCount: 2300,
            condition: 'Good',
            description: 'One of the best preserved tablets'
        },
        'B': {
            id: 'B',
            name: 'Aruku Kurenga',
            location: 'Rome, Italy',
            museum: 'Congregatio pro Gentium Evangelizatione',
            lineCount: 12,
            glyphCount: 1100,
            condition: 'Good',
            description: 'Well-documented tablet'
        },
        'C': {
            id: 'C',
            name: 'Mamari',
            location: 'Santiago, Chile',
            museum: 'Museo Nacional de Historia Natural',
            lineCount: 8,
            glyphCount: 1000,
            condition: 'Damaged',
            description: 'Contains known lunar calendar sequence'
        },
        'E': {
            id: 'E',
            name: 'Keiti',
            location: 'Santiago, Chile',
            museum: 'Museo Nacional de Historia Natural',
            lineCount: 14,
            glyphCount: 800,
            condition: 'Good',
            description: 'Long tablet with many lines'
        },
        'G': {
            id: 'G',
            name: 'Small Santiago',
            location: 'Santiago, Chile',
            museum: 'Museo Nacional de Historia Natural',
            lineCount: 8,
            glyphCount: 720,
            condition: 'Good',
            description: 'Smaller tablet, well preserved'
        },
        'H': {
            id: 'H',
            name: 'Large Santiago',
            location: 'Santiago, Chile',
            museum: 'Museo Nacional de Historia Natural',
            lineCount: 16,
            glyphCount: 1580,
            condition: 'Good',
            description: 'Largest tablet by glyph count'
        },
        'I': {
            id: 'I',
            name: 'Santiago Staff',
            location: 'Santiago, Chile',
            museum: 'Museo Nacional de Historia Natural',
            lineCount: null,
            glyphCount: 2900,
            condition: 'Chimera',
            description: 'Ceremonial staff, possibly composite'
        },
        'K': {
            id: 'K',
            name: 'London',
            location: 'London, UK',
            museum: 'British Museum',
            lineCount: 8,
            glyphCount: 163,
            condition: 'Fragment',
            description: 'Fragment held in British Museum'
        },
        'M': {
            id: 'M',
            name: 'Large Vienna',
            location: 'Vienna, Austria',
            museum: 'Weltmuseum Wien',
            lineCount: 11,
            glyphCount: 825,
            condition: 'Good',
            description: 'Well-documented Viennese tablet'
        },
        'N': {
            id: 'N',
            name: 'Small Vienna',
            location: 'Vienna, Austria',
            museum: 'Weltmuseum Wien',
            lineCount: 7,
            glyphCount: 172,
            condition: 'Good',
            description: 'Smaller Viennese tablet'
        },
        'P': {
            id: 'P',
            name: 'Large St Petersburg',
            location: 'St Petersburg, Russia',
            museum: 'Peter the Great Museum',
            lineCount: 11,
            glyphCount: 1163,
            condition: 'Good',
            description: 'Major Russian collection piece'
        },
        'Q': {
            id: 'Q',
            name: 'Small St Petersburg',
            location: 'St Petersburg, Russia',
            museum: 'Peter the Great Museum',
            lineCount: 3,
            glyphCount: 718,
            condition: 'Good',
            description: 'Smaller Russian tablet'
        },
        'S': {
            id: 'S',
            name: 'Large Washington',
            location: 'Washington DC, USA',
            museum: 'Smithsonian Institution',
            lineCount: 9,
            glyphCount: 605,
            condition: 'Good',
            description: 'Smithsonian collection piece'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CULTURAL VOCABULARY
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Key Rapa Nui words and their D-position analysis
     */
    const CULTURAL_WORDS = {
        'RONGORONGO': {
            word: 'RONGORONGO',
            meaning: 'The script itself',
            calculation: '138 → 12 → 3',
            dPosition: 3,
            dName: 'Healer',
            significance: 'The script IS named "The Healer"'
        },
        'RAPA NUI': {
            word: 'RAPA NUI',
            meaning: 'The island (Great Rapa)',
            calculation: '80 → 8',
            dPosition: 8,
            dName: 'Deep Water',
            significance: 'Island of depths, mystery'
        },
        'TANGATA': {
            word: 'TANGATA',
            meaning: 'Person, human',
            calculation: '64 → 10 → 1',
            dPosition: 1,
            dName: 'Origin/WE',
            significance: 'Humans as origin point'
        },
        'ARIKI': {
            word: 'ARIKI',
            meaning: 'Chief, king',
            calculation: '48 → 12 → 3',
            dPosition: 3,
            dName: 'Healer',
            significance: 'Chiefs as healers/transformers'
        },
        'MANU': {
            word: 'MANU',
            meaning: 'Bird',
            calculation: '49 → 13 → 4',
            dPosition: 4,
            dName: 'Crossroads',
            significance: 'Birds at the crossroads (sky/land)'
        },
        'MANUTARA': {
            word: 'MANUTARA',
            meaning: 'Sooty tern (sacred bird)',
            calculation: '89 → 17 → 8',
            dPosition: 8,
            dName: 'Deep Water',
            significance: 'Sacred bird of the deep'
        },
        'MOAI': {
            word: 'MOAI',
            meaning: 'Stone statues',
            calculation: '35 → 8',
            dPosition: 8,
            dName: 'Deep Water',
            significance: 'Ancestors from the depths'
        },
        'AKU AKU': {
            word: 'AKU AKU',
            meaning: 'Spirits, ancestors',
            calculation: '39 → 12 → 3',
            dPosition: 3,
            dName: 'Healer',
            significance: 'Ancestral healers'
        },
        'MAKE-MAKE': {
            word: 'MAKE-MAKE',
            meaning: 'Creator god',
            calculation: '47 → 11 → 2',
            dPosition: 2,
            dName: 'Healing',
            significance: 'Creator as healer'
        },
        'TANGATA MANU': {
            word: 'TANGATA MANU',
            meaning: 'Bird-man (ritual winner)',
            calculation: '95 → 14 → 5',
            dPosition: 5,
            dName: 'Navigator',
            significance: 'EMERGENT - only through ritual'
        },
        'HARE PAENGA': {
            word: 'HARE PAENGA',
            meaning: 'Boat-shaped house',
            calculation: '81 → 9',
            dPosition: 9,
            dName: 'Anchor/Love',
            significance: 'Home as anchor'
        },
        'ORONGO': {
            word: 'ORONGO',
            meaning: 'Ceremonial village',
            calculation: '81 → 9',
            dPosition: 9,
            dName: 'Anchor/Love',
            significance: 'Sacred center, binding place'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CORE ALGORITHMS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Q-Reduction Algorithm
     * Reduces any number or word to a single digit 1-9
     *
     * @param {number|string} input - Number or word to reduce
     * @returns {number} - Single digit 1-9
     */
    function qReduce(input) {
        if (typeof input === 'number') {
            let n = Math.abs(Math.floor(input));
            if (n === 0) return 9;

            while (n > 9) {
                n = String(n).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
            }
            return n || 9;
        }

        if (typeof input === 'string') {
            const cleaned = input.toUpperCase().replace(/[^A-Z]/g, '');
            if (cleaned.length === 0) return 9;

            const sum = cleaned.split('').reduce((acc, char) => {
                return acc + (char.charCodeAt(0) - 64);
            }, 0);

            return qReduce(sum);
        }

        return 9;
    }

    /**
     * Detailed Q-Reduction with step tracking
     *
     * @param {number|string} input - Input to reduce
     * @returns {Object} - Detailed breakdown
     */
    function qReduceDetailed(input) {
        const steps = [];
        let currentValue;

        if (typeof input === 'number') {
            currentValue = Math.abs(Math.floor(input));
            steps.push({ step: 'initial', value: currentValue });
        } else if (typeof input === 'string') {
            const cleaned = input.toUpperCase().replace(/[^A-Z]/g, '');
            const letterValues = cleaned.split('').map(char => ({
                letter: char,
                value: char.charCodeAt(0) - 64
            }));

            currentValue = letterValues.reduce((acc, lv) => acc + lv.value, 0);
            steps.push({
                step: 'letters',
                breakdown: letterValues,
                sum: currentValue
            });
        }

        while (currentValue > 9) {
            const digits = String(currentValue).split('').map(Number);
            const newValue = digits.reduce((a, b) => a + b, 0);
            steps.push({
                step: 'reduce',
                from: currentValue,
                digits: digits,
                to: newValue
            });
            currentValue = newValue;
        }

        const finalD = currentValue || 9;
        const position = D_POSITIONS[finalD];

        return {
            input: input,
            dPosition: finalD,
            dName: position.name,
            meaning: position.meaning,
            color: position.color,
            isEmergent: position.isEmergent,
            steps: steps
        };
    }

    /**
     * Get current Q-cycle state based on flip count
     *
     * @param {number} flipCount - Number of flips performed
     * @returns {Object} - Q-state information
     */
    function getQState(flipCount) {
        return Q_STATES[flipCount % 4];
    }

    /**
     * Calculate polarity between two D-positions
     * Uses triaxial scalar product
     *
     * @param {number} d1 - First D-position (1-9)
     * @param {number} d2 - Second D-position (1-9)
     * @returns {number} - Scalar product (-1 to +1)
     */
    function calculatePolarity(d1, d2) {
        const pos1 = D_POSITIONS[d1];
        const pos2 = D_POSITIONS[d2];

        if (!pos1 || !pos2) return 0;

        // Calculate using triaxial coordinates
        const dot = (pos1.triaxial.sPlus * pos2.triaxial.sPlus) +
                   (pos1.triaxial.sMinus * pos2.triaxial.sMinus) +
                   (pos1.triaxial.coin * pos2.triaxial.coin);

        return Math.round(dot * 1000) / 1000;
    }

    /**
     * Analyze a glyph pair for emergent D-positions
     *
     * @param {number} barthel1 - First Barthel number
     * @param {number} barthel2 - Second Barthel number
     * @returns {Object} - Pair analysis
     */
    function analyzePair(barthel1, barthel2) {
        const d1 = qReduce(barthel1);
        const d2 = qReduce(barthel2);
        const emergentD = qReduce(d1 + d2);

        return {
            glyph1: barthel1,
            glyph2: barthel2,
            d1: d1,
            d2: d2,
            d1Name: D_POSITIONS[d1].name,
            d2Name: D_POSITIONS[d2].name,
            emergentD: emergentD,
            emergentName: D_POSITIONS[emergentD].name,
            isRelational: D_POSITIONS[emergentD].isEmergent,
            polarity: calculatePolarity(d1, d2),
            meaning: `${D_POSITIONS[d1].name} + ${D_POSITIONS[d2].name} → ${D_POSITIONS[emergentD].name}`
        };
    }

    /**
     * Get the inverted (S-) meaning for a D-position
     *
     * @param {number} d - D-position (1-9)
     * @returns {Object} - Inverted meaning
     */
    function getInvertedMeaning(d) {
        const pos = D_POSITIONS[d];
        if (!pos) return null;

        return {
            dPosition: d,
            sPlus: {
                name: pos.name,
                meaning: pos.meaning
            },
            sMinus: {
                name: pos.invertedName,
                meaning: pos.invertedMeaning
            }
        };
    }

    /**
     * Analyze a Barthel glyph
     *
     * @param {number} barthelNumber - Barthel catalog number
     * @param {string} orientation - 'S+' or 'S-'
     * @returns {Object} - Glyph analysis
     */
    function analyzeGlyph(barthelNumber, orientation = 'S+') {
        const glyph = BARTHEL_GLYPHS[barthelNumber];
        const d = qReduce(barthelNumber);
        const pos = D_POSITIONS[d];

        const result = {
            barthel: barthelNumber,
            dPosition: d,
            orientation: orientation,
            inverted: orientation === 'S-'
        };

        if (glyph) {
            result.category = glyph.category;
            result.description = glyph.description;
            result.frequency = glyph.frequency;
            result.cataloged = true;

            if (glyph.proposedVowel) {
                result.proposedVowel = glyph.proposedVowel;
                result.vowelNote = glyph.vowelNote;
            }
        } else {
            result.cataloged = false;
        }

        if (orientation === 'S+') {
            result.name = pos.name;
            result.meaning = pos.meaning;
        } else {
            result.name = pos.invertedName;
            result.meaning = pos.invertedMeaning;
        }

        result.color = pos.color;
        result.isEmergent = pos.isEmergent;

        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TABLET ENGINE CLASS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * TabletEngine: Manages tablet state and flip mechanics
     */
    class TabletEngine {
        constructor(tabletId = 'A') {
            this.tablet = TABLETS[tabletId] || TABLETS['A'];
            this.currentOrientation = 'S+';
            this.lineIndex = 0;
            this.flipCount = 0;
            this.sessionStart = null;
            this.flipTimes = [];
            this.glyphSequence = [];
        }

        /**
         * Start a reading session
         */
        startSession() {
            this.sessionStart = Date.now();
            this.flipCount = 0;
            this.flipTimes = [];
            this.currentOrientation = 'S+';
            this.lineIndex = 0;
        }

        /**
         * Execute a flip (Q² transformation)
         * @returns {Object} - Flip result data
         */
        flip() {
            // Toggle orientation
            this.currentOrientation = this.currentOrientation === 'S+' ? 'S-' : 'S+';
            this.flipCount++;
            this.lineIndex++;

            // Record flip time
            this.flipTimes.push(Date.now());

            // Get Q-state
            const qState = getQState(this.flipCount);

            return {
                newOrientation: this.currentOrientation,
                flipCount: this.flipCount,
                lineIndex: this.lineIndex,
                qState: qState,
                qCycleProgress: (this.flipCount % 4) / 4 * 100,
                cyclesCompleted: Math.floor(this.flipCount / 4)
            };
        }

        /**
         * Get rhythm analysis for healing metrics
         * @returns {Object} - Rhythm analysis
         */
        getRhythmAnalysis() {
            if (this.flipTimes.length < 2) {
                return {
                    intervals: [],
                    average: 0,
                    consistency: 0,
                    inOptimalRange: false
                };
            }

            const intervals = [];
            for (let i = 1; i < this.flipTimes.length; i++) {
                intervals.push((this.flipTimes[i] - this.flipTimes[i - 1]) / 1000);
            }

            const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / intervals.length;
            const consistency = 1 / (1 + variance);

            // Optimal range is 4-6 seconds (like EMDR bilateral timing)
            const inOptimalRange = average >= 4 && average <= 6;

            return {
                intervals: intervals,
                average: Math.round(average * 100) / 100,
                consistency: Math.round(consistency * 100) / 100,
                inOptimalRange: inOptimalRange,
                optimalRange: { min: 4, max: 6 }
            };
        }

        /**
         * Get session metrics
         * @returns {Object} - Session metrics
         */
        getSessionMetrics() {
            const now = Date.now();
            const duration = this.sessionStart ? (now - this.sessionStart) / 1000 : 0;
            const rhythm = this.getRhythmAnalysis();

            return {
                duration: Math.round(duration),
                durationFormatted: this.formatDuration(duration),
                totalFlips: this.flipCount,
                cyclesCompleted: Math.floor(this.flipCount / 4),
                currentQState: getQState(this.flipCount),
                rhythm: rhythm,
                tablet: this.tablet
            };
        }

        /**
         * Format duration as MM:SS
         */
        formatDuration(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        /**
         * Select a different tablet
         * @param {string} tabletId - Tablet ID (A, B, C, etc.)
         */
        selectTablet(tabletId) {
            if (TABLETS[tabletId]) {
                this.tablet = TABLETS[tabletId];
                this.lineIndex = 0;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HEALING ENGINE CLASS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * HealingEngine: Tracks therapeutic metrics and Q-cycle progress
     */
    class HealingEngine {
        constructor() {
            this.sessions = [];
            this.currentSession = null;
        }

        /**
         * Start a new healing session
         */
        startSession(tabletId = 'A') {
            this.currentSession = {
                id: Date.now().toString(36),
                tabletId: tabletId,
                startTime: Date.now(),
                endTime: null,
                flips: [],
                completed: false
            };
        }

        /**
         * Record a flip event
         */
        recordFlip(flipData) {
            if (this.currentSession) {
                this.currentSession.flips.push({
                    timestamp: Date.now(),
                    ...flipData
                });
            }
        }

        /**
         * End the current session
         */
        endSession() {
            if (this.currentSession) {
                this.currentSession.endTime = Date.now();
                this.currentSession.completed = true;
                this.sessions.push(this.currentSession);

                const session = this.currentSession;
                this.currentSession = null;

                return this.analyzeSession(session);
            }
            return null;
        }

        /**
         * Analyze a completed session
         */
        analyzeSession(session) {
            const duration = (session.endTime - session.startTime) / 1000;
            const flipCount = session.flips.length;
            const cyclesCompleted = Math.floor(flipCount / 4);

            // Calculate rhythm
            let intervals = [];
            for (let i = 1; i < session.flips.length; i++) {
                intervals.push((session.flips[i].timestamp - session.flips[i - 1].timestamp) / 1000);
            }

            const avgInterval = intervals.length > 0 ?
                intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;

            const variance = intervals.length > 0 ?
                intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length : 0;

            const consistency = 1 / (1 + variance);

            return {
                sessionId: session.id,
                tabletId: session.tabletId,
                duration: Math.round(duration),
                totalFlips: flipCount,
                cyclesCompleted: cyclesCompleted,
                averageInterval: Math.round(avgInterval * 100) / 100,
                rhythmConsistency: Math.round(consistency * 100) / 100,
                inOptimalRange: avgInterval >= 4 && avgInterval <= 6,
                healingScore: this.calculateHealingScore(cyclesCompleted, consistency, duration)
            };
        }

        /**
         * Calculate a healing score (0-100)
         */
        calculateHealingScore(cycles, consistency, duration) {
            // Factors:
            // - Complete Q-cycles (more = better, up to a point)
            // - Rhythm consistency (higher = better)
            // - Duration (15-30 minutes optimal)

            const cycleScore = Math.min(cycles * 10, 40); // Max 40 points
            const consistencyScore = consistency * 30; // Max 30 points

            let durationScore = 0;
            if (duration >= 900 && duration <= 1800) { // 15-30 min
                durationScore = 30;
            } else if (duration >= 600 || duration <= 2400) { // 10-40 min
                durationScore = 20;
            } else if (duration >= 300) { // 5+ min
                durationScore = 10;
            }

            return Math.round(cycleScore + consistencyScore + durationScore);
        }

        /**
         * Get lifetime statistics
         */
        getLifetimeStats() {
            if (this.sessions.length === 0) {
                return {
                    totalSessions: 0,
                    totalFlips: 0,
                    totalCycles: 0,
                    averageHealingScore: 0
                };
            }

            const analyses = this.sessions.map(s => this.analyzeSession(s));

            return {
                totalSessions: this.sessions.length,
                totalFlips: analyses.reduce((acc, a) => acc + a.totalFlips, 0),
                totalCycles: analyses.reduce((acc, a) => acc + a.cyclesCompleted, 0),
                averageHealingScore: Math.round(
                    analyses.reduce((acc, a) => acc + a.healingScore, 0) / analyses.length
                ),
                tabletsExplored: [...new Set(this.sessions.map(s => s.tabletId))].length
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════

    return {
        // Configuration
        CONFIG: CONFIG,
        CONSTANTS: CONSTANTS,

        // Data
        D_POSITIONS: D_POSITIONS,
        Q_STATES: Q_STATES,
        BARTHEL_GLYPHS: BARTHEL_GLYPHS,
        TABLETS: TABLETS,
        CULTURAL_WORDS: CULTURAL_WORDS,

        // Core functions
        qReduce: qReduce,
        qReduceDetailed: qReduceDetailed,
        getQState: getQState,
        calculatePolarity: calculatePolarity,
        analyzePair: analyzePair,
        getInvertedMeaning: getInvertedMeaning,
        analyzeGlyph: analyzeGlyph,

        // Classes
        TabletEngine: TabletEngine,
        HealingEngine: HealingEngine,

        // Utility
        getDPosition: function(input) {
            return D_POSITIONS[qReduce(input)];
        },

        getTablet: function(id) {
            return TABLETS[id];
        },

        getGlyph: function(barthel) {
            return BARTHEL_GLYPHS[barthel];
        },

        // Initialization
        init: function() {
            console.log(`[1 = -1] ${CONFIG.name} v${CONFIG.version} initialized`);
            console.log(`RONGORONGO = D${qReduce('RONGORONGO')} = ${D_POSITIONS[qReduce('RONGORONGO')].name}`);
            console.log('Q² = -1 = THE FLIP');
            return this;
        }
    };

})();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.RongorongoReader = RongorongoReader;
    document.addEventListener('DOMContentLoaded', function() {
        RongorongoReader.init();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RongorongoReader;
}
