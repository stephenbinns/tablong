import Phaser from 'phaser';

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 400

const twoPlayer = true;
const config = {
  type: Phaser.AUTO,
  scale: {
    parent: 'phaser-game',
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
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);
const screenCenter = game.config.width / 2;

let player1;
let player2;
let table;
let score1Label;
let score2Label;

let score1 = 0;
let score2 = 0;


function createPlayer(game, x, y, flip) {
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

function preload() {
  this.load.image('player1-up', 'assets/player1.png');
  this.load.image('player1-down', 'assets/player1-down.png');

  this.load.image('wall', 'assets/wall.png');
  this.load.image('table', 'assets/table.png');
  this.load.image('shrug', 'assets/shrug.png');
}

function mapKeys(cursors, player) {
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

function resetTable(xVelocity) {
  table.body.reset(game.config.width / 2, 30);
  table.body.enable = false;
  table.setAngle(0);

  player1.body.x = 200;
  player1.setVelocityX(0);

  player2.body.x = game.config.width - 200;
  player2.setVelocityX(0);

  setTimeout(() => {
    table.setVelocity(xVelocity, 200);
    table.body.enable = true;
  }, 1000);
}


function update() {
  const arrowKeys = this.input.keyboard.createCursorKeys();
  const wasdKeys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  mapKeys(wasdKeys, player1);

  if (table.body.enable) {
    if (table.body.velocity.x > 1) {
      table.setAngle(table.angle + 1);
    } else {
      table.setAngle(table.angle - 1);
    }
  }

  if (false && twoPlayer) {
    mapKeys(arrowKeys, player2);
  } else if (table.body.x > player2.body.x) {
    player2.body.velocity.x = table.body.velocity.x;
  } else {
    player2.body.velocity.x = -table.body.velocity.x;
  }

  if (player1.x >= (screenCenter - (player1.body.width / 2)) && player1.body.velocity.x >= 0) {
    player1.setVelocityX(0);
  }
  if (player2.x <= (screenCenter + (player2.body.width / 2)) && player2.body.velocity.x <= 0) {
    player2.setVelocityX(0);
  }

  if (player1.body.velocity.y === 0) {
    player1.setTexture('player1-down');
  }
  if (player2.body.velocity.y === 0) {
    player2.setTexture('player1-down');
  }

  if (table.body.y >= (this.game.config.height - table.body.height)) {
    if (table.body.x < screenCenter) {
      score2 += 1;
      score2Label.setText(score2);
      this.cameras.main.shake(500);
      resetTable(200);
    } else {
      score1 += 1;
      score1Label.setText(score1);
      this.cameras.main.shake(500);
      resetTable(-200);
    }
  }
}

function create() {
  this.cameras.main.setBackgroundColor(0xffffff);

  const line = new Phaser.Geom.Line(game.config.width, screenCenter, 0, screenCenter);
  const graphics = this.add.graphics({ lineStyle: { width: 8, color: 0x000000 } });
  graphics.strokeLineShape(line);

  score1Label = this.add.text(200, 50, '0', { fontSize: '48px', fill: '#000' });
  score2Label = this.add.text(this.game.config.width - 200, 50, '0', { fontSize: '48px', fill: '#000' });

  table = this.physics.add.image(screenCenter, 30, 'table');
  table.setBounce(2, 1);
  table.setCollideWorldBounds(true);
  table.setDrag(5, 5);
  table.setMaxVelocity(800, 800);
  table.body.enable = false;

  setTimeout(() => {
    table.body.enable = true;
    table.setVelocity(200, 200);
  }, 1000);

  player1 = createPlayer(this, 200, 390);
  player2 = createPlayer(this, this.game.config.width - 200, 390, true);

  this.physics.add.collider(player1, table);
  this.physics.add.collider(player2, table);

  const walls = this.physics.add.staticGroup();

  Array.from(Array(5)).forEach((_, i) => {
    walls.create(this.game.config.width / 2, 70 + (this.game.config.height / 2) + i * 28, 'wall');
  });
  this.physics.add.collider(table, walls);
  this.physics.add.collider(player1, walls);
  this.physics.add.collider(player2, walls);

  const particles = this.add.particles('shrug');
  const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 0.5, end: 0 },
    blendMode: 'SUBTRACT',
  });

  emitter.startFollow(table);
}
