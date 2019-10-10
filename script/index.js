var STARTED = false, COUNT = 0, LIMIT = 999, TAU = Math.PI * 2;

// Stars
var Particle = (function () {
    function Particle(texture, frame) {
        this.texture = texture;
        this.frame = frame;
        this.alive = false;
        this.width = frame.width;
        this.height = frame.height;
        this.originX = frame.width / 2;
        this.originY = frame.height / 2;
    }

    Particle.prototype.init = function (x, y) {
        if (x === void 0) {
            x = 0;
        }

        if (y === void 0) {
            y = 0;
        }

        var angle = random(TAU);
        var force = random(2, 6);
        this.x = x;
        this.y = y;
        this.alpha = 1;
        this.alive = true;
        this.theta = angle;
        this.vx = Math.sin(angle) * force;
        this.vy = Math.cos(angle) * force;
        this.rotation = Math.atan2(this.vy, this.vx);
        this.drag = random(0.82, 0.97);
        this.scale = random(0.1, 0.8);
        this.wander = random(0.5, 1.0);
        this.matrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            tx: 0,
            ty: 0
        };
        return this;
    };

    Particle.prototype.update = function () {
        var matrix = this.matrix;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.theta += random(-0.5, 0.5) * this.wander;
        this.vx += Math.sin(this.theta) * 0.1;
        this.vy += Math.cos(this.theta) * 0.1;
        this.rotation = Math.atan2(this.vy, this.vx);
        this.alpha *= 0.98;
        this.scale *= 0.985;
        this.alive = this.scale > 0.06 && this.alpha > 0.06;
        var cos = Math.cos(this.rotation) * this.scale;
        var sin = Math.sin(this.rotation) * this.scale;
        matrix.a = cos;
        matrix.b = sin;
        matrix.c = -sin;
        matrix.d = cos;
        matrix.tx = this.x - ((this.originX * matrix.a) + (this.originY * matrix.c));
        matrix.ty = this.y - ((this.originX * matrix.b) + (this.originY * matrix.d));
        return this;
    };

    Particle.prototype.draw = function (context) {
        var m = this.matrix;
        var f = this.frame;
        context.globalAlpha = this.alpha;
        context.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
        context.drawImage(this.texture, f.x, f.y, f.width, f.height, 0, 0, this.width, this.height);
        return this;
    };

    return Particle;
} ());

var Stars = (function () {
    function Stars(options) {
        var _this = this;

        this.pool = [];
        this.particles = [];
        this.pointer = {
            x: -9999,
            y: -9999
        };

        this.buffer = document.createElement("canvas");
        document.getElementById("base").appendChild(this.buffer);
        this.bufferContext = this.buffer.getContext("2d");
        this.supportsFilters = (typeof this.bufferContext.filter !== "undefined");

        this.pointerMove = function (event) {
            event.preventDefault();
            var pointer = event.targetTouches ? event.targetTouches[0] : event;
            _this.pointer.x = pointer.clientX;
            _this.pointer.y = pointer.clientY;
            for (var i = 0; i < random(2, 7); i++) {
                _this.spawn(_this.pointer.x, _this.pointer.y);
            }
        };
        this.resize = function (width, height) {
            _this.width = _this.buffer.width = _this.view.width = width;
            _this.height = _this.buffer.height = _this.view.height = height;
        };
        this.render = function (time) {
            var context = _this.context;
            var particles = _this.particles;
            var bufferContext = _this.bufferContext;
            context.fillStyle = _this.backgroundColor;
            context.fillRect(0, 0, _this.width, _this.height);

            bufferContext.globalAlpha = 1;
            bufferContext.setTransform(1, 0, 0, 1, 0, 0);
            bufferContext.clearRect(0, 0, _this.width, _this.height);
            bufferContext.globalCompositeOperation = _this.blendMode;

            for (var i = 0; i < particles.length; i++) {
                var particle = particles[i];
                if (particle.alive) {
                    particle.update();
                } else {
                    _this.pool.push(particle);
                    removeItems(particles, i, 1);
                }
            }
            for (var _i = 0, particles_1 = particles; _i < particles_1.length; _i++) {
                var particle = particles_1[_i];
                particle.draw(bufferContext);
            }
            if (_this.supportsFilters) {
                if (_this.useBlurFilter) {
                    context.filter = "blur(" + _this.filterBlur + "px)";
                }
                context.drawImage(_this.buffer, 0, 0);
                if (_this.useContrastFilter) {
                    context.filter = "drop-shadow(4px 4px 4px rgba(0,0,0,1)) contrast(" + _this.filterContrast + "%)";
                }
            }

            context.filter = "none";
            requestAnimationFrame(_this.render);
        };

        Object.assign(this, options);
        this.context = this.view.getContext("2d", {
            alpha: false
        });
    }

    Stars.prototype.spawn = function (x, y) {
        var particle;

        if (this.particles.length > this.maxParticles) {
            particle = this.particles.shift();
        } else if (this.pool.length) {
            particle = this.pool.pop();
        } else {
            particle = new Particle(this.texture, sample(this.frames));
        }

        particle.init(x, y);
        this.particles.push(particle);

        if (STARTED && ++COUNT == LIMIT) {
            stopAudio(document.getElementById("birthday"));
            console.log("haha");
        }

        return this;
    };

    Stars.prototype.start = function () {
        this.resize(this.width, this.height);
        this.render();
        this.view.style.visibility = "visible";

        if (window.PointerEvent) {
            window.addEventListener("pointermove", this.pointerMove);
        } else {
            window.addEventListener("mousemove", this.pointerMove);
            window.addEventListener("touchmove", this.pointerMove);
        }

        requestAnimationFrame(this.render);
        return this;
    };

    return Stars;
} ());

function createFrames(numFrames, width, height) {
    var frames = [];
    for (var i = 0; i < numFrames; i++) {
        frames.push({
            x: width * i,
            y: 0,
            width: width,
            height: height
        });
    }
    return frames;
}

function removeItems(array, startIndex, removeCount) {
    var length = array.length;
    if (startIndex >= length || removeCount === 0) {
        return;
    }

    removeCount = (startIndex + removeCount > length ? length - startIndex : removeCount);

    var len = length - removeCount;
    for (var i = startIndex; i < len; ++i) {
        array[i] = array[i + removeCount];
    }
    array.length = len;
}

function random(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }

    if (min > max) {
        var tmp = min;
        min = max;
        max = tmp;
    }

    return min + (max - min) * Math.random();
}

function sample(array) {
    return array[(Math.random() * array.length) | 0];
}

var stars = new Stars({
    view: document.querySelector("#view"),
    texture: document.querySelector("#stars"),
    frames: createFrames(5, 80, 80),
    width: 340,
    height: 544,
    maxParticles: 800,
    backgroundColor: "#000",
    blendMode: "lighter",
    filterBlur: 50,
    filterContrast: 300,
    useBlurFilter: true,
    useContrastFilter: true
});

// Balloons
var Balloon = function (id, settings) {
    var self = document.getElementById(id);

	this.bundle = document.getElementById("bundle");
	this.balloon = {
		obj: self,
		x: Math.random() * (this.bundle.clientWidth - self.clientWidth - settings.margin * 2) + settings.left + settings.margin,
		y: Math.random() * settings.margin + settings.top + settings.margin,
		amplitude: {
			x: 0.02 + Math.random() / 10,
			y: 0.5 + Math.random() / 2
		},
		amplifier: Math.random() * 20,
		angle: 0
	}

	this.setTimer(settings);
};

Balloon.prototype.setTimer = function (settings) {
	this.move(settings);
	var self = this;
	setTimeout(function () {self.setTimer(settings)}, 20);
};

Balloon.prototype.move = function (settings) {
	var balloon = this.balloon;

	balloon.y += balloon.amplitude.y;

	if (balloon.y + balloon.obj.clientHeight + settings.margin > this.bundle.clientHeight + settings.top) {
		balloon.y = Math.random() * settings.margin + settings.top + settings.margin;
	}

	balloon.angle += balloon.amplitude.x;
	balloon.obj.style.top = balloon.y + "px";
	balloon.obj.style.left = balloon.x + balloon.amplifier * Math.sin(balloon.angle) + "px";
};

function createObj(type, parent, id, src) {
    var obj = document.createElement(type);
    obj.id = id;
    obj.src = src;
    document.getElementById(parent).appendChild(obj);
}

function createBalloons(settings) {
    var ids = ["balloon1", "balloon2", "balloon3", "balloon4"],
        srcs = ["image/balloon_blue.png", "image/balloon_red.png"];

    for (var i = 0, n = ids.length, m = srcs.length; i < n; i++) {
        createObj("img", "bundle", ids[i], srcs[i % m]);
        new Balloon(ids[i], settings);
    }
}

// Menu
function calcPos(element, settings) {
    var x = Math.ceil(Math.random() * (settings.width - element.width() * 1.5 - settings.margin * 4)) + settings.left + settings.margin * 2,
        y = Math.ceil(Math.random() * (settings.height - element.height() * 1.5 - settings.margin * 4)) + settings.top + settings.margin * 2;

    return [x, y];
}

function calcSpeed(curr, next) {
    var x = Math.abs(curr[0] - next[0]),
        y = Math.abs(curr[1] - next[1]),
        greater = x > y ? x : y,
        modifier = 0.05;

    return Math.ceil(greater / modifier);
}

function animateElement(element, settings) {
    var curr = element.offset(),
        next = calcPos(element, settings),
        speed = calcSpeed([curr.left, curr.top], next);

    element.animate({left: next[0], top: next[1]}, speed, function () {
        animateElement(element, settings);
    });
}

function typing(note) {
    var s = "子曰——学而时习之。不亦说乎。🌈",
        n = s.length, i = -1, l = [0, 4, 10, n];

    typingTimer = setInterval(function () {
        if (++i < n) {
            if (l.includes(i)) {
                note.innerHTML = s[i];
                $("#note").fadeIn(500);
            }
            else if (l.includes(i + 1)) {
                note.innerHTML += s[i];
                $("#note").fadeOut(500);
            }
            else {
                note.innerHTML += s[i];
            }
        }
        else {
            note.remove();
            clearInterval(typingTimer);
        }
    }, 375);
}

function playAudio(audio, loop) {
    var playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
        })
        .catch(error => {
        });
    }

    audio.onended = function () {
        if (loop) {
            this.currentTime = 0;
            this.play();
        }
    };
}

function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
}

// Main
function main() {
    var settings = {
        margin: 20,
        left: 10,
        top: 10,
        width: 340,
        height: 544
    };

    var divBase = document.getElementById("base"),
        divNote = document.getElementById("note"),
        divButton = document.getElementById("button"),
        divPop = document.getElementById("pop"),
        divBirthday = document.getElementById("birthday");

    var isClicked = false, isPlayed = false;

    stars.start()
    animateElement($("#button"), settings);

    divButton.onclick = function () {
        explodeTimer = setInterval(function () {
            if (!isClicked) {
                isClicked = true;
                $("#bubble").explode({
                    maxWidth: 12,
                    minWidth: 4,
                    maxAngle: 360,
                    radius: 480,
                    explodeTime: 250,
                    gravity: 10,
                    groundDistance: 4096,
                    canvas: true,
                    round: true,
                    recycle: false,
                    release: false
                });
            }
            else {
                divButton.remove();
                clearInterval(explodeTimer);
            }
        }, 250);

        if (!STARTED) {
            STARTED = true;
            playAudio(divPop, false);
            playAudio(divBirthday, true);
            createBalloons(settings);
            typing(divNote);
        }
    };

    divBase.onclick = function (e) {
    };

    divBase.onmousemove = function (e) {
    };

    divBase.ontouchmove = function (e) {
    };
}

window.onload = main();