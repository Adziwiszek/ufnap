const dbrepo = require('./db.js');

console.log("ready");
(async () => {
    try{
        var res = await dbrepo.userExists('Krzychuo');
        console.log("Krzychuo:", res);
        res = await dbrepo.userExists('ola')
        console.log("ola:", res);
    } catch (err){
        console.error(err);
    }
})();