const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#222",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let cursors;
let cameraDirection = 0; // ラジアン
let player = { x: 400, y: 300, speed: 200 };
let pointerLocked = false;
let crosshair;

function preload() {
    // クロスヘア用画像を生成
}

function create() {
    // クロスヘア（中央の照準）
    crosshair = this.add.graphics();
    crosshair.lineStyle(2, 0xffffff, 1);
    crosshair.strokeLineShape(new Phaser.Geom.Line(400 - 10, 300, 400 + 10, 300));
    crosshair.strokeLineShape(new Phaser.Geom.Line(400, 300 - 10, 400, 300 + 10));

    // キーボード
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // マウスロック
    this.input.on('pointerdown', function () {
        if (!pointerLocked) {
            this.input.mouse.requestPointerLock();
        }
    }, this);

    this.input.mouse.on('pointerlockchange', function (locked) {
        pointerLocked = locked;
    }, this);

    // マウスで視点回転
    this.input.on('pointermove', function (pointer) {
        if (pointerLocked) {
            cameraDirection += pointer.movementX * 0.002;
        }
    }, this);

    // 背景用タイル
    this.bg = this.add.tileSprite(400, 300, 800, 600, null);
    this.bg.fillColor = 0x333366;
    this.bg.setOrigin(0.5, 0.5);
    // 簡易的な床模様
    this.bgGraphics = this.add.graphics();
}

function update(time, delta) {
    // 移動
    let moveX = 0, moveY = 0;
    if (cursors.up.isDown) moveY += 1;
    if (cursors.down.isDown) moveY -= 1;
    if (cursors.left.isDown) moveX -= 1;
    if (cursors.right.isDown) moveX += 1;

    // 進行方向をカメラの向きに合わせる
    let angle = cameraDirection;
    let speed = player.speed * (delta / 1000);
    let dx = (moveY * Math.cos(angle) + moveX * Math.cos(angle - Math.PI/2)) * speed;
    let dy = (moveY * Math.sin(angle) + moveX * Math.sin(angle - Math.PI/2)) * speed;
    player.x += dx;
    player.y += dy;

    // 背景を動かして移動感を出す
    this.bg.tilePositionX = player.x;
    this.bg.tilePositionY = player.y;

    // 床模様を描画
    this.bgGraphics.clear();
    this.bgGraphics.fillStyle(0x333366, 1);
    this.bgGraphics.fillRect(0, 0, 800, 600);
    this.bgGraphics.lineStyle(1, 0x8888cc, 0.5);
    for (let i = -10; i <= 10; i++) {
        // 奥行き方向の線
        let x1 = 400 + Math.cos(angle) * -300 + Math.cos(angle - Math.PI/2) * i * 40;
        let y1 = 300 + Math.sin(angle) * -300 + Math.sin(angle - Math.PI/2) * i * 40;
        let x2 = 400 + Math.cos(angle) * 300 + Math.cos(angle - Math.PI/2) * i * 40;
        let y2 = 300 + Math.sin(angle) * 300 + Math.sin(angle - Math.PI/2) * i * 40;
        this.bgGraphics.lineBetween(x1, y1, x2, y2);
    }
    for (let j = -7; j <= 7; j++) {
        // 横方向の線
        let x1 = 400 + Math.cos(angle - Math.PI/2) * -400 + Math.cos(angle) * j * 40;
        let y1 = 300 + Math.sin(angle - Math.PI/2) * -400 + Math.sin(angle) * j * 40;
        let x2 = 400 + Math.cos(angle - Math.PI/2) * 400 + Math.cos(angle) * j * 40;
        let y2 = 300 + Math.sin(angle - Math.PI/2) * 400 + Math.sin(angle) * j * 40;
        this.bgGraphics.lineBetween(x1, y1, x2, y2);
    }
}

// グローバルPhaserを使う
const game = new window.Phaser.Game(config);
