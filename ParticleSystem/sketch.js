let fireworks = []; // 여러 불꽃놀이 이펙트를 관리할 배열

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(20, 0, 50); // 짙은 남색 배경
    // noStroke(); // 파티클 기본 윤곽선 제거
}

function draw() {
    // 배경 트레일 효과
    background(20, 0, 50, 50);

    // 모든 불꽃놀이 이펙트 업데이트 및 그리기
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();
        if (fireworks[i].isFinished()) {
            fireworks.splice(i, 1);
        }
    }
}

function mousePressed() {
    // 마우스 클릭 시 새로운 불꽃놀이 이펙트 생성
    fireworks.push(new Emitter(mouseX, mouseY));
}

// 윈도우 크기가 변경될 때 캔버스 크기도 조정
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(20, 0, 50); // 배경색 다시 칠하기
}