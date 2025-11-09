// Projectile class to demonstrate Euler integration limitation
class Projectile {
  constructor(startX, startY, isEuler, timeStep = 1) {
    this.start = createVector(startX, startY);
    this.position = createVector(startX, startY);
    this.velocity = createVector(8, -12); // Initial velocity
    this.isEuler = isEuler;
    this.timeStep = timeStep; // Time step for Euler integration
    this.time = 0; // Track total time
    
    // Store path points
    this.points = [];
    this.points.push(this.position.copy());
  }
  
  update() {
    if (this.isEuler) {
      // Euler integration: discrete time steps
      this.updateEuler();
    } else {
      // Analytical solution: continuous real-world physics
      this.updateAnalytical();
    }
  }
  
  updateEuler() {
    // Euler method with adjustable time step
    // Smaller time steps = more accurate
    let gravity = createVector(0, 0.5);
    
    // Apply multiple sub-steps for smaller time increments
    for (let i = 0; i < this.timeStep; i++) {
      let dt = 1.0 / this.timeStep;
      this.velocity.add(p5.Vector.mult(gravity, dt));
      this.position.add(p5.Vector.mult(this.velocity, dt));
    }
    
    this.time++;
    // Store point for visualization
    this.points.push(this.position.copy());
  }
  
  updateAnalytical() {
    // Real-world physics: smooth parabolic curve
    // This represents the "actual" trajectory
    this.time++;
    let t = this.time * 1.0; // time
    let v0x = 8;
    let v0y = -12;
    let g = 0.5;
    
    // Physics equations: x = x0 + v0x*t, y = y0 + v0y*t + 0.5*g*t^2
    this.position.x = this.start.x + v0x * t;
    this.position.y = this.start.y + v0y * t + 0.5 * g * t * t;
    
    this.points.push(this.position.copy());
  }
  
  setTimeStep(step) {
    this.timeStep = step;
  }
  
  isOffScreen() {
    return this.position.y > height + 50;
  }
  
  show() {
    if (this.isEuler) {
      // Draw Euler path with straight line segments (like the image)
      stroke(255, 100, 100);
      strokeWeight(3);
      noFill();
      
      for (let i = 0; i < this.points.length - 1; i++) {
        line(this.points[i].x, this.points[i].y, 
             this.points[i + 1].x, this.points[i + 1].y);
      }
      
      // Draw points at each time step
      // More time steps = more points visible
      fill(255, 100, 100);
      noStroke();
      let pointInterval = max(1, floor(5 / this.timeStep)); // Adjust interval based on timeStep
      for (let i = 0; i < this.points.length; i += pointInterval) {
        circle(this.points[i].x, this.points[i].y, 8);
      }
    } else {
      // Draw smooth real-world curve
      stroke(100, 200, 255);
      strokeWeight(2);
      noFill();
      
      beginShape();
      for (let p of this.points) {
        curveVertex(p.x, p.y);
      }
      endShape();
    }
  }
}
