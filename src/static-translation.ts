import path from "path";
import { LangFile, LangTranslation } from "./lang-file-type";
import fs from 'fs'
import { fastReadWrite } from "./tool/file";

/**
 * Translate the js files after tsc
 * @param distDir the directory to translate the files
 * @param langFiles the files lang data
 */
export function staticTranslation(distDir: string, langFiles: LangFile[]) {
    let distAbsPath = path.resolve(distDir);

    langFiles.forEach( langF => {
        translateFile( path.format({dir: distAbsPath, base: langF.pathFromSrc}), langF);
    });
}

function translateFile(pathFileToTranslate: string, langFile: LangFile) {
    if(langFile.data.ressources.length == 0) {
        console.error(`empty translation ${langFile.pathFromSrc}`);
        return;
    }

    fastReadWrite(pathFileToTranslate, (fd, fileData, closeCb) => {
        writeTranslation(fd, fileData, langFile.data.ressources, 0, closeCb);
    }, (err) => {
        if(err) {
            console.error(err);
            return;
        }
    });
}

/**
 * write translation to one file
 * @param fd file number access
 * @param fileData file data
 * @param langTr translation to process
 */
function writeTranslation(fd: number, fileData: Buffer<ArrayBufferLike>, langTr: LangTranslation[], currentTrIndex: number, closeCb: () => void) {
    if(currentTrIndex >= langTr.length) {
        closeCb();
        return;
    }
    
    let iTr = fileData.indexOf(langTr[currentTrIndex]['en']);
    if(iTr != -1) {
        fs.write(fd, langTr[currentTrIndex]['fr'], iTr, (err) => {
            if(err) {
                console.error(err);
                return;
            }
            // next translation
            writeTranslation(fd, fileData, langTr, currentTrIndex+1, closeCb);
        });
    }
    else {
        // next translation
        writeTranslation(fd, fileData, langTr, currentTrIndex+1, closeCb);
    }

}

