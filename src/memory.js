const { getRandom } = require('./utils')

class Memory {
    // [{ aiInputTensor, aiOutputDirV, reward }]
    memories = new Array();

    /**
     * @param {number} maxMemory
     */
    constructor(maxMemory) {
        this.maxMemory = maxMemory;
    }

    /**
     * @param {Array} gameRound
     */
    record(gameRound) {
        this.memories.push(gameRound);
        if (this.memories.length > this.maxMemory) {
            let [state,,, nextState] = this.memories.shift();
            state.dispose();
            nextState.dispose();
        }
    }

    /**
     * @param {number} nSamples
     * @returns {Array} Randomly selected samples
     */
    sample(nSamples) {
        var samples = new Array(nSamples)
        var prevIndices = new Array(nSamples)
        while (samples.length < nSamples) {
            const sampleIndex = getRandom(0, this.memories.length)
            if (prevIndices.includes(sampleIndex)) return
            prevIndex.push(sampleIndex)
            samples.push(this.memories[sampleIndex])
        }

        return samples
    }
}


module.exports = Memory