class Fish extends Life {
  constructor(pos,weight) {
    super(pos,weight);

  }
  
  custom(){
    this.name="Bird"
    this.lifeSpan = 60 * 60;
    this.normalSpeed = 4;
    this.fastSpeed = 6;
    this.sightRange = 80;
    this.addPart(new Wings(this));  
  }

  // 개체 그리기
  drawing() {
    // 새의 부리 (눈 근처, 반원의 노말 방향)
    push();
      scale(1.5);
      translate(-this.weight * 0.15, 0)
      fill("rgba(255, 202, 96, 1)"); // 주황색 부리
      push();
        translate(this.weight * 0.1, -this.weight * 0.115 );
        rotate(radians(45));
        triangle(
          -this.weight * 0.05, -this.weight * 0.25,
          -this.weight * 0.15, -this.weight * 0.3,
          -this.weight * 0.15, -this.weight * 0.2
        );
        noFill();
      pop();
    
    fill(255, 0, 0);
    
    fill("rgba(45, 56, 113, 1)"); // 주황색 부리
    arc(0, 0, this.weight * 0.8, this.weight * 0.8, -PI/2, PI/2);
    // 반원을 이어주는 선
    //line(0, -this.weight * 0.4, 0, this.weight * 0.4);
    
    // 새의 눈 (칠한 작은 원, 왼쪽 위로 이동)
    noStroke();
    fill(255);
    circle(this.weight * 0.1, -this.weight * 0.2, this.weight * 0.1);
  
    noStroke();
    fill(0);
    circle(this.weight * 0.1, -this.weight * 0.2, this.weight * 0.03);
    pop();
  }
  
  /* 필수 함수 */
  static create(){
    return new Bird();
  }
  
  updateCustom(){
    // 출산 적용시
    if(this.birth){
      world.add(new Bird( this.pos.copy() ));
    }
  }
  /* 필수 함수 */
  
}

class Wings extends Part{
	constructor(pos,weight) {
    super(pos,weight);
  }

	custom(){
	  // Part가 움직이는 속도
    this.speed = 0.2;
	}

	updateCustom(){

	}

	drawing(){

		// this.movement 는 frameCount 와 쓰임이 유사하다
		// sin(움직임) * 움직임 범위
    translate(this.parent.weight * 0.05, -this.parent.weight * 0.04)
    rotate(sin(this.movement * 2)*radians(20) - radians(100));
    
    // 부모(생명체) 크기에 비례한 반원 모양 날개
    fill("rgba(92, 94, 133, 1)"); // 주황색 부리
    // strokeWeight(2);
    push();
      translate(-this.parent.weight * 0.125, 0);
      arc(0, 0, this.parent.weight * 0.3, this.parent.weight * 0.3, 0, PI);
      line(-this.parent.weight * 0.15, 0, this.parent.weight * 0.15, 0);
    pop();
  }
}