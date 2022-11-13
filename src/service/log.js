let File = require('../util/File');

File.init();

module.exports = {

    async writeFile(type, message) {
        await File.write(type, message);
    }

}