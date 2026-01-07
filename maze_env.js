class MazeEnv {
    /**
     * Ambiente de laberinto para aprendizaje por refuerzo.
     */
    constructor(mazeContent, start = null, goal = null) {
        this.walls = new Set();
        this._loadMazeFromContent(mazeContent);

        // If user provides start/goal, override automatic ones
        this.start = start !== null ? start : this.autoStart;
        this.goal = goal !== null ? goal : this.autoGoal;

        this.state = this.start;
    }

    _loadMazeFromContent(content) {
        /**
         * Lee el contenido del laberinto.
         * Formato:
         * - Línea 1: n_rows n_cols
         * - Línea 2: k
         * - Siguientes k líneas: x1 y1 x2 y2 (coordenadas de vértices)
         */
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length === 0) {
            throw new Error("El archivo del laberinto está vacío");
        }

        const [origRows, origCols] = lines[0].split(/\s+/).map(Number);

        // Dimensions: cols is Width (X), rows is Height (Y)
        this.n_rows = origRows;
        this.n_cols = origCols;

        let k = parseInt(lines[1]) || 0;

        this.walls = new Set();

        for (let i = 0; i < k; i++) {
            if (lines[2 + i]) {
                const [y1, x1, y2, x2] = lines[2 + i].split(/\s+/).map(Number);

                // Store as [x, y] internally
                const p1 = [x1, y1];
                const p2 = [x2, y2];

                // Simplified serialization for Set matching
                const seg = this._serializeSegment(p1, p2);
                this.walls.add(seg);
            }
        }

        this._detectStartAndGoal();
    }

    _serializeSegment(p1, p2) {
        // Ensure consistent order for segments
        const sortPoints = (pa, pb) => {
            if (pa[0] < pb[0]) return [pa, pb];
            if (pa[0] > pb[0]) return [pb, pa];
            if (pa[1] < pb[1]) return [pa, pb];
            return [pb, pa];
        };
        const [sortedP1, sortedP2] = sortPoints(p1, p2);
        return `${sortedP1[0]},${sortedP1[1]}|${sortedP2[0]},${sortedP2[1]}`;
    }

    _detectStartAndGoal() {
        /**
         * Detect:
         * - start: open cell on left border
         * - goal: open cell on right border
         * Saves them as: this.autoStart, this.autoGoal
         */
        this.autoStart = [0, 0]; // Default fallback
        this.autoGoal = [this.n_rows - 1, this.n_cols - 1]; // Default fallback

        // ---------- LEFT BORDER (start) ----------
        for (let r = 0; r < this.n_rows; r++) {
            const p1 = [0, r];
            const p2 = [0, r + 1];
            const seg = this._serializeSegment(p1, p2);

            if (!this.walls.has(seg)) {   // open
                this.autoStart = [r, 0];
                break;
            }
        }

        // ---------- RIGHT BORDER (goal) ----------
        for (let r = 0; r < this.n_rows; r++) {
            const p1 = [this.n_cols, r];
            const p2 = [this.n_cols, r + 1];
            const seg = this._serializeSegment(p1, p2);

            if (!this.walls.has(seg)) {   // open
                this.autoGoal = [r, this.n_cols - 1];
                break;
            }
        }
    }

    reset() {
        /** Reinicia el ambiente al estado inicial y lo retorna. */
        this.state = this.start;
        return this.state;
    }

    isTerminal(state) {
        /** Retorna True si el estado es la meta. */
        return state[0] === this.goal[0] && state[1] === this.goal[1];
    }

    _edgeForMove(state, action) {
        /**
         * Devuelve el segmento correspondiente al borde
         * que se cruza al intentar ejecutar 'action' desde 'state'.
         */
        const [r, c] = state;
        let p1, p2;

        switch (action) {
            case "up":
                p1 = [c, r];
                p2 = [c + 1, r];
                break;
            case "down":
                p1 = [c, r + 1];
                p2 = [c + 1, r + 1];
                break;
            case "left":
                p1 = [c, r];
                p2 = [c, r + 1];
                break;
            case "right":
                p1 = [c + 1, r];
                p2 = [c + 1, r + 1];
                break;
            default:
                throw new Error(`Acción desconocida: ${action}`);
        }

        return this._serializeSegment(p1, p2);
    }

    _move(state, action) {
        /**
         * Calcula la celda destino SIN verificar paredes ni límites.
         */
        const [r, c] = state;
        let r2, c2;

        switch (action) {
            case "up":
                [r2, c2] = [r - 1, c];
                break;
            case "down":
                [r2, c2] = [r + 1, c];
                break;
            case "left":
                [r2, c2] = [r, c - 1];
                break;
            case "right":
                [r2, c2] = [r, c + 1];
                break;
            default:
                throw new Error(`Acción desconocida: ${action}`);
        }

        return [r2, c2];
    }

    step(action) {
        /**
         * Ejecuta una acción y actualiza el estado del ambiente.
         */
        if (!["up", "down", "left", "right"].includes(action)) {
            return [this.state, 0, false];
        }

        // 1) Verificar si la acción está bloqueada por una pared
        const edge = this._edgeForMove(this.state, action);
        const blocked = this.walls.has(edge);

        // 2) Intento de movimiento ignorando paredes
        const [r2, c2] = this._move(this.state, action);

        // 3) Verificar límites del tablero
        const outOfBounds = !(r2 >= 0 && r2 < this.n_rows && c2 >= 0 && c2 < this.n_cols);

        let nextState, reward;

        if (blocked || outOfBounds) {
            nextState = this.state;
            reward = -5.0;
        } else {
            nextState = [r2, c2];
            reward = -1.0;
        }

        let done = false;
        if (this.isTerminal(nextState)) {
            reward = 100.0;
            done = true;
        }

        this.state = nextState;
        return [nextState, reward, done];
    }

    getActions(state) {
        return ["up", "down", "left", "right"];
    }
}
