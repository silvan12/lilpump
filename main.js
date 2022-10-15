const game = new Game("canvas");

const score = document.getElementById("score");
const timer = document.getElementById("timer");

let time = timer.innerHTML;

score.innerHTML = localStorage.getItem("score") ?? 0;

function endGame(message, saveScore) {
    alert(message);
    if (saveScore && ball.pumps.toFixed(2) > localStorage.getItem("score")) {
        localStorage.setItem("score", ball.pumps.toFixed(2));
        score.innerHTML = localStorage.getItem("score") ?? 0;
    }
    window.location.reload();
}

class Pump extends GameObject {
    static upTexture = game.loadImage("pump_up.png");
    static downTexture = game.loadImage("pump_down.png");

    constructor() {
        super(new Vector(100, 420), new Vector(0.4, 0.4));
        this.pumpTimer = 0;
    }

    update(deltaTime) {
        this.pumping = Input.keyDown(" ");

        if (Input.keyGoingDown(" ")) {
            this.pumpTimer = 1.5;
        }

        if (Input.keyGoingUp(" ") && this.pumpTimer > 0.5) {
            this.pumpTimer = 0.5;
        }

        if (this.pumpTimer > 0) {
            ball.pump(this.pumpTimer * 1.75 * deltaTime);
        }

        this.pumpTimer -= deltaTime;
    }

    draw() {
        game.canvas.drawImage(this.pumping ? Pump.downTexture : Pump.upTexture, this.pos, this.scale);
    }
}

class Ball extends GameObject {
    static texture = game.loadImage("ball.png");

    constructor() {
        super(new Vector(315, 710), new Vector(0.35, 0.35));
        this.pumps = 0;
    }

    pump(amount) {
        this.pumps += amount;
    }

    pumpedScale() {
        return this.scale.mult(1 + this.pumps * 0.1);
    }

    update(deltaTime) {
        if (this.pumps > 0) {
            this.pumps -= deltaTime * 0.35;
        }

        if (this.pumps > 25) {
            endGame("The ball was pumped too much!", false);
        }

        time -= deltaTime;
        timer.innerHTML = Math.round(time)

        if (Math.round(time) === 0) {
            endGame(`Timer ran out, you scored ${this.pumps.toFixed(2)}`, true);
        }
    }

    draw() {
        var pumpedScale = this.pumpedScale();
        game.canvas.drawImage(Ball.texture, this.pos.sub(new Vector(0, pumpedScale.mult(Ball.texture.size.y).y)), pumpedScale);
    }
}

const pump = new Pump();
game.addObject(pump);

const ball = new Ball();
game.addObject(ball);

game.run();
