let fs = require('fs'),
    ms = require('ms'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    Util = require('../util/Util'),
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
    wflType,
    slash = '/',
    listOfDir = [
        INFO,
        ERROR,
        DEBUG,
        NOTICE,
        WANING,
        CRITICAL
    ],
    accessToDelete,
    wflScopeInUserPackageJson,
    rootScopeInPackageJson;


try {
    wflScopeInUserPackageJson = JSON.parse(fs.readFileSync('package.json').toString());
    rootScopeInPackageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
    wflScopeInUserPackageJson = rootScopeInPackageJson['wfl'];
    size = wflScopeInUserPackageJson['size'];
    where = wflScopeInUserPackageJson['where'];
    pathDir = wflScopeInUserPackageJson['path'];
    offset = wflScopeInUserPackageJson['offset'];
    wflType = rootScopeInPackageJson['wflType'];
    accessToDelete = wflScopeInUserPackageJson['accessToDelete'];
} catch (e) {
}

let isRelease = wflType === 'release';


function getOffsetForDeleteFiles(offset) {
    let twoHours = 7200;
    return (typeof offset === 'string') ? ms(offset) : twoHours;
}


function mkAllDirsFromList() {
    listOfDir.forEach(item => {
        mkdirp(pathDir + slash + item + slash);
    });
}


function isSpecificDataWrittenInThisFile(filename, specificData, cb) {
    fs.readFile(filename, (err, data) => {
        if (!err && data.includes(specificData)) {
            cb(true);
            return;
        }
        cb(false);
    });
}


function getFolderName(pathDir) {
    if (pathDir.includes('/')) {
        let arr = pathDir.split('/');
        return arr[arr.length - 1];
    }
    return pathDir;
}


function getMessageInJsonObject(type, message) {
    return {
        "date": new Date(),
        "type": type,
        "message": message
    }
}


function mkRootDir() {
    if (pathDir !== undefined && !fs.existsSync(pathDir)) {
        return mkAllDirsFromList();
    }

    if (pathDir !== undefined && fs.existsSync(pathDir))
        return;

    pathDir = './log';
    if (!fs.existsSync(pathDir))
        mkAllDirsFromList();
}

function mkIgnoreFileInUserRootProject(fileName) {
    fs.mkdirSync(fileName);
}


function appendDataIntoFile(path, data) {
    fs.appendFileSync(path, data);
}

function writeIntoFile(path, data) {
    fs.writeFileSync(path, data);
}


function isExistFile(path) {
    return fs.existsSync(path);
}

function fileIgnoreHandler() {
    if (!isExistFile('.gitignore')) {
        mkIgnoreFileInUserRootProject('.gitignore');
        writeIntoFile('.gitignore', '/' + getFolderName(pathDir) + '/\n');
        return;
    }

    if (isExistFile('.gitignore')) {
        isSpecificDataWrittenInThisFile('.gitignore', getFolderName(pathDir), result => {
            if (!result)
                appendDataIntoFile('.gitignore', '\n/' + getFolderName(pathDir) + '/');
        });
    }

    if (!isExistFile('.npmignore')) {
        mkIgnoreFileInUserRootProject('.npmignore');
        writeIntoFile('.npmignore', getFolderName(pathDir) + '\n');
        return;
    }

    if (isExistFile('.npmignore')) {
        isSpecificDataWrittenInThisFile('.npmignore', getFolderName(pathDir), result => {
            if (!result)
                appendDataIntoFile('.npmignore', '\n' + getFolderName(pathDir));
        });
    }

}


function fileHandlerFoEachDir(type, message) {

    let fileName = Util.getRandomFileName(),
        path = pathDir + slash + type + slash + fileName;

    if (isExistFile(path)) {
        appendDataIntoFile(path, '\n' + getMessageInJsonObject(type, message));
        return;
    }

    mkdirp(path);
    writeIntoFile(path, getMessageInJsonObject(type, message) + '\n');
}


function DeleteFileAfterSpecifiedPeriod() {
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


module.exports = {

    init() {
        if (isRelease) {
            mkRootDir();
            fileIgnoreHandler();
            if (accessToDelete || accessToDelete === undefined)
                DeleteFileAfterSpecifiedPeriod();
        }
    },


    readFile() {


    },

    writeFile(type, message) {
        if (isRelease)
            fileHandlerFoEachDir(type, message);
    }

}