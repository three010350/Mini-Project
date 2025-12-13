var config = {
    type: Phaser.AUTO,
    width: 1334,
    height: 750,
    parent: 'gameContainer',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0},
            debug: false
        }
    }
};

var game = new Phaser.Game(config);
var scene;
var player;
var keyUp, keyDown;
var keyLeft, keyRight;
var keyFire;
var bulletSpeed = 1200;
var playerBulletGrp;

var theifGrp;
var theifSpacing = 130;

var explosionGrp;
var theifBulletGrp;

var playerHeart = 3;
var HeartGrp;

function preload() {
    scene = this;
    scene.load.image('police_car', './asset/img/police_car.png');
    scene.load.image('cartoon_bullet', './asset/img/cartoon_bullet.png');
    scene.load.image('theif', './asset/img/theif.png');
    scene.load.image('explosion1', './asset/img/explosion.png');
    scene.load.image('explosion2', './asset/img/explosion2.png');
    scene.load.image('theif_bullet', './asset/img/theif_bullet.png');
    scene.load.image('heart', './asset/img/heart.png');
}

function create() {
    createPlayer();

    playerBulletGrp = scene.add.group();

    theifGrp = scene.add.group();
    theifBulletGrp = scene.add.group();
    createTheif();

    explosionGrp = scene.add.group();

    HeartGrp = scene.add.group();
    createPlayerHeart();

    scene.physics.add.overlap(theifGrp, playerBulletGrp, onTheifHit);
    scene.physics.add.overlap(player, theifBulletGrp, onPlayerHit);
    scene.physics.add.overlap(player, theifGrp, onPlayerHit);
    
    keyUp = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    keyDown = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    keyLeft = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    keyFire = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function createPlayer() {
    player = scene.physics.add.sprite(config.width/2, config.height/2, 'police_car');
    player.speed = 400;
    player.setScale(0.3)
    player.immortal = false;
}

function createTheif() {
    for(var i = 0; i < 5; i++){
        var theif = scene.physics.add.sprite(1400, 100 + (i * theifSpacing), 'theif');
        theif.setScale(0.07);
        theif.speed = (Math.random() * 2) + 1;
        theif.startX = config.width + (theif.getBounds().width/2);
        theif.startY = 100 + (i * theifSpacing);
        theif.x = theif.startX;
        theif.y = theif.startY;
        theif.magnitude = Math.random() * 40;
        theif.fireInterval =  (Math.random() * 3000) + 1500;
        theif.fireTime = scene.time.addEvent({
            delay: theif.fireInterval,
            args: [theif],
            callback: theifFire,
            repeat: -1
        });

        theifGrp.add(theif);
    }
}

function createPlayerHeart() {
    for(var i = 0; i < playerHeart; i++){
        var heart = scene.add.sprite(40 + (i * 35), 40, 'heart');
        heart.setScale(0.1);
        heart.depth = 10;
        HeartGrp.add(heart);
    }
}

function update() {
    updatePlayer();
    updatePlayerBullet();

    updateTheif();
    updateExplosion();
    updateTheifBullet();
}

function updateTheif() {
    for(var i = 0; i < theifGrp.getChildren().length; i++){
        var enemy = theifGrp.getChildren()[i];
        enemy.x -= enemy.speed;
        enemy.y = enemy.startY + (Math.sin(game.getTime()/1000) * enemy.magnitude);

        if(enemy.x < 0 - (enemy.width/2)){
            enemy.speed = (Math.random() * 2) + 1
            enemy.x = enemy.startX;
            enemy.magnitude = Math.random() * 60;
        }
    }
}

function updateExplosion() {
    for (var i = explosionGrp.getChildren().length - 1; i >= 0; i--) {
        var explosion = explosionGrp.getChildren()[i];
        explosion.rotation += 0.02;
        explosion.scale += 0.01;
        explosion.alpha -= 0.05

        if(explosion.alpha <= 0){
            explosion.destroy();
        }
    }
}

function updateTheifBullet() {
    for(var i = 0; i < theifBulletGrp.getChildren().length; i++) {
        var bullet = theifBulletGrp.getChildren()[i];

        if(bullet.x < 0 - (bullet.width/2)) {
            bullet.destroy();
        }
    }
}

function updatePlayer() {
    if (keyUp.isDown){
        player.setVelocityY(-player.speed);
    }
    else if (keyDown.isDown){
        player.setVelocityY(player.speed);
    }
    else{
        player.setVelocityY(0);
    }

    if (keyLeft.isDown){
        player.setVelocityX(-player.speed);
    }
    else if (keyRight.isDown) {
        player.setVelocityX(player.speed);
    }
    else {
        player.setVelocityX(0);
    }

    if (player.y < 0 + (player.getBounds().height/2)) {
        player.y = (player.getBounds().height/2);
    }
    else if (player.y > config.height - (player.getBounds().height/2)) {
        player.y = config.height - (player.getBounds().height/2);
    }

    if (player.x < 0 + (player.getBounds().width/2)) {
        //console.log('Hit the left');
        player.x = (player.getBounds().width/2);
    }
    else if (player.x > config.width - (player.getBounds().width/2)) {
        //console.log('Hit the right');
        player.x = config.width - (player.getBounds().width/2);
    }

    if (Phaser.Input.Keyboard.JustDown(keyFire)){
        fire();
    }
}

function updatePlayerBullet() {
    for(var i = 0; i < playerBulletGrp.getChildren().length; i++){
        var bullet = playerBulletGrp.getChildren()[i];
        if (bullet.x > config.width) {
            bullet.destroy();
        }
    }
}

function fire() {
    var bullet = scene.physics.add.sprite(player.x + (player.getBounds().width/2), player.y - 20, 'cartoon_bullet');
    bullet.setScale(0.06);
    bullet.angle = 90;

    bullet.body.velocity.x = bulletSpeed;
    playerBulletGrp.add(bullet);
}

function onTheifHit(theif, bullet) {
    createExplosion(theif.x, theif.y);

    bullet.destroy();
    theif.x = theif.startX;
    theif.speed = (Math.random() * 2) + 1 
}

function createExplosion(posX, posY) {
    var explosion1 = scene.add.sprite(posX, posY, 'explosion1');
    explosion1.setScale(0.15);
    explosion1.rotation = Phaser.Math.Between(0, 360);

    var explosion2 = scene.add.sprite(posX, posY, 'explosion2');
    explosion2.setScale(0.3);
    explosion2.rotation = Phaser.Math.Between(0, 360);

    explosionGrp.add(explosion1);
    explosionGrp.add(explosion2);
}

function theifFire(enemy) {
    var bullet = scene.physics.add.sprite(enemy.x, enemy.y,'theif_bullet');
    bullet.angle = 270;
    bullet.setScale(0.05);
    bullet.body.velocity.x = -bulletSpeed;

    theifBulletGrp.add(bullet);
}

function onPlayerHit(player, obstacle) {
    if(player.immortal == false) {
        if(obstacle.texture.key == 'theif_bullet') {
            obstacle.destroy();
        }
    
        playerHeart--;
        if (playerHeart <= 0) {
            playerHeart = 0;
            console.log('Game Over');
        }
    
        updatePlayerHeart();
        player.immortal = true;
        player.flickerTimer = scene.time.addEvent({
            delay: 100,
            callback: playerFlickering,
            repeat: 15
        })
    }
}

function playerFlickering() {
    player.setVisible(!player.visible);

    if(player.flickerTimer.repeatCount == 0) {
        player.immortal = false;
        player.setVisible(true);
        player.flickerTimer.remove();
    }
}

function updatePlayerHeart() {
    for(var i = HeartGrp.getChildren().length - 1; i >= 0; i--){
        if(playerHeart < i+1) {
            HeartGrp.getChildren()[i].setVisible(false);
        }
        else {
            HeartGrp.getChildren()[i].setVisible(true);
        }
    }
}