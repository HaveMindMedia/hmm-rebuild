/**
 * CIRCLE CANVAS - Interactive Circle Visualization Component
 * Geometry Math Education Platform
 * Have Mind Media | January 28, 2026 | [1 = -1]
 *
 * An interactive canvas where users can drag a point around a circle
 * and see the mathematical relationships in real-time.
 */

class CircleCanvas {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }

        // Configuration
        this.options = {
            radius: options.radius || 120,
            showGrid: options.showGrid !== false,
            showAxes: options.showAxes !== false,
            showProjections: options.showProjections || false,
            showAngle: options.showAngle || false,
            showCoordinates: options.showCoordinates || false,
            showTrace: options.showTrace || false,
            interactive: options.interactive !== false,
            animate: options.animate || false,
            animationSpeed: options.animationSpeed || 1,
            colors: {
                circle: options.colors?.circle || '#d4af37',
                point: options.colors?.point || '#00d4ff',
                projectionX: options.colors?.projectionX || '#ff6b6b',
                projectionY: options.colors?.projectionY || '#4ecdc4',
                angle: options.colors?.angle || 'rgba(212, 175, 55, 0.3)',
                grid: options.colors?.grid || 'rgba(255, 255, 255, 0.1)',
                axes: options.colors?.axes || 'rgba(255, 255, 255, 0.3)',
                trace: options.colors?.trace || 'rgba(0, 212, 255, 0.3)',
                ...options.colors
            }
        };

        // State
        this.angle = 0;
        this.isDragging = false;
        this.tracePoints = [];
        this.animationId = null;

        // Callbacks
        this.onAngleChange = options.onAngleChange || null;

        // Create canvas
        this.setupCanvas();
        this.bindEvents();
        this.draw();

        // Start animation if enabled
        if (this.options.animate) {
            this.startAnimation();
        }
    }

    setupCanvas() {
        // Create SVG element
        const size = this.options.radius * 3;
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', size);
        this.svg.setAttribute('height', size);
        this.svg.setAttribute('viewBox', `${-size/2} ${-size/2} ${size} ${size}`);
        this.svg.style.display = 'block';
        this.svg.style.margin = '0 auto';
        this.svg.style.cursor = this.options.interactive ? 'pointer' : 'default';

        // Create groups for layering
        this.gridGroup = this.createGroup('grid');
        this.axesGroup = this.createGroup('axes');
        this.circleGroup = this.createGroup('circle');
        this.traceGroup = this.createGroup('trace');
        this.projectionGroup = this.createGroup('projections');
        this.angleGroup = this.createGroup('angle');
        this.pointGroup = this.createGroup('point');
        this.labelGroup = this.createGroup('labels');

        this.container.appendChild(this.svg);
    }

    createGroup(id) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', id);
        this.svg.appendChild(g);
        return g;
    }

    bindEvents() {
        if (!this.options.interactive) return;

        // Mouse events
        this.svg.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.svg.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.svg.addEventListener('mouseup', () => this.handlePointerUp());
        this.svg.addEventListener('mouseleave', () => this.handlePointerUp());

        // Touch events
        this.svg.addEventListener('touchstart', (e) => this.handlePointerDown(e), { passive: false });
        this.svg.addEventListener('touchmove', (e) => this.handlePointerMove(e), { passive: false });
        this.svg.addEventListener('touchend', () => this.handlePointerUp());
    }

    handlePointerDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.updateAngleFromEvent(e);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updateAngleFromEvent(e);
    }

    handlePointerUp() {
        this.isDragging = false;
    }

    updateAngleFromEvent(e) {
        const rect = this.svg.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Convert to SVG coordinates (centered)
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;

        // Calculate angle (note: y is inverted in screen coordinates)
        this.angle = Math.atan2(-y, x);

        // Add to trace if enabled
        if (this.options.showTrace) {
            this.tracePoints.push({
                x: this.options.radius * Math.cos(this.angle),
                y: -this.options.radius * Math.sin(this.angle)
            });
            // Limit trace length
            if (this.tracePoints.length > 500) {
                this.tracePoints.shift();
            }
        }

        this.draw();

        // Callback
        if (this.onAngleChange) {
            this.onAngleChange(this.angle, this.getValues());
        }
    }

    getValues() {
        const point = CircleEngine.pointOnCircle(this.angle);
        return {
            angle: this.angle,
            degrees: CircleEngine.toDegrees(this.angle),
            x: point.x,
            y: point.y,
            sin: point.y,
            cos: point.x,
            tan: point.y / point.x
        };
    }

    draw() {
        // Clear all groups
        this.clearGroup(this.gridGroup);
        this.clearGroup(this.axesGroup);
        this.clearGroup(this.circleGroup);
        this.clearGroup(this.traceGroup);
        this.clearGroup(this.projectionGroup);
        this.clearGroup(this.angleGroup);
        this.clearGroup(this.pointGroup);
        this.clearGroup(this.labelGroup);

        // Draw in order (back to front)
        if (this.options.showGrid) this.drawGrid();
        if (this.options.showAxes) this.drawAxes();
        this.drawCircle();
        if (this.options.showTrace) this.drawTrace();
        if (this.options.showAngle) this.drawAngle();
        if (this.options.showProjections) this.drawProjections();
        this.drawPoint();
        if (this.options.showCoordinates) this.drawLabels();
    }

    clearGroup(group) {
        while (group.firstChild) {
            group.removeChild(group.firstChild);
        }
    }

    drawGrid() {
        const r = this.options.radius;
        const step = r / 4;
        const color = this.options.colors.grid;

        // Vertical lines
        for (let x = -r; x <= r; x += step) {
            this.drawLine(this.gridGroup, x, -r * 1.2, x, r * 1.2, color, 1);
        }

        // Horizontal lines
        for (let y = -r; y <= r; y += step) {
            this.drawLine(this.gridGroup, -r * 1.2, y, r * 1.2, y, color, 1);
        }
    }

    drawAxes() {
        const r = this.options.radius * 1.3;
        const color = this.options.colors.axes;

        // X-axis
        this.drawLine(this.axesGroup, -r, 0, r, 0, color, 2);
        // Y-axis
        this.drawLine(this.axesGroup, 0, -r, 0, r, color, 2);

        // Arrow heads
        this.drawArrowHead(this.axesGroup, r, 0, 0, color);
        this.drawArrowHead(this.axesGroup, 0, -r, -90, color);
    }

    drawArrowHead(group, x, y, rotation, color) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M -6 -4 L 0 0 L -6 4');
        path.setAttribute('transform', `translate(${x}, ${y}) rotate(${rotation})`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        group.appendChild(path);
    }

    drawCircle() {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        circle.setAttribute('r', this.options.radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', this.options.colors.circle);
        circle.setAttribute('stroke-width', 2);
        this.circleGroup.appendChild(circle);

        // Center dot
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', 0);
        center.setAttribute('cy', 0);
        center.setAttribute('r', 4);
        center.setAttribute('fill', this.options.colors.circle);
        this.circleGroup.appendChild(center);
    }

    drawTrace() {
        if (this.tracePoints.length < 2) return;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${this.tracePoints[0].x} ${this.tracePoints[0].y}`;
        for (let i = 1; i < this.tracePoints.length; i++) {
            d += ` L ${this.tracePoints[i].x} ${this.tracePoints[i].y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.options.colors.trace);
        path.setAttribute('stroke-width', 3);
        path.setAttribute('stroke-linecap', 'round');
        this.traceGroup.appendChild(path);
    }

    drawAngle() {
        const r = this.options.radius;
        const arcRadius = r * 0.3;

        // Angle arc
        const startAngle = 0;
        const endAngle = -this.angle; // Negative because SVG y is inverted

        const startX = arcRadius * Math.cos(startAngle);
        const startY = arcRadius * Math.sin(startAngle);
        const endX = arcRadius * Math.cos(endAngle);
        const endY = arcRadius * Math.sin(endAngle);

        const largeArc = Math.abs(this.angle) > Math.PI ? 1 : 0;
        const sweep = this.angle >= 0 ? 0 : 1;

        const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arc.setAttribute('d', `M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${endX} ${endY}`);
        arc.setAttribute('fill', 'none');
        arc.setAttribute('stroke', this.options.colors.angle);
        arc.setAttribute('stroke-width', 20);
        this.angleGroup.appendChild(arc);

        // Angle fill (wedge)
        const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wedge.setAttribute('d', `M 0 0 L ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${endX} ${endY} Z`);
        wedge.setAttribute('fill', this.options.colors.angle);
        wedge.setAttribute('stroke', 'none');
        this.angleGroup.appendChild(wedge);

        // Radius line to point
        const px = r * Math.cos(this.angle);
        const py = -r * Math.sin(this.angle);
        this.drawLine(this.angleGroup, 0, 0, px, py, this.options.colors.circle, 2);
    }

    drawProjections() {
        const r = this.options.radius;
        const px = r * Math.cos(this.angle);
        const py = -r * Math.sin(this.angle);

        // Vertical projection (sin)
        this.drawLine(this.projectionGroup, px, py, px, 0, this.options.colors.projectionY, 2, '5,5');
        this.drawLine(this.projectionGroup, 0, 0, 0, py, this.options.colors.projectionY, 4);

        // Horizontal projection (cos)
        this.drawLine(this.projectionGroup, px, py, 0, py, this.options.colors.projectionX, 2, '5,5');
        this.drawLine(this.projectionGroup, 0, 0, px, 0, this.options.colors.projectionX, 4);

        // Projection points on axes
        const dotX = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dotX.setAttribute('cx', px);
        dotX.setAttribute('cy', 0);
        dotX.setAttribute('r', 5);
        dotX.setAttribute('fill', this.options.colors.projectionX);
        this.projectionGroup.appendChild(dotX);

        const dotY = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dotY.setAttribute('cx', 0);
        dotY.setAttribute('cy', py);
        dotY.setAttribute('r', 5);
        dotY.setAttribute('fill', this.options.colors.projectionY);
        this.projectionGroup.appendChild(dotY);
    }

    drawPoint() {
        const r = this.options.radius;
        const px = r * Math.cos(this.angle);
        const py = -r * Math.sin(this.angle);

        // Outer glow
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glow.setAttribute('cx', px);
        glow.setAttribute('cy', py);
        glow.setAttribute('r', 15);
        glow.setAttribute('fill', this.options.colors.point);
        glow.setAttribute('opacity', '0.3');
        this.pointGroup.appendChild(glow);

        // Main point
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', px);
        point.setAttribute('cy', py);
        point.setAttribute('r', 10);
        point.setAttribute('fill', this.options.colors.point);
        point.setAttribute('stroke', '#fff');
        point.setAttribute('stroke-width', 2);
        point.style.cursor = this.options.interactive ? 'grab' : 'default';
        this.pointGroup.appendChild(point);
    }

    drawLabels() {
        const r = this.options.radius;
        const values = this.getValues();
        const px = r * Math.cos(this.angle);
        const py = -r * Math.sin(this.angle);

        // Angle label
        const angleLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        angleLabel.setAttribute('x', 35);
        angleLabel.setAttribute('y', -15);
        angleLabel.setAttribute('fill', this.options.colors.circle);
        angleLabel.setAttribute('font-size', '14');
        angleLabel.setAttribute('font-family', 'monospace');
        angleLabel.textContent = `${values.degrees.toFixed(1)}°`;
        this.labelGroup.appendChild(angleLabel);

        // Coordinate labels
        if (this.options.showProjections) {
            // X (cos) label
            const cosLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cosLabel.setAttribute('x', px);
            cosLabel.setAttribute('y', 25);
            cosLabel.setAttribute('fill', this.options.colors.projectionX);
            cosLabel.setAttribute('font-size', '12');
            cosLabel.setAttribute('font-family', 'monospace');
            cosLabel.setAttribute('text-anchor', 'middle');
            cosLabel.textContent = `cos: ${values.cos.toFixed(2)}`;
            this.labelGroup.appendChild(cosLabel);

            // Y (sin) label
            const sinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sinLabel.setAttribute('x', -r - 10);
            sinLabel.setAttribute('y', py + 5);
            sinLabel.setAttribute('fill', this.options.colors.projectionY);
            sinLabel.setAttribute('font-size', '12');
            sinLabel.setAttribute('font-family', 'monospace');
            sinLabel.setAttribute('text-anchor', 'end');
            sinLabel.textContent = `sin: ${values.sin.toFixed(2)}`;
            this.labelGroup.appendChild(sinLabel);
        }
    }

    drawLine(group, x1, y1, x2, y2, color, width, dash = null) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', width);
        if (dash) {
            line.setAttribute('stroke-dasharray', dash);
        }
        group.appendChild(line);
    }

    // ===== Public API =====

    setAngle(angle) {
        this.angle = angle;
        this.draw();
        if (this.onAngleChange) {
            this.onAngleChange(this.angle, this.getValues());
        }
    }

    setAngleDegrees(degrees) {
        this.setAngle(CircleEngine.toRadians(degrees));
    }

    startAnimation() {
        if (this.animationId) return;

        const animate = () => {
            this.angle += 0.02 * this.options.animationSpeed;
            if (this.angle > CircleEngine.CONSTANTS.TAU) {
                this.angle -= CircleEngine.CONSTANTS.TAU;
            }

            if (this.options.showTrace) {
                this.tracePoints.push({
                    x: this.options.radius * Math.cos(this.angle),
                    y: -this.options.radius * Math.sin(this.angle)
                });
                if (this.tracePoints.length > 500) {
                    this.tracePoints.shift();
                }
            }

            this.draw();

            if (this.onAngleChange) {
                this.onAngleChange(this.angle, this.getValues());
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    clearTrace() {
        this.tracePoints = [];
        this.draw();
    }

    setOption(key, value) {
        if (key in this.options) {
            this.options[key] = value;
            this.draw();
        }
    }

    destroy() {
        this.stopAnimation();
        if (this.svg && this.svg.parentNode) {
            this.svg.parentNode.removeChild(this.svg);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CircleCanvas;
}
