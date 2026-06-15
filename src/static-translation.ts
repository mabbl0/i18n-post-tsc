import path from "path";
import { LangFile, SimpleStaticTranslation, StaticLangFile, StaticTranslation } from "./lang-file-type";
import { fastReadWrite } from "./tool/file";
import { StrInterpolationTranslation } from "./str-interpolation-translation";


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
    if(StrInterpolationTranslation.isStrInterpolationTr(srcTr)) {
        return new StrInterpolationTranslation(srcTr, outTr);
    }
    else {
        return {
            srcTr: new RegExp("(\'|\"|\`)" + RegExp.escape(srcTr) + "(\'|\"|\`)", 'g'),
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
    staticLangFile.tr.forEach( staticTr => {
        if((staticTr as StrInterpolationTranslation).applyTranslation != undefined) {
            dataReaded = (staticTr as StrInterpolationTranslation).applyTranslation(dataReaded);
        }
        else {
            dataReaded = dataReaded.replaceAll((staticTr as SimpleStaticTranslation).srcTr, (staticTr as SimpleStaticTranslation).outTr);
        }
    });
    return dataReaded;
}

