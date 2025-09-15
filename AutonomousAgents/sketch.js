// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// (Modified with enhancements)

let vehicle;
let target;
let speedSlider, forceSlider;
let resetButton;

function setup() {
  createCanvas(800, 400);
  resetSketch(); // 초기 설정을 위한 함수 호출

  // 최대 속도 슬라이더 생성
  speedSlider = createSlider(0, 15, 8, 0.1); // (최소, 최대, 시작값, 단계)
  speedSlider.position(10, 10);

  // 최대 조향력 슬라이더 생성
  forceSlider = createSlider(0, 0.5, 0.2, 0.01);
  forceSlider.position(10, 40);

  // 리셋 버튼 생성
  resetButton = createButton('Reset');
  resetButton.position(10, 70);
  resetButton.mousePressed(resetSketch); // 버튼 클릭 시 resetSketch 함수 실행
}

// 스케치를 초기 상태로 리셋하는 함수
function resetSketch() {
  // Vehicle을 화면 왼쪽 중앙에 생성
  vehicle = new Vehicle(100, height / 2);
  // Target을 화면 오른쪽 중앙에 고정
  target = createVector(width - 64, height / 2);
}


function draw() {
  background(240);

  // 목표 지점(Target) 그리기
  stroke(0);
  strokeWeight(2);
  fill(127, 200, 127); // 초록색 원
  circle(target.x, target.y, 48);

  // 슬라이더 값을 vehicle 속성에 실시간으로 반영
  vehicle.maxspeed = speedSlider.value();
  vehicle.maxforce = forceSlider.value();

  // 목표와의 충돌 감지
  let distance = p5.Vector.dist(vehicle.position, target);
  if (distance < 24) { // 원의 반지름(24)보다 가까워지면
    vehicle.stop(); // vehicle 정지
  }

  // 정지 상태가 아닐 때만 목표를 향해 이동
  if (!vehicle.isStopped()) {
    vehicle.seek(target);
  }

  // Vehicle 상태 업데이트 및 그리기
  vehicle.update();
  vehicle.displayPath(); // 이동 경로 그리기
  vehicle.show(); // Vehicle 본체 그리기
  vehicle.debugDraw(target); // 힘 시각화 화살표 그리기

  // 슬라이더 옆에 텍스트 라벨 표시
  fill(0);
  noStroke();
  textSize(14);
  text('Max Speed', speedSlider.x * 2 + speedSlider.width, 25);
  text('Max Force', forceSlider.x * 2 + forceSlider.width, 55);
}