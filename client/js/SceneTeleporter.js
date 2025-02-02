class SceneTeleporter {
    constructor(gameObj, callback) {
        this.callback = callback;   
        this.obj = gameObj;
    }
}

function addTeleporter(scene, callback, {x, y}) {
    console.log(`pos = ${x}, ${y}`);
    let telporterSprite = scene.physics.add
        .sprite(x, y, 'teleporter')
    let sceneTeleporter = new SceneTeleporter(telporterSprite, callback);
    return sceneTeleporter;
}

export { SceneTeleporter, addTeleporter };