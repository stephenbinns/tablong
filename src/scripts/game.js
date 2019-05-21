import Phaser from 'phaser';

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 400
const SCREEN_CENTER = DEFAULT_WIDTH / 2;


class IntroScene extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'IntroScene', active: true });
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xffffff);
        this.add.text(DEFAULT_WIDTH / 2 - 170, 50, 'TABLONG!!!', { fontSize: '64px', fill: '#000' });

        if (this.sys.game.device.input.touch == false) {
            this.add.text(DEFAULT_WIDTH / 2 - 70, 200, 'Players:', { fontSize: '32px', fill: '#000' });

            this.input.manager.enabled = true;
            this.clickButton1 = this.add.text(DEFAULT_WIDTH / 2 - 130, 270, 'One', { fontSize: '32px', fill: '#000' });
            this.clickButton2 = this.add.text(DEFAULT_WIDTH / 2 + 100, 270, 'Two', { fontSize: '32px', fill: '#000' });

            this.clickButton1.setInteractive();
            this.clickButton2.setInteractive();

            this.clickButton1.once('pointerdown', function () {
                this.scene.start('GameScene', { twoPlayer: false });
            }, this);

            this.clickButton2.once('pointerdown', function () {
                this.scene.start('GameScene', { twoPlayer: true });
            }, this);
        } else {
            setTimeout(() => this.scene.start("GameScene", { twoPlayer: false }), 1000)
        }
    }
}

class GameScene extends Phaser.Scene {
    constructor ()
    {
        super({ key: 'GameScene', active: false });
        this.score1 = 0;
        this.score2 = 0;
        this.twoPlayer = false;
    }

    init(data)
    {
        console.log('init', data);
        this.twoPlayer = data.twoPlayer;

        this.arrowKeys = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

    }

    createPlayer(game, x, y, flip) {
        const player = game.physics.add.image(x, y, 'player1-down');

        player.setImmovable(true);
        player.setCollideWorldBounds(true);
        player.body.setMaxVelocity(360, 360);

        if (flip) {
            player.flipX = true;
        }
        player.body.setDragX(400);

        return player;
    }

    preload() {
        this.load.image('player1-up', 'assets/player1.png');
        this.load.image('player1-down', 'assets/player1-down.png');

        this.load.image('wall', 'assets/wall.png');
        this.load.image('table', 'assets/table.png');
        this.load.image('shrug', 'assets/shrug.png');
    }

    mapKeys(cursors, player) {
        if (cursors.left.isDown) {
            const vel = Math.max(player.body.velocity.x - 360, -360);
            player.setVelocityX(vel);
        } else if (cursors.right.isDown) {
            const vel = Math.min(player.body.velocity.x + 360, 360);
            player.setVelocityX(vel);
        }

        if (cursors.up.isDown) {
            if (player.body.velocity.y === 0) {
                player.setVelocityY(-270);
                player.setTexture('player1-up');
            }
        }
    }

    resetTable(xVelocity) {
        this.table.body.reset(game.config.width / 2, 30);
        this.table.body.enable = false;
        this.table.setAngle(0);

        this.player1.body.x = 200;
        this.player1.setVelocityX(0);

        this.player2.body.x = game.config.width - 200;
        this.player2.setVelocityX(0);

        setTimeout(() => {
            this.table.setVelocity(xVelocity, 200);
            this.table.body.enable = true;
        }, 1000);
    }


    update() {
        this.mapKeys(this.wasdKeys, this.player1);

        if (this.table.body.enable) {
            if (this.table.body.velocity.x > 1) {
                this.table.setAngle(this.table.angle + 1);
            } else {
                this.table.setAngle(this.table.angle - 1);
            }
        }

        if (this.twoPlayer) {
            this.mapKeys(this.arrowKeys, this.player2);
        } else if (this.table.body.x > this.player2.body.x) {
            this.player2.body.velocity.x = this.table.body.velocity.x;
        } else {
            this.player2.body.velocity.x = -this.table.body.velocity.x;
        }

        if (this.player1.x >= (SCREEN_CENTER - (this.player1.body.width / 2)) && this.player1.body.velocity.x >= 0) {
            this.player1.setVelocityX(0);
        }
        if (this.player2.x <= (SCREEN_CENTER + (this.player2.body.width / 2)) && this.player2.body.velocity.x <= 0) {
            this.player2.setVelocityX(0);
        }

        if (this.player1.body.velocity.y === 0) {
            this.player1.setTexture('player1-down');
        }
        if (this.player2.body.velocity.y === 0) {
            this.player2.setTexture('player1-down');
        }

        if (this.table.body.y >= (this.game.config.height - this.table.body.height)) {
            if (this.table.body.x < SCREEN_CENTER) {
                this.score2 += 1;
                this.score2Label.setText(this.score2);
                this.cameras.main.shake(500);
                this.resetTable(200);
            } else {
                this.score1 += 1;
                this.score1Label.setText(this.score1);
                this.cameras.main.shake(500);
                this.resetTable(-200);
            }
        }
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        const line = new Phaser.Geom.Line(game.config.width, SCREEN_CENTER, 0, SCREEN_CENTER);
        const graphics = this.add.graphics({ lineStyle: { width: 8, color: 0x000000 } });
        graphics.strokeLineShape(line);

        this.score1Label = this.add.text(200, 50, '0', { fontSize: '48px', fill: '#000' });
        this.score2Label = this.add.text(this.game.config.width - 200, 50, '0', { fontSize: '48px', fill: '#000' });

        this.table = this.physics.add.image(SCREEN_CENTER, 30, 'table');
        this.table.setBounce(2, 1);
        this.table.setCollideWorldBounds(true);
        this.table.setDrag(5, 5);
        this.table.setMaxVelocity(800, 800);
        this.table.body.enable = false;

        setTimeout(() => {
            this.table.body.enable = true;
            this.table.setVelocity(200, 200);
        }, 1000);

        this.player1 = this.createPlayer(this, 200, 390);
        this.player2 = this.createPlayer(this, this.game.config.width - 200, 390, true);

        this.physics.add.collider(this.player1, this.table);
        this.physics.add.collider(this.player2, this.table);

        const walls = this.physics.add.staticGroup();

        Array.from(Array(5)).forEach((_, i) => {
            walls.create(this.game.config.width / 2, 70 + (this.game.config.height / 2) + i * 28, 'wall');
        });
        this.physics.add.collider(this.table, walls);
        this.physics.add.collider(this.player1, walls);
        this.physics.add.collider(this.player2, walls);

        if (this.sys.game.device.input.touch == false) {
            const particles = this.add.particles('shrug');
            const emitter = particles.createEmitter({
                speed: 100,
                scale: { start: 0.5, end: 0 },
                blendMode: 'SUBTRACT',
            });

            emitter.startFollow(this.table);
        } else {
            this.input.addPointer();
            this.input.on('pointerdown', function(pointer) {
                if (pointer.x > 400) {
                    this.player1.setVelocityX(360);
                } else {
                    this.player1.setVelocityX(-360);
                }
                if (pointer.y < 150) {
                    if (this.player1.body.velocity.y === 0) {
                        this.player1.setVelocityY(-270);
                        this.player1.setTexture('player1-up');
                    }
                }
            }, this);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    },
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
        },
    },
    scene: [ IntroScene, GameScene ]
};

const game = new Phaser.Game(config);
