/**
 * Life 클래스 - 생명체의 기본 동작을 정의하는 클래스
 * 위치, 속도, 가속도, 시야, 행동 패턴 등을 관리
 */
class Life {
  constructor(pos = new p5.Vector(random(-width / 2, width / 2), random(-height / 2, height / 2)), weight = null) {
    // 기본 물리 속성
    this.pos = pos;           // 위치 벡터
    this.vel = new p5.Vector(); // 속도 벡터
    this.acc = new p5.Vector(); // 가속도 벡터
    this.maxForce = 0.1;      // 최대 힘의 크기
    this.r = 20;              // 반지름
    this.theta = 0;           // 현재 각도
    this.angle;               // 각도 변수
    
    // 시야 관련 속성
    this.sightAngle = Math.PI * 0.4; // 시야 각도 (라디안)
    this.sightRange = 100;           // 시야 범위
    
    // 속도 관련 속성
    this.normalSpeed = 1;     // 일반 속도
    this.fastSpeed = 2;       // 빠른 속도

    // 초기속도
    this.vel.setMag(this.normalSpeed);
    this.vel.rotate(random(0, Math.PI * 2));

    // 주변 개체 관리
    this.boidsInSight = [];   // 시야 내의 다른 개체들
    this.mouseFollowing = false; // 마우스 추적 여부

    // 목표 및 무게 관련
    this.target = null;       // 추적할 목표 개체
    this.weightLimit = 30;    // 최대 무게 제한
    this.parts = [];          // 부속 부품들
    
    // 생명 관련 속성
    this.life = 0;            // 현재 생명력
    this.lifeSpan = 60 * 60 + random(-60,60);  // 최대 생명력

    // 배부름 관련 속성
    this.fullness = random(0.5, 1); // 배부름 정도

    // 번식 관련 속성
    this.birthInterval = 60 * 20; // 번식 간격
    this.birth = false;           // 번식 가능 여부

    // 무리짓기 속성 0~1 권장
    this.cohesionWeight = 0.6;
    this.alignWeight = 0.6;
    this.separateWeight = 0.9;
    this.avoidWeight = 1.0;
    
    // 초기화 메서드들 호출
    this.custom();
    this.init();
    if (weight) this.weight = weight;
    this.target_weight = this.weight;
    this.sight = this.weight + this.sightRange;
    this.maxSpeedTarget = this.maxSpeed = this.normalSpeed;
    this.birthTime = this.birthInterval + int(random(-5,30));
    
    // 초기 랜덤 힘 적용
    let force = p5.Vector.random2D();
    force.mult(random());
    this.applyForce(force);
  }

  /**
   * 커스터마이징 메서드 - 하위 클래스에서 오버라이드하여 특별한 속성 설정
   */
  custom() {

  }

  /**
   * 초기화 메서드 - 무게를 랜덤하게 설정
   */
  init() {
    this.weight = random(0, 0.3) * this.weightLimit + 5;
  }

  /**
   * 힘을 가속도에 적용하는 메서드
   * @param {p5.Vector} force - 적용할 힘 벡터
   */
  applyForce(force) {
    this.acc.add(force);
  }

  /**
   * 행동 패턴을 적용하는 메서드
   * 분리, 정렬, 응집, 추적, 회피 등의 행동을 조합하여 최종 힘을 계산
   * @param {Array} boids - 전체 개체 배열 (회피 행동에 전달)
   */
  applyBehaviors(boids) {
    this.findTarget(); // 목표 찾기
    
    var separate = this.separate(); // 분리 행동
    var align = this.align();       // 정렬 행동
    var cohesion = this.cohesion(); // 응집 행동
    var avoid = this.avoid(boids);  // 회피 행동 (전체 boids 배열 전달)

    // 목표가 있으면 추적 행동 적용
    if (this.target) {
      var seek = this.seek(this.target);
      seek.mult(setting.mouseFollow);
      this.applyForce(seek);
    }

    // 행동 가중치 적용 (현재는 모두 0으로 설정됨)
    separate.mult(this.separateWeight);
    align.mult(this.alignWeight);
    cohesion.mult(this.cohesionWeight);
    avoid.mult(this.avoidWeight); // 회피 행동은 항상 활성화

    // 계산된 힘들을 적용
    this.applyForce(separate);
    this.applyForce(align);
    this.applyForce(cohesion);
    this.applyForce(avoid);
  }

  /**
   * 목표를 향해 이동하는 seek 행동
   * @param {Object} target - 추적할 목표 객체 (pos 속성을 가져야 함)
   * @returns {p5.Vector} 조향력 벡터
   */
  seek(target) {
    // 목표와의 각도 차이 계산
    var angle = p5.Vector.sub(target.pos, this.pos);
    angle = angle.heading() - this.theta;
    
    // 각도 차이를 -π에서 π 사이로 정규화 (더 안정적인 방법)
    while (angle > PI) angle -= TWO_PI;
    while (angle < -PI) angle += TWO_PI;
    
    // 시야 범위와 각도 내에 있는지 확인
    if (this.pos.dist(target.pos) > 0 &&
      this.pos.dist(target.pos) < this.sight &&
      abs(angle) < this.sightAngle) {

      // 목표 방향으로의 원하는 속도 계산
      var desired = p5.Vector.sub(target.pos, this.pos);
      desired.setMag(this.maxSpeed);
      var steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
    } else {
      // 시야 밖이면 조향력 없음
      var steer = new p5.Vector(0, 0);
    }

    return steer;
  }

  /**
   * 정렬 행동 - 같은 종류의 개체들과 같은 방향으로 이동
   * @returns {p5.Vector} 정렬을 위한 속도 벡터
   */
  align(boids) {
    var sum = new p5.Vector();
    var count = 0;
    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      // 같은 종류이고 자신보다 크거나 같은 개체들의 속도를 평균화
      if (boid.name == this.name && boid.weight >= this.weight) {
        sum.add(this.boidsInSight[i].vel);
        count++;
      }
    }
    if (count > 0) sum.div(count);
    sum.setMag(this.maxSpeed);
    return sum;
  }

  /**
   * 응집 행동 - 같은 종류의 개체들의 중심으로 이동
   * @returns {p5.Vector} 응집을 위한 조향력 벡터
   */
  cohesion(boids) {
    var sum = new p5.Vector();
    var count = 0;
    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      // 같은 종류이고 자신보다 크거나 같은 개체들의 위치를 평균화
      if (boid.name == this.name && boid.weight >= this.weight) {
        sum.add(this.boidsInSight[i].pos);
        count++;
      }
    }
    if (count > 0) sum.div(count);
    // 평균 위치를 목표로 하는 seek 행동 반환
    return this.seek({
      pos: sum
    });
  }

  /**
   * 분리 행동 - 너무 가까운 같은 종류의 개체들로부터 멀어짐
   * @returns {p5.Vector} 분리를 위한 조향력 벡터
   */
  separate() {
    var desiredspeparation = this.r * 2; // 원하는 분리 거리 (반지름의 2배)
    var sum = new p5.Vector();
    var count = 0;
    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      // 같은 종류이고 너무 가까운 개체들에 대해 분리 행동 적용
      if (boid.name == this.name && this.pos.dist(boid.pos) < desiredspeparation) {
        // 너무 가까우면 반대 방향으로 이동
        var desired = p5.Vector.sub(boid.pos, this.pos);
        desired.setMag(-this.maxSpeed); // 반대 방향으로 최대 속도
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);

        sum.add(steer);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count); // 평균 분리력 계산
    }
    return sum;
  }
  
  /**
   * 목표 찾기 - 시야 내에서 자신보다 작은 다른 종류의 개체를 찾아 목표로 설정
   * 포식 행동을 위한 메서드
   */
  findTarget() {
    // 배부름이 70% 이상이면 목표 찾기 중단 (배가 부르면 사냥하지 않음)
    if(this.fullness >= 0.7) return;

    for (var i = 0; i < this.boidsInSight.length; i++) {
      let boid = this.boidsInSight[i];
      // 다른 종류이고, 살아있으며, 자신의 절반 크기보다 작은 개체를 찾음
      if (boid.name != this.name && boid.weight > 0 && boid.weight < this.weight / 2) {
        if (this.target) {
          // 이미 목표가 있으면 더 가까운 개체로 교체
          if (this.pos.dist(boid.pos) < this.pos.dist(this.target.pos)) this.target = boid;
        } else {
          this.target = boid; // 첫 번째 목표 설정
        }
        this.maxSpeedTarget = this.fastSpeed; // 목표를 찾으면 빠른 속도로 전환
      }
    }
  }

  /**
   * 회피 행동 - 자신의 두 배 이상 크기인 개체들과 자신을 추적 중인 포식자들로부터 멀어짐
   * @param {Array} boids - 전체 개체 배열 (QuadTree가 없을 때 사용)
   * @returns {p5.Vector} 회피를 위한 조향력 벡터
   */
  avoid(boids) {
    var sum = new p5.Vector();
    var count = 0;
    
    // QuadTree를 사용하여 시야 범위 내의 개체들을 효율적으로 찾기
    if (world.quadtree) {
      let candidates = world.quadtree.queryCircle(this.pos, this.sight);
      
      for (var i = 0; i < candidates.length; i++) {
        let boid = candidates[i];
        // 자기 자신은 제외
        if (boid === this || boid instanceof Plant) continue;
        
        // 다른 종류이고, 살아있으며, 거리 내에 있는 개체
        if (boid.name != this.name && boid.weight > 0) {
          var distance = this.pos.dist(boid.pos);
          
          if (distance < this.sight) {
            var avoidanceForce = new p5.Vector();
            var shouldAvoid = false;
            
            // 1. 자신의 두 배 이상 크기인 개체 회피
            if (boid.weight >= this.weight * 2) {
              shouldAvoid = true;
              // 회피 방향 계산 (반대 방향으로)
              var desired = p5.Vector.sub(this.pos, boid.pos);
              desired.normalize();
              
              // 거리에 반비례하여 회피력 강도 조정
              var avoidanceStrength = map(distance, 0, this.sight, 1.0, 0.1);
              desired.mult(this.maxSpeed * avoidanceStrength);
              
              avoidanceForce = p5.Vector.sub(desired, this.vel);
              avoidanceForce.limit(this.maxForce * 2); // 회피는 더 강한 힘 적용
            }
            
            // 2. 자신을 타겟으로 추적 중인 포식자 회피
            if (boid.target === this) {
              shouldAvoid = true;
              // 회피 방향 계산 (반대 방향으로)
              var desired = p5.Vector.sub(this.pos, boid.pos);
              desired.normalize();
              
              // 추적당하는 경우 더 강한 회피력 적용
              var avoidanceStrength = map(distance, 0, this.sight, 1.5, 0.2);
              desired.mult(this.maxSpeed * avoidanceStrength);
              
              var trackingAvoidanceForce = p5.Vector.sub(desired, this.vel);
              trackingAvoidanceForce.limit(this.maxForce * 3); // 추적당할 때는 더욱 강한 힘 적용
              
              // 두 회피력이 모두 있으면 더 강한 것을 사용
              if (avoidanceForce.mag() > 0) {
                avoidanceForce.add(trackingAvoidanceForce);
                avoidanceForce.limit(this.maxForce * 3);
              } else {
                avoidanceForce = trackingAvoidanceForce;
              }
            }
            
            if (shouldAvoid) {
              sum.add(avoidanceForce);
              count++;
              this.maxSpeedTarget = this.fastSpeed; // 회피 시 빠른 속도로 전환
            }
          }
        }
      }
    } else {
      // QuadTree가 없는 경우 기존 방식 사용 (성능이 떨어짐)
      for (var i = 0; i < boids.length; i++) {
        let boid = boids[i];
        // 자기 자신은 제외
        if (boid === this) continue;
        
        // 다른 종류이고, 살아있으며, 거리 내에 있는 개체
        if (boid.name != this.name && boid.weight > 0) {
          var distance = this.pos.dist(boid.pos);
          
          if (distance < this.sight) {
            var avoidanceForce = new p5.Vector();
            var shouldAvoid = false;
            
            // 1. 자신의 두 배 이상 크기인 개체 회피
            if (boid.weight >= this.weight * 2) {
              shouldAvoid = true;
              // 회피 방향 계산 (반대 방향으로)
              var desired = p5.Vector.sub(this.pos, boid.pos);
              desired.normalize();
              
              // 거리에 반비례하여 회피력 강도 조정
              var avoidanceStrength = map(distance, 0, this.sight, 1.0, 0.1);
              desired.mult(this.maxSpeed * avoidanceStrength);
              
              avoidanceForce = p5.Vector.sub(desired, this.vel);
              avoidanceForce.limit(this.maxForce * 2); // 회피는 더 강한 힘 적용
            }
            
            // 2. 자신을 타겟으로 추적 중인 포식자 회피
            if (boid.target === this) {
              shouldAvoid = true;
              // 회피 방향 계산 (반대 방향으로)
              var desired = p5.Vector.sub(this.pos, boid.pos);
              desired.normalize();
              
              // 추적당하는 경우 더 강한 회피력 적용
              var avoidanceStrength = map(distance, 0, this.sight, 1.5, 0.2);
              desired.mult(this.maxSpeed * avoidanceStrength);
              
              var trackingAvoidanceForce = p5.Vector.sub(desired, this.vel);
              trackingAvoidanceForce.limit(this.maxForce * 3); // 추적당할 때는 더욱 강한 힘 적용
              
              // 두 회피력이 모두 있으면 더 강한 것을 사용
              if (avoidanceForce.mag() > 0) {
                avoidanceForce.add(trackingAvoidanceForce);
                avoidanceForce.limit(this.maxForce * 3);
              } else {
                avoidanceForce = trackingAvoidanceForce;
              }
            }
            
            if (shouldAvoid) {
              sum.add(avoidanceForce);
              count++;
              this.maxSpeedTarget = this.fastSpeed; // 회피 시 빠른 속도로 전환
            }
          }
        }
      }
    }
    
    if (count > 0) {
      sum.div(count);
    }
    return sum;
  }


  /**
   * 시야 체크 - 시야 범위와 각도 내의 다른 개체들을 찾아서 boidsInSight 배열에 저장
   * QuadTree를 사용하여 성능을 최적화
   * @param {Array} boids - 전체 개체 배열 (QuadTree가 없을 때 사용)
   */
  checkSight(boids) {
    this.boidsInSight = [];
    
    // QuadTree를 사용하여 시야 범위 내의 boid들을 효율적으로 찾기
    if (world.quadtree) {
      let candidates = world.quadtree.queryCircle(this.pos, this.sight);
      
      for (var i = 0; i < candidates.length; i++) {
        // 자기 자신은 제외
        if (candidates[i] === this) continue;
        
        // 각도 차이 계산
        var angle = p5.Vector.sub(candidates[i].pos, this.pos);
        angle = angle.heading() - this.theta;
        
        // 각도 차이를 -π에서 π 사이로 정규화
        while (angle > PI) angle -= TWO_PI;
        while (angle < -PI) angle += TWO_PI;
        
        // 시야 범위와 각도 내에 있는지 확인
        if (this.pos.dist(candidates[i].pos) > 0 &&
          this.pos.dist(candidates[i].pos) < this.sight &&
          abs(angle) < this.sightAngle) {

          this.boidsInSight.push(candidates[i]);
        }
      }
    } else {
      // QuadTree가 없는 경우 기존 방식 사용 (성능이 떨어짐)
      for (var i = 0; i < boids.length; i++) {
        var angle = p5.Vector.sub(boids[i].pos, this.pos);
        angle = angle.heading() - this.theta;
        
        // 각도 차이를 -π에서 π 사이로 정규화
        while (angle > PI) angle -= TWO_PI;
        while (angle < -PI) angle += TWO_PI;
        if (this.pos.dist(boids[i].pos) > 0 &&
          this.pos.dist(boids[i].pos) < this.sight &&
          abs(angle) < this.sightAngle) {

          this.boidsInSight.push(boids[i]);
        }
      }
    }
  }



  /**
   * 포식 행동 - 목표와 충분히 가까워지면 목표를 잡아먹고 무게 증가
   */
  predation() {
    if (this.target && this.pos.dist(this.target.pos) < this.weight) {
      // 목표의 무게의 60%를 자신의 무게에 추가
      this.target_weight += this.target.weight * 0.6;
      if (this.target_weight > this.weightLimit) this.target_weight = this.weightLimit;
      
      // 목표를 죽임 (무게를 0으로 설정)
      this.target.target_weight = this.target.weight = 0;
      this.target = null; // 목표 초기화
      this.maxSpeedTarget = this.normalSpeed; // 일반 속도로 복귀

      // 배부름 채움 (먹은 양에 비례하여)
      this.fullness += this.target_weight/this.weight;
      if(this.fullness > 1) this.fullness = 1; // 최대 배부름 제한
    }
  }

  /**
   * 매 프레임마다 호출되는 업데이트 메서드
   * 이동, 커스텀 업데이트, 부품 업데이트, 번식, 생명력 관리 등을 처리
   */
  update() {
    this.moving();        // 이동 처리
    this.updateCustom();  // 커스텀 업데이트
    this.partUpdate();    // 부품 업데이트
    
    // 번식 타이밍 체크
    if(this.life==this.birthTime){
      this.birth = true;
      this.birthTime += this.birthInterval + int(random(-5,30)); // 다음 번식 시간 설정 (랜덤 변동)
    } 
    else this.birth = false;
    
    this.life ++; // 생명력 증가
    if (this.life > this.lifeSpan) this.weight = 0; // 생명력이 다하면 죽음
    if(this.life > this.lifeSpan - 30) this.maxSpeedTarget = 0; // 죽기 30프레임 전부터 속도 감소

    // 식물이 아닌 경우에만 배부름 감소 처리
    if(this instanceof Plant) return;
    this.fullness -= 0.01; // 매 프레임마다 배부름 감소
    if (this.fullness < 0){
       this.fullness = 0;
       this.lifeSpan -= 0.01; // 배가 고프면 생명력 감소
    }
  }

  /**
   * 이동 처리 메서드 - 물리 계산, 행동 적용, 위치 업데이트 등을 담당
   */
  moving() {
    // 시야 범위를 무게에 따라 조정 (무거울수록 시야가 넓어짐)
    this.sight = this.weight + this.sightRange;
    // 무게와 속도를 목표값으로 부드럽게 보간 (자연스러운 변화)
    this.weight = lerp(this.weight, this.target_weight, 0.1);
    this.maxSpeed = lerp(this.maxSpeed, this.maxSpeedTarget, 0.1);

    // 시야 체크 및 행동 적용
    this.checkSight(world.boids);
    this.applyBehaviors(world.boids);

    // 물리 계산 적용
    this.vel.add(this.acc); // 가속도를 속도에 추가
    this.vel.limit(this.maxSpeed); // 최대 속도 제한
    this.pos.add(this.vel); // 속도를 위치에 추가
    this.acc.mult(0); // 가속도 초기화
    this.worldEdge(); // 화면 경계 처리

    // 각도 변화를 부드럽게 처리
    let newTheta = this.vel.heading(); // 현재 속도 방향의 각도
    let sub = newTheta - this.theta; // 각도 차이
    
    // 각도 차이를 -π에서 π 사이로 정규화
    while (sub > PI) sub -= TWO_PI;
    while (sub < -PI) sub += TWO_PI;
    
    // 각도 변화를 부드럽게 제한 (급격한 회전 방지)
    let maxRotation = PI * 0.1; // 최대 회전 각도
    sub = constrain(sub, -maxRotation, maxRotation);
    
    // 부드러운 각도 보간 적용
    this.theta += sub * 0.3; // 부드러운 회전

    this.predation(); // 포식 행동 체크
  }

  /**
   * 부품 업데이트 - 모든 부속 부품들을 업데이트
   */
  partUpdate() {
    for (let part of this.parts) {
      part.update();
    }
  }
  
  /**
   * 커스텀 업데이트 메서드 - 하위 클래스에서 오버라이드
   */
  updateCustom(){}

  /**
   * 화면 경계 처리 - 개체가 화면 밖으로 나가면 반대편으로 순환
   */
  worldEdge() {
    if (this.pos.x > width / 2 + this.sight) this.pos.x = -width / 2 - this.sight;
    else if (this.pos.x < -width / 2 - this.sight) this.pos.x = width / 2 + this.sight;

    if (this.pos.y > height / 2 + this.sight) this.pos.y = -height / 2 - this.sight;
    else if (this.pos.y < -height / 2 - this.sight) this.pos.y = height / 2 + this.sight;
  }

  /**
   * 화면에 그리기 - 개체의 모양과 부품들을 렌더링
   */
  display() {
    stroke(255);
    fill(255);
    strokeWeight(0);
    push();
    translate(this.pos.x, this.pos.y);
    rectMode(CENTER);
    if(!isDrawingMode)rotate(this.theta + HALF_PI);
    this.drawing(); // 실제 모양 그리기
    for (let part of this.parts) {
      part.display(); // 부품들 그리기
    }
    pop();
  }

  /**
   * 실제 모양 그리기 메서드 - 하위 클래스에서 오버라이드
   */
  drawing() {
    stroke(255);
    strokeWeight(1);
    noFill();
    ellipse(0,0,this.weight,this.weight);
  }

  /**
   * 부품 추가
   * @param {Part} part - 추가할 부품 객체
   */
  addPart(part) {
    this.parts.push(part);
  }

  /**
   * 새로운 Life 객체 생성 - 하위 클래스에서 오버라이드
   * @returns {Life} 새로운 Life 객체
   */
  static create() {
    return new Life();
  }

  /**
   * 디버깅용 가이드 그리기 - 시야 범위, 각도, 무게 등을 시각화
   */
  guide() {
    push();
      noStroke();
      fill(255, 0, 0, 50);
      strokeWeight(1);
    push();
      translate(this.pos.x, this.pos.y);
      if(!isDrawingMode)rotate(this.theta);
      else rotate(-HALF_PI);
      push();
        noFill();
        stroke(255, 0, 0);
        circle(0, 0, this.weight); // 무게를 나타내는 원
      pop();
      push();
      rotate(-this.sightAngle);
      line(0, 0, this.sight, 0); // 왼쪽 시야선
      pop();
      push();
      rotate(this.sightAngle);
      line(0, 0, this.sight, 0); // 오른쪽 시야선
      pop();
      arc(0, 0, this.sight * 2, this.sight * 2, -this.sightAngle, this.sightAngle); // 시야 각도 호
     pop();

    if (this.mouseFollowing) ellipse(mouse.x, mouse.y, 10, 10); // 마우스 추적 표시
    pop();
  }
}

/**
 * Plant 클래스 - 식물을 나타내는 클래스
 * Life 클래스를 상속받아 움직이지 않고 성장하는 특성을 가짐
 */
class Plant extends Life {
  constructor(pos, weight) {
    super(pos,weight);

    this.checkEdgeAtStart();
    this.growSpeed = 0.01; // 성장 속도
    this.weight = 0.1;
    this.birthInterval = 60 * 8 + random(-10,10); // 번식 간격
  }

  checkEdgeAtStart() {
    if(this.pos.x > width/2) this.pos.x = width/2 - random(0,100);
    if(this.pos.x < -width/2) this.pos.x = -width/2 + random(0,100);
    if(this.pos.y > height/2) this.pos.y = height/2 - random(0,100);
    if(this.pos.y < -height/2) this.pos.y = -height/2 + random(0,100);
  }
  
  /**
   * 식물 그리기 - 회전하지 않고 그리기
   */
  display() {
    stroke(255);
    fill(255);
    strokeWeight(0);
    push();
    translate(this.pos.x, this.pos.y);
    rectMode(CENTER);
    this.drawing(); // 실제 모양 그리기
    for (let part of this.parts) {
      part.display(); // 부품들 그리기
    }
    pop();

  }
  
  /**
   * 식물 업데이트 - 움직이지 않고 성장만 함
   */
  update() {
    this.weight = lerp(this.weight, this.target_weight, 0.1);
    this.updateCustom();  // 커스텀 업데이트
    this.partUpdate(); // 부품 업데이트

    // 번식 타이밍 체크
    if(this.life==this.birthTime){
      this.birth = true;
      this.birthTime += this.birthInterval + int(random(-5,30)); // 다음 번식 시간 설정
    } 
    else this.birth = false;

    this.life ++;      // 생명력 증가
   if (this.life > this.lifeSpan) this.weight = 0; // 생명력이 다하면 죽음
   if(this.life > this.lifeSpan - 60){
     this.target_weight = 0; // 시듬
   }
   else{
    this.target_weight += this.growSpeed; // 성장
   }
  }
  
  /**
   * 새로운 Plant 객체 생성
   * @returns {Plant} 새로운 Plant 객체
   */
  create() {
    return new Plant();
  }
  
  /**
   * 식물은 가이드를 그리지 않음
   */
  guide() {}
}