// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Vehicle object

class Vehicle {
  constructor(x, y) {
    // All the usual stuff
    this.position = createVector(x, y);
    this.r = 6;
    this.maxspeed = 6; // Maximum speed (증가: 3 → 6)
    this.maxforce = 0.4; // Maximum steering force (증가: 0.2 → 0.4)
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
  }

  applyBehaviors(vehicles, separateWeight, seekWeight) {
    let separateForce = this.separate(vehicles);
    let seekForce = this.seek(createVector(mouseX, mouseY));

    // 슬라이더 값을 사용하여 가중치 적용
    separateForce.mult(separateWeight);
    seekForce.mult(seekWeight);

    this.applyForce(separateForce);
    this.applyForce(seekForce);
  }

  applyForce(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  }

  // Separation
  // Method checks for nearby vehicles and steers away
  separate(vehicles) {
    let desiredSeparation = this.r * 2;
    let sum = createVector();
    let count = 0;
    // For every vehicle in the system, check if it's too close
    for (let other of vehicles) {
      let d = p5.Vector.dist(this.position, other.position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (this != other && d < desiredSeparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.position, other.position);
        diff.setMag(1 / d); // Weight by distance
        sum.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      sum.div(count);
      // Our desired vector is the average scaled to maximum speed
      sum.setMag(this.maxspeed);
      // Implement Reynolds: Steering = Desired - Velocity
      sum.sub(this.velocity);
      sum.limit(this.maxforce);
    }
    return sum;
  }

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  seek(target) {
    let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus velocity
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }

  // Method to update location
  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
  }

  show() {
    fill(127);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.position.x, this.position.y);
    circle(0, 0, this.r * 2);
    pop();
  }

  // Wraparound
  borders() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }
}
