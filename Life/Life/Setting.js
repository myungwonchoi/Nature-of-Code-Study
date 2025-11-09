/**
 * Setting.js - 전역 설정 및 유틸리티 함수들을 정의하는 파일
 * 화면 좌표계 설정, 격자 그리기, 시야 표시 등의 유틸리티 함수들을 포함
 */

// 전역 변수들
let CenterPosition = new p5.Vector(0,0); // 화면 중심 위치 (사용되지 않음)
let isOnSight = false;                   // 시야 표시 여부 (개체들의 시야 범위 표시)
let isDrawingMode = false;               // 그리기 모드 여부 (격자 표시 및 회전 비활성화)

/**
 * 화면 중심으로 좌표계 이동
 * 모든 그리기 작업을 화면 중심을 기준으로 하도록 설정
 */
function setCenter(){
   translate(width/2,height/2);
}

/**
 * 격자 그리기 함수
 * @param {boolean} mode - true면 세로 격자, false면 가로 격자 (현재는 사용되지 않음)
 */
function drawGrid(mode){
  let len1 = mode?height:width;  // 화면 너비
  let len2 = mode?width:height;  // 화면 높이
  stroke(30);                    // 어두운 회색 격자선
  strokeWeight(1);
  var gap = 20;                  // 격자 간격
  
  // 격자선 그리기 (화면 중심 기준)
  for(var x=-gap; x>-len1/2; x-=gap) line(x,-len2/2,x,len2/2);  // 왼쪽 세로선들
  for(var x=gap; x<len1/2; x+=gap) line(x,-len2/2,x,len2/2);    // 오른쪽 세로선들
  for(var y=-gap; y>-len2/2; y-=gap) line(-len1/2,y,len1/2,y);  // 위쪽 가로선들
  for(var y=gap; y<len2/2; y+=gap) line(-len1/2,y,len1/2,y);    // 아래쪽 가로선들
  
  // 중심축 그리기 (더 밝은 색상)
  stroke(70);
  line(-len1/2,0,len1/2,0);  // X축 (수평선)
  line(0,-len2/2,0,len2/2);  // Y축 (수직선)
  
  // 기본 설정 복원
  noFill();
  stroke(255);
}

/**
 * 그리기 모드 활성화
 * 격자를 그리고 그리기 모드 플래그를 설정
 */
function drawingMode(){
  drawGrid(false);
  isDrawingMode = true;
}

/**
 * 시야 표시 모드 활성화
 * 개체들의 시야 범위와 각도를 표시
 */
function onSight(){
   isOnSight = true;
}

/**
 * 키보드 입력 처리 함수
 * Q키로 QuadTree 시각화 및 정보 표시를 토글
 */
function keyPressed() {
  if (['q','Q','ㅂ'].includes(key)) {  // Q키 또는 한글 ㅂ키
    world.showQuadTree = !world.showQuadTree;
    world.showInfo = world.showQuadTree; // 시각화와 정보를 함께 토글
    console.log('QuadTree 시각화 및 정보:', world.showQuadTree ? 'ON' : 'OFF');
  }
}