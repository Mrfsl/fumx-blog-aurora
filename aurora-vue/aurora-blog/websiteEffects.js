(function () {
    let particles = []; // 飘落粒子数组
    let trails = []; // 鼠标滑动轨迹数组
    let clicks = []; // 鼠标点击特效数组
    let width, height;
    let ctx;
    let particleInterval;

    const shapes = ["@", "✿", "❉", "❀", "&"]; // 其他常规形状
    const shapeColors = ["#FFC1C1", "#FFE4E1", "#FFD700", "#87CEEB", "#65C4EAFF"]; // 粒子颜色
    const specialShapes = ["Fu", "ovo"]; // 特殊的形状字符
    const specialShapeColors = ["#FF6347", "#FF4500"]; // 特殊字符的颜色

    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.setAttribute(
        "style",
        "width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;"
    );

    if (canvas.getContext && window.addEventListener) {
        ctx = canvas.getContext("2d");
        updateSize();
        window.addEventListener("resize", updateSize, false);
        loop();

        // 鼠标滑动特效
        window.addEventListener(
            "mousemove",
            function (e) {
                let x = e.clientX;
                let y = e.clientY;
                createTrail(x, y); // 鼠标轨迹粒子
            },
            false
        );

        // 鼠标点击特效
        window.addEventListener(
            "click",
            function (e) {
                let x = e.clientX;
                let y = e.clientY;
                createClickExplosion(x, y); // 点击爆炸效果
            },
            false
        );

        // 页面可见性变化时暂停或恢复生成粒子
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                // 页面进入后台时停止生成粒子
                clearInterval(particleInterval);
            } else {
                // 页面恢复前台时重新生成粒子
                particleInterval = setInterval(() => createFallingParticles(1), 1500); // 每1500ms生成一个粒子
            }
        });

    } else {
        console.log("Canvas or addEventListener is unsupported!");
    }

    // 更新画布尺寸
    function updateSize() {
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.scale(2, 2);
        width = window.innerWidth;
        height = window.innerHeight;
    }

    // 将文本（如 "Fu", "ovo"）转化为图像的函数
    function textToImage(text, size, color, callback) {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = size * text.length; // 计算宽度
        tempCanvas.height = size; // 设定高度
        tempCtx.font = `${size}px Arial`;
        tempCtx.fillStyle = color; // 使用指定颜色
        tempCtx.fillText(text, 0, size);
        const img = new Image();
        img.onload = function() {
            callback(img); // 在图像加载完成后，执行回调
        };
        img.src = tempCanvas.toDataURL(); // 转换为图片
    }

    // 飘落粒子类
    class FallingParticle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * -50;
            this.vx = Math.random() * -0.3 - 0.3; // 左下飘落速度
            this.vy = Math.random() * 1 + 1.5; // 下落速度
            this.size = Math.random() * 12 + 8; // 粒子大小
            this.color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
            this.shape = shapes[Math.floor(Math.random() * shapes.length)];
            this.isSpecialShape = Math.random() < 0.003; // 9%的概率使用特殊字符
            this.specialShape = this.isSpecialShape ? specialShapes[Math.floor(Math.random() * specialShapes.length)] : null;
            this.opacity = Math.random() * 0.5 + 0.5; // 半透明效果
            this.image = null;

            // 如果是特殊字符（如 "Fu" 或 "ovo"），转化为图像
            if (this.isSpecialShape) {
                // 通过回调函数确保图像加载完成
                const color = specialShapeColors[Math.floor(Math.random() * specialShapeColors.length)];
                textToImage(this.specialShape, 40, color, (img) => {
                    this.image = img;
                });
            }
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.y > height || this.x < 0) {
                // 粒子超出屏幕重新生成
                this.y = Math.random() * -50;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.globalAlpha = this.opacity;
            if (this.isSpecialShape && this.image) {
                // 确保图像加载完成再绘制
                ctx.drawImage(this.image, this.x, this.y, this.size * 2, this.size * 2); // 增加尺寸
            } else {
                // 绘制其他形状（如 "@"、"✿" 等）
                ctx.fillStyle = this.color;
                ctx.font = `${this.size}px Arial`;
                ctx.fillText(this.shape, this.x, this.y);
            }
        }
    }

    // 鼠标轨迹线类
    class Trail {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.opacity = 1; // 初始透明度
            this.fadeRate = 0.05; // 渐隐速度，延长时间
            this.lineWidth = Math.random() * 2 + 1; // 轨迹线宽度
            this.previousX = x; // 当前点的前一个位置X
            this.previousY = y; // 当前点的前一个位置Y
        }
        update() {
            this.opacity -= this.fadeRate; // 渐隐
            if (this.opacity <= 0) {
                this.opacity = 0;
            }
        }
        draw() {
            ctx.globalAlpha = this.opacity;
            const gradient = ctx.createLinearGradient(this.previousX, this.previousY, this.x, this.y);
            gradient.addColorStop(0, "rgba(200, 200, 200, 0.8)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)"); // 渐变颜色
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.previousX, this.previousY);
            ctx.lineTo(this.x, this.y); // 画轨迹线
            ctx.stroke();
        }
    }

    // 点击爆炸特效
    class ClickExplosion {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.particles = [];
            const particleCount = 12; // 缩小爆炸粒子数量
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 20 + 5; // 缩小扩散范围
                const size = Math.random() * 3 + 2; // 缩小粒子大小
                const color = "#f8b1b1"; // 暗色粒子
                this.particles.push({
                    angle,
                    distance,
                    size,
                    color,
                    opacity: 1,
                    fadeRate: 0.07 // 渐隐速度，稍微加快消失速度
                });
            }
        }
        update() {
            this.particles.forEach((p) => {
                p.distance += 0.5; // 粒子扩散
                p.opacity -= p.fadeRate; // 粒子渐隐
            });
            this.particles = this.particles.filter((p) => p.opacity > 0); // 清除透明度为零的粒子
        }
        draw() {
            this.particles.forEach((p) => {
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(
                    this.x + Math.cos(p.angle) * p.distance,
                    this.y + Math.sin(p.angle) * p.distance,
                    p.size,
                    0,
                    Math.PI * 2
                );
                ctx.fillStyle = p.color;
                ctx.fill();
            });
        }
    }

    // 创建飘落粒子
    function createFallingParticles(count) {
        for (let i = 0; i < count; i++) {
            particles.push(new FallingParticle());
        }

        // 保持粒子数量不超过20个
        particles = particles.slice(0, 20); // 只保留前20个
    }

    // 创建鼠标轨迹粒子
    function createTrail(x, y) {
        trails.push(new Trail(x, y));

        // 保持轨迹数量不超过10个
        trails = trails.slice(0, 10); // 只保留前10个轨迹
    }

    // 创建点击爆炸特效
    function createClickExplosion(x, y) {
        clicks.push(new ClickExplosion(x, y));

        // 保持点击爆炸特效数量不超过5个
        clicks = clicks.slice(0, 5); // 只保留前5个爆炸特效
    }

    // 主循环
    function loop() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        trails.forEach((t) => {
            t.update();
            t.draw();
        });
        clicks.forEach((c) => {
            c.update();
            c.draw();
        });

        // 限制粒子数量、轨迹数量和点击爆炸数量
        particles = particles.slice(0, 5);
        trails = trails.slice(0, 10);
        clicks = clicks.slice(0, 5);

        requestAnimationFrame(loop);
    }
})();
