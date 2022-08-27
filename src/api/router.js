let service = require('../service/log'),
    logType = require('../util/const');


module.exports = {


    info(message) {
        service.writeFile(logType.INFO, message);
    },


    error(message) {
        service.writeFile(logType.ERROR, message);
    },


    debug(message) {
        service.writeFile(logType.DEBUG, message);
    },


    notice(message) {
        service.writeFile(logType.NOTICE, message);
    },


    warning(message) {
        service.writeFile(logType.WANING, message);
    },


    critical(message) {
        service.writeFile(logType.CRITICAL, message);
    }


}