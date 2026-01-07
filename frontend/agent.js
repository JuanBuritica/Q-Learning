class QLearningAgent {
    /**
     * Agente que aprende a resolver el laberinto usando Q-learning.
     */
    constructor(env, options = {}) {
        this.env = env;
        this.alpha = options.alpha !== undefined ? options.alpha : 0.5;
        this.gamma = options.gamma !== undefined ? options.gamma : 0.99;
        this.epsilon = options.epsilon !== undefined ? options.epsilon : 1.0;
        this.epsilonMin = options.epsilonMin !== undefined ? options.epsilonMin : 0.01;
        this.epsilonDecay = options.epsilonDecay !== undefined ? options.epsilonDecay : 0.999;

        // Q-table: Map where key is string "row,col,action"
        this.q = {};
    }

    _getQKey(state, action) {
        return `${state[0]},${state[1]},${action}`;
    }

    getQ(state, action) {
        const key = this._getQKey(state, action);
        return this.q[key] !== undefined ? this.q[key] : 0.0;
    }

    bestAction(state) {
        const actions = this.env.getActions(state);
        const qValues = actions.map(a => this.getQ(state, a));
        const maxQ = Math.max(...qValues);
        const bestActions = actions.filter((a, i) => qValues[i] === maxQ);
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            const actions = this.env.getActions(state);
            return actions[Math.floor(Math.random() * actions.length)];
        }
        return this.bestAction(state);
    }

    update(state, action, reward, nextState, done) {
        const currentQ = this.getQ(state, action);
        let target;

        if (done) {
            target = reward;
        } else {
            const nextActions = this.env.getActions(nextState);
            const nextQValues = nextActions.map(a => this.getQ(nextState, a));
            const maxNextQ = Math.max(...nextQValues);
            target = reward + this.gamma * maxNextQ;
        }

        const newQ = currentQ + this.alpha * (target - currentQ);
        const key = this._getQKey(state, action);
        this.q[key] = newQ;
    }

    decayEpsilon() {
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
            if (this.epsilon < this.epsilonMin) {
                this.epsilon = this.epsilonMin;
            }
        }
    }
}
