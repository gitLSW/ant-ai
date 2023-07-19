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

  if (trainingMode) {
    const targetActor = await createActorModel()
    const critic = await createCriticModel()
    const targetCritic = await createCriticModel()

    const gym = new Gym(actor, targetActor, critic, targetCritic, field)

    var actorLosses = []
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

      logger.actor(JSON.stringify({ epoch, actorLoss, stats: getStats(actorLosses) }))
      logger.critic(JSON.stringify({ epoch, criticLoss, stats: getStats(criticLosses) }))

      if (epoch % 50 == 0) {
        gym.updateTargetActor()
        gym.updateTargetCritic()

        const now = new Date().toISOString()
        actor.save('actor_' + now)
        critic.save('critic_' + now)

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