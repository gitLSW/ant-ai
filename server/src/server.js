Error.stackTraceLimit = Infinity;
const Matter = require("matter-js");
const Gym = require("./gym")
// const Game = require("./game")
const Field = require("./field")
const { getStats } = require('./utils')
const { createActorModel, createCriticModel } = require('./ai-model')
const logger = require('./logger')
// const express = require("express");
// const createSocket = require("socket.io")
// const http = require("http")

// const app = express()
// app.use(express.static("public"));
// const server = http.createServer(app);
// const io = createSocket(server);

async function start() {
  const engine = Matter.Engine.create();

  const worldSize = { width: 1000, height: 1000 }
  const field = new Field(worldSize, engine)

  const trainingMode = true
  const actor = await createActorModel()

  const statsBufferSize = 400 // If the mean is not changing, decrease this to see if it is just fluctuating (Not good)

  if (trainingMode) {
    const targetActor = await createActorModel()
    const critic = await createCriticModel()
    const targetCritic = await createCriticModel()

    const gym = new Gym(actor, targetActor, critic, targetCritic, field)

    var minActorLoss = 1.6 // Establish BAseline by looking at the output
    var actorLosses = []

    var minCriticLoss = 3.8166921131871407 // Establish Bseline by looking at the output
    var criticLosses = []
    // for (let epoch = 0; epoch < 500; epoch++) {
    var epoch = 0
    while (true) {
      epoch += 1

      const score = await gym.collectSamples()
      console.log('Epoch:', epoch, 'Score:', score, '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
      const { actorLoss, criticLoss } = await gym.train()

      actorLosses.push(actorLoss)
      criticLosses.push(criticLoss)

      logger.actor(JSON.stringify({ epoch, actorLoss, ...getStats(actorLosses), score }))
      logger.critic(JSON.stringify({ epoch, criticLoss, ...getStats(criticLosses) }))

      if (statsBufferSize < epoch) {
        actorLosses.shift()
        criticLosses.shift()
      }


      if (150 < epoch && Math.abs(actorLoss) < minActorLoss) {
        minActorLoss = Math.abs(actorLoss)
        actor.save('actor', minActorLoss)
      }

      if (150 < epoch && Math.abs(criticLoss) < minCriticLoss) {
        minCriticLoss = Math.abs(criticLoss)
        actor.save('critic', minCriticLoss)
      }

      if (epoch % 10 == 0) {
        gym.updateTargetActor()
        gym.updateTargetCritic()

        actor.save('actor')
        critic.save('critic')

        // const data = [
        //   {
        //     x: [...Array(epoch).keys()],
        //     y: actorLosses,
        //     type: 'scatter',
        //   },
        //   {
        //     x: [...Array(epoch).keys()],
        //     y: criticLosses,
        //     type: 'scatter',
        //   },
        // ];

        // plot(data);
      }
    }
  } else {
    // const game = new Game(actor, field)
    // const score = game.playRound()
    // console.log('Score:', score)
  }
}

start()

// io.on("connection", socket => {
//   console.log('CONNECTION')
//   start()

//   // socket.on("disconnect", () => --online);
//   // socket.on("register", cb => cb({ canvas }));
//   // socket.on("player click", coordinates => {
//   //   entities.boxes.forEach(box => {
//   //     // servers://stackoverflow.com/a/50472656/6243352
//   //     const force = 0.01;
//   //     const deltaVector = Matter.Vector.sub(box.position, coordinates);
//   //     const normalizedDelta = Matter.Vector.normalise(deltaVector);
//   //     const forceVector = Matter.Vector.mult(normalizedDelta, force);
//   //     Matter.Body.applyForce(box, box.position, forceVector);
//   //   });
//   // });
// });

// app.get('/', async (req, res) => {
//   res.sendFile(__dirname + '/client/renderer.html')
// })


// server.listen(4000, () => {
//   console.log("server listening on " + 4000)
// });