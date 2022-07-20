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

        return str.trim() + '.txt';
    },


    sizeToByte(realSize) {
        if (typeof realSize !== 'string')
            return realSize;

        let packetSize = 1024,
            arr = realSize.split(''),
            typeSize = arr.pop(),
            arrOfTypeSize = ['b', 'k', 'm', 'g', 't'],
            indexFromArrTypeSize = (type) => {
                return arrOfTypeSize.indexOf(type);
            },
            size = arr.join('');

        return size * Math.pow(packetSize, indexFromArrTypeSize(typeSize));
    }


}