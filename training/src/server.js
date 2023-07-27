Error.stackTraceLimit = Infinity;
const Matter = require("matter-js");
const Gym = require("./gym")
// const Game = require("./game")
const Field = require("./field")
const { getStats } = require('./utils')
const { createActorModel, createCriticModel } = require('./ai-model')
const logger = require('./logger')


async function start() {
  const engine = Matter.Engine.create();

  const worldSize = { width: 1000, height: 1000 }
  const field = new Field(worldSize, engine)

  const trainingMode = true
  const actor = await createActorModel()

  const statsBufferSize = 500 // If the mean is not changing, decrease this to see if it is just fluctuating (Not good)

  if (trainingMode) {
    const targetActor = await createActorModel()
    const critic = await createCriticModel()
    const targetCritic = await createCriticModel()

    const gym = new Gym(actor, targetActor, critic, targetCritic, field)

    var actorLog = []
    var criticLog = []
    // for (let epoch = 0; epoch < 500; epoch++) {
    var epoch = 0
    while (true) {
      epoch += 1

      const score = await gym.collectSamples()
      console.log('Epoch:', epoch, 'Score:', score, '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
      const { actorLoss, criticLoss, criticEventCount } = await gym.train()

      actorLog.push(actorLoss)
      criticLog.push({ loss: criticLoss, eventCount: criticEventCount })

      logger.actor(JSON.stringify({
        epoch,
        actorLoss,
        ...getStats(actorLog),
        score
      }))

      logger.critic(JSON.stringify({
        epoch,
        criticLoss,
        ...getStats(criticLog.map(e => e.loss)),
        eventCount: criticEventCount,
        eventCountMean: getStats(criticLog.filter(e => e.eventCount === criticEventCount).map(e => e.loss)).mean,
        score
      }))
      
      if (statsBufferSize < epoch) {
        actorLog.shift()
        criticLog.shift()
      }

      if (epoch % 50 == 0) {
        gym.updateTargetActor()
        gym.updateTargetCritic()
      }

      if (epoch % 50 == 0) {
        actor.save('actor')
        critic.save('critic')
      }
    }
  } else {
    // const game = new Game(actor, field)
    // const score = game.playRound()
    // console.log('Score:', score)
  }
}

start()