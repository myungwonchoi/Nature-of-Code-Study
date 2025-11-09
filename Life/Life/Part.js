/**
 * Part 클래스 - Life 객체의 부속 부품을 나타내는 클래스
 * 부모 개체의 움직임에 따라 애니메이션되는 부품들을 정의
 */
class Part{
  constructor(parent,pos = new p5.Vector(0,0)){
    this.pos = pos;           // 부품의 상대 위치
    this.move = new p5.Vector(); // 이동 벡터
    this.parent = parent;     // 부모 Life 객체 참조
    this.movement = 0;        // 애니메이션을 위한 움직임 값
    this.speed = 0.2;         // 애니메이션 속도
    this.custom();
  }
  
  /**
   * 커스터마이징 메서드 - 하위 클래스에서 오버라이드
   */
  custom(){
    
  }
  
  /**
   * 부품 업데이트 - 커스텀 업데이트와 움직임 업데이트를 호출
   */
  update(){
    this.updateCustom();
    this.updateMovement();
  }
  
  /**
   * 움직임 업데이트 - 부모의 속도에 따라 애니메이션 값 계산
   * 부모가 빠르게 움직일수록 부품의 애니메이션이 빨라짐
   */
  updateMovement(){
    this.movement += this.parent.vel.mag()*this.speed; // 부모의 속도 크기에 비례하여 움직임 증가
  }
  
  /**
   * 이동 처리 메서드 - 하위 클래스에서 오버라이드
   */
  moving(){
    
  }
  
  /**
   * 커스텀 업데이트 메서드 - 하위 클래스에서 오버라이드
   */
  updateCustom(){}
  
  /**
   * 부품 그리기 - 부품의 위치로 이동하여 그리기
   */
  display(){
    push();
      translate(this.pos.x,this.pos.y);
      this.drawing();
    pop();
  }
  
  /**
   * 실제 부품 모양 그리기 - 기본적으로 움직이는 사각형
   * 하위 클래스에서 오버라이드하여 다른 모양으로 변경 가능
   */
  drawing(){
    rotate(sin(this.movement)*radians(30)); // 사인파를 이용한 회전 애니메이션 (최대 30도)
    rect(0, this.parent.weight*0.75, this.parent.weight*0.1, this.parent.weight*0.4); // 부모 크기에 비례한 사각형
  }
}
