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

let player;
let cursors;
let shadow;

function preload() {
    // シンプルな人形画像を用意するか、Phaserのgraphicsで描画
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    // 影
    shadow = this.add.ellipse(400, 300 + 32, 40, 16, 0x000000, 0.3);
    // プレイヤー
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
}

function update() {
    let speed = 200;
    let vx = 0, vy = 0;

    if (cursors.left.isDown) vx -= speed;
    if (cursors.right.isDown) vx += speed;
    if (cursors.up.isDown) vy -= speed;
    if (cursors.down.isDown) vy += speed;

    player.setVelocity(vx, vy);

    // 疑似3D: Y座標によってスケールを変える
    let scale = 1 + (player.y - 300) / 600;
    player.setScale(scale);
    shadow.setScale(scale * 1.2, scale * 0.5);
    shadow.setPosition(player.x, player.y + 32 * scale);
}

// グローバルPhaserを使う
const game = new window.Phaser.Game(config);
