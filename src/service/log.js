let File = require('../util/File');

File.init();

module.exports = {

    writeFile(type, message) {
        File.writeFile(type, message);
    }

}