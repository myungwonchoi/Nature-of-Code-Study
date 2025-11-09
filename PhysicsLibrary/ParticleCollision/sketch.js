const { Engine, Bodies, Composite, Constraint, Body, Vector } = Matter;

let engine;

let particles = [];
let wall;

function setup() {
  createCanvas(640, 480);
  engine = Engine.create();
  wall = new Boundary(width / 2, height - 5, width, 10);
  Matter.Events.on(engine, "collisionStart", handleCollisions);
}

function handleCollisions(event) {
  let particlesToAdd = []; // Store new particles to add after collision
  
  for (let pair of event.pairs) {
    let bodyA = pair.bodyA;
    let bodyB = pair.bodyB;

    //{!2} When we pull the "user data" object out of the Body object, we have to remind our program that it is a Particle object.  Box2D doesn't know this.
    let particleA = bodyA.plugin.particle;
    let particleB = bodyB.plugin.particle;
    
    //{!4} Once we have the particles, we can do anything to them.  Here we just call a function that changes their color.
    if (particleA instanceof Particle && particleB instanceof Particle) {
      // If both particles are large enough (radius > 3), shatter them
      if (particleA.radius > 3 && particleB.radius > 3) {
        particleA.change();
        particleB.change();
        // Shatter both particles
        let fragmentsA = particleA.shatter();
        let fragmentsB = particleB.shatter();
        particlesToAdd.push(...fragmentsA, ...fragmentsB);
        // Mark original particles for deletion
        particleA.markForDeletion();
        particleB.markForDeletion();
      } 
      // If both particles are small, delete both
      else if (particleA.radius <= 3 && particleB.radius <= 3) {
        particleA.markForDeletion();
        particleB.markForDeletion();
      }
      // If one is large and one is small, only delete the small one
      else {
        if (particleA.radius <= 3) {
          particleA.markForDeletion();
          particleB.change(); // Change color of large particle
        } else {
          particleB.markForDeletion();
          particleA.change(); // Change color of large particle
        }
      }
    }
  }
  
  // Add new particles to the array
  particles.push(...particlesToAdd);
}

function draw() {
  background(255);
  if (random(1) < 0.3) {
    particles.push(new Particle(random(width), 0));
  }
  Engine.update(engine);


  // Iterate over the boxes backwards
  for (let i = particles.length-1; i >= 0; i--) {
    particles[i].show();
    // Remove the Body from the world and the array
    // Check if particle fell off screen OR is marked for deletion
    if (particles[i].checkEdge() || particles[i].shouldDelete()) {
      particles[i].removeBody();
      particles.splice(i, 1);
    }
  }
  wall.show();
}
