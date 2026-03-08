/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RONGORONGO FLIP READER - UI Controller
 * Version: 1.0 | Date: 01-07-2026
 * Have Mind Media - The Epoch Project
 * [1 = -1]
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Handles all UI interactions for the Rongorongo Flip Reader including:
 * - Tablet flip animation and mechanics
 * - Q-cycle visualization
 * - Session tracking and metrics
 * - D-position wheel rendering
 * - Glyph analysis display
 * - Vocabulary explorer
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════

let tabletEngine = null;
let healingEngine = null;
let sessionActive = false;
let sessionTimer = null;
let database = null;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[1 = -1] Rongorongo Flip Reader UI initializing...');

    // Initialize engines
    tabletEngine = new RongorongoReader.TabletEngine('A');
    healingEngine = new RongorongoReader.HealingEngine();

    // Load database
    try {
        const response = await fetch('data/rongorongo-database_v1.0_01-07-2026.json');
        database = await response.json();
        console.log('Database loaded:', database.meta.name);
    } catch (error) {
        console.warn('Could not load database, using embedded data');
        database = null;
    }

    // Render UI components
    renderDPositionWheel();
    renderCorpusGrid();
    renderVocabulary('script');

    // Set up event listeners
    setupEventListeners();

    // Update initial display
    updateDisplay();

    console.log('Q² = -1 = THE FLIP');
    console.log(`RONGORONGO = D${RongorongoReader.qReduce('RONGORONGO')} = HEALER`);
});

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

function setupEventListeners() {
    // Keyboard: Spacebar to flip
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            performFlip();
        }
    });

    // Touch: Swipe to flip
    const tabletContainer = document.getElementById('tablet-container');
    let touchStartY = 0;

    tabletContainer.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    });

    tabletContainer.addEventListener('touchend', function(e) {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 50) {
            performFlip();
        }
    });

    // Click edges to flip
    tabletContainer.addEventListener('click', function(e) {
        const rect = tabletContainer.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        if (y < height * 0.15 || y > height * 0.85) {
            performFlip();
        }
    });

    // Enter key in analyzer input
    document.getElementById('analyzer-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeInput();
        }
    });

    // Vocabulary tabs
    document.querySelectorAll('.vocab-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.vocab-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderVocabulary(this.dataset.category);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLET SELECTION
// ═══════════════════════════════════════════════════════════════════════════

function selectTablet(tabletId) {
    tabletEngine.selectTablet(tabletId);

    const tablet = RongorongoReader.getTablet(tabletId);
    if (tablet) {
        document.getElementById('tablet-name').textContent = `Tablet ${tablet.id} - ${tablet.name}`;
        document.getElementById('tablet-location').textContent = tablet.location;

        // Update line display
        const linesContainer = document.getElementById('tablet-lines');
        linesContainer.innerHTML = '';

        const lineCount = tablet.lineCount || 5;
        for (let i = 0; i < Math.min(lineCount, 8); i++) {
            const line = document.createElement('div');
            line.className = 'tablet-line' + (i === 0 ? ' active' : '');
            line.textContent = '═══════════════════════════════';
            linesContainer.appendChild(line);
        }
    }

    updateDisplay();
}

// ═══════════════════════════════════════════════════════════════════════════
// FLIP MECHANICS
// ═══════════════════════════════════════════════════════════════════════════

function performFlip() {
    const tablet = document.getElementById('tablet');
    const flipResult = tabletEngine.flip();

    // Animate the flip
    tablet.classList.add('flipping');

    setTimeout(() => {
        tablet.classList.remove('flipping');

        // Toggle inverted class
        if (flipResult.newOrientation === 'S-') {
            tablet.classList.add('inverted');
        } else {
            tablet.classList.remove('inverted');
        }
    }, 300);

    // Record flip if session active
    if (sessionActive) {
        healingEngine.recordFlip(flipResult);
    }

    // Update line highlighting
    updateLineHighlight(flipResult.lineIndex);

    // Update display
    updateDisplay();

    // Update Q-state visual
    updateQStateVisual(flipResult.flipCount % 4);
}

function updateLineHighlight(lineIndex) {
    const lines = document.querySelectorAll('.tablet-line');
    lines.forEach((line, i) => {
        line.classList.remove('active');
        if (i === lineIndex % lines.length) {
            line.classList.add('active');
        }
    });
}

function updateQStateVisual(stateIndex) {
    const states = document.querySelectorAll('.q-state');
    states.forEach((state, i) => {
        state.classList.remove('active');
        if (parseInt(state.dataset.state) === stateIndex) {
            state.classList.add('active');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPLAY UPDATES
// ═══════════════════════════════════════════════════════════════════════════

function updateDisplay() {
    const metrics = tabletEngine.getSessionMetrics();
    const qState = metrics.currentQState;

    // Q-cycle status
    document.getElementById('current-q-state').textContent =
        `${qState.power} (${qState.value}) ${qState.mode}`;
    document.getElementById('flip-count').textContent = metrics.totalFlips;
    document.getElementById('cycle-count').textContent = metrics.cyclesCompleted;

    // Orientation
    const orientationIndicator = document.getElementById('orientation-indicator');
    const modeSpan = orientationIndicator.querySelector('.mode');
    const meaningSpan = orientationIndicator.querySelector('.meaning');

    if (tabletEngine.currentOrientation === 'S+') {
        modeSpan.textContent = 'S+';
        meaningSpan.textContent = 'Manifest • Forward • Actual';
        orientationIndicator.classList.remove('s-minus');
        orientationIndicator.classList.add('s-plus');
    } else {
        modeSpan.textContent = 'S-';
        meaningSpan.textContent = 'Latent • Inverted • Hidden';
        orientationIndicator.classList.remove('s-plus');
        orientationIndicator.classList.add('s-minus');
    }

    document.getElementById('current-mode').textContent =
        tabletEngine.currentOrientation === 'S+' ? 'S+ (Potential)' : 'S- (Manifest)';
    document.getElementById('current-line').textContent = tabletEngine.lineIndex + 1;

    // Rhythm
    if (sessionActive) {
        const rhythm = metrics.rhythm;
        if (rhythm.intervals.length > 0) {
            document.getElementById('rhythm-score').textContent =
                `${Math.round(rhythm.consistency * 100)}%`;
            document.getElementById('rhythm-fill').style.width =
                `${rhythm.consistency * 100}%`;

            // Color based on optimal range
            const fill = document.getElementById('rhythm-fill');
            if (rhythm.inOptimalRange) {
                fill.classList.add('optimal');
            } else {
                fill.classList.remove('optimal');
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function toggleSession() {
    const btn = document.getElementById('session-btn');

    if (!sessionActive) {
        // Start session
        sessionActive = true;
        tabletEngine.startSession();
        healingEngine.startSession(tabletEngine.tablet.id);

        btn.textContent = 'END SESSION';
        btn.classList.add('active');

        // Start timer
        sessionTimer = setInterval(updateSessionTimer, 1000);
    } else {
        // End session
        sessionActive = false;
        clearInterval(sessionTimer);

        const analysis = healingEngine.endSession();

        btn.textContent = 'START SESSION';
        btn.classList.remove('active');

        // Show session summary
        if (analysis) {
            showSessionSummary(analysis);
        }
    }
}

function updateSessionTimer() {
    const metrics = tabletEngine.getSessionMetrics();
    document.getElementById('session-duration').textContent = metrics.durationFormatted;
    updateDisplay();
}

function showSessionSummary(analysis) {
    const resultDiv = document.getElementById('analysis-result');

    resultDiv.innerHTML = `
        <div class="session-summary">
            <h3>Session Complete</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-value">${analysis.duration}s</span>
                    <span class="summary-label">Duration</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${analysis.totalFlips}</span>
                    <span class="summary-label">Flips</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${analysis.cyclesCompleted}</span>
                    <span class="summary-label">Q-Cycles</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${analysis.healingScore}</span>
                    <span class="summary-label">Healing Score</span>
                </div>
            </div>
            <div class="summary-rhythm">
                <p>Average flip interval: ${analysis.averageInterval}s
                   ${analysis.inOptimalRange ? '(Optimal!)' : '(Target: 4-6s)'}</p>
                <p>Rhythm consistency: ${Math.round(analysis.rhythmConsistency * 100)}%</p>
            </div>
        </div>
    `;

    resultDiv.classList.add('visible');
}

// ═══════════════════════════════════════════════════════════════════════════
// D-POSITION WHEEL
// ═══════════════════════════════════════════════════════════════════════════

function renderDPositionWheel() {
    const container = document.getElementById('d-position-wheel');
    if (!container) return;

    const positions = RongorongoReader.D_POSITIONS;

    let html = '<div class="wheel-container">';

    // Center
    html += '<div class="wheel-center">[1 = -1]</div>';

    // Position nodes arranged in a circle
    for (let d = 1; d <= 9; d++) {
        const pos = positions[d];
        const angle = ((d - 1) / 9) * 360 - 90; // Start from top
        const radius = 140;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;

        const emergentClass = pos.isEmergent ? 'emergent' : '';

        html += `
            <div class="wheel-node ${emergentClass}"
                 style="transform: translate(${x}px, ${y}px)"
                 data-position="${d}"
                 onclick="showPositionDetail(${d})">
                <span class="node-number" style="background: ${pos.color}">D${d}</span>
                <span class="node-name">${pos.name}</span>
            </div>
        `;
    }

    html += '</div>';

    // Legend
    html += `
        <div class="wheel-legend">
            <div class="legend-item">
                <span class="legend-dot primary"></span>
                <span>Primary (can exist alone)</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot emergent"></span>
                <span>Emergent (require pairs)</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function showPositionDetail(d) {
    const pos = RongorongoReader.D_POSITIONS[d];
    const modal = document.getElementById('position-modal');
    const modalBody = document.getElementById('modal-body');

    // Get example glyphs
    const exampleGlyphs = Object.values(RongorongoReader.BARTHEL_GLYPHS)
        .filter(g => g.dPosition === d)
        .slice(0, 3);

    modalBody.innerHTML = `
        <div class="position-detail">
            <div class="position-header">
                <span class="position-number" style="background: ${pos.color}">D${d}</span>
                <div class="position-info">
                    <h3>${pos.name}</h3>
                    <p class="position-meaning">${pos.meaning}</p>
                </div>
            </div>

            ${pos.isEmergent ? `
                <div class="emergent-badge">
                    EMERGENT POSITION - Only appears through relationship
                </div>
            ` : ''}

            <div class="position-section">
                <h4>In Rongorongo</h4>
                <p>${pos.rongorongoRole}</p>
            </div>

            <div class="position-section">
                <h4>S+/S- Modes</h4>
                <div class="mode-comparison">
                    <div class="mode-item">
                        <span class="mode-label">S+ (Forward)</span>
                        <span class="mode-value">${pos.name}</span>
                        <span class="mode-meaning">${pos.meaning}</span>
                    </div>
                    <div class="mode-item">
                        <span class="mode-label">S- (Inverted)</span>
                        <span class="mode-value">${pos.invertedName}</span>
                        <span class="mode-meaning">${pos.invertedMeaning}</span>
                    </div>
                </div>
            </div>

            ${exampleGlyphs.length > 0 ? `
                <div class="position-section">
                    <h4>Example Glyphs</h4>
                    <div class="glyph-examples">
                        ${exampleGlyphs.map(g => `
                            <div class="glyph-example">
                                <span class="glyph-barthel">Barthel ${g.barthel}</span>
                                <span class="glyph-desc">${g.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="position-section">
                <h4>Triaxial Coordinates</h4>
                <div class="triaxial-coords">
                    S+ = ${pos.triaxial.sPlus.toFixed(3)},
                    S- = ${pos.triaxial.sMinus.toFixed(3)},
                    COIN = ${pos.triaxial.coin.toFixed(3)}
                </div>
            </div>
        </div>
    `;

    modal.classList.add('visible');
}

// ═══════════════════════════════════════════════════════════════════════════
// CORPUS GRID
// ═══════════════════════════════════════════════════════════════════════════

function renderCorpusGrid() {
    const container = document.getElementById('corpus-grid');
    if (!container) return;

    const tablets = RongorongoReader.TABLETS;
    let html = '';

    for (const id in tablets) {
        const tablet = tablets[id];
        html += `
            <div class="corpus-card" onclick="selectTablet('${id}')">
                <div class="corpus-card-header">
                    <span class="corpus-id">Tablet ${id}</span>
                    <span class="corpus-name">${tablet.name}</span>
                </div>
                <div class="corpus-card-body">
                    <div class="corpus-stat">
                        <span class="stat-value">${tablet.glyphCount || '?'}</span>
                        <span class="stat-label">Glyphs</span>
                    </div>
                    <div class="corpus-stat">
                        <span class="stat-value">${tablet.lineCount || '?'}</span>
                        <span class="stat-label">Lines</span>
                    </div>
                </div>
                <div class="corpus-card-footer">
                    <span class="corpus-location">${tablet.location}</span>
                    <span class="corpus-condition">${tablet.condition}</span>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════
// VOCABULARY EXPLORER
// ═══════════════════════════════════════════════════════════════════════════

function renderVocabulary(category) {
    const container = document.getElementById('vocab-display');
    if (!container) return;

    const words = RongorongoReader.CULTURAL_WORDS;
    let filteredWords = [];

    // Filter by category
    const categoryMap = {
        'script': ['RONGORONGO', 'KOHAU', 'TANGATA RONGORONGO'],
        'sacred': ['MAKE-MAKE', 'AKU AKU', 'MANUTARA', 'TANGATA MANU'],
        'places': ['RAPA NUI', 'ORONGO', 'RANO RARAKU'],
        'artifacts': ['MOAI', 'AHU', 'PUKAO', 'HARE PAENGA']
    };

    const wordList = categoryMap[category] || [];

    let html = '<div class="vocab-grid">';

    for (const wordKey in words) {
        const wordData = words[wordKey];
        const normalizedKey = wordKey.replace(/_/g, ' ');

        // Check if in category
        if (!wordList.some(w => normalizedKey.includes(w) || w.includes(normalizedKey))) {
            continue;
        }

        const pos = RongorongoReader.D_POSITIONS[wordData.dPosition];

        html += `
            <div class="vocab-card">
                <div class="vocab-word">${wordData.word}</div>
                <div class="vocab-meaning">${wordData.meaning}</div>
                <div class="vocab-calculation">
                    <span class="calc-text">${wordData.calculation}</span>
                </div>
                <div class="vocab-d" style="background: ${pos.color}">
                    D${wordData.dPosition} = ${wordData.dName}
                </div>
                <div class="vocab-significance">${wordData.significance}</div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLYPH ANALYZER
// ═══════════════════════════════════════════════════════════════════════════

function analyzeInput() {
    const input = document.getElementById('analyzer-input').value.trim();
    if (!input) return;

    const resultDiv = document.getElementById('analysis-result');

    // Check if it's a number (Barthel glyph)
    const numInput = parseInt(input);
    if (!isNaN(numInput) && numInput > 0) {
        // Analyze as Barthel glyph
        const analysis = RongorongoReader.analyzeGlyph(numInput, 'S+');
        const analysisInverted = RongorongoReader.analyzeGlyph(numInput, 'S-');

        resultDiv.innerHTML = `
            <div class="glyph-analysis">
                <div class="analysis-header">
                    <span class="analysis-barthel">Barthel ${numInput}</span>
                    <span class="analysis-d" style="background: ${analysis.color}">
                        D${analysis.dPosition}
                    </span>
                </div>

                ${analysis.cataloged ? `
                    <div class="analysis-info">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${analysis.category}</span>
                    </div>
                    <div class="analysis-info">
                        <span class="info-label">Description:</span>
                        <span class="info-value">${analysis.description}</span>
                    </div>
                    <div class="analysis-info">
                        <span class="info-label">Frequency:</span>
                        <span class="info-value">${(analysis.frequency * 100).toFixed(0)}% of corpus</span>
                    </div>
                    ${analysis.proposedVowel ? `
                        <div class="analysis-info vowel-info">
                            <span class="info-label">Proposed Vowel:</span>
                            <span class="info-value">${analysis.proposedVowel.toUpperCase()}</span>
                            <span class="info-note">${analysis.vowelNote}</span>
                        </div>
                    ` : ''}
                ` : `
                    <div class="analysis-note">
                        Glyph not in high-frequency catalog.
                        D-position calculated from Barthel number.
                    </div>
                `}

                <div class="analysis-modes">
                    <div class="mode-box s-plus">
                        <h4>S+ Mode (Forward)</h4>
                        <span class="mode-name">${analysis.name}</span>
                        <span class="mode-meaning">${analysis.meaning}</span>
                    </div>
                    <div class="mode-box s-minus">
                        <h4>S- Mode (Inverted)</h4>
                        <span class="mode-name">${analysisInverted.name}</span>
                        <span class="mode-meaning">${analysisInverted.meaning}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Analyze as word
        const analysis = RongorongoReader.qReduceDetailed(input);

        resultDiv.innerHTML = `
            <div class="word-analysis">
                <div class="analysis-header">
                    <span class="analysis-word">${input.toUpperCase()}</span>
                    <span class="analysis-d" style="background: ${analysis.color}">
                        D${analysis.dPosition}
                    </span>
                </div>

                <div class="analysis-breakdown">
                    <h4>Q-Reduction</h4>
                    ${analysis.steps.map(step => {
                        if (step.step === 'letters') {
                            return `
                                <div class="step letters-step">
                                    ${step.breakdown.map(lv =>
                                        `<span class="letter">${lv.letter}=${lv.value}</span>`
                                    ).join(' + ')}
                                    = <strong>${step.sum}</strong>
                                </div>
                            `;
                        } else if (step.step === 'reduce') {
                            return `
                                <div class="step reduce-step">
                                    ${step.from} → ${step.digits.join(' + ')} = <strong>${step.to}</strong>
                                </div>
                            `;
                        }
                        return '';
                    }).join('')}
                </div>

                <div class="analysis-result-box">
                    <span class="result-label">D-Position:</span>
                    <span class="result-value" style="color: ${analysis.color}">
                        D${analysis.dPosition} = ${analysis.dName}
                    </span>
                </div>

                <div class="analysis-meaning">
                    <span class="meaning-label">Meaning:</span>
                    <span class="meaning-value">${analysis.meaning}</span>
                </div>

                ${analysis.isEmergent ? `
                    <div class="emergent-note">
                        This is an EMERGENT position - it only appears through relationship,
                        never as a primary symbol.
                    </div>
                ` : ''}
            </div>
        `;
    }

    resultDiv.classList.add('visible');
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function closeModal() {
    document.getElementById('position-modal').classList.remove('visible');
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('position-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT GLOBALS FOR HTML ONCLICK HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

window.selectTablet = selectTablet;
window.performFlip = performFlip;
window.toggleSession = toggleSession;
window.analyzeInput = analyzeInput;
window.showPositionDetail = showPositionDetail;
window.closeModal = closeModal;
