var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    parent: "game",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

var game = new Phaser.Game(config);

var player1,
    player2,
    table,
    score_1_label,
    score_2_label,
    wall;

var score1 = 0;
var score2 = 0;
var screen_center = game.config.width / 2;

var isTableMoving = false;
var twoPlayer = true;

function createPlayer(game, x, y, flip) {
    var player = game.physics.add.image(x, y, 'player1-down');

    player.setImmovable(true);
    player.setCollideWorldBounds(true);
    player.body.setMaxVelocity(360,360);

    if (flip) {
        player.flipX = true;
    }
    player.body.setDragX(400);

    return player;
}

function preload ()
{
    this.load.image('player1-up', 'assets/player1.png');
    this.load.image('player1-down', 'assets/player1-down.png');

    this.load.image('wall', 'assets/wall.png');
    this.load.image('table', 'assets/table.png');
    this.load.image('shrug', 'assets/shrug.png');
}

function mapKeys(cursors, player) {
    if (cursors.left.isDown) {
        var vel = Math.max(player.body.velocity.x - 360, -360);
        player.setVelocityX(vel);
    }
    else if (cursors.right.isDown) {
        var vel = Math.min(player.body.velocity.x + 360, 360);
        player.setVelocityX(vel);
    }

    if (cursors.up.isDown) {
        if (player.body.velocity.y == 0) {
            player.setVelocityY(-270);
            player.setTexture('player1-up');
        }
    }
}

function update() {
    arrowKeys = this.input.keyboard.createCursorKeys();
    wasdKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    mapKeys(wasdKeys, player1);

    if (table.body.enable) {
        if (table.body.velocity.x > 1 ) {
            table.setAngle(table.angle + 1);
        } else {
            table.setAngle(table.angle - 1);
        }
    }

    if (false && twoPlayer) {
        mapKeys(arrowKeys, player2);
    } else {
        if (table.body.x > player2.body.x){
            player2.body.velocity.x = table.body.velocity.x
        } else {
            player2.body.velocity.x = -table.body.velocity.x
        }
    }

    if (player1.x >= (screen_center - (player1.body.width / 2)) && player1.body.velocity.x >= 0) {
        player1.setVelocityX(0);
    }
    if (player2.x <= (screen_center + (player2.body.width / 2)) && player2.body.velocity.x <= 0) {
        player2.setVelocityX(0);
    }

    if (player1.body.velocity.y == 0) {
        player1.setTexture('player1-down');
    }
    if (player2.body.velocity.y == 0) {
        player2.setTexture('player1-down');
    }

    if (table.body.y >= (this.game.config.height - table.body.height)) {
        if (table.body.x < screen_center) {
            score2 += 1;
            score_2_label.setText(score2);
            this.cameras.main.shake(500);
            resetTable(200);
        } else {
            score1 += 1;
            score_1_label.setText(score1);
            this.cameras.main.shake(500);
            resetTable(-200);
        }
    }
}

function resetTable(xVelocity) {
    table.body.reset(game.config.width / 2, 30);
    table.body.enable = false;
    table.setAngle(0);

    player1.body.x = 200;
    player1.setVelocityX(0);

    player2.body.x = game.config.width - 200;
    player2.setVelocityX(0);

    setTimeout(function() {
        table.setVelocity(xVelocity, 200)
        table.body.enable = true;
    }, 1000)
}

function create()
{
    this.cameras.main.setBackgroundColor(0xffffff)

    var line = new Phaser.Geom.Line(game.config.width, screen_center, 0, screen_center);
    var graphics = this.add.graphics({ lineStyle: { width: 8, color: 0x000000 } });
    graphics.strokeLineShape(line);

    score_1_label = this.add.text(200, 50, '0', { fontSize: '48px', fill: '#000' });
    score_2_label = this.add.text(this.game.config.width - 200, 50, '0',  { fontSize: '48px', fill: '#000' });

    table = this.physics.add.image(screen_center, 30, 'table');
    table.setBounce(2, 1);
    table.setCollideWorldBounds(true);
    table.setDrag(5, 5);
    table.setMaxVelocity(800, 800);
    table.body.enable = false;

    setTimeout(function() {
        table.body.enable = true;
        table.setVelocity(200, 200);
    }, 1000);

    player1 = createPlayer(this, 200, 390);
    player2 = createPlayer(this, this.game.config.width - 200, 390, true);

    this.physics.add.collider(player1, table);
    this.physics.add.collider(player2, table);

    walls = this.physics.add.staticGroup();

    for (var i = 0; i < 5; i++) {
        walls.create(this.game.config.width / 2, 70 + (this.game.config.height / 2) + i * 28, 'wall');
    }
    this.physics.add.collider(table, walls);
    this.physics.add.collider(player1, walls);
    this.physics.add.collider(player2, walls);

    var particles = this.add.particles('shrug');

    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 0.5, end: 0 },
        blendMode: 'SUBTRACT'
    });

    emitter.startFollow(table);
}
