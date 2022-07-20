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


function isExistGitignoreInUserProject() {
    return fs.existsSync('.gitignore');
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


function isExistNpmIgnoreInUserProject() {
    return fs.existsSync('.npmignore');
}


function getFolderName(pathDir) {
    if (pathDir.includes('/')) {
        let arr = pathDir.split('/');
        return arr[arr.length - 1];
    }
    return pathDir;
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

function mkIgnoreFile(fileName) {
    fs.mkdirSync(fileName);
}


function appendDataInIgnoreFile(fileName, data) {
    fs.appendFileSync(fileName, data);
}

function writeInIgnoreFile(fileName, data) {
    fs.writeFileSync(fileName, data);
}


function fileIgnoreHandler() {
    if (!isExistGitignoreInUserProject()) {
        mkIgnoreFile('.gitignore');
        writeInIgnoreFile('.gitignore', '/' + getFolderName(pathDir) + '/\n')
    }

    if (isExistGitignoreInUserProject()) {
        isSpecificDataWrittenInThisFile('.gitignore', getFolderName(pathDir), result => {
            if (!result)
                appendDataInIgnoreFile('.gitignore', '\n/' + getFolderName(pathDir) + '/');
        });
    }

    if (!isExistNpmIgnoreInUserProject()) {
        mkIgnoreFile('.npmignore');
        writeInIgnoreFile('.npmignore', getFolderName(pathDir) + '\n')
    }

    if (isExistNpmIgnoreInUserProject()) {
        isSpecificDataWrittenInThisFile('.npmignore', getFolderName(pathDir), result => {
            if (!result)
                appendDataInIgnoreFile('.npmignore', '\n' + getFolderName(pathDir));
        });
    }

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
        if (wflType === 'release') {
            mkRootDir();
            fileIgnoreHandler();
            DeleteFileAfterSpecifiedPeriod();
        }
    },


    readFile() {


    }

}