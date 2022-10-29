let fs = require('fs'),
    ms = require('ms'),
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
    lookFile = 'look.txt',
    npmignore = '.npmignore',
    gitignore = '.gitignore',
    wflScopeInUserPackageJson,
    wflObjectScopeInUserPackageJson,
    rootScopeInPackageJson;


try {
    wflScopeInUserPackageJson = JSON.parse(fs.readFileSync('package.json').toString());
    rootScopeInPackageJson = JSON.parse(fs.readFileSync(__dirname + '/../../' + slash + 'package.json').toString());
} catch (e) {
}

wflObjectScopeInUserPackageJson = wflScopeInUserPackageJson?.wfl;
size = wflObjectScopeInUserPackageJson?.size;
where = wflObjectScopeInUserPackageJson?.where;
pathDir = wflObjectScopeInUserPackageJson?.path;
offset = wflObjectScopeInUserPackageJson?.offset;
accessToDelete = wflObjectScopeInUserPackageJson?.accessToDelete;
wflType = rootScopeInPackageJson?.wflType;

let isRelease = wflType === 'release';

function getMaximumTimeForDeleteOldFiles(offset) {
    let twoHours = 7200;
    return typeof offset === 'string' ? ms(offset) : twoHours;
}

function getMaximumSizeForWriteFile() {
    let MaxFileSize = 26214400;
    return typeof size === 'string' ? Util.sizeToByte(size) : MaxFileSize;
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
    if (pathDir.includes(slash)) {
        let arr = pathDir.split(slash);
        return arr[arr.length - 1];
    }
    return pathDir;
}


function getMessageInJsonObject(type, message) {
    if (typeof message === 'string')
        return `{ "data": "${new Date()}", "type": "${type}", "message": "${message}" }`;
    return `{ "data": "${new Date()}", "type": "${type}", "message": ${JSON.stringify(message)} }`;
}


function mkRootDir() {
    if (pathDir && !isExistFile(pathDir) || !isExistFile(slash + 'log'))
        return mkAllDirsFromList();
}

function mkIgnoreFileInUserRootProject(fileName) {
    fs.writeFileSync(fileName, '');
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
    if (!isExistFile(gitignore)) {
        mkIgnoreFileInUserRootProject(gitignore);
        writeIntoFile(gitignore, slash + getFolderName(pathDir) + slash + '\n');
        return;
    }

    if (isExistFile(gitignore)) {
        isSpecificDataWrittenInThisFile(gitignore, getFolderName(pathDir), result => {
            if (!result)
                appendDataIntoFile(gitignore, '\n' + slash + getFolderName(pathDir) + slash);
        });
    }

    if (!isExistFile(npmignore)) {
        mkIgnoreFileInUserRootProject(npmignore);
        writeIntoFile(npmignore, getFolderName(pathDir) + '\n');
        return;
    }

    if (isExistFile(npmignore)) {
        isSpecificDataWrittenInThisFile(npmignore, getFolderName(pathDir), result => {
            if (!result)
                appendDataIntoFile(npmignore, '\n' + getFolderName(pathDir));
        });
    }

}

function getFileName(path) {
    let fileNameInDisk;
    try {
        fileNameInDisk = fs.readFileSync(path + lookFile);
    } catch (e) {

    }
    return !fileNameInDisk ? Util.getRandomFileName() : fileNameInDisk.toString();
}

function fileHandlerFoEachDir(type, message) {
    let path = pathDir + slash + type + slash,
        fileName = getFileName(path);

    if (!isExistFile(path + fileName)) {
        writeIntoFile(path + fileName, getMessageInJsonObject(type, message) + '\n');
        writeIntoFile(path + lookFile, fileName);
        return;
    }

    let fileSize = fs.statSync(path + fileName).size;
    if (fileSize < getMaximumSizeForWriteFile())
        return appendDataIntoFile(path + fileName, '\n' + getMessageInJsonObject(type, message));

    if (fileSize > getMaximumSizeForWriteFile()) {
        let newFileName = Util.getRandomFileName();
        writeIntoFile(path + newFileName, getMessageInJsonObject(type, message) + '\n');
        writeIntoFile(path + lookFile, newFileName);
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
                                if (err)
                                    return;

                                now = new Date().getTime();
                                endTime = new Date(stat.ctime).getTime() + ms(where[key]);
                                if (now > endTime) {
                                    fs.unlink(realPath + file, err => {

                                    });
                                }
                            });
                        });
                    });

                }

            }, parseInt(ms(where[key])));
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
                        if (err)
                            return;

                        now = new Date().getTime();
                        endTime = new Date(stat.ctime).getTime() + getMaximumTimeForDeleteOldFiles();
                        if (now > endTime) {
                            fs.unlink(realPath + file, err => {

                            });
                        }
                    });
                });
            });
        });
    }, getMaximumTimeForDeleteOldFiles());
}


module.exports = {

    init() {
        if (isRelease) {
            mkRootDir();
            fileIgnoreHandler();
            if (accessToDelete === true)
                DeleteFileAfterSpecifiedPeriod();
        }
    },


    writeFile(type, message) {
        if (isRelease) {
            setInterval(() => {
                fileHandlerFoEachDir(type, message);
            }, getMaximumTimeForDeleteOldFiles());
        }
    }

}