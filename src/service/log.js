let File = require('../util/File');

File.init();

module.exports = {

    writeFile(type, message) {
        File.write(type, message);
    }

}