/**
 * Control.js - GUI 설정 및 개체 행동 파라미터를 관리하는 파일
 */

/**
 * Setting 클래스 - 개체들의 행동을 제어하는 파라미터들을 정의
 * dat.GUI를 사용하여 실시간으로 조정 가능한 설정들
 */
var Setting = function() {
  this.sightDist = 70;           // 시야 거리
  this.sightAngle = Math.PI*0.5; // 시야 각도 (라디안)
  this.mouseFollow = 3.0;        // 마우스 추적 강도
  this.separate = 0.0;           // 분리 행동 강도
  this.cohesion = 0.0;           // 응집 행동 강도
  this.align = 0.0;              // 정렬 행동 강도
};

// 전역 설정 인스턴스 생성
var setting = new Setting();

// dat.GUI를 사용한 실시간 파라미터 조정 (현재 주석 처리됨)
// var gui = new dat.GUI();
// gui.add(setting, 'sightDist', 0, 300);      // 시야 거리 조정
// gui.add(setting, 'sightAngle', 0, Math.PI); // 시야 각도 조정
// gui.add(setting, 'mouseFollow', 0, 10);     // 마우스 추적 강도 조정
// gui.add(setting, 'separate', 0, 1);         // 분리 행동 강도 조정
// gui.add(setting, 'cohesion', 0, 1);         // 응집 행동 강도 조정
// gui.add(setting, 'align', 0, 0.1);          // 정렬 행동 강도 조정
// gui.close();