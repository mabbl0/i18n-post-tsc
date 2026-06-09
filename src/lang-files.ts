import fs from 'fs'
import path from 'path'
import { LangFile, LangFileData } from './lang-file-type';



/**
 * find and read the langages files
 * @param srcPath the path to the source directory
 * @returns data from every lang files
 */
export function readLangFiles(srcPath: string): LangFile[] {
    let srcAbsPath = path.resolve(srcPath);

    let langFilesPath: string[] = [];
    getRecursiveLangFiles(srcAbsPath, langFilesPath);

    let srcPathLength = srcPath.length;
    let langFiles: LangFile[] = [];
    langFilesPath.forEach(langFilePath =>
        langFiles.push( {
            pathFromSrc: langFilePath.slice(srcPathLength),
            data: JSON.parse( fs.readFileSync(langFilePath, 'utf-8') ) as LangFileData
        })
    );

    return langFiles;
}


/**
 * get recursively all the lang files from a directories
 * @param dirPath path to directory to search
 * @param langFilesPath list of the lang files found
 */
function getRecursiveLangFiles(dirPath: string, langFilesPath: string[]) {
    let dirPathContent = fs.readdirSync(dirPath, {withFileTypes: true});
    dirPathContent.forEach(content => {
        if(content.isDirectory()) {
            getRecursiveLangFiles(content.name, langFilesPath);
        }
        else if(isLangFile(content.name)) {
            langFilesPath.push(content.name);
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

