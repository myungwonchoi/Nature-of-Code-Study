// Euler Integration Limitation Demo
// Visualizes the difference between Euler approximation and real-world physics

let eulerProjectile;
let realWorldProjectile;
let showGrid = true;
let timeStep = 1; // Controls Euler accuracy (1 = least accurate, higher = more accurate)

function setup() {
  createCanvas(900, 600);
  
  // Starting position
  let startX = 100;
  let startY = height - 100;
  
  // Create two projectiles with same initial conditions
  eulerProjectile = new Projectile(startX, startY, true, timeStep);
  realWorldProjectile = new Projectile(startX, startY, false);
}

function mouseWheel(event) {
  // Adjust time step with mouse wheel
  // Scroll up (negative delta) = smaller time steps = more accurate
  // Scroll down (positive delta) = larger time steps = less accurate
  if (event.delta < 0) {
    timeStep = min(timeStep + 1, 50); // Max 50 substeps
  } else {
    timeStep = max(timeStep - 1, 1); // Min 1 substep
  }
  
  // Reset simulation with new time step
  let startX = 100;
  let startY = height - 100;
  eulerProjectile = new Projectile(startX, startY, true, timeStep);
  realWorldProjectile = new Projectile(startX, startY, false);
  
  // Prevent default scrolling behavior
  return false;
}

function draw() {
  background(30);
  
  // Draw coordinate axes
  drawAxes();
  
  // Update projectiles if not off screen
  if (!eulerProjectile.isOffScreen()) {
    eulerProjectile.update();
  }
  if (!realWorldProjectile.isOffScreen()) {
    realWorldProjectile.update();
  }
  
  // Draw the real-world smooth curve first (background)
  realWorldProjectile.show();
  
  // Draw Euler approximation on top (foreground)
  eulerProjectile.show();
  
  // Display information
  displayInfo();
  
  // Display legend
  displayLegend();
}

function drawAxes() {
  // Draw subtle grid
  if (showGrid) {
    stroke(60);
    strokeWeight(1);
    for (let x = 0; x < width; x += 50) {
      line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 50) {
      line(0, y, width, y);
    }
  }
  
  // Draw main axes
  stroke(150);
  strokeWeight(2);
  
  // X-axis
  line(50, height - 50, width - 50, height - 50);
  fill(150);
  noStroke();
  triangle(width - 50, height - 50, width - 60, height - 55, width - 60, height - 45);
  
  // Y-axis
  stroke(150);
  strokeWeight(2);
  line(50, height - 50, 50, 50);
  fill(150);
  noStroke();
  triangle(50, 50, 45, 60, 55, 60);
}

function displayInfo() {
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(18);
  textStyle(BOLD);
  
  text('Euler Integration vs Real World', 20, 30);
  
  textSize(14);
  textStyle(NORMAL);
  fill(200);
  text('The Euler approximation uses discrete time steps,', 20, 55);
  text('creating straight line segments instead of a smooth curve.', 20, 75);
  
  // Display current time step
  fill(100, 255, 150);
  textSize(16);
  textStyle(BOLD);
  text('Time Steps per Frame: ' + timeStep, 20, 110);
  
  fill(150, 220, 180);
  textSize(12);
  textStyle(NORMAL);
  text('Scroll Mouse Wheel: Up = More Accurate, Down = Less Accurate', 20, 130);
}

function displayLegend() {
  let x = width - 320;
  let y = 20;
  let lineHeight = 25;
  
  // Background box
  fill(40, 40, 40, 200);
  noStroke();
  rect(x - 10, y - 5, 310, 140, 8);
  
  // Euler integration
  fill(255, 100, 100);
  circle(x + 10, y + 15, 12);
  stroke(255, 100, 100);
  strokeWeight(3);
  line(x + 20, y + 15, x + 50, y + 15);
  
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(14);
  text('Euler Integration', x + 60, y + 20);
  
  fill(200);
  textSize(11);
  text('Discrete time steps: ' + timeStep, x + 60, y + 35);
  text('velocity += acceleration * dt', x + 60, y + 50);
  text('position += velocity * dt', x + 60, y + 65);
  
  // Real world
  y += 90;
  stroke(100, 200, 255);
  strokeWeight(2);
  noFill();
  line(x + 10, y + 15, x + 50, y + 15);
  
  fill(255);
  noStroke();
  text('Real World (Analytical)', x + 60, y + 20);
  
  fill(200);
  textSize(11);
  text('Continuous smooth curve', x + 60, y + 35);
  text('Perfect parabolic trajectory', x + 60, y + 50);
}

function keyPressed() {
  if (key === ' ') {
    // Reset simulation
    let startX = 100;
    let startY = height - 100;
    eulerProjectile = new Projectile(startX, startY, true, timeStep);
    realWorldProjectile = new Projectile(startX, startY, false);
  } else if (key === 'g' || key === 'G') {
    showGrid = !showGrid;
  } else if (key === '+' || key === '=') {
    // Increase time steps (more accurate)
    timeStep = min(timeStep + 1, 20);
    let startX = 100;
    let startY = height - 100;
    eulerProjectile = new Projectile(startX, startY, true, timeStep);
    realWorldProjectile = new Projectile(startX, startY, false);
  } else if (key === '-' || key === '_') {
    // Decrease time steps (less accurate)
    timeStep = max(timeStep - 1, 1);
    let startX = 100;
    let startY = height - 100;
    eulerProjectile = new Projectile(startX, startY, true, timeStep);
    realWorldProjectile = new Projectile(startX, startY, false);
  }
}

function mousePressed() {
  // Reset on click
  let startX = 100;
  let startY = height - 100;
  eulerProjectile = new Projectile(startX, startY, true, timeStep);
  realWorldProjectile = new Projectile(startX, startY, false);
}
