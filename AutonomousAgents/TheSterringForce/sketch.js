// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// (Modified with enhancements)

let vehicle;
let target;
let speedSlider, forceSlider;
let resetButton;

let zoom = 1; // 줌 레벨
let viewOffset; // 뷰포트 오프셋

function setup() {
  createCanvas(800, 800);
  resetSketch();

  speedSlider = createSlider(0, 50, 10, 0.1);
  speedSlider.position(10, 10); 
  speedSlider.style('background-color', '#444');  // 슬라이더 배경색 변경

  forceSlider = createSlider(0, 0.3, 0.02, 0.01);  // 범위와 초기값 증가
  forceSlider.position(10, 40);
  forceSlider.style('background-color', '#444');  // 슬라이더 배경색 변경

  resetButton = createButton('Reset');
  resetButton.position(10, 70);
  resetButton.style('background-color', '#444');  // 버튼 배경색 변경
  resetButton.style('color', '#fff');  // 버튼 텍스트 색상 변경
  resetButton.style('border', '1px solid #666');  // 버튼 테두리 색상 변경
  resetButton.mousePressed(resetSketch);

  viewOffset = createVector(0, 0);
}

// 스케치를 초기 상태로 리셋하는 함수
function resetSketch() {
  vehicle = new Vehicle(100, height / 2);
  
  // 초기 속도를 더 강하게 설정
  vehicle.velocity = createVector(1, -5);
  vehicle.velocity.setMag(5); 
  
  target = createVector(width - 64, height / 2);
}


function draw() {
  background(32);

  // Vehicle이 화면을 벗어나는지 체크하고 줌 레벨 조정
  let margin = 100;
  let vPos = vehicle.position;
  let bounds = {
      left: margin,
      right: width - margin,
      top: margin,
      bottom: height - margin
  };

  if (vPos.x < bounds.left || vPos.x > bounds.right || 
      vPos.y < bounds.top || vPos.y > bounds.bottom) {
      let maxDist = max(
          abs(vPos.x - width/2) / (width/2),
          abs(vPos.y - height/2) / (height/2)
      );
      let targetZoom = 1 / (maxDist + 0.5);
      zoom = lerp(zoom, targetZoom, 0.05);
  } else {
      zoom = lerp(zoom, 1, 0.05);
  }

  // 중심점을 기준으로 줌 적용
  push();
  translate(width/2, height/2);
  scale(zoom);
  translate(-width/2, -height/2);

  // Target 그리기 (Vehicle 업데이트 전에)
  stroke(100);
  strokeWeight(2/zoom);  // 줌 레벨에 따라 선 두께 조정
  fill(46, 139, 87);    // 어두운 녹색
  circle(target.x, target.y, 48);

  // Vehicle 관련 업데이트 및 그리기
  vehicle.maxspeed = speedSlider.value();
  vehicle.maxforce = forceSlider.value();

  let distance = p5.Vector.dist(vehicle.position, target);
  if (distance < 24) {
    vehicle.stop();
  }

  if (!vehicle.isStopped()) {
    vehicle.seek(target);
  }

  vehicle.update();
  vehicle.displayPath();
  vehicle.debugDraw(target);
  vehicle.show();

  pop();

  // 범례 그리기
  drawLegend();
}

// 범례 그리기 함수
function drawLegend() {
    const legendX = 20;
    const legendY = height - 120;
    const lineSpacing = 30;
    
    // 벡터 색상 정의
    const desiredColor = color(120, 255, 120);
    const velocityColor = color(255, 90, 90);
    const steerColor = color(100, 100, 255);
    const negVelocityColor = color(255, 180, 180);

    push();
    textAlign(LEFT);
    textSize(16);
    textStyle(BOLD);

    // 텍스트 테두리 효과로 그리기
    function drawTextWithBorder(txt, x, y, col) {
        strokeWeight(4);
        stroke(0);
        fill(0);
        text(txt, x, y);
        noStroke();
        fill(col);
        text(txt, x, y);
    }

    // 텍스트와 화살표 그리기
    drawTextWithBorder("DESIRED", legendX + 30, legendY, desiredColor);
    drawTextWithBorder("VELOCITY", legendX + 30, legendY + lineSpacing, velocityColor);
    drawTextWithBorder("STEERING", legendX + 30, legendY + lineSpacing * 2, steerColor);
    drawTextWithBorder("-VELOCITY", legendX + 30, legendY + lineSpacing * 3, negVelocityColor);

    // 범례의 작은 화살표 그리기
    let legendArrowSize = createVector(20, 0);
    vehicle.drawArrow(createVector(legendX, legendY - 5), legendArrowSize, desiredColor);
    vehicle.drawArrow(createVector(legendX, legendY + lineSpacing - 5), legendArrowSize, velocityColor);
    vehicle.drawArrow(createVector(legendX, legendY + lineSpacing * 2 - 5), legendArrowSize, steerColor);
    vehicle.drawArrow(createVector(legendX, legendY + lineSpacing * 3 - 5), legendArrowSize, negVelocityColor);

    // 슬라이더 레이블
    fill(200);
    noStroke();
    text('Max Speed', speedSlider.x * 2 + speedSlider.width, 25);
    text('Max Force', forceSlider.x * 2 + forceSlider.width, 55);
    
    pop();
}