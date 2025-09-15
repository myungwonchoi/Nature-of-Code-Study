// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// (Modified with enhancements)

class Vehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.r = 12; // 크기 증가 (8 -> 12)
    this.maxspeed = 8;
    this.maxforce = 0.2;  // 0.01에서 0.2로 증가
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

    // 몸체 (삼각형) - 더 밝은 색상으로 변경
    fill(100, 160, 220);  // 밝은 스틸블루 색상
    stroke(255);  // 흰색 테두리
    strokeWeight(2);
    beginShape();
    vertex(this.r * 2, 0);
    vertex(-this.r * 2, -this.r);
    vertex(-this.r * 2, this.r);
    endShape(CLOSE);

    // 귀여운 눈 👀 - 크기 조정
    fill(255);
    noStroke();
    ellipse(-this.r * 0.5, -this.r * 0.6, this.r * 1.2, this.r * 1.2);
    ellipse(-this.r * 0.5, this.r * 0.6, this.r * 1.2, this.r * 1.2);
    fill(0);
    ellipse(-this.r * 0.3, -this.r * 0.6, this.r * 0.6, this.r * 0.6);
    ellipse(-this.r * 0.3, this.r * 0.6, this.r * 0.6, this.r * 0.6);

    pop();
  }

  drawArrow(base, vec, color) {
      push();
      stroke(color);
      strokeWeight(3);  // 선 굵기 증가
      fill(color);
      
      // 선 그리기
      line(base.x, base.y, base.x + vec.x, base.y + vec.y);
      
      // 화살표 머리 그리기
      push();
      translate(base.x + vec.x, base.y + vec.y);
      rotate(vec.heading());
      
      // 삼각형으로 화살표 머리 그리기
      const arrowSize = 8;
      triangle(0, 0, -arrowSize, arrowSize/2, -arrowSize, -arrowSize/2);
      pop();
      
      pop();
  }

  // 힘 시각화 (디버깅용)
  debugDraw(target) {
    const scale = 20;
    
    // 벡터 색상 정의
    const desiredColor = color(120, 255, 120);    // 초록색 (desired)
    const velocityColor = color(255, 90, 90);   // 빨간색 (velocity)
    const steerColor = color(100, 100, 255);      // 파란색 (steering)
    const negVelocityColor = color(255, 180, 180);// 연한 빨간색 (-velocity)

    // 원본 벡터 계산 (시각화용 복사본 생성)
    let desired = p5.Vector.sub(target, this.position);
    let desiredNorm = desired.copy().normalize().mult(this.maxspeed * 0.5);
    let velocityVis = this.velocity.copy();
    
    // 시각화를 위한 벡터 스케일링
    let desiredScaled = desiredNorm.copy().mult(scale);
    let velocityScaled = velocityVis.copy().mult(scale);
    
    // -velocity 벡터 계산
    let negVelocityVis = velocityVis.copy().mult(-1);
    let negVelocityStart = p5.Vector.add(this.position, desiredScaled.copy());
    let negVelocityScaled = negVelocityVis.copy().mult(scale);
    
    // steering 벡터 계산
    let steerVis = p5.Vector.sub(desiredNorm, velocityVis);
    //steerVis.limit(this.maxforce);
    let steerScaled = steerVis.copy().mult(scale);

    // Vehicle 그리기
    this.show();

    // 화살표 그리기
    this.drawArrow(this.position, desiredScaled, desiredColor);
    this.drawArrow(this.position, velocityScaled, velocityColor);
    this.drawArrow(this.position, steerScaled, steerColor);
    this.drawArrow(negVelocityStart, negVelocityScaled, negVelocityColor);
}

  // 이동 경로(족적) 그리기
  displayPath() {
    stroke(255, 200);  // 경로 색상 더 밝게
    noFill();
    strokeWeight(1.5);
    beginShape();
    for (let v of this.path) {
      vertex(v.x, v.y);
    }
    endShape();
  }
}