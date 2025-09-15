// ===============================================
// 부모 클래스: Particle
// ===============================================
class Particle {
    constructor(x, y, hue, isRocket = false) {
        this.pos = createVector(x, y);
        // 프레임 기반 수명을 초 기반으로 변경 (60fps 기준)
        this.lifespan = random(0.5, 1.5) * 60; 
        this.initialLifespan = this.lifespan; // 초기 수명을 저장해 크기/투명도 계산에 사용
        this.hue = hue;
        this.alpha = 255;
        this.isRocket = isRocket;

        if (this.isRocket) {
            this.vel = createVector(0, random(-14, -17)); // 위로 발사되는 속도
            this.acc = createVector(0, 0);
        } else {
            // 폭발 파티클
            this.vel = p5.Vector.random2D(); // 360도 랜덤 방향
            this.vel.mult(random(2, 9));     // 랜덤 속도
            this.acc = createVector(0, 0);   // 중력은 update에서 따로 적용
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.isRocket) {
            this.vel.mult(0.96); // 공기 저항 효과로 서서히 느려지게
            this.lifespan -= 1;
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0); // 매 프레임 가속도 초기화

        // 수명에 따른 투명도와 크기 조절
        if (!this.isRocket) {
            const lifeRatio = this.lifespan / this.initialLifespan;
            this.alpha = lifeRatio * 255;
        }
    }
    
    // 이 메서드는 각 자식 클래스에서 재정의(override)될 예정
    show() {
        // 로켓(발사체)을 위한 기본 모양
        push();
        colorMode(HSB, 360, 100, 100, 1);
        stroke(this.hue, 80, 90, this.alpha / 255);
        strokeWeight(4);
        point(this.pos.x, this.pos.y);
        pop();
    }

    isDead() {
        return this.lifespan < 0;
    }
}


// ===============================================
// 자식 클래스 1: Spark
// ===============================================
class Spark extends Particle {
    constructor(x, y, hue) {
        super(x, y, hue);
        this.initialSize = random(3, 7);
    }

    show() {
        const size = this.initialSize * (this.lifespan / this.initialLifespan);
        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();
        fill(this.hue, 80, 90, this.alpha / 255);
        ellipse(this.pos.x, this.pos.y, size, size);
        pop();
    }
}


// ===============================================
// 자식 클래스 2: Star
// ===============================================
class Star extends Particle {
    constructor(x, y, hue) {
        super(x, y, hue);
        this.initialSize = random(5, 10);
        this.points = floor(random(4, 7));
        this.angle = random(TWO_PI); // 초기 회전 각도
    }

    show() {
        const lifeRatio = this.lifespan / this.initialLifespan;
        const currentSize = this.initialSize * lifeRatio;
        const outerRadius = currentSize;
        const innerRadius = currentSize * 0.5;

        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();
        fill(this.hue, 70, 100, this.alpha / 255);
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);

        beginShape();
        for (let i = 0; i < this.points * 2; i++) {
            let r = (i % 2 === 0) ? outerRadius : innerRadius;
            let x = cos(i * PI / this.points) * r;
            let y = sin(i * PI / this.points) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    }
}


// ===============================================
// 자식 클래스 3: Glow
// ===============================================
class Glow extends Particle {
    constructor(x, y, hue) {
        super(x, y, hue);
        this.initialSize = random(8, 14);
    }

    show() {
        const size = this.initialSize * (this.lifespan / this.initialLifespan);
        push();
        colorMode(HSB, 360, 100, 100, 1);
        noStroke();
        
        // 바깥쪽의 부드러운 빛
        fill(this.hue, 50, 95, this.alpha / 255 * 0.5);
        ellipse(this.pos.x, this.pos.y, size, size);
        
        // 중심부의 밝은 핵
        fill(this.hue, 30, 100, this.alpha / 255 * 0.8);
        ellipse(this.pos.x, this.pos.y, size * 0.5, size * 0.5);
        pop();
    }
}