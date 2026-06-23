import fs from 'fs'
import path from 'path'
import { LangFile, LangFileData } from './lang-file-type';
import { fastRead } from './tool/file';
import { log, LogLevel } from './tool/log';

const langFileExt = '.lang.json';
const reExt = /\w+\.lang\.json$/g;

/**
 * Parameter to read the lang files
 * @param srcAbsPath absolute path to the source directory
 * @param langFilesPath path to the files to read
 * @param currentFileIndex the index of the current data to read
 * @param langFiles data lang files
 * @param endCallback callback after read all lang files
 */
interface ReadLangFileParam {
    srcAbsPath: string,
    langFilesPath: string[], 
    currentFileIndex: number, 
    langFiles: LangFile[], 
    endCallback: (langFiles: LangFile[]) => void
}

/**
 * find and read the langages files
 * @param srcPath the path to the source directory
 */
export function readLangFiles(srcPath: string, callback: (langFiles: LangFile[]) => void) {
    let srcAbsPath = path.resolve(srcPath);

    let langFilesPath: string[] = [];
    getLangFiles(srcAbsPath, langFilesPath);
    log(LogLevel.Verbose, `${langFilesPath.length} lang files found`);

    readDataLangFile({
        srcAbsPath: srcAbsPath,
        langFilesPath: langFilesPath,
        currentFileIndex: 0,
        langFiles: [],
        endCallback(langFiles) {
            log(LogLevel.Verbose, `${langFiles.length} lang files readed`);
            callback(langFiles);
        },
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
function readDataLangFile(readParam: ReadLangFileParam) {
    if (readParam.currentFileIndex >= readParam.langFilesPath.length) {
        readParam.endCallback(readParam.langFiles);
        return;
    }

    fastRead(readParam.langFilesPath[readParam.currentFileIndex], (err, data, rParam) => {
        if(rParam == undefined) {
            // shall not append
            log(LogLevel.Error, 'no parameter returned');
            return;
        }
        else if (err || data == undefined) {
            log(LogLevel.Error, err);
        }
        else if(data.length != 0) {
            // check the data
            let jsonData = JSON.parse(data.toString()) as LangFileData;
            if( checkLangFileData( jsonData, rParam.langFilesPath[rParam.currentFileIndex] ) ) {
                rParam.langFiles.push({
                    pathFromSrc: path.relative(rParam.srcAbsPath, rParam.langFilesPath[rParam.currentFileIndex] ).slice(0, -langFileExt.length) + '.js',
                    data: jsonData
                });
                log(LogLevel.Verbose, `Read the lang file: ${rParam.langFilesPath[rParam.currentFileIndex]}`);
            }
        }
        
        // continue to read the next files
        readDataLangFile({
            srcAbsPath: rParam.srcAbsPath,
            langFilesPath: rParam.langFilesPath,
            currentFileIndex: rParam.currentFileIndex +1,
            langFiles: rParam.langFiles,
            endCallback: rParam.endCallback
        });
    }, readParam);
}

/**
 * check the data read
 * @param data data to check
 * @returns if the data are correcte or not
 */
function checkLangFileData(data: LangFileData, filePath: string): boolean {
    if(data.srcLang == undefined ||
        data.translations == undefined ||
        data.translations.length == 0
    ) {
        log(LogLevel.Error, `the '${filePath}' lang file has not the require data`);
        return false;
    }

    // check if every translation the source lang
    for (let i = 0; i < data.translations.length; i++) {
        if(data.translations[i][data.srcLang] == undefined) {
            log(LogLevel.Error, `the translation ${data.translations[i].toString()} from the '${filePath}' lang file don't containt the source langage`);
            return false;
        }
    }
    
    return true;
}

/**
 * get recursively all the relative lang file path from a directory
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
            log(LogLevel.Verbose, `find '${content.name}' file`);
            langFilesPath.push( path.format({ dir: dirPath, base: content.name }) );
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
        pathFile.search( reExt ) != -1;
}

