const { sampleSize } = require('lodash')
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
        return sampleSize(this.memories, nSamples);
        // var samples = []
        // var prevIndices = []
        // nSamples = Math.min([nSamples, this.maxMemory])
        // while (samples.length < nSamples) {
        //     const sampleIndex = getRandom(0, this.memories.length)

        //     console.log(prevIndices.includes(sampleIndex))

        //     if (prevIndices.includes(sampleIndex)) { continue }

        //     console.log(prevIndices.includes(sampleIndex))

        //     prevIndices.push(sampleIndex)
        //     samples.push(this.memories[sampleIndex])
        // }

        // return samples
    }
}


module.exports = Memory