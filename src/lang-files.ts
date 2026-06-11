import fs from 'fs'
import path from 'path'
import { LangFile, LangFileData } from './lang-file-type';
import { fastRead } from './tool/file';



/**
 * find and read the langages files
 * @param srcPath the path to the source directory
 */
export function readLangFiles(srcPath: string, callback: (langFiles: LangFile[]) => void) {
    let srcAbsPath = path.resolve(srcPath);

    let langFilesPath: string[] = [];
    getLangFiles(srcAbsPath, langFilesPath);

    readDataLangFile(langFilesPath, 0, [], (langFiles: LangFile[]) => {
        callback(langFiles);
    });
}

/**
 * read data of all the lang files
 * @param langFilesPath path to the files to read
 * @param currentFileIndex the index of the current data to read
 * @param langFiles data lang files
 * @param endCallback callback after read all lang files
 * @returns 
 */
function readDataLangFile(langFilesPath: string[], currentFileIndex: number, langFiles: LangFile[], endCallback: (langFiles: LangFile[]) => void) {
    if (currentFileIndex >= langFilesPath.length) {
        endCallback(langFiles);
        return;
    }

    fastRead(langFilesPath[currentFileIndex], (err, data) => {
        if (err || data == undefined) {
            console.error(err);
            return;
        }

        langFiles.push({
            pathFromSrc: path.basename(langFilesPath[currentFileIndex], '.lang.json') + '.js',
            data: JSON.parse(data.toString()) as LangFileData
        });

        readDataLangFile(langFilesPath, currentFileIndex+1, langFiles, endCallback);
    });
}

/**
 * get recursively all the lang files from a directories
 * @param dirPath path to directory to search
 * @param langFilesPath list of the lang files found
 */
function getLangFiles(dirPath: string, langFilesPath: string[]) {
    let dirContents = fs.readdirSync(dirPath, { withFileTypes: true });
    dirContents.forEach(content => {
        if (content.isDirectory()) {
            getLangFiles(path.format({ dir: dirPath, base: content.name }), langFilesPath);
        }
        else if (isLangFile(content.name)) {
            langFilesPath.push(path.format({ dir: dirPath, base: content.name }));
        }
    });
}

/**
 * Indicate if the file is a lang file. index.lang.json
 * @param pathFile the file to test
 * @returns Indicate if the file is a lang file
 */
function isLangFile(pathFile: string): boolean {
    return pathFile != undefined && pathFile.length != undefined &&
        pathFile.match(/\w+\.lang\.json$/g) != null;
}

