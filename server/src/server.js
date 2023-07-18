Error.stackTraceLimit = Infinity;
const Matter = require("matter-js");
const Gym = require("./gym")
// const Game = require("./game")
const Field = require("./field")
const { createActorModel, createCriticModel } = require('./ai-model')
// const { plot } = require('nodeplotlib');

// CLEAN UP UNDISPOSED TENSORS:
// The way to clean any unused tensors in async code is to wrap the code that creates them between a startScope() and an endScope() call.
// tf.engine().startScope()
// tf.engine().endScope()

// const express = require("express");
// const app = express()
// const server = require("http").createServer(app);
// const io = require("socket.io")(server);

// app.use(express.static("public"));

const canvas = { width: 300, height: 200 };
let online = 0;


const engine = Matter.Engine.create();

const worldSize = { width: 1000, height: 1000 }
const field = new Field(worldSize, engine)

function getStats(array) {
  if (!Array.isArray(array)) {
    return new Error('Input must be a array.');
  }

  const sum = array.reduce((acc, val) => acc + val, 0);
  const mean = sum / array.length;

  const sd = Math.sqrt(array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (array.length - 1));

  return { sd, mean };
}

async function start() {
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

      console.log('Actor Loss:', actorLoss, 'Stats:', getStats(actorLosses))
      console.log('Critic Loss:', criticLoss, 'Stats:', getStats(criticLosses))

      if (epoch % 20 == 0) {
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
//   online++;
//   socket.on("disconnect", () => --online);
//   socket.on("register", cb => cb({ canvas }));
//   socket.on("player click", coordinates => {
//     entities.boxes.forEach(box => {
//       // servers://stackoverflow.com/a/50472656/6243352
//       const force = 0.01;
//       const deltaVector = Matter.Vector.sub(box.position, coordinates);
//       const normalizedDelta = Matter.Vector.normalise(deltaVector);
//       const forceVector = Matter.Vector.mult(normalizedDelta, force);
//       Matter.Body.applyForce(box, box.position, forceVector);
//     });
//   });
// });

// server.listen(process.env.PORT, () =>
//   console.log("server listening on " + process.env.PORT)
// );