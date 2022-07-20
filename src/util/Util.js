const crypto = require('crypto');


module.exports = {


    getRandomFileName() {
        const rand = crypto.randomBytes(30);

        let formatValidString = '0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';

        let chars = formatValidString.repeat(5);

        let str = '';

        for (let i = 0; i < rand.length; i++) {
            let decimal = rand[i];
            str += chars[decimal];
        }

        return str.trim();
    },


    bytesToSize(realSize) {
        const decimalLength = 2,
            packetSize = 1024;

        let d = Math.floor(Math.log(realSize) / Math.log(packetSize));

        return 0 === realSize ? '0 B' :
            parseFloat((realSize / Math.pow(packetSize, d)).toFixed(Math.max(0, decimalLength))) +
            ' ' + ['B', 'K', 'M', 'G'][d];
    }


}