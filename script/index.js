var STARTED = false, COUNT = 0, LIMIT = 999, TAU = Math.PI * 2;
var divMeteor = document.getElementById("meteor");
    divBase = document.getElementById("base"),
    divNote = document.getElementById("note"),
    divBundle = document.getElementById("bundle"),
    divButton = document.getElementById("button"),
    divPop = document.getElementById("pop"),
    divBirthday = document.getElementById("birthday");
var balloons = ["balloon1", "balloon2", "balloon3", "balloon4", "balloon5"];

// Meteor
var context;
var arr = new Array();
var stellarCount = 800;
var meteors = new Array();
var meteorCount = 10;

//初始化画布及context
function initStellar() {
    //获取canvas
    windowWidth = window.innerWidth;
    divMeteor.width = windowWidth;
    divMeteor.height=window.innerHeight;
    //获取context
    context = divMeteor.getContext("2d");
}

//创建一个星星对象
var Stellar = function () {
    this.x = windowWidth * Math.random(); //横坐标
    this.y = 5000 * Math.random(); //纵坐标
    this.text="."; //文本
    this.color = "#fff"; //颜色

    //产生随机颜色
    this.getColor=function () {
        var _r = Math.random();

        if (_r < 0.5) {
            this.color = "#333";
        }
        else {
            this.color = "#fff";
        }
    }

    //初始化
    this.init = function () {
        this.getColor();
    }

    //绘制
    this.draw = function () {
        context.fillStyle = this.color;
        context.fillText(this.text, this.x, this.y);
    }
}

//星星闪起来
function playStellar() {
    for (var i = 0; i < stellarCount; i++){
        arr[i].getColor();
        arr[i].draw();
    }

    setTimeout("playStellar()", 100);
}

/*流星雨开始*/
 var Meteor = function () {
    this.x = -1;
    this.y = -1;
    this.length = -1; //长度
    this.angle = 30; //倾斜角度
    this.width = -1; //宽度
    this.height = -1; //高度
    this.speed = 1; //速度
    this.offset_x = -1; //横轴移动偏移量
    this.offset_y = -1; //纵轴移动偏移量
    this.alpha = 1; //透明度
    this.color1 = ""; //流星颜色
    this.color2 = ""; //流星颜色

    this.init = function () {
        this.getPos();
        this.alpha = 1; //透明度
        this.getRandomColor();
        //最小长度，最大长度
        var x = Math.random() * 80 + 150;
        this.length = Math.ceil(x);
        //x = Math.random()*10+30;
        this.angle = 30; //流星倾斜角
        x = Math.random() + 0.5;
        this.speed = Math.ceil(x); //流星的速度
        var cos = Math.cos(this.angle * 3.14 / 180);
        var sin = Math.sin(this.angle * 3.14 / 180);
        this.width = this.length * cos; //流星所占宽度
        this.height = this.length * sin; //流星所占高度
        this.offset_x = this.speed * cos;
        this.offset_y = this.speed * sin;
    }

    /**************获取随机颜色函数*****************/
    this.getRandomColor = function () {
        var a = Math.ceil(255 - 240 * Math.random());
        //中段颜色
        this.color1 = "rgba("+a+", "+a+", "+a+", 1)";
        //结束颜色
        this.color2 = "#111";
    }

     /***************重新计算流星坐标的函数******************/
    this.countPos = function () {
        //往左下移动,x减少，y增加
        this.x = this.x - this.offset_x;
        this.y = this.y + this.offset_y;
    }

    /*****************获取随机坐标的函数*****************/
    this.getPos = function () {
        //横坐标200-1200
        this.x = Math.random() * window.innerWidth; //窗口高度
        //纵坐标小于600
        this.y = Math.random() * window.innerHeight; //窗口宽度
    }

     /****绘制流星***************************/
    this.draw = function () {
        context.save();
        context.beginPath();
        context.lineWidth = 1; //宽度
        context.globalAlpha = this.alpha; //设置透明度

        //创建横向渐变颜色,起点坐标至终点坐标
        var line = context.createLinearGradient(this.x, this.y, this.x + this.width, this.y - this.height);

        //分段设置颜色
        line.addColorStop(0, "white");
        line.addColorStop(0.3, this.color1);
        line.addColorStop(0.6, this.color2);
        context.strokeStyle = line;
        //起点
        context.moveTo(this.x, this.y);
        //终点
        context.lineTo(this.x + this.width, this.y - this.height);
        context.closePath();
        context.stroke();
        context.restore();
    }

    this.move = function () {
        //清空流星像素
        var x = this.x + this.width - this.offset_x;
        var y = this.y - this.height;
        context.clearRect(x - 3, y - 3, this.offset_x + 5, this.offset_y + 5);
        //context.strokeStyle = "red";
        //context.strokeRect(x, y-1, this.offset_x + 1, this.offset_y + 1);
        //重新计算位置，往左下移动
        this.countPos();
        //透明度增加
        this.alpha -= 0.002;
        //重绘
        this.draw();
    }
}

//绘制流星
function playMeteors() {
    for (var i = 0; i < meteorCount; i++) {
        var meteor = meteors[i];
        meteor.move();
        if (meteor.y > window.innerHeight) {
            context.clearRect(meteor.x, meteor.y - meteor.height, meteor.width, meteor.height);
            meteors[i] = new Meteor();
            meteors[i].init();
        }
    }

    setTimeout("playMeteors()", 2);
}

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

        var angle = random(TAU), force = random(2, 6);
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
        divBase.appendChild(this.buffer);
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
            explodeTimer = setInterval(function () {
                if (STARTED) {
                    STARTED = false;
                    for (x of balloons) {
                        $("#" + x).explode({
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
                }
                else {
                    playAudio(divPop, false);
                    initStellar();
                    //画星星
                    for (var i = 0; i < stellarCount; i++) {
                        var stellar = new Stellar();
                        stellar.init();
                        stellar.draw();
                        arr.push(stellar);
                    }

                    //画流星
                    for (var i=0;i<meteorCount;i++) {
                        var meteor = new Meteor();
                        meteor.init();
                        meteor.draw();
                        meteors.push(meteor);
                    }

                    playStellar();//绘制闪动的星星
                    playMeteors();//绘制流星
                    clearInterval(explodeTimer);
                }
            }, 250);
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
    maxParticles: 400,
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

	this.bundle = divBundle;
	this.balloon = {
		obj: self,
		x: Math.ceil(Math.random() * (this.bundle.clientWidth - self.clientWidth - settings.margin * 2)) + settings.left + settings.margin,
		y: Math.ceil(Math.random() * settings.margin) + settings.top + settings.margin,
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
		balloon.y = Math.ceil(Math.random() * settings.margin) + settings.top + settings.margin;
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
    var srcs = ["image/balloon_blue.png", "image/balloon_gold.png", "image/balloon_pink.png", "image/balloon_violet.png", "image/balloon_white.png"];

    for (var i = 0, n = balloons.length, m = srcs.length; i < n; i++) {
        createObj("img", "bundle", balloons[i], srcs[i % m]);
        new Balloon(balloons[i], settings);
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