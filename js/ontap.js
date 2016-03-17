var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { create: create });

function create() {

    game.input.onTap.add(onTap, this);

    game.input.onHold.add(onHold, this);

}

function onTap(pointer, doubleTap) {

    if (doubleTap) {
        console.log("jump: " + pointer.x + ", " + pointer.y);
    }
    else {
        console.log("run: " + pointer.x + ", " + pointer.y);
    }

}

function onHold(pointer) {
    console.log("hold: " + pointer.x + ", " + pointer.y);
}
