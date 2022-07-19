let api = require('./src/api/router');


module.exports = {


    info(message) {
        api.info(message);
    },


    error(message) {
        api.error(message);
    },


    debug(message) {
        api.debug(message);
    },


    notice(message) {
        api.notice(message);
    },


    warning(message) {
        api.warning(message);
    },


    critical(message) {
        api.critical(message);
    }

}