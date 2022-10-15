class Obama {
    static Canvas = class {
        size; // Vector

        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (this.canvas == undefined) {
                throw new Error(`Could not find canvas with id "${canvasId}"`);
            }

            this.size = new Obama.Vector(this.canvas.width, this.canvas.height);
            this.context = this.canvas.getContext("2d");
        }

        clear() {
            this.context.clearRect(0, 0, this.size.x, this.size.y);
        }

        drawRect(topLeft, size, color) {
            this.context.fillStyle = color;
            this.context.fillRect(topLeft.x, topLeft.y, size.x, size.y);
        }

        drawImage(image, topLeft) {
            this.context.drawImage(image, topLeft.x, topLeft.y);
        }

        drawImage(image, topLeft, scale) {
            this.context.drawImage(image, topLeft.x, topLeft.y, scale.x, scale.y);
        }
    }

    static Vector = class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        add(other) {
            return new Obama.Vector(this.x + other.x, this.y + other.y);
        }

        sub(other) {
            return new Obama.Vector(this.x - other.x, this.y - other.y);
        }
    }

    static Game = class {
        constructor(canvas, objects) {
            this.canvas = canvas instanceof Obama.Canvas ? canvas : new Obama.Canvas(canvas);
            this.objects = objects;
        }

        run(fps) {
            // Wait for all images to load
            if (Obama.imagesToLoad > 0) {
                setTimeout(function () {
                    this.run(fps);
                }.bind(this), 100);

                return;
            }

            this.loop(fps);
        }

        // Warning: Do not call this method directly, you should call Game.run as Game.run makes sure textures are loaded, unlike Game.loop
        loop(fps) {
            this.update();
            this.draw();

            setTimeout(function () {
                this.loop(fps);
            }.bind(this), 1 / fps * 1000);
        }

        update() {
            // Update objects
            this.objects.forEach(obj => {
                obj.update();
            });
        }

        draw() {
            // Draw objects
            this.canvas.clear();

            this.objects.forEach(obj => {
                obj.draw();
            });
        }
    }

    static GameObject = class {
        pos; // Vector
        canvas; // Canvas

        constructor(pos) {
            this.pos = pos;
        }

        update() {
            throw new Error(`${typeof this} does not implement update`);
        }

        draw() {
            throw new Error(`${typeof this} does not implement draw`);
        }
    }

    static imagesToLoad = 0;

    static loadImage(path) {
        const image = new Image();
        image.src = path;
        image.addEventListener("load", () => {
            Obama.imagesToLoad--;
        });

        Obama.imagesToLoad++;
        return image;
    }

}