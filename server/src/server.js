Error.stackTraceLimit = Infinity;

const express = require("express");
const Matter = require("matter-js");
const Gym = require("./gym")
// const Game = require("./game")
const Field = require("./field")
const { createActorModel, createCriticModel } = require('./ai-model')

// CLEAN UP UNDISPOSED TENSORS:
// The way to clean any unused tensors in async code is to wrap the code that creates them between a startScope() and an endScope() call.
// tf.engine().startScope()
// tf.engine().endScope()

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

const canvas = { width: 300, height: 200 };
let online = 0;




const engine = Matter.Engine.create();

const worldSize = { width: 1000, height: 1000 }
const field = new Field(worldSize, engine)

async function start() {
  const trainingMode = true
  const actor = await createActorModel()

  if (trainingMode) {
    const critic = await createCriticModel()
    const gym = new Gym(actor, critic, field, io)
    
    for (let epoch = 0; epoch < 20; epoch++) {
      const score = await gym.collectSamples()
      console.log('Score:', score)
      const { actorLoss, criticLoss } = await gym.train()

      console.log('Actor Loss:', actorLoss)
      console.log('Critic Loss:', criticLoss)

      if (epoch % 3 === 0) {
        const now = new Date().toISOString()
        actor.save('actor_' + now)
        critic.save('critic_' + now)
      }
    }
  } else {
    // const game = new Game(actor, field)
    // const score = game.playRound()
    // console.log('Score:', score)
  }
}

start()






io.on("connection", socket => {
  online++;
  socket.on("disconnect", () => --online);
  socket.on("register", cb => cb({ canvas }));
  socket.on("player click", coordinates => {
    entities.boxes.forEach(box => {
      // servers://stackoverflow.com/a/50472656/6243352
      const force = 0.01;
      const deltaVector = Matter.Vector.sub(box.position, coordinates);
      const normalizedDelta = Matter.Vector.normalise(deltaVector);
      const forceVector = Matter.Vector.mult(normalizedDelta, force);
      Matter.Body.applyForce(box, box.position, forceVector);
    });
  });
});

server.listen(process.env.PORT, () =>
  console.log("server listening on " + process.env.PORT)
);