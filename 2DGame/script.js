class SimulationGame {
    constructor() {
        this.board = document.getElementById('simulation-board');
        this.components = [];
        this.isDragging = false;
        this.selectedComponent = null;
        this.gridSize = 40;
        
        this.initializeGrid();
        this.setupEventListeners();
        
        // Initialize connection handling
        this.setupConnectionPoints();
        
        // Add window resize handling
        window.addEventListener('resize', () => {
            this.initializeGrid();
        });
    }

    initializeGrid() {
        const boardRect = this.board.getBoundingClientRect();
        const rows = Math.floor(boardRect.height / this.gridSize);
        const cols = Math.floor(boardRect.width / this.gridSize);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.style.left = `${j * this.gridSize}px`;
                cell.style.top = `${i * this.gridSize}px`;
                this.board.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        // Setup drag and drop from toolbox
        const components = document.querySelectorAll('.component');
        components.forEach(component => {
            component.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', component.dataset.type);
            });
        });

        // Setup board events
        this.board.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.board.addEventListener('drop', (e) => {
            e.preventDefault();
            const componentType = e.dataTransfer.getData('text/plain');
            const rect = this.board.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createComponent(componentType, x, y);
        });
    }

    createComponent(type, x, y) {
        // Snap to grid
        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;

        const component = document.createElement('div');
        component.className = 'component-instance';
        component.dataset.type = type;
        component.style.left = `${snappedX}px`;
        component.style.top = `${snappedY}px`;
        component.textContent = ''; // Remove the text content

        // Add visual representation based on component type
        const visual = document.createElement('div');
        visual.className = 'component-visual';
        
        switch(type) {
            case 'pushbutton':
                visual.innerHTML = `
                    <svg viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="15" fill="#ecf0f1" stroke="#7f8c8d" stroke-width="2"/>
                        <circle cx="20" cy="20" r="10" fill="#bdc3c7"/>
                    </svg>
                `;
                break;
            case 'relay':
                visual.innerHTML = `
                    <svg viewBox="0 0 40 40">
                        <rect x="5" y="10" width="30" height="20" fill="#f0f9ff" stroke="#3498db" stroke-width="2" rx="2"/>
                        <line x1="10" y1="20" x2="30" y2="20" stroke="#3498db" stroke-width="2"/>
                    </svg>
                `;
                break;
            // Add more component visualizations...
        }

        component.appendChild(visual);

        // Make component draggable
        component.draggable = true;
        this.setupComponentDrag(component);

        // Add connection points based on component type
        this.addConnectionPoints(component, type);

        this.board.appendChild(component);
        this.components.push(component);
    }

    setupComponentDrag(component) {
        let isDragging = false;
        let startX, startY;

        component.addEventListener('mousedown', (e) => {
            isDragging = true;
            component.classList.add('dragging');
            
            const rect = component.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            
            component.style.zIndex = 1000;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const boardRect = this.board.getBoundingClientRect();
            let newX = e.clientX - boardRect.left - startX;
            let newY = e.clientY - boardRect.top - startY;

            // Snap to grid
            newX = Math.round(newX / this.gridSize) * this.gridSize;
            newY = Math.round(newY / this.gridSize) * this.gridSize;

            component.style.left = `${newX}px`;
            component.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                component.classList.remove('dragging');
                component.style.zIndex = '';
            }
        });
    }

    addConnectionPoints(component, type) {
        // Add appropriate connection points based on component type
        switch(type) {
            case 'pushbutton':
                this.addConnectionPoint(component, 'left');
                this.addConnectionPoint(component, 'right');
                break;
            case 'relay':
                this.addConnectionPoint(component, 'left');
                this.addConnectionPoint(component, 'right');
                this.addConnectionPoint(component, 'top');
                break;
            // Add more cases for other component types
        }
    }

    addConnectionPoint(component, position) {
        const point = document.createElement('div');
        point.className = 'connection-point';
        
        switch(position) {
            case 'left':
                point.style.left = '-4px';
                point.style.top = '50%';
                point.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                point.style.right = '-4px';
                point.style.top = '50%';
                point.style.transform = 'translateY(-50%)';
                break;
            case 'top':
                point.style.top = '-4px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
                break;
            case 'bottom':
                point.style.bottom = '-4px';
                point.style.left = '50%';
                point.style.transform = 'translateX(-50%)';
                break;
        }

        component.appendChild(point);
    }

    setupConnectionPoints() {
        let startPoint = null;
        let connectionLine = null;

        const connectionPoints = document.querySelectorAll('.connection-point');
        
        connectionPoints.forEach(point => {
            point.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                startPoint = point;
                
                connectionLine = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                connectionLine.style.position = 'absolute';
                connectionLine.style.top = '0';
                connectionLine.style.left = '0';
                connectionLine.style.width = '100%';
                connectionLine.style.height = '100%';
                connectionLine.style.pointerEvents = 'none';
                
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('stroke', '#3498db');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                
                connectionLine.appendChild(path);
                this.board.appendChild(connectionLine);
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!startPoint || !connectionLine) return;

            const path = connectionLine.querySelector('path');
            const startRect = startPoint.getBoundingClientRect();
            const boardRect = this.board.getBoundingClientRect();

            const startX = startRect.left + startRect.width / 2 - boardRect.left;
            const startY = startRect.top + startRect.height / 2 - boardRect.top;
            const endX = e.clientX - boardRect.left;
            const endY = e.clientY - boardRect.top;

            path.setAttribute('d', `M ${startX} ${startY} C ${startX} ${endY}, ${startX} ${endY}, ${endX} ${endY}`);
        });

        document.addEventListener('mouseup', () => {
            if (connectionLine) {
                connectionLine.remove();
            }
            startPoint = null;
            connectionLine = null;
        });
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new SimulationGame();
});
