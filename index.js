const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const scanDirectory = (dir) => {
    console.log("Scanning " + dir);

    walkDir(dir, dirname => {
        checkDirectoryForDuplicates(dirname)
    });
}

const checkDirectoryForDuplicates =  (dirname) => {
    let dirNameWasAlreadyPrinted = false;

    const files = fs.readdirSync(dirname);
    if(!Array.isArray(files)) return;

    const lowerCased = files.map(f => [f.toLowerCase(), f]);

    const uniqued = [...new Map(lowerCased).values()];
    if(uniqued.length !== files.length) {
        const diffs = _.differenceWith(files, uniqued, _.isEqual);
        diffs.forEach( diff => {
            if(!dirNameWasAlreadyPrinted) {
                console.log("\n" + dirname + ': ');
                dirNameWasAlreadyPrinted = true;
            }

            console.log('+ ' + diff);
            files.filter(f => f.toLowerCase() == diff.toLowerCase() ).map( f => console.log('  - ' + f))
        })
    }
}

function walkDir(dir, callback) {
    try {
        callback(dir);
    }
    catch(err) {
        console.error(err.message);
    }

    try {
        fs.readdirSync(dir).forEach( f => {
            const dirPath = path.join(dir, f);
            const isDirectory = fs.statSync(dirPath).isDirectory();
            if(isDirectory) {
                try {
                    callback(path.join(dir, f));
                }
                catch(err) {
                    console.error(err.message);
                }
                walkDir(dirPath, callback);
            }
        });
    }
    catch(err) {
        console.error(err.message);
    }
}

module.exports = () => {
    const args = minimist(process.argv.slice(2))
    if(typeof args._ !== 'undefined') {
        args._.forEach( scanDirectory );
    }
}
