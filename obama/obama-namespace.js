const obama = {
    Canvas: class {
        size; // Vector

        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (this.canvas == undefined) {
                throw new Error(`Could not find canvas with id "${canvasId}"`);
            }

            this.size = new obama.Vector(this.canvas.width, this.canvas.height);
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
    },

    Vector: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        add(other) {
            return new obama.Vector(this.x + other.x, this.y + other.y);
        }

        sub(other) {
            return new obama.Vector(this.x - other.x, this.y - other.y);
        }
    },

    Game: class {
        constructor(canvas, objects) {
            this.canvas = canvas instanceof obama.Canvas ? canvas : new obama.Canvas(canvas);
            this.objects = objects;
        }

        run(fps) {
            // Wait for all images to load
            if (obama.imagesToLoad > 0) {
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
    },

    GameObject: class {
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
    },

    imagesToLoad: 0,

    loadImage: function (path) {
        const image = new Image();
        image.src = path;
        image.addEventListener("load", () => {
            obama.imagesToLoad--;
        });

        obama.imagesToLoad++;
        return image;
    }
}
