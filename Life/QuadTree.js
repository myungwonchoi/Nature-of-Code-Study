/**
 * QuadTree 클래스 - 공간 분할을 통한 효율적인 개체 검색을 위한 데이터 구조
 * 2D 공간을 재귀적으로 4개의 사분면으로 나누어 개체들을 관리
 */
class QuadTree {
  constructor(boundary, capacity = 4) {
    this.boundary = boundary; // 경계 영역 {x, y, w, h}
    this.capacity = capacity; // 노드당 최대 개체 수
    this.boids = [];          // 이 노드에 포함된 개체들
    this.divided = false;     // 분할 여부
    this.northeast = null;    // 북동쪽 자식 노드
    this.northwest = null;    // 북서쪽 자식 노드
    this.southeast = null;    // 남동쪽 자식 노드
    this.southwest = null;    // 남서쪽 자식 노드
  }

  /**
   * 노드를 4개의 자식 노드로 분할
   * 현재 노드가 용량을 초과할 때 호출됨
   */
  subdivide() {
    let x = this.boundary.x; // 현재 노드의 X 좌표
    let y = this.boundary.y; // 현재 노드의 Y 좌표
    let w = this.boundary.w / 2; // 너비의 절반
    let h = this.boundary.h / 2; // 높이의 절반

    // 4개의 사분면 경계 정의
    let ne = { x: x + w, y: y, w: w, h: h };      // 북동쪽 (오른쪽 위)
    let nw = { x: x, y: y, w: w, h: h };          // 북서쪽 (왼쪽 위)
    let se = { x: x + w, y: y + h, w: w, h: h };  // 남동쪽 (오른쪽 아래)
    let sw = { x: x, y: y + h, w: w, h: h };      // 남서쪽 (왼쪽 아래)

    // 4개의 자식 노드 생성 (같은 용량으로)
    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true; // 분할 완료 표시
  }

  /**
   * 개체를 QuadTree에 삽입
   * @param {Object} boid - 삽입할 개체 (pos 속성을 가져야 함)
   * @returns {boolean} 삽입 성공 여부
   */
  insert(boid) {
    // 개체가 이 노드의 경계 내에 있는지 확인
    if (!this.contains(boid.pos)) {
      return false; // 경계 밖이면 삽입 실패
    }

    // 용량이 남아있으면 이 노드에 추가
    if (this.boids.length < this.capacity) {
      this.boids.push(boid);
      return true; // 삽입 성공
    }

    // 분할되지 않았으면 분할
    if (!this.divided) {
      this.subdivide();
    }

    // 자식 노드들에 삽입 시도 (순서대로 시도)
    if (this.northeast.insert(boid)) return true;
    if (this.northwest.insert(boid)) return true;
    if (this.southeast.insert(boid)) return true;
    if (this.southwest.insert(boid)) return true;

    return false; // 모든 자식 노드에서 삽입 실패
  }

  /**
   * 위치가 이 노드의 경계 내에 있는지 확인
   * @param {p5.Vector} pos - 확인할 위치
   * @returns {boolean} 경계 내 포함 여부
   */
  contains(pos) {
    return pos.x >= this.boundary.x &&                    // 왼쪽 경계
           pos.x < this.boundary.x + this.boundary.w &&   // 오른쪽 경계
           pos.y >= this.boundary.y &&                    // 위쪽 경계
           pos.y < this.boundary.y + this.boundary.h;     // 아래쪽 경계
  }

  /**
   * 범위가 이 노드와 교차하는지 확인
   * @param {Object} range - 확인할 범위 {x, y, w, h}
   * @returns {boolean} 교차 여부
   */
  intersects(range) {
    // 교차하지 않는 경우들을 체크 (반대 조건)
    return !(range.x > this.boundary.x + this.boundary.w ||     // 범위가 노드 오른쪽에 있음
             range.x + range.w < this.boundary.x ||             // 범위가 노드 왼쪽에 있음
             range.y > this.boundary.y + this.boundary.h ||     // 범위가 노드 아래쪽에 있음
             range.y + range.h < this.boundary.y);              // 범위가 노드 위쪽에 있음
  }

  /**
   * 사각형 범위 내의 모든 개체를 검색
   * @param {Object} range - 검색 범위 {x, y, w, h}
   * @param {Array} found - 결과를 저장할 배열
   * @returns {Array} 검색된 개체들의 배열
   */
  query(range, found = []) {
    // 범위가 이 노드와 교차하지 않으면 반환
    if (!this.intersects(range)) {
      return found;
    }

    // 이 노드의 개체들 중 범위 내에 있는 것들 추가
    for (let boid of this.boids) {
      if (range.x <= boid.pos.x &&                    // X 좌표가 범위 내
          boid.pos.x <= range.x + range.w &&          // X 좌표가 범위 내
          range.y <= boid.pos.y &&                    // Y 좌표가 범위 내
          boid.pos.y <= range.y + range.h) {          // Y 좌표가 범위 내
        found.push(boid);
      }
    }

    // 자식 노드들도 재귀적으로 검색
    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }

  /**
   * 원형 범위 내의 모든 개체를 검색
   * @param {p5.Vector} center - 원의 중심점
   * @param {number} radius - 원의 반지름
   * @param {Array} found - 결과를 저장할 배열
   * @returns {Array} 검색된 개체들의 배열
   */
  queryCircle(center, radius, found = []) {
    // 원과 사각형의 교차를 확인하기 위한 사각형 범위 계산
    let range = {
      x: center.x - radius,  // 원의 왼쪽 경계
      y: center.y - radius,  // 원의 위쪽 경계
      w: radius * 2,         // 원의 너비 (지름)
      h: radius * 2          // 원의 높이 (지름)
    };

    // 범위가 이 노드와 교차하지 않으면 반환
    if (!this.intersects(range)) {
      return found;
    }

    // 이 노드의 개체들 중 원 내에 있는 것들 추가
    for (let boid of this.boids) {
      let distance = center.dist(boid.pos); // 중심점과의 거리 계산
      if (distance <= radius) {             // 반지름 내에 있으면 추가
        found.push(boid);
      }
    }

    // 자식 노드들도 재귀적으로 검색
    if (this.divided) {
      this.northeast.queryCircle(center, radius, found);
      this.northwest.queryCircle(center, radius, found);
      this.southeast.queryCircle(center, radius, found);
      this.southwest.queryCircle(center, radius, found);
    }

    return found;
  }

  /**
   * QuadTree 초기화 - 모든 개체와 자식 노드들을 제거
   */
  clear() {
    this.boids = [];        // 개체 배열 초기화
    this.divided = false;   // 분할 상태 초기화
    this.northeast = null;  // 북동쪽 자식 노드 제거
    this.northwest = null;  // 북서쪽 자식 노드 제거
    this.southeast = null;  // 남동쪽 자식 노드 제거
    this.southwest = null;  // 남서쪽 자식 노드 제거
  }

  /**
   * 디버깅용 - QuadTree 구조를 시각화
   * 노드 경계와 포함된 개체 수를 표시
   */
  show() {
    push();
      stroke(255, 100);  // 반투명 흰색 테두리
      strokeWeight(1);
      noFill();
      rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h); // 노드 경계 그리기

      // 자식 노드들도 재귀적으로 시각화
      if (this.divided) {
        this.northeast.show();
        this.northwest.show();
        this.southeast.show();
        this.southwest.show();
      }
      
      // 각 노드에 포함된 개체 수 표시
      if (this.boids.length > 0) {
        fill(255, 150);  // 반투명 흰색 텍스트
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(10);
        text(this.boids.length, 
            this.boundary.x + this.boundary.w/2, 
            this.boundary.y + this.boundary.h/2); // 노드 중심에 개체 수 표시
      }
    pop();
  }
  
  /**
   * 특정 영역의 쿼리 결과를 시각화
   * @param {p5.Vector} center - 쿼리 중심점
   * @param {number} radius - 쿼리 반지름
   * @param {Array} queryResults - 쿼리 결과 개체들
   */
  showQuery(center, radius, queryResults = []) {
    push();
    
      // 시야 원 그리기
      stroke(0, 255, 0, 150);
      strokeWeight(2);
      noFill();
      circle(center.x, center.y, radius * 2);
    
      // 쿼리 결과 개체들 표시
      for (let boid of queryResults) {
        push();
          // 하이라이트 원
          fill(255, 0, 0, 100);
          stroke(255, 0, 0, 255);
          strokeWeight(3);
          circle(boid.pos.x, boid.pos.y, 15);
        pop();
        
        push();
          // 연결선 그리기
          stroke(255, 0, 0, 150);
          strokeWeight(2);
          line(center.x, center.y, boid.pos.x, boid.pos.y);
        pop();
        
        push();
          // 거리 표시
          fill(255, 0, 0, 200);
          noStroke();
          textAlign(CENTER);
          textSize(8);
          text(center.dist(boid.pos).toFixed(1), boid.pos.x, boid.pos.y - 20);
        pop();
      }
    
    pop();
  }
  
  /**
   * 쿼리되는 노드 영역들을 시각화
   * @param {p5.Vector} center - 쿼리 중심점
   * @param {number} radius - 쿼리 반지름
   * @returns {number} 쿼리된 노드 수
   */
  showQueryNodes(center, radius) {
    this.queryNodeCount = 0;
    this.showQueryNodesRecursive(center, radius);
    return this.queryNodeCount || 0;
  }
  
  /**
   * 쿼리되는 노드 수만 계산 (시각화 없이)
   * @param {p5.Vector} center - 쿼리 중심점
   * @param {number} radius - 쿼리 반지름
   * @returns {number} 쿼리된 노드 수
   */
  countQueryNodes(center, radius) {
    return this.countQueryNodesRecursive(center, radius);
  }
  
  /**
   * 재귀적으로 쿼리되는 노드 수 계산
   * @param {p5.Vector} center - 쿼리 중심점
   * @param {number} radius - 쿼리 반지름
   * @returns {number} 쿼리된 노드 수
   */
  countQueryNodesRecursive(center, radius) {
    let count = 0;
    let range = {
      x: center.x - radius,
      y: center.y - radius,
      w: radius * 2,
      h: radius * 2
    };
    
    if (this.intersects(range)) {
      // 모든 교차하는 노드 카운트 (QuadTree가 실제로 검사하는 노드들)
      count = 1;
    }
    
    if (this.divided) {
      count += this.northeast.countQueryNodesRecursive(center, radius);
      count += this.northwest.countQueryNodesRecursive(center, radius);
      count += this.southeast.countQueryNodesRecursive(center, radius);
      count += this.southwest.countQueryNodesRecursive(center, radius);
    }
    
    return count;
  }
  
  /**
   * 재귀적으로 쿼리되는 노드들을 시각화
   * @param {p5.Vector} center - 쿼리 중심점
   * @param {number} radius - 쿼리 반지름
   */
  showQueryNodesRecursive(center, radius) {
    // queryCircle과 동일한 사각형 범위 계산
    let range = {
      x: center.x - radius,
      y: center.y - radius,
      w: radius * 2,
      h: radius * 2
    };
    
    // 이 노드가 쿼리 범위와 교차하는지 확인 (queryCircle과 동일한 로직)
    if (this.intersects(range)) {
      // 모든 교차하는 노드 표시 (QuadTree가 실제로 검사하는 노드들)
      this.queryNodeCount = (this.queryNodeCount || 0) + 1;
      push();
      // 쿼리되는 노드 하이라이트
      fill(255, 255, 0, 30);
      stroke(255, 255, 0, 150);
      strokeWeight(1);
      rect(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h);
      pop();
      
      // 개체가 있는 노드에만 "Q" 표시
      if (!this.divided && this.boids.length > 0) {
        // 이 노드에 실제로 원형 범위 내의 개체가 있는지 확인
        let hasValidBoids = false;
        for (let boid of this.boids) {
          let distance = center.dist(boid.pos);
          if (distance <= radius) {
            hasValidBoids = true;
            break;
          }
        }
        
        // if (hasValidBoids) {
        //   push();
        //   fill(255, 255, 0, 200);
        //   noStroke();
        //   textAlign(CENTER, CENTER);
        //   textSize(8);
        //   text(`Q`, 
        //       this.boundary.x + this.boundary.w/2, 
        //       this.boundary.y + this.boundary.h/2);
        //   pop();
        // }
      }
    }
    
    // 자식 노드들도 재귀적으로 처리
    if (this.divided) {
      this.northeast.showQueryNodesRecursive(center, radius);
      this.northwest.showQueryNodesRecursive(center, radius);
      this.southeast.showQueryNodesRecursive(center, radius);
      this.southwest.showQueryNodesRecursive(center, radius);
    }
  }
}
