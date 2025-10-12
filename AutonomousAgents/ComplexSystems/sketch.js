// Separation
// Via Reynolds: http://www.red3d.com/cwr/steer/

// A list of vehicles
let vehicles = [];

let separateSlider;
let seekSlider;

function setup() {
  // 화면 전체로 캔버스 생성
  createCanvas(windowWidth, windowHeight);
  
  // 슬라이더 생성
  separateSlider = createSlider(0, 3, 1.5, 0.1);
  separateSlider.position(20, 20);
  separateSlider.style('width', '200px');
  
  seekSlider = createSlider(0, 3, 0.5, 0.1);
  seekSlider.position(20, 60);
  seekSlider.style('width', '200px');
  
  // We are now making random vehicles and storing them in an array
  for (let i = 0; i < 80; i++) {
    vehicles.push(new Vehicle(random(width), random(height)));
  }
}

function draw() {
  background(255);

  // 슬라이더 값 가져오기
  let separateWeight = separateSlider.value();
  let seekWeight = seekSlider.value();

  for (let v of vehicles) {
    v.applyBehaviors(vehicles, separateWeight, seekWeight);
    v.update();
    v.borders();
    v.show();
  }
  
  // 마우스 포인터 위치에 투명한 빨간색 원 그리기
  fill(255, 0, 0, 100); // 빨간색, 투명도 100/255
  stroke(255, 0, 0, 150); // 빨간색 테두리, 투명도 150/255
  strokeWeight(2);
  circle(mouseX, mouseY, 40); // 반지름 20px의 원
  
  // 중앙에 작은 점 추가 (정확한 마우스 위치 표시)
  fill(255, 0, 0, 200);
  noStroke();
  circle(mouseX, mouseY, 6);
  
  // 슬라이더 라벨 표시
  fill(0);
  noStroke();
  textSize(14);
  text('Separate 가중치 (분리 행동의 강도): ' + separateWeight.toFixed(1), 240, 35);
  text('Seek 가중치 (마우스 추적 강도): ' + seekWeight.toFixed(1), 240, 75);
  
  // 사용법 안내
  textSize(12);
  text('마우스를 움직여서 차량들이 따라오게 할 수 있습니다', 20, height - 20);
}

// 창 크기가 변경될 때 캔버스 크기도 조정
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}