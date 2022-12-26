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


let slash = '/',
    listOfDir = [
        INFO,
        ERROR,
        DEBUG,
        NOTICE,
        WANING,
        CRITICAL
    ],
    lookFile = 'look.txt',
    npmignore = '.npmignore',
    gitignore = '.gitignore',
    wflScopeInUserPackageJson,
    wflObjectScopeInUserPackageJson,
    rootScopeInPackageJson;

init();


async function init() {
    try {
        wflScopeInUserPackageJson = await fs.promises.readFile('package.json');
        rootScopeInPackageJson = await fs.promises.readFile(__dirname + '/../../' + slash + 'package.json');
    } catch (e) {
    }

    wflObjectScopeInUserPackageJson = wflScopeInUserPackageJson?.wfl;

    return {
        wflType: rootScopeInPackageJson?.wflType,
        wflObjectScopeInUserPackageJson: wflObjectScopeInUserPackageJson
    }
}


async function getMaximumTimeForDeleteOldFiles() {
    let init = await init();
    let offset = init.wflObjectScopeInUserPackageJson?.offset;

    let twoHours = 7200;
    return typeof offset === 'string' ? ms(offset) : twoHours;
}

async function getMaximumSizeForWriteFile() {
    let init = await init();
    let size = init.wflObjectScopeInUserPackageJson?.size;

    let MaxFileSize = 26214400;
    return typeof size === 'string' ? Util.sizeToByte(size) : MaxFileSize;
}


async function mkAllDirsFromList() {
    let init = await init(),
        pathDir = init.wflObjectScopeInUserPackageJson?.path;

    for (const item of listOfDir) {
        await mkdirp(pathDir + slash + item + slash);
    }
}


async function isSpecificDataWrittenInThisFile(filename, specificData) {
    return new Promise(res => {
        fs.readFile(filename, (err, data) => {
            if (!err && data.includes(specificData)) {
                res(true);
                return;
            }
            res(false);
        });
    });
}


async function getFolderName(pathDir) {
    if (pathDir.includes(slash)) {
        let arr = pathDir.split(slash);
        return arr[arr.length - 1];
    }
    return pathDir;
}


async function getMessageInJsonObject(type, message) {
    if (typeof message === 'string')
        return `{ "data": "${new Date()}", "type": "${type}", "message": "${message}" }`;
    return `{ "data": "${new Date()}", "type": "${type}", "message": ${JSON.stringify(message)} }`;
}


async function mkRootDir() {
    let init = await init(),
        pathDir = init.wflObjectScopeInUserPackageJson?.path;

    if (pathDir && !await isExistFile(pathDir) || !await isExistFile(slash + 'log'))
        return await mkAllDirsFromList();
}

async function mkIgnoreFileInUserRootProject(fileName) {
    await fs.promises.writeFile(fileName, '');
}


async function appendDataIntoFile(path, data) {
    await fs.promises.appendFile(path, data);
}

async function writeIntoFile(path, data) {
    await fs.promises.writeFile(path, data);
}


async function isExistFile(path) {
    return await fs.promises.access(path) === false;
}

async function fileIgnoreHandler() {
    let init = await init(),
        pathDir = init.wflObjectScopeInUserPackageJson?.path;

    if (!await isExistFile(gitignore)) {
        await mkIgnoreFileInUserRootProject(gitignore);
        await writeIntoFile(gitignore, slash + await getFolderName(pathDir) + slash + '\n');
        return;
    }

    if (await isExistFile(gitignore)) {
        await isSpecificDataWrittenInThisFile(gitignore, await getFolderName(pathDir)).then(async result => {
            if (!result)
                await appendDataIntoFile(gitignore, '\n' + slash + await getFolderName(pathDir) + slash);
        });
    }

    if (!await isExistFile(npmignore)) {
        await mkIgnoreFileInUserRootProject(npmignore);
        await writeIntoFile(npmignore, await getFolderName(pathDir) + '\n');
        return;
    }

    if (await isExistFile(npmignore)) {
        await isSpecificDataWrittenInThisFile(npmignore, await getFolderName(pathDir)).then(async result => {
            if (!result)
                await appendDataIntoFile(npmignore, '\n' + await getFolderName(pathDir));
        });
    }

}

async function getFileName(path) {
    let fileNameInDisk;
    try {
        fileNameInDisk = await fs.promises.readFile(path + lookFile);
    } catch (e) {

    }
    return !fileNameInDisk ? Util.getRandomFileName() : fileNameInDisk.toString();
}

async function fileHandlerFoEachDir(type, message) {
    let init = await init(),
        pathDir = init.wflObjectScopeInUserPackageJson?.path;

    let path = pathDir + slash + type + slash,
        fileName = await getFileName(path);

    if (!await isExistFile(path + fileName)) {
        await writeIntoFile(path + fileName, await getMessageInJsonObject(type, message) + '\n');
        await writeIntoFile(path + lookFile, fileName);
        return;
    }

    let fileSize = await fs.promises.stat(path + fileName);
    if (fileSize.size < await getMaximumSizeForWriteFile())
        return appendDataIntoFile(path + fileName, '\n' + await getMessageInJsonObject(type, message));


    // The file size is greater than the getMaximumSizeForWriteFile function
    let newFileName = Util.getRandomFileName();
    await writeIntoFile(path + newFileName, await getMessageInJsonObject(type, message) + '\n');
    await writeIntoFile(path + lookFile, newFileName);

}


async function filesHandler(realPath, userTime) {

    await fs.readdir(realPath, (err, files) => {

        files.forEach(async file => {

            await fs.stat(realPath + file, async (err, stat) => {

                let endTime, now;
                if (err)
                    return;

                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + userTime;

                if (now > endTime)
                    await fs.promises.unlink(realPath + file);
            });

        });

    });

}


async function DeleteFileAfterSpecifiedPeriod() {

    let init = await init(),
        where = init.wflObjectScopeInUserPackageJson?.where,
        pathDir = init.wflObjectScopeInUserPackageJson?.path;

    if (typeof where === 'object') {
        for (let key in where) {
            setInterval(async () => {

                if (!where.hasOwnProperty(key))
                    return;

                let realPath = pathDir + slash + key + slash;
                await filesHandler(realPath, ms(where[key]));

            }, parseInt(ms(where[key])));
        }
        return;
    }

    setInterval(() => {
        listOfDir.forEach(async item => {
            let realPath = pathDir + slash + item + slash;

            await filesHandler(realPath, await getMaximumTimeForDeleteOldFiles());

        });
    }, await getMaximumTimeForDeleteOldFiles());
}


module.exports = {

    async isRelease() {
        let initData = await init();
        return initData.wflType === 'release';
    },

    async init() {
        if (!await module.exports.isRelease())
            return false;

        await mkRootDir().then(() => fileIgnoreHandler());

        let initData = await init(),
            accessToDelete = initData.wflObjectScopeInUserPackageJson?.accessToDelete;

        if (accessToDelete === true)
            await DeleteFileAfterSpecifiedPeriod();
    },



    async write(type, message) {

        if (await module.exports.isRelease())
            setInterval(async () => {
                await fileHandlerFoEachDir(type, message);
            }, await getMaximumTimeForDeleteOldFiles());

    }

}