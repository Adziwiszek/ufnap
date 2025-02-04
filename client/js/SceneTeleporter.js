class SceneTeleporter {
    constructor(sprite, callback) {
        this.callback = callback;   
        this.sprite = sprite;
    }
}

function addTeleporter(scene, callback, {x, y}) {
    let telporterSprite = scene.physics.add
        .sprite(x, y, 'teleporter')
    let sceneTeleporter = new SceneTeleporter(telporterSprite, callback);
    return sceneTeleporter;
}

export { SceneTeleporter, addTeleporter };