let {
    mkRootDir,
    DeleteFileAfterSpecifiedPeriod
} = require('../util/File');

function init() {
    mkRootDir();
    DeleteFileAfterSpecifiedPeriod();
}

init();


module.exports = {

    writeFile(type, message) {

    }

}