/**
 * World 클래스 - 전체 생태계를 관리하는 클래스
 * 모든 개체들을 관리하고, QuadTree를 사용하여 성능을 최적화하며, 시각화 기능을 제공
 */
class World{
  constructor(){
    this.boids = [];                    // 모든 개체들을 저장하는 배열
    this.isStopped = false;             // 시뮬레이션 정지 여부
    this.quadtree = null;               // QuadTree 인스턴스
    this.showQuadTree = false;          // QuadTree 시각화 기본 비활성화 (성능 테스트)
    this.showInfo = false;              // 정보 표시 기본 활성화
    this.performanceStats = {           // 성능 통계 정보
      lastFrameTime: 0,
      frameCount: 0,
      fps: 0
    };
    this.initQuadTree();
  }
  
  /**
   * QuadTree 초기화 - 화면 크기에 맞는 QuadTree 생성
   */
  initQuadTree(){
    // 실제 화면 크기에 맞는 quad tree 경계 설정
    this.quadtree = new QuadTree({
      x: -width/2,
      y: -height/2,
      w: width,
      h: height
    });
  }

  /**
   * 메인 그리기 메서드 - 매 프레임마다 호출되어 전체 시뮬레이션을 업데이트하고 그리기
   */
  draw(){
    // QuadTree 업데이트 (개체들의 위치 변화를 반영)
    this.updateQuadTree();
    
    // 시뮬레이션이 정지되지 않았으면 모든 개체 업데이트
    if(!this.isStopped)for(var i=0; i<this.boids.length; i++) this.boids[i].update();
    
    // 시야 표시 모드가 활성화되면 모든 개체의 가이드 그리기
    if(isOnSight)for(var i=0; i<this.boids.length; i++) this.boids[i].guide();
    
    // QuadTree 시각화 및 정보 표시
    if(this.showInfo) {
      if(this.showQuadTree) {
        this.visualizeQuadTree(); // 상세한 시각화
      } else {
        // 시각화 없이도 기본 정보 표시
        this.showBasicInfo();
      }
    }

    // 개체들을 동물과 식물로 분류
    let animals = this.boids.filter(boid=> !(boid instanceof Plant));
    let plants = this.boids.filter(boid=> (boid instanceof Plant) );
    plants.sort((a,b)=> a.pos.y - b.pos.y); // 식물들을 Y좌표 순으로 정렬 (깊이감)

    // 식물군 그리기 (먼저 그려서 배경에 위치)
    for(var i=0; i<plants.length; i++){
      plants[i].display();
    }
    
    // 동물군 그리기 (나중에 그려서 앞에 위치)
    for(var i=0; i<animals.length; i++){
      animals[i].display();
    }
    
    // 죽은 개체들 제거 (무게가 0인 개체들)
    this.boids = this.boids.filter(boid=>boid.weight>0);
    //this.boids = this.boids.filter(boid=>boid.hunger<1); // 주석 처리된 코드
  }
  
  /**
   * QuadTree 업데이트 - 모든 개체들을 QuadTree에 다시 삽입
   * 매 프레임마다 호출되어 개체들의 위치 변화를 반영
   */
  updateQuadTree(){
    // QuadTree 초기화 (이전 프레임의 데이터 제거)
    this.quadtree.clear();
    
    // 모든 boid를 QuadTree에 삽입 (새로운 위치로)
    for(let boid of this.boids){
      this.quadtree.insert(boid);
    }
  }
  
  /**
   * QuadTree 상세 시각화 - QuadTree 구조와 가장 강한 개체의 시야를 시각화
   */
  visualizeQuadTree(){
    if(!this.quadtree || this.boids.length === 0) return;
    
    // QuadTree 구조 그리기
    this.quadtree.show();
    
    // 가장 weight가 강한 개체의 시야 범위 시각화
    if(this.boids.length > 0) {
      let strongestBoid = this.getStrongestBoid();
      
      // 시야 각도 시각화
      push();
      translate(strongestBoid.pos.x, strongestBoid.pos.y);
      
      // 가장 강한 개체 하이라이트
      fill(0, 255, 255, 150);
      stroke(0, 255, 255, 255);
      strokeWeight(3);
      circle(0, 0, 20);
      
      // 시야 원
      stroke(0, 255, 0, 150);
      strokeWeight(2);
      noFill();
      circle(0, 0, strongestBoid.sight * 2);
      
      // 시야 각도 선들
      stroke(255, 255, 0, 200);
      strokeWeight(2);
      
      // 왼쪽 시야선
      push();
      rotate(-strongestBoid.sightAngle + strongestBoid.theta);
      line(0, 0, strongestBoid.sight, 0);
      pop();
      
      // 오른쪽 시야선
      push();
      rotate(strongestBoid.sightAngle + strongestBoid.theta);
      line(0, 0, strongestBoid.sight, 0);
      pop();
      
      // 시야 각도 호
      stroke(255, 255, 0, 150);
      strokeWeight(1);
      noFill();
      rotate(strongestBoid.theta);
      arc(0, 0, strongestBoid.sight * 2, strongestBoid.sight * 2, -strongestBoid.sightAngle, strongestBoid.sightAngle);
      
      pop();
      
      // QuadTree 쿼리 결과 시각화 - 실제 시야 내 개체들만 필터링
      let candidates = this.quadtree.queryCircle(strongestBoid.pos, strongestBoid.sight);
      let queryResults = [];
      
      for (let candidate of candidates) {
        // 자기 자신은 제외
        if (candidate === strongestBoid) continue;
        
        // 시야 각도 체크
        let angle = p5.Vector.sub(candidate.pos, strongestBoid.pos);
        angle = angle.heading() - strongestBoid.theta;
        if (abs(angle) > Math.PI) angle = angle / abs(angle) * (abs(angle) - Math.PI * 2);
        
        if (strongestBoid.pos.dist(candidate.pos) > 0 &&
            strongestBoid.pos.dist(candidate.pos) < strongestBoid.sight &&
            abs(angle) < strongestBoid.sightAngle) {
          queryResults.push(candidate);
        }
      }
      
      // QuadTree 쿼리 영역 표시
      this.quadtree.showQueryNodes(strongestBoid.pos, strongestBoid.sight);
      
      // 쿼리 결과 표시
      this.quadtree.showQuery(strongestBoid.pos, strongestBoid.sight, queryResults);
      
      // 쿼리된 노드 수 계산
      let queryNodeCount = this.quadtree.countQueryNodes(strongestBoid.pos, strongestBoid.sight);
      
      // 개체 정보 표시
      push();
      fill(255);
      noStroke();
      textAlign(LEFT);
      textSize(12);
      // 화면 좌측상단에 표시 (좌표계 조정)
      text(`가장 강한 개체 정보:`, -width/2 + 10, -height/2 + 30);
      text(`Weight: ${strongestBoid.weight.toFixed(2)}`, -width/2 + 10, -height/2 + 45);
      text(`시야 범위: ${strongestBoid.sight.toFixed(1)}`, -width/2 + 10, -height/2 + 60);
      text(`시야 각도: ${(strongestBoid.sightAngle * 180 / PI).toFixed(1)}°`, -width/2 + 10, -height/2 + 75);
      text(`감지된 개체: ${queryResults.length}`, -width/2 + 10, -height/2 + 90);
      text(`쿼리된 노드: ${queryNodeCount || 0}`, -width/2 + 10, -height/2 + 105);
      text(`전체 노드 수: ${this.countQuadTreeNodes()}`, -width/2 + 10, -height/2 + 120);
      text(`전체 개체 수: ${this.boids.length}`, -width/2 + 10, -height/2 + 135);
      
      // 성능 정보 표시
      let currentTime = millis();
      this.performanceStats.frameCount++;
      if (currentTime - this.performanceStats.lastFrameTime >= 1000) {
        this.performanceStats.fps = this.performanceStats.frameCount;
        this.performanceStats.frameCount = 0;
        this.performanceStats.lastFrameTime = currentTime;
      }
      
      text(`FPS: ${this.performanceStats.fps}`, -width/2 + 10, -height/2 + 150);
      text(`QuadTree 사용: ${this.quadtree ? 'YES' : 'NO'}`, -width/2 + 10, -height/2 + 165);
      text(`시각화: ${this.showQuadTree ? 'ON' : 'OFF'}`, -width/2 + 10, -height/2 + 180);
      text(`정보 표시: ${this.showInfo ? 'ON' : 'OFF'}`, -width/2 + 10, -height/2 + 195);
      pop();
      
      // 사용법 표시
      push();
      fill(200);
      noStroke();
      textAlign(RIGHT);
      textSize(10);
      text(`Q키: 시각화 및 정보 토글`, width/2 - 10, -height/2 + 20);
      pop();
    }
  }
  
  /**
   * QuadTree의 총 노드 수 계산
   * @returns {number} 총 노드 수
   */
  countQuadTreeNodes(){
    if(!this.quadtree) return 0;
    return this.countNodesRecursive(this.quadtree);
  }
  
  /**
   * 재귀적으로 QuadTree 노드 수 계산
   * @param {Object} node - QuadTree 노드
   * @returns {number} 노드 수
   */
  countNodesRecursive(node){
    if(!node.divided) return 1;
    return 1 + this.countNodesRecursive(node.northeast) + 
               this.countNodesRecursive(node.northwest) + 
               this.countNodesRecursive(node.southeast) + 
               this.countNodesRecursive(node.southwest);
  }
  
  /**
   * 가장 무게가 큰 개체 찾기
   * @returns {Object|null} 가장 강한 개체 또는 null
   */
  getStrongestBoid(){
    if(this.boids.length === 0) return null;
    
    let strongest = this.boids[0];
    for(let boid of this.boids){
      if(boid.weight > strongest.weight){
        strongest = boid;
      }
    }
    return strongest;
  }
  
  /**
   * 기본 정보 표시 - 시각화 없이 텍스트 정보만 표시
   */
  showBasicInfo(){
    if(this.boids.length > 0) {
      let strongestBoid = this.getStrongestBoid();
      
      // QuadTree 쿼리 결과 계산 (시각화 없이)
      let candidates = this.quadtree.queryCircle(strongestBoid.pos, strongestBoid.sight);
      let queryResults = [];
      
      for (let candidate of candidates) {
        if (candidate === strongestBoid) continue;
        
        let angle = p5.Vector.sub(candidate.pos, strongestBoid.pos);
        angle = angle.heading() - strongestBoid.theta;
        if (abs(angle) > Math.PI) angle = angle / abs(angle) * (abs(angle) - Math.PI * 2);
        
        if (strongestBoid.pos.dist(candidate.pos) > 0 &&
            strongestBoid.pos.dist(candidate.pos) < strongestBoid.sight &&
            abs(angle) < strongestBoid.sightAngle) {
          queryResults.push(candidate);
        }
      }
      
      // 성능 정보 표시
      let currentTime = millis();
      this.performanceStats.frameCount++;
      if (currentTime - this.performanceStats.lastFrameTime >= 1000) {
        this.performanceStats.fps = this.performanceStats.frameCount;
        this.performanceStats.frameCount = 0;
        this.performanceStats.lastFrameTime = currentTime;
      }
      
      push();
      fill(255);
      noStroke();
      textAlign(LEFT);
      textSize(12);
      // 화면 좌측상단에 표시 (좌표계 조정)
      text(`가장 강한 개체 정보:`, -width/2 + 10, -height/2 + 30);
      text(`Weight: ${strongestBoid.weight.toFixed(2)}`, -width/2 + 10, -height/2 + 45);
      text(`시야 범위: ${strongestBoid.sight.toFixed(1)}`, -width/2 + 10, -height/2 + 60);
      text(`시야 각도: ${(strongestBoid.sightAngle * 180 / PI).toFixed(1)}°`, -width/2 + 10, -height/2 + 75);
      text(`감지된 개체: ${queryResults.length}`, -width/2 + 10, -height/2 + 90);
      let basicQueryNodeCount = this.quadtree.countQueryNodes(strongestBoid.pos, strongestBoid.sight);
      text(`쿼리된 노드: ${basicQueryNodeCount}`, -width/2 + 10, -height/2 + 105);
      text(`전체 노드 수: ${this.countQuadTreeNodes()}`, -width/2 + 10, -height/2 + 120);
      text(`전체 개체 수: ${this.boids.length}`, -width/2 + 10, -height/2 + 135);
      text(`FPS: ${this.performanceStats.fps}`, -width/2 + 10, -height/2 + 150);
      text(`QuadTree 사용: ${this.quadtree ? 'YES' : 'NO'}`, -width/2 + 10, -height/2 + 165);
      text(`시각화: ${this.showQuadTree ? 'ON' : 'OFF'}`, -width/2 + 10, -height/2 + 180);
      text(`정보 표시: ${this.showInfo ? 'ON' : 'OFF'}`, -width/2 + 10, -height/2 + 195);
      pop();
      
      // 사용법 표시
      push();
      fill(200);
      noStroke();
      textAlign(RIGHT);
      textSize(10);
      text(`Q키: 시각화 및 정보 토글`, width/2 - 10, -height/2 + 20);
      text(`I키: 정보만 토글`, width/2 - 10, -height/2 + 35);
      pop();
    }
  }
  
  /**
   * 개체 추가
   * @param {Object} boid - 추가할 개체
   */
  add(boid){
    this.boids.push(boid);
  }
  
  /**
   * 개체 생성 및 추가
   * @param {Function} create - 개체 생성 함수 (정적 메서드)
   * @param {number} number - 생성할 개체 수 (기본값: 1)
   */
  create(create, number = 1){
    for(var i=0; i<number; i++){
      let b = create(); // 생성 함수 호출
      this.boids.push(b); // 생성된 개체를 배열에 추가
    }
  }
  
  /**
   * 시뮬레이션 정지
   * 모든 개체의 업데이트를 중단
   */
  stop(){
    this.isStopped = true;
  }
}

