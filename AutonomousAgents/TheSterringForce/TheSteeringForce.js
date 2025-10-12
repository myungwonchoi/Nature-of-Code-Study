class Vehicle{
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 최고속도;
        this.maxForce = 최대조향력;
    }

    seek(target) {       
        // 원하는 속도 = (목표 위치 - 현재 위치)
        let desired = p5.Vector.sub(target, this.position);
        // 원하는 속도의 크기를 최고속도로 설정
        desired.setMag(this.maxSpeed); 
        
        // 조향력 = 원하는 속도 - 현재 속도
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce); // 조향력의 크기를 최대 조향력으로 제한
        this.applyForce(steer); 
    }
}

