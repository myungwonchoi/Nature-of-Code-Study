class Particle {
  constructor(x, y, r) {
    // If radius is not provided, use a random value
    this.radius = r || random(6, 12);
    this.col = color(127);
    this.toDelete = false; // Flag to mark for deletion

    let options = {
      restitution: 0.6,
    };
    this.body = Bodies.circle(x, y, this.radius, options);

    this.body.plugin.particle = this;

    Composite.add(engine.world, this.body);
  }

  // Change color when hit
  change() {
    this.col = color(random(100, 255), 0, random(100, 255));
  }
  
  // Mark particle for deletion
  markForDeletion() {
    this.toDelete = true;
  }
  
  // Check if particle should be deleted
  shouldDelete() {
    return this.toDelete;
  }
  
  // Shatter into smaller particles
  shatter() {
    let newParticles = [];
    // Only shatter if the particle is large enough (radius > 3)
    if (this.radius > 3) {
      // Create 3-5 smaller particles
      let numFragments = floor(random(3, 6));
      for (let i = 0; i < numFragments; i++) {
        // New radius is between 1/3 and 1/2 of original
        let newRadius = this.radius / random(2, 3);
        // Add some random offset to position
        let offsetX = random(-this.radius, this.radius);
        let offsetY = random(-this.radius, this.radius);
        let newParticle = new Particle(
          this.body.position.x + offsetX, 
          this.body.position.y + offsetY, 
          newRadius
        );
        // Give the fragments some initial velocity
        let angle = random(TWO_PI);
        let force = p5.Vector.fromAngle(angle).mult(random(0.00003, 0.0001));
        Body.applyForce(newParticle.body, newParticle.body.position, {x: force.x, y: force.y});
        newParticles.push(newParticle);
      }
    }
    return newParticles;
  }
  
  
  checkEdge() {
    return this.body.position.y > height + this.radius;
  }
  
    // This function removes a body from the Matter.js world.
  removeBody() {
    Composite.remove(engine.world, this.body);
  }


  // Drawing the box
  show() {
    rectMode(CENTER);
    fill(this.col);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    circle(0, 0, this.radius * 2);
    line(0, 0, this.radius, 0);
    pop();
  }
}
