let service = require('../service/log'),
    logType = require('../util/const');


module.exports = {


    info(message) {
        service.writeFile(logType.INFO, message);
    },


    error(message) {
        service.writeFile(logType.INFO, message);
    },


    debug(message) {
        service.writeFile(logType.INFO, message);
    },


    notice(message) {
        service.writeFile(logType.INFO, message);
    },


    warning(message) {
        service.writeFile(logType.INFO, message);
    },


    critical(message) {
        service.writeFile(logType.INFO, message);
    }


}