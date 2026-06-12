import path from "path";
import { LangFile, StaticLangFile, StaticTranslation } from "./lang-file-type";
import { fastReadWrite } from "./tool/file";

/**
 * Translate the js files after tsc
 * @param distDir the directory to translate the files
 * @param langFiles the files lang data
 */
export function staticTranslation(distDir: string, langFiles: LangFile[]) {
    let distAbsPath = path.resolve(distDir);
    let staticLangFiles = prepareTranslationData(langFiles, 'en', 'fr');
    staticLangFiles.forEach( staticLangF => {
        translateFile( path.format({dir: distAbsPath, base: staticLangF.pathFromSrc}), staticLangF);
    });
}

function prepareTranslationData(langFiles: LangFile[], srcLang: string, outLang: string): StaticLangFile[] {
    let staticLangFiles: StaticLangFile[] = [];
    let staticLangF: StaticLangFile;
    langFiles.forEach( langF => {        
        if(langF.data.srcLang == srcLang && langF.data.outLang.includes(outLang)) {
            staticLangF = {
                pathFromSrc: langF.pathFromSrc,
                tr: []
            };
            langF.data.ressources.forEach(tr => {
                if(tr[srcLang] != undefined && tr[outLang] != undefined) {
                    staticLangF.tr.push( prepareOneTranslation(tr[srcLang], tr[outLang]) );
                }
            });
            staticLangFiles.push(staticLangF);
        }
    });
    return staticLangFiles;
}

function prepareOneTranslation(srcTr: string, outTr: string): StaticTranslation {
    let isStrInterpolation = srcTr.match(/\$\{.*\}/g) != null;
    if(isStrInterpolation) {
        return {
            srcTr: "\`" + srcTr + "\`",
            outTr: '\`' + outTr + '\`',
            interpolation: isStrInterpolation
        }
    }
    else {
        return {
            srcTr: ["\"" + srcTr + "\"", "\'" + srcTr + "\'", "\`" + srcTr + "\`"],
            outTr: '\"' + outTr + '\"'
        }
    }
}

function translateFile(pathFileToTranslate: string, staticLangFile: StaticLangFile) {
    if(staticLangFile.tr.length == 0) {
        console.error(`empty translation for ${staticLangFile.pathFromSrc}`);
        return;
    }

    fastReadWrite(pathFileToTranslate, 
        (dataReaded) => processDataToTranslate(dataReaded, staticLangFile)
    , (err) => {
        if(err) console.error(err);
    });
}

/**
 * process the data to translate
 * @param dataReaded the data readed from the file
 * @param staticLangFile the translation to apply
 */
function processDataToTranslate(dataReaded: string, staticLangFile: StaticLangFile): string {
    staticLangFile.tr.forEach( tr => {
        if((tr.srcTr as Array<string>).forEach!=undefined) {
            (tr.srcTr as Array<string>).forEach(srcTr =>
                dataReaded = dataReaded.replaceAll(srcTr, tr.outTr)
            );
        }
        else {
            dataReaded = dataReaded.replaceAll(tr.srcTr as string, tr.outTr);
        }
    });
    return dataReaded;
}

function processReplace(dataReaded: string, tr: StaticTranslation, srcTr: string) {
    if(tr.interpolation) {
        return dataReaded.replaceAll(srcTr, (strMatch) => {
            return ''
        });
    }
    else {
        return dataReaded.replaceAll(srcTr, tr.outTr);
    }
}
