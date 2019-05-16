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

var isTableMoving = false;
var twoPlayer = true;

function createPlayer(game, x, y, flip) {
    var player = game.physics.add.image(x, y, 'player1');

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
    // TODO randomize player sprites
    this.load.image('player1', 'assets/player1.png');
    this.load.image('player2', 'assets/player2.png');

    this.load.image('wall', 'assets/wall.png');
    this.load.image('table', 'assets/table.png');
}

function mapKeys(cursors, player) {
    if (cursors.left.isDown)
    {
        var vel = Math.max(player.body.velocity['x'] -360, -360);
        player.setVelocityX(vel);
    }
    else if (cursors.right.isDown)
    {
        var vel = Math.min(player.body.velocity['x'] +360, 360);
        player.setVelocityX(vel);
    }
    if (cursors.up.isDown)
    {
        if (player.body.velocity['y'] == 0) {
            player.setVelocityY(-200);
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

    if (table.body.velocity["x"] > 1 ) {
        table.setAngle(table.angle + 1);
    } else {
        table.setAngle(table.angle - 1);
    }

    if (twoPlayer) {
        mapKeys(arrowKeys, player2);
    } else {
        player2.body.velocity["x"] = table.body.velocity["x"];
    }

    if (player1.x >= (400 - (player1.body.width / 2)) && player1.body.velocity['x'] >= 0) {
        player1.setVelocityX(0);
    }
    if (player2.x <= (400 + (player2.body.width / 2)) && player2.body.velocity['x'] <= 0) {
        player2.setVelocityX(0);
    }

    if (table.body.y >= (this.game.config.height - table.body.height)) {
        if (table.body.x < 400) {
            score2 += 1;
            score_2_label.setText(score2);

            resetTable(200);
            this.cameras.main.shake(300);
            setTimeout(function() {
                table.setVelocity(100, 200)
            }, 1000)
        } else {
            score1 += 1;
            score_1_label.setText(score1);

            resetTable(this.game.config.width - 200);
            this.cameras.main.shake(300);
            setTimeout(function() {
                table.setVelocity(100, 200)
            }, 1000)
        }
    }
}

function resetTable(initial) {
    table.x = initial;
    table.y = 30;

    player1.x = 200;
    player1.setVelocityX(0);

    player2.x = 800 - 200;
    player2.setVelocityX(0);
}

function create()
{
    this.cameras.main.setBackgroundColor(0xffffff)
    table = this.physics.add.image(200, 30, 'table');

    var line = new Phaser.Geom.Line(800, 400, 0, 400);
    var graphics = this.add.graphics({ lineStyle: { width: 8, color: 0x000000 } });
    graphics.strokeLineShape(line);

    score_1_label = this.add.text(200, 50, '0',  { fontSize: '48px', fill: '#000' });
    score_2_label = this.add.text(this.game.config.width - 200, 50, '0',  { fontSize: '48px', fill: '#000' });

    table.setVelocity(100, 200);
    table.setBounce(2, 1);
    table.setCollideWorldBounds(true);

    table.body.setMaxVelocity(800,800);

    player1 = createPlayer(this, 200, 390);
    player2 = createPlayer(this, this.game.config.width - 200, 390, true);

    this.physics.add.collider(player1, table);
    this.physics.add.collider(player2, table);

    walls = this.physics.add.staticGroup();

    for (var i = 0; i < 5; i++) {
        walls.create(this.game.config.width / 2, 70 + (this.game.config.height / 2) + i * 30, 'wall');
    }
    this.physics.add.collider(table, walls);
    this.physics.add.collider(player1, walls);
    this.physics.add.collider(player2, walls);

    var particles = this.add.particles('table');

    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 0.2, end: 0 },
        blendMode: 'SUBTRACT'
    });

    emitter.startFollow(table);
}
