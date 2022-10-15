class Canvas {
    #canvas;
    #context;

    size; // Vector

    constructor(canvasId) {
        this.#canvas = document.getElementById(canvasId);
        if (this.#canvas == undefined) {
            throw new Error(`Could not find canvas with id "${canvasId}"`);
        }

        this.size = new Vector(this.#canvas.width, this.#canvas.height);
        this.#context = this.#canvas.getContext("2d");
    }

    clear() {
        this.#context.clearRect(0, 0, this.size.x, this.size.y);
    }

    drawRect(topLeft, size, color) {
        this.#context.fillStyle = color;
        this.#context.fillRect(topLeft.x, topLeft.y, size.x, size.y);
    }

    drawImage(image, topLeft, scale = new Vector(1, 1)) {
        var flipX = scale.x < 0;
        var flipY = scale.y < 0;
        var scaledWidth = image.width * Math.abs(scale.x);
        var scaledHeight = image.height * Math.abs(scale.y);

        this.#context.save();
        this.#context.setTransform(
            flipX ? -1 : 1, 0,
            0, flipY ? -1 : 1,
            topLeft.x + flipX * scaledWidth,
            topLeft.y + flipY * scaledHeight
        );
        this.#context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        this.#context.restore();
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    mult(other) {
        if (typeof other == "number") {
            return new Vector(this.x * other, this.y * other);
        }

        return new Vector(this.x * other.x, this.y * other.y);
    }

    div(other) {
        if (typeof other == "number") {
            if (other == 0) {
                throw new Error("Division by 0");
            }

            return new Vector(this.x / other, this.y / other);
        }

        if (other.x == 0 || other.y == 0) {
            throw new Error("Division by 0");
        }

        return new Vector(this.x / other.x, this.y / other.y);
    }

    dist(other) {
        return other.sub(this).magnitude();
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const magnitude = this.magnitude();
        if (magnitude != 0) {
            return this.div(magnitude);
        }

        return new Vector(0, 0);
    }
}

class Game {
    #objects;
    #imagesToLoad;

    constructor(canvas) {
        this.canvas = canvas instanceof Canvas ? canvas : new Canvas(canvas);

        this.#objects = [];
        this.#imagesToLoad = 0;
    }

    addObject(object) {
        if (!object instanceof GameObject) {
            throw new Error("Cannot add object that doesn't extend GameObject");
        }

        this.#objects.push(object);
    }

    removeObject(object) {
        this.#objects = this.#objects.filter(obj => obj != object);
    }

    loadImage(path) {
        this.#imagesToLoad++;
        const image = new Image();

        image.src = path;
        image.addEventListener("load", function () {
            image.size = new Vector(image.width, image.height);
            this.#imagesToLoad--;
        }.bind(this));

        return image;
    }

    run() {
        // Wait for all images to load
        if (this.#imagesToLoad > 0) {
            setTimeout(function () {
                this.run();
            }.bind(this), 100);

            return;
        }

        // Set up input
        Input.setup();

        // Create lastTime member
        this.lastTime = Date.now();

        // Start main loop
        this.loop();
    }

    // Warning: Do not call this method directly, you should call Game.run as Game.run makes sure textures are loaded, unlike Game.loop
    loop() {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(deltaTime);
        this.draw();

        setTimeout(function () {
            this.loop();
        }.bind(this));
    }

    update(deltaTime) {
        // Update objects
        this.#objects.forEach(obj => {
            obj.update(deltaTime);
        });

        // Update input
        Input.update();
    }

    draw() {
        // Clear canvas
        this.canvas.clear();

        // Draw objects
        this.#objects.forEach(obj => {
            obj.draw();
        });
    }
}

class Input {
    static #keyMap = {};

    static #State = {
        GoingUp: 0,
        Up: 1,
        GoingDown: 2,
        Down: 3,
    };

    static setup() {
        document.onkeydown = event => {
            if (event.repeat) {
                return;
            }

            Input.#keyMap[event.key] = Input.#State.GoingDown;
        };

        document.onkeyup = event => {
            Input.#keyMap[event.key] = Input.#State.GoingUp;
        };
    };

    static update() {
        Object.keys(Input.#keyMap).forEach(key => {
            if (Input.#keyMap[key] == Input.#State.GoingDown) {
                Input.#keyMap[key] = Input.#State.Down;
            } else if (Input.#keyMap[key] == Input.#State.GoingUp) {
                Input.#keyMap[key] = Input.#State.Up;
            }
        });
    };

    static keyGoingUp = key => Input.#keyMap[key] == Input.#State.GoingUp;
    static keyUp = key => Input.#keyMap[key] == Input.#State.GoingUp || Input.#keyMap[key] == Input.#State.Up;
    static keyGoingDown = key => Input.#keyMap[key] == Input.#State.GoingDown;
    static keyDown = key => Input.#keyMap[key] == Input.#State.GoingDown || Input.#keyMap[key] == Input.#State.Down;
}

class GameObject {
    pos; // Vector
    scale; // Vector

    constructor(pos, scale) {
        this.pos = pos;
        this.scale = scale;
    }

    update(deltaTime) {
        throw new Error(`${typeof this} does not implement update`);
    }

    draw() {
        throw new Error(`${typeof this} does not implement draw`);
    }
}

class Collision {
    static circleWithCircle(posA, radiusA, posB, radiusB) {
        return posA.dist(posB) < radiusA + radiusB;
    }

    static rectWithRect(posA, sizeA, posB, sizeB) {
        return !(
            (posB.x + sizeB.x < posA.x) ||
            (posB.x > posA.x + sizeA.x) ||
            (posB.y + sizeB.y < posA.y) ||
            (posB.y > posA.y + sizeA.y)
        );
    }
}
