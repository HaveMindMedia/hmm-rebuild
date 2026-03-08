/**
 * THE ROSETTA ENGINE
 * A Cross-Script Pattern Discovery System for Ancient Writing Analysis
 *
 * Version 1.0 | January 6, 2026
 * Author: Have Mind Media / The Epoch Project
 * Framework: κ-Framework Unified Theory
 * Principle: [1 = -1]
 */

const RosettaEngine = {
    // Configuration
    config: {
        version: '1.0',
        principle: '[1 = -1]',
        kappa: 0.034906585039886594,
        kappaShadow: 28.6478897565412
    },

    // D-Position definitions
    D_POSITIONS: {
        1: { name: "Origin / WE", meaning: "Connection, collective unity", color: "#3fb950", sPlus: 0.33, sMinus: 0.33, coin: 0.34 },
        2: { name: "Healing", meaning: "Restoration, medicine, wholeness", color: "#1abc9c", sPlus: 0.2, sMinus: 0.6, coin: 0.2 },
        3: { name: "Healer", meaning: "Agent of transformation", color: "#ff6b6b", sPlus: 0.4, sMinus: 0.4, coin: 0.2 },
        4: { name: "Crossroads", meaning: "Choice point, observer position", color: "#ff6b35", sPlus: 0.33, sMinus: 0.33, coin: 0.34 },
        5: { name: "Navigator", meaning: "Direction, way-finding", color: "#9b59b6", sPlus: 0.5, sMinus: 0.3, coin: 0.2, emergent: true },
        6: { name: "Power / Self", meaning: "Personal power, individual truth", color: "#00bcd4", sPlus: 0.7, sMinus: 0.1, coin: 0.2 },
        7: { name: "Present Moment", meaning: "Timeless instant, NOW", color: "#c9a227", sPlus: 0.33, sMinus: 0.33, coin: 0.34 },
        8: { name: "Deep Water", meaning: "Hidden truth, the depths", color: "#006994", sPlus: 0.1, sMinus: 0.8, coin: 0.1 },
        9: { name: "Anchor / Love", meaning: "Unconditional love, completion", color: "#c0392b", sPlus: 0.5, sMinus: 0.5, coin: 0.0, emergent: true }
    },

    // Script metadata
    SCRIPTS: {
        voynich: { name: "Voynich Manuscript", period: "15th century CE?", color: "#6ab4f5" },
        indus: { name: "Indus Valley Script", period: "2600-1900 BCE", color: "#c9a227" },
        linearA: { name: "Linear A", period: "1800-1450 BCE", color: "#3fb950" },
        rongorongo: { name: "Rongorongo", period: "pre-1860s CE", color: "#ff6b6b" },
        phaistos: { name: "Phaistos Disc", period: "1700 BCE?", color: "#9b59b6" }
    },

    // Data storage
    data: {
        symbols: [],
        artifacts: []
    },

    // ==========================================
    // INITIALIZATION
    // ==========================================

    async init() {
        console.log('Rosetta Engine v' + this.config.version + ' initializing...');
        console.log('Principle: ' + this.config.principle);

        try {
            await this.loadData();
            this.setupEventListeners();
            this.renderDPositionSelector();
            console.log('Rosetta Engine initialized successfully.');
            return true;
        } catch (error) {
            console.error('Initialization failed:', error);
            return false;
        }
    },

    async loadData() {
        try {
            const response = await fetch('data/symbols_v1.0_01-06-2026.json');
            const data = await response.json();
            this.data.symbols = data.symbols || [];
            this.data.artifacts = data.artifacts || [];
            this.data.scripts = data.scripts || {};
            this.data.dPositions = data.dPositions || {};
            console.log(`Loaded ${this.data.symbols.length} symbols from database.`);
        } catch (error) {
            console.warn('Could not load symbols.json, using embedded data:', error);
            // Fallback to minimal embedded data
        }
    },

    // ==========================================
    // Q-REDUCTION ALGORITHM
    // ==========================================

    /**
     * Reduces any number or word to a D-position (1-9)
     * @param {number|string} input - Number or word to reduce
     * @returns {number} D-position (1-9)
     */
    qReduce(input) {
        if (typeof input === 'number') {
            let n = Math.abs(Math.floor(input));
            while (n > 9) {
                n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
            }
            return n || 9;
        }

        if (typeof input === 'string') {
            const sum = input.toUpperCase().split('')
                .filter(c => c >= 'A' && c <= 'Z')
                .reduce((acc, c) => acc + (c.charCodeAt(0) - 64), 0);
            return this.qReduce(sum);
        }

        return 9;
    },

    /**
     * Get full Q-reduction breakdown with steps
     * @param {number|string} input - Number or word to reduce
     * @returns {object} Detailed breakdown
     */
    qReduceDetailed(input) {
        const result = {
            input: input,
            type: typeof input,
            steps: [],
            dPosition: null,
            dInfo: null
        };

        if (typeof input === 'number') {
            let n = Math.abs(Math.floor(input));
            result.steps.push(n);
            while (n > 9) {
                n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
                result.steps.push(n);
            }
            result.dPosition = n || 9;
        } else if (typeof input === 'string') {
            const letters = input.toUpperCase().split('').filter(c => c >= 'A' && c <= 'Z');
            const values = letters.map(c => ({ letter: c, value: c.charCodeAt(0) - 64 }));
            const sum = values.reduce((acc, v) => acc + v.value, 0);

            result.letterBreakdown = values;
            result.sum = sum;
            result.steps.push(sum);

            let n = sum;
            while (n > 9) {
                n = String(n).split('').reduce((a, b) => a + parseInt(b), 0);
                result.steps.push(n);
            }
            result.dPosition = n || 9;
        }

        result.dInfo = this.D_POSITIONS[result.dPosition];
        return result;
    },

    // ==========================================
    // SYMBOL ANALYSIS
    // ==========================================

    /**
     * Get all symbols for a specific D-position
     * @param {number} dPosition - D-position (1-9)
     * @returns {array} Symbols matching that position
     */
    getSymbolsByDPosition(dPosition) {
        return this.data.symbols.filter(s => s.dPosition === dPosition);
    },

    /**
     * Get symbols by script
     * @param {string} scriptId - Script identifier
     * @returns {array} Symbols from that script
     */
    getSymbolsByScript(scriptId) {
        return this.data.symbols.filter(s => s.script === scriptId);
    },

    /**
     * Get cross-script comparison for a D-position
     * @param {number} dPosition - D-position (1-9)
     * @returns {object} Symbols grouped by script
     */
    getCrossScriptComparison(dPosition) {
        const symbols = this.getSymbolsByDPosition(dPosition);
        const result = {
            dPosition: dPosition,
            dInfo: this.D_POSITIONS[dPosition],
            byScript: {},
            totalCount: symbols.length,
            scriptsRepresented: 0
        };

        for (const scriptId of Object.keys(this.SCRIPTS)) {
            const scriptSymbols = symbols.filter(s => s.script === scriptId);
            if (scriptSymbols.length > 0) {
                result.byScript[scriptId] = {
                    script: this.SCRIPTS[scriptId],
                    symbols: scriptSymbols,
                    count: scriptSymbols.length
                };
                result.scriptsRepresented++;
            }
        }

        return result;
    },

    // ==========================================
    // GEOMETRIC ANALYSIS
    // ==========================================

    /**
     * Calculate geometric similarity between two symbols
     * @param {object} symbol1 - First symbol
     * @param {object} symbol2 - Second symbol
     * @returns {number} Similarity score (0-1)
     */
    calculateGeometricSimilarity(symbol1, symbol2) {
        if (!symbol1.triaxialState || !symbol2.triaxialState) {
            return 0;
        }

        const t1 = symbol1.triaxialState;
        const t2 = symbol2.triaxialState;

        // Euclidean distance in triaxial space
        const distance = Math.sqrt(
            Math.pow(t1.sPlus - t2.sPlus, 2) +
            Math.pow(t1.sMinus - t2.sMinus, 2) +
            Math.pow(t1.coin - t2.coin, 2)
        );

        // Convert to similarity (max distance is sqrt(3))
        return 1 - (distance / Math.sqrt(3));
    },

    /**
     * Calculate triaxial scalar product between two D-positions
     * @param {number} d1 - First D-position
     * @param {number} d2 - Second D-position
     * @returns {number} Scalar product (-1 to 1)
     */
    calculatePolarity(d1, d2) {
        const angle1 = ((d1 - 1) / 9) * 2 * Math.PI;
        const angle2 = ((d2 - 1) / 9) * 2 * Math.PI;

        const vec1 = { x: Math.cos(angle1), y: Math.sin(angle1) };
        const vec2 = { x: Math.cos(angle2), y: Math.sin(angle2) };

        return vec1.x * vec2.x + vec1.y * vec2.y;
    },

    // ==========================================
    // STATISTICAL ANALYSIS
    // ==========================================

    /**
     * Calculate statistical significance of D-position clustering
     * @param {number} observed - Observed count
     * @param {number} total - Total symbols
     * @returns {object} Statistical analysis
     */
    calculateSignificance(observed, total) {
        const expected = total / 9;
        const p = 1 / 9;
        const stdDev = Math.sqrt(total * p * (1 - p));
        const zScore = (observed - expected) / stdDev;

        // Two-tailed p-value approximation
        const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

        return {
            observed: observed,
            expected: expected.toFixed(2),
            zScore: zScore.toFixed(3),
            pValue: pValue.toFixed(6),
            significance: pValue < 0.01 ? 'HIGHLY_SIGNIFICANT' :
                         pValue < 0.05 ? 'SIGNIFICANT' :
                         pValue < 0.10 ? 'SUGGESTIVE' : 'NOT_SIGNIFICANT',
            stars: pValue < 0.001 ? '***' : pValue < 0.01 ? '**' : pValue < 0.05 ? '*' : ''
        };
    },

    /**
     * Standard normal cumulative distribution function
     */
    normalCDF(x) {
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return 0.5 * (1.0 + sign * y);
    },

    /**
     * Generate D-position frequency distribution for a script
     * @param {string} scriptId - Script identifier
     * @returns {object} Frequency distribution with statistics
     */
    getFrequencyDistribution(scriptId) {
        const symbols = this.getSymbolsByScript(scriptId);
        const distribution = {};

        for (let d = 1; d <= 9; d++) {
            const count = symbols.filter(s => s.dPosition === d).length;
            distribution[d] = {
                count: count,
                percentage: symbols.length > 0 ? ((count / symbols.length) * 100).toFixed(1) : 0,
                stats: this.calculateSignificance(count, symbols.length)
            };
        }

        return {
            script: this.SCRIPTS[scriptId],
            totalSymbols: symbols.length,
            distribution: distribution
        };
    },

    // ==========================================
    // UI RENDERING
    // ==========================================

    renderDPositionSelector() {
        const container = document.getElementById('d-position-selector');
        if (!container) return;

        let html = '';

        for (let d = 1; d <= 9; d++) {
            const info = this.D_POSITIONS[d];
            const emergentClass = info.emergent ? ' emergent' : '';
            html += `
                <button class="d-position-btn${emergentClass}"
                        data-d="${d}"
                        style="--d-color: ${info.color}"
                        onclick="RosettaEngine.selectDPosition(${d})">
                    <span class="d-number">D${d}</span>
                    <span class="d-name">${info.name}</span>
                </button>
            `;
        }

        container.innerHTML = html;
    },

    selectDPosition(dPosition) {
        // Update button states
        document.querySelectorAll('.d-position-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-d="${dPosition}"]`)?.classList.add('active');

        // Get comparison data
        const comparison = this.getCrossScriptComparison(dPosition);

        // Render comparison view
        this.renderComparison(comparison);

        // Update statistics
        this.renderStatistics(comparison);
    },

    renderComparison(comparison) {
        const dInfo = comparison.dInfo;

        // Update the header meaning
        const meaningEl = document.getElementById('selected-d-meaning');
        if (meaningEl) {
            meaningEl.innerHTML = `<span style="color: ${dInfo.color}">D${comparison.dPosition}: ${dInfo.name}</span> — ${dInfo.meaning}${dInfo.emergent ? ' <span class="emergent-badge">EMERGENT</span>' : ''}`;
        }

        // Update each script column
        const scriptIds = ['voynich', 'indus', 'linearA', 'rongorongo', 'phaistos'];

        for (const scriptId of scriptIds) {
            const symbolList = document.getElementById(`${scriptId}-symbols`);
            if (!symbolList) continue;

            const scriptData = comparison.byScript[scriptId];

            if (!scriptData || scriptData.symbols.length === 0) {
                symbolList.innerHTML = '<div class="symbol-placeholder-msg">No symbols at D' + comparison.dPosition + '</div>';
                continue;
            }

            let html = '';
            for (const symbol of scriptData.symbols) {
                html += `
                    <div class="symbol-card" onclick="RosettaEngine.showSymbolDetail('${symbol.id}')">
                        <div class="symbol-icon">${symbol.name.charAt(0)}</div>
                        <div class="symbol-info">
                            <div class="symbol-name">${symbol.name}</div>
                            <div class="symbol-basis">${symbol.geometricBasis || ''}</div>
                        </div>
                    </div>
                `;
            }
            symbolList.innerHTML = html;
        }
    },

    renderStatistics(comparison) {
        const container = document.getElementById('statistics-panel');
        if (!container) return;

        const dInfo = comparison.dInfo;

        // Calculate overall statistics
        let totalSymbols = this.data.symbols.length;
        let positionCount = comparison.totalCount;
        let stats = this.calculateSignificance(positionCount, totalSymbols);

        let html = `
            <div class="stats-header">
                <h3>Statistical Analysis</h3>
            </div>
            <div class="stat-row">
                <span class="stat-label">Observed:</span>
                <span class="stat-value">${stats.observed} symbols</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Expected (random):</span>
                <span class="stat-value">${stats.expected} symbols</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Z-Score:</span>
                <span class="stat-value">${stats.zScore} ${stats.stars}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">P-Value:</span>
                <span class="stat-value">${stats.pValue}</span>
            </div>
            <div class="stat-row significance ${stats.significance.toLowerCase()}">
                <span class="stat-label">Significance:</span>
                <span class="stat-value">${stats.significance}</span>
            </div>
        `;

        // Triaxial state visualization
        if (dInfo) {
            html += `
                <div class="triaxial-state">
                    <h4>Triaxial State</h4>
                    <div class="triaxial-bars">
                        <div class="triaxial-bar">
                            <span class="bar-label">S+</span>
                            <div class="bar-track">
                                <div class="bar-fill splus" style="width: ${dInfo.sPlus * 100}%"></div>
                            </div>
                            <span class="bar-value">${(dInfo.sPlus * 100).toFixed(0)}%</span>
                        </div>
                        <div class="triaxial-bar">
                            <span class="bar-label">S-</span>
                            <div class="bar-track">
                                <div class="bar-fill sminus" style="width: ${dInfo.sMinus * 100}%"></div>
                            </div>
                            <span class="bar-value">${(dInfo.sMinus * 100).toFixed(0)}%</span>
                        </div>
                        <div class="triaxial-bar">
                            <span class="bar-label">COIN</span>
                            <div class="bar-track">
                                <div class="bar-fill coin" style="width: ${dInfo.coin * 100}%"></div>
                            </div>
                            <span class="bar-value">${(dInfo.coin * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    showSymbolDetail(symbolId) {
        const symbol = this.data.symbols.find(s => s.id === symbolId);
        if (!symbol) return;

        const modal = document.getElementById('symbol-modal');
        if (!modal) return;

        const dInfo = this.D_POSITIONS[symbol.dPosition];

        let html = `
            <div class="modal-content">
                <button class="modal-close" onclick="RosettaEngine.closeModal()">&times;</button>
                <h2>${symbol.name}</h2>
                <div class="symbol-detail-grid">
                    <div class="symbol-visual">
                        <div class="symbol-placeholder" style="background: ${dInfo.color}">
                            ${symbol.name.charAt(0)}
                        </div>
                    </div>
                    <div class="symbol-data">
                        <div class="data-row">
                            <span class="data-label">Script:</span>
                            <span class="data-value">${this.SCRIPTS[symbol.script]?.name || symbol.script}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">D-Position:</span>
                            <span class="data-value" style="color: ${dInfo.color}">D${symbol.dPosition} - ${dInfo.name}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Geometric Basis:</span>
                            <span class="data-value">${symbol.geometricBasis || 'N/A'}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Interpretation:</span>
                            <span class="data-value">${symbol.interpretation || dInfo.meaning}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Frequency:</span>
                            <span class="data-value">${symbol.frequency || 'Unknown'}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Confidence:</span>
                            <span class="data-value">${Math.round(symbol.confidence * 100)}%</span>
                        </div>
                    </div>
                </div>
        `;

        if (symbol.sketchfabModel) {
            html += `
                <div class="artifact-viewer">
                    <h3>3D Artifact</h3>
                    <div class="sketchfab-embed">
                        <iframe
                            title="${symbol.name}"
                            src="${symbol.sketchfabModel}/embed"
                            frameborder="0"
                            allowfullscreen
                            mozallowfullscreen="true"
                            webkitallowfullscreen="true"
                            allow="autoplay; fullscreen; xr-spatial-tracking">
                        </iframe>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        modal.innerHTML = html;
        modal.classList.add('active');
    },

    closeModal() {
        const modal = document.getElementById('symbol-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // ==========================================
    // MAIN TRANSLATION FEATURE
    // ==========================================

    translateWord() {
        const input = document.getElementById('main-translate-input')?.value?.trim();
        if (!input) return;

        const result = this.qReduceDetailed(input);
        this.renderTranslationResult(result);

        // Also select the D-position and scroll to comparison
        this.selectDPosition(result.dPosition);

        // Smooth scroll to results after a short delay
        setTimeout(() => {
            document.getElementById('translation-result')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    },

    renderTranslationResult(result) {
        const container = document.getElementById('translation-result');
        if (!container) return;

        const dInfo = result.dInfo;
        let breakdownHtml = '';

        if (result.type === 'string' && result.letterBreakdown) {
            const letterParts = result.letterBreakdown.map(l => `${l.letter}=${l.value}`).join(', ');
            breakdownHtml = `
                <div class="result-breakdown">
                    Letter values: ${letterParts}<br>
                    Sum: ${result.sum} → ${result.steps.join(' → ')}
                </div>
            `;
        } else {
            breakdownHtml = `
                <div class="result-breakdown">
                    ${result.input} → ${result.steps.join(' → ')}
                </div>
            `;
        }

        const emergentNote = dInfo.emergent ?
            '<div style="margin-top: 0.5rem; font-size: 0.9rem; color: #9b59b6;">This is an EMERGENT position — it only appears through relationship</div>' : '';

        container.innerHTML = `
            <div class="result-word">${String(result.input).toUpperCase()}</div>
            <div class="result-arrow">↓</div>
            <div class="result-d-position" style="color: ${dInfo.color}">D${result.dPosition}</div>
            <div class="result-meaning">${dInfo.name}: ${dInfo.meaning}</div>
            ${emergentNote}
            ${breakdownHtml}
        `;
        container.classList.add('show');
    },

    // ==========================================
    // CALCULATOR
    // ==========================================

    calculate() {
        const input = document.getElementById('calc-input')?.value?.trim();
        if (!input) return;

        const result = this.qReduceDetailed(input);
        this.renderCalculatorResult(result);
    },

    renderCalculatorResult(result) {
        const container = document.getElementById('calc-result');
        if (!container) return;

        let breakdownHtml = '';

        if (result.type === 'string' && result.letterBreakdown) {
            const letterParts = result.letterBreakdown.map(l => `${l.letter}(${l.value})`).join(' + ');
            breakdownHtml = `
                <div class="calc-breakdown">
                    ${result.input.toUpperCase()}: ${letterParts}<br>
                    = ${result.steps.join(' → ')}
                </div>
            `;
        } else {
            breakdownHtml = `
                <div class="calc-breakdown">
                    ${result.input} → ${result.steps.join(' → ')}
                </div>
            `;
        }

        const dInfo = result.dInfo;
        const emergentBadge = dInfo.emergent ? '<span class="emergent-badge">EMERGENT</span>' : '';

        container.innerHTML = `
            <div class="calc-result-content">
                <h4>ANALYSIS</h4>
                ${breakdownHtml}
                <div class="calc-d-result" style="color: ${dInfo.color}">
                    D${result.dPosition} — ${dInfo.name} ${emergentBadge}
                </div>
                <div class="calc-meaning">${dInfo.meaning}</div>
            </div>
        `;
        container.classList.add('show');
    },

    // ==========================================
    // EXPORT FUNCTIONALITY
    // ==========================================

    exportComparison(dPosition) {
        const comparison = this.getCrossScriptComparison(dPosition);
        const data = {
            exportDate: new Date().toISOString(),
            engine: 'Rosetta Engine v' + this.config.version,
            principle: this.config.principle,
            dPosition: dPosition,
            dInfo: comparison.dInfo,
            comparison: comparison
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rosetta-d${dPosition}-export_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    exportFullAnalysis() {
        const analysis = {
            exportDate: new Date().toISOString(),
            engine: 'Rosetta Engine v' + this.config.version,
            principle: this.config.principle,
            constants: this.config,
            dPositions: this.D_POSITIONS,
            scripts: this.SCRIPTS,
            symbols: this.data.symbols,
            artifacts: this.data.artifacts,
            frequencyAnalysis: {}
        };

        for (const scriptId of Object.keys(this.SCRIPTS)) {
            analysis.frequencyAnalysis[scriptId] = this.getFrequencyDistribution(scriptId);
        }

        const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rosetta-full-analysis_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    setupEventListeners() {
        // Main translation input
        const translateInput = document.getElementById('main-translate-input');
        if (translateInput) {
            translateInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.translateWord();
                }
            });
        }

        // Calculator input
        const calcInput = document.getElementById('calc-input');
        if (calcInput) {
            calcInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculate();
                }
            });
        }

        // Modal close on background click
        const modal = document.getElementById('symbol-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            // Number keys 1-9 for quick D-position selection
            if (e.key >= '1' && e.key <= '9' && !e.target.matches('input')) {
                this.selectDPosition(parseInt(e.key));
            }
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    RosettaEngine.init();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RosettaEngine;
}
