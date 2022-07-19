let fs = require('fs'),
    ms = require('ms'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    {
        INFO,
        ERROR,
        DEBUG,
        NOTICE,
        WANING,
        CRITICAL
    } = require('../util/const');


let size,
    where,
    offset,
    pathDir,
    slash = '/',
    listOfDir = [
        INFO,
        ERROR,
        DEBUG,
        NOTICE,
        WANING,
        CRITICAL
    ],
    wflScopeInPackageJson;


try {
    wflScopeInPackageJson = JSON.parse(fs.readFileSync('./package.json').toString())['wfl'];
    size = wflScopeInPackageJson['size'];
    where = wflScopeInPackageJson['where'];
    pathDir = wflScopeInPackageJson['path'];
    offset = wflScopeInPackageJson['offset'];
} catch (e) {
}


function getOffsetForDeleteFiles(offset) {
    let twoHours = 7200;
    return (typeof offset === 'string') ? ms(offset) : twoHours;
}


function mkAllDirsFromList() {
    listOfDir.forEach(item => {
        mkdirp(pathDir + slash + item + slash);
    });
}


module.exports = {


    mkRootDir() {
        if (pathDir !== undefined && !fs.existsSync(pathDir)) {
            return mkAllDirsFromList();
        }

        if (pathDir !== undefined && fs.existsSync(pathDir))
            return;

        pathDir = './log';
        if (!fs.existsSync(pathDir))
            mkAllDirsFromList();
    },

    readFile() {


    },

    DeleteFileAfterSpecifiedPeriod() {
        if (typeof where === 'object') {
            for (let key in where) {
                setInterval(() => {
                    if (where.hasOwnProperty(key)) {
                        let realPath = pathDir + slash + key + slash;
                        fs.readdir(realPath, (err, files) => {
                            files.forEach(file => {
                                fs.stat(realPath + file, (err, stat) => {
                                    let endTime, now;
                                    if (err) {
                                        return;
                                    }
                                    now = new Date().getTime();
                                    endTime = new Date(stat.ctime).getTime() + ms(where[key]);
                                    if (now > endTime) {
                                        return rimraf(realPath + file);
                                    }
                                });
                            });
                        });

                    }

                }, ms(where[key]));
            }
            return;
        }

        setInterval(() => {
            listOfDir.forEach(item => {
                let realPath = pathDir + slash + item + slash;
                fs.readdir(realPath, (err, files) => {
                    files.forEach(file => {
                        fs.stat(realPath + file, (err, stat) => {
                            let endTime, now;
                            if (err) {
                                return;
                            }
                            now = new Date().getTime();
                            endTime = new Date(stat.ctime).getTime() + getOffsetForDeleteFiles();
                            if (now > endTime) {
                                return rimraf(realPath + file);
                            }
                        });
                    });
                });
            });
        }, getOffsetForDeleteFiles());
    }


}