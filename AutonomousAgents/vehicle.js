// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// (Modified with enhancements)

class Vehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.r = 8; // 크기
    this.maxspeed = 8;
    this.maxforce = 0.2;
    this.path = []; // 이동 경로를 저장할 배열
    this.stopped = false; // 정지 상태 플래그
  }

  // 정지 상태 확인
  isStopped() {
    return this.stopped;
  }

  // Vehicle 정지
  stop() {
    this.stopped = true;
  }

  // 위치 업데이트
  update() {
    // 정지 상태이면 업데이트 중단
    if (this.stopped) {
      this.velocity.mult(0); // 혹시 모를 잔여 속도 제거
      return;
    }

    // 물리 법칙에 따라 위치 업데이트
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // 매 프레임 가속도 초기화

    // 현재 위치를 경로 배열에 추가
    if (this.velocity.mag() > 0.1) { // 조금이라도 움직일 때만 추가
      this.path.push(this.position.copy());
    }
  }

  // 힘 적용
  applyForce(force) {
    this.acceleration.add(force);
  }

  // 목표를 향한 조향력 계산 (STEER = DESIRED - VELOCITY)
  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  // Vehicle 그리기
  show() {
    let angle = this.velocity.heading();
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);

    // 몸체 (삼각형)
    fill(100, 150, 200);
    stroke(0);
    strokeWeight(1);
    beginShape();
    vertex(this.r * 2, 0);
    vertex(-this.r * 2, -this.r);
    vertex(-this.r * 2, this.r);
    endShape(CLOSE);

    // 귀여운 눈 👀
    fill(255);
    noStroke();
    ellipse(-this.r * 0.5, -this.r * 0.6, this.r, this.r);
    ellipse(-this.r * 0.5, this.r * 0.6, this.r, this.r);
    fill(0);
    ellipse(-this.r * 0.3, -this.r * 0.6, this.r * 0.5, this.r * 0.5);
    ellipse(-this.r * 0.3, this.r * 0.6, this.r * 0.5, this.r * 0.5);

    pop();
  }

  // 이동 경로(족적) 그리기
  displayPath() {
    stroke(0, 50); // 반투명 검은색
    noFill();
    strokeWeight(1.5);
    beginShape();
    for (let v of this.path) {
      vertex(v.x, v.y);
    }
    endShape();
  }

  // 힘 시각화 (디버깅용)
  debugDraw(target) {
    push();
    // 1. 현재 속도 (초록색)
    stroke(0, 255, 0);
    strokeWeight(2);
    line(this.position.x, this.position.y, this.position.x + this.velocity.x * 10, this.position.y + this.velocity.y * 10);

    // 2. 원하는 속도 (파란색)
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxspeed * 10);
    stroke(0, 0, 255, 150);
    strokeWeight(1);
    line(this.position.x, this.position.y, this.position.x + desired.x, this.position.y + desired.y);

    // 3. 조향력 (빨간색)
    let desiredForSteer = p5.Vector.sub(target, this.position).setMag(this.maxspeed);
    let steer = p5.Vector.sub(desiredForSteer, this.velocity);
    steer.limit(this.maxforce);
    steer.mult(100); // 화면에 잘 보이도록 증폭
    stroke(255, 0, 0);
    strokeWeight(2);
    line(this.position.x, this.position.y, this.position.x + steer.x, this.position.y + steer.y);
    pop();
  }
}