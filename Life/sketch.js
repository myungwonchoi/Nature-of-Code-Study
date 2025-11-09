/**
 * sketch.js - p5.js 메인 스케치 파일
 * 생명체 시뮬레이션의 진입점으로 전체 프로그램을 초기화하고 실행
 * p5.js의 setup()과 draw() 함수를 통해 생태계 시뮬레이션을 관리
 */

// 전역 변수
var world; // World 객체 - 전체 생태계를 관리하는 핵심 객체

/**
 * 창 크기 변경 시 캔버스 크기 조정
 * 브라우저 창 크기가 변경될 때 자동으로 호출됨
 */
function windowResized(){
  resizeCanvas(windowWidth,windowHeight); // 캔버스를 창 크기에 맞게 조정
}

/**
 * p5.js 초기화 함수
 * 캔버스 생성, World 객체 생성, 초기 개체들을 생성
 */
function setup(){
  createCanvas(windowWidth,windowHeight); // 전체 화면 크기의 캔버스 생성
  world = new World(); // 생태계 관리 객체 생성
  
  // 디자인을 위해 하나만 생성하기
  world.add(new Fish(CenterPosition, 100));
  
  // 여러개체 한꺼번에 생성하기
  // world.create(MyLife.create,10);
  // world.create(Life.create,10);
}

/**
 * p5.js 메인 루프 함수
 * 매 프레임마다 호출되어 화면을 그리고 시뮬레이션을 업데이트
 */
function draw(){
  background(0);    // 검은색 배경으로 화면 초기화
  setCenter();      // 좌표계를 화면 중심으로 이동 (0,0이 화면 중앙)
  
  // 드로잉용 그리드 생성
  drawingMode();
  
  // 월드 멈추기
  // world.stop();
  
  // 시야 확인
  onSight();
  
  // 월드(개체들) 그리기
  world.draw();
}