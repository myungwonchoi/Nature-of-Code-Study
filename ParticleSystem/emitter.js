class Emitter {
    constructor(targetX, targetY) {
        this.pos = createVector(width / 2, height); // 캔버스 하단 중앙에서 시작 (수정: 캔버스 하단, x는 랜덤)
        this.target = createVector(targetX, targetY); // 마우스 클릭 위치
        this.rocket = new Particle(random(width * 0.2, width * 0.8), height, random(0, 360), true); // 랜덤 x 위치에서 로켓 생성
        this.particles = [];
        this.exploded = false;
        this.explosionDelay = 0; // 폭발 지연 타이머
        this.initialDistance = p5.Vector.dist(this.rocket.pos, this.target); // 초기 거리 계산
    this.rocketHue = random(0, 360); // 로켓의 고유 색상
    this.particlesCreated = false; // 파티클이 실제로 생성(폭발)되었는지 여부
    }

    update() {
        if (!this.exploded) {
            // 로켓이 목표 지점에 도달했는지 확인
            let currentDistance = p5.Vector.dist(this.rocket.pos, this.target);

            // 로켓이 목표 지점을 넘어섰거나, 목표 지점에 매우 가까워지면 폭발
            if (currentDistance < 10 || this.rocket.pos.y < this.target.y) {
                this.exploded = true;
                this.explosionDelay = frameCount + floor(random(20, 40)); // 약 0.3초 ~ 0.6초 지연 (60fps 기준)
                // 로켓은 사라지기 위해 수명 0으로 설정
                this.rocket.lifespan = 0;
            } else {
                // 로켓이 목표를 향해 움직이도록 가속도 조정
                let steer = p5.Vector.sub(this.target, this.rocket.pos);
                steer.normalize();
                steer.mult(0.5); // 가속력 조절
                this.rocket.applyForce(steer);
                this.rocket.update();
            }
        } else {
            // 폭발 지연 후 파티클 생성
            if (frameCount > this.explosionDelay && this.particles.length === 0) {
                this.explode();
            }
            // 파티클 업데이트를 Emitter에서 직접 처리
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                if (this.particles[i].isDead()) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    explode() {
        let numParticles = floor(random(50, 100)); // 폭발 시 생성될 파티클 수
        for (let i = 0; i < numParticles; i++) {
            let particleType = floor(random(3)); // 0, 1, 2 중 랜덤 선택

            // 오묘한 색상을 위한 Hue 범위 조절
            let particleHue = (this.rocketHue + random(-30, 30) + 360) % 360; // 로켓 색상 주변으로 퍼지게

            if (particleType === 0) {
                this.particles.push(new Spark(this.rocket.pos.x, this.rocket.pos.y, particleHue));
            } else if (particleType === 1) {
                this.particles.push(new Star(this.rocket.pos.x, this.rocket.pos.y, particleHue));
            } else {
                this.particles.push(new Glow(this.rocket.pos.x, this.rocket.pos.y, particleHue));
            }
        }
        this.particlesCreated = true; // 폭발(파티클 생성) 완료 플래그
    }

    show() {
        if (!this.exploded || this.rocket.lifespan > 0) { // 폭발 전 로켓 표시 (혹은 폭발해도 잠시 유지)
            this.rocket.show();
        }
        for (let particle of this.particles) {
            particle.show();
        }
    }

    isFinished() {
        // 폭발이 일어나지 않았으면 무조건 false
        if (!this.exploded) return false;
        // 폭발 후 파티클이 모두 사라졌을 때만 true
        if (this.particles.length === 0 && this.particlesCreated) {
            // 파티클 모두 사라짐 콘솔 디버그
            console.log("Emitter finished: all particles are dead.");
            return true;
        }

    }
}
