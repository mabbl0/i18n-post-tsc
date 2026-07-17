import path from "path";
import { LangFile, LangTranslation } from "../common/lang-file-type";
import { fastReadWrite } from "../tool/file";
import { readLangFiles } from "../common/lang-files";
import { StaticTranslationParam } from "../common/translation-parameter";
import { log, LogLevel } from "../tool/log";
import { SimpleStaticTranslation, StaticLangFile, StaticTranslation } from "./translation-data";
import { StaticStrInterpolationTr } from "./static-str-interpolation-tr";


/**
 * Translate the js files after tsc
 * @param staticTrParam the parameter to the static translation
 */
export function staticTranslation(staticTrParam: StaticTranslationParam) {
    log(LogLevel.Verbose, `Static Translation of the '${staticTrParam.srcDir}' source path`);
    readLangFiles(staticTrParam.srcDir, langFiles => {
        let staticLangFiles = prepareTranslationData(langFiles, staticTrParam);
        let distAbsPath = path.resolve(staticTrParam.outDir);

        staticLangFiles.forEach(staticLangF => {
            translateFile(distAbsPath, staticLangF);
        });
    });
}

/**
 * Prepare the translation data
 * @param langFiles the lang files with translation data
 * @param staticTrParam the parameter to the static translation
 * @returns the static translation data prepared
 */
function prepareTranslationData(langFiles: LangFile[], staticTrParam: StaticTranslationParam): StaticLangFile[] {
    let staticLangFiles: StaticLangFile[] = [];
    let staticLangF: StaticLangFile;
    let outTr: string|undefined;
    let outLangWanted: string[];
    for (let i = 0; i < langFiles.length; i++) {
        log(LogLevel.Debug, `start to prepare '${langFiles[i].pathFromSrc}' file data`);
        log(LogLevel.Debug, langFiles[i].data);

        if (langFiles[i].data.srcLang == staticTrParam.outLang) {
            continue;
        }
        if ( !checkFileOutLang(langFiles[i].data.outLang, staticTrParam) ) {
            continue;
        }

        // initiate the list of the lang output wanted
        if(staticTrParam.fallbackLang != undefined) {
            outLangWanted = [staticTrParam.outLang].concat(staticTrParam.fallbackLang);
        }
        else {
            outLangWanted = [staticTrParam.outLang];
        }

        // initiate the translation object for the file
        staticLangF = {
            fileName: langFiles[i].pathFromSrc,
            pathToJs: [langFiles[i].pathFromSrc],
            tr: []
        };

        // add possible path to the file
        if(langFiles[i].data.srcFile != undefined) {
            if( path.extname(langFiles[i].data.srcFile as string).length == 0) {
                staticLangF.pathToJs.push((langFiles[i].data.srcFile as string) + '.js');
            }
            else {
                staticLangF.pathToJs.push(langFiles[i].data.srcFile as string);
            }
        }

        // test and prepare all translation for the file
        langFiles[i].data.translations.forEach(tr => {
            if(tr[langFiles[i].data.srcLang] != undefined) {
                outTr = chooseOutTr(tr, outLangWanted);
                if(outTr != undefined && outTr!=langFiles[i].data.srcLang) {
                    addOneTranslation(staticLangF.tr, tr[langFiles[i].data.srcLang], outTr);
                }
            }
        });

        // the file is ready to be translate
        staticLangFiles.push(staticLangF);
    }

    log(LogLevel.Verbose, 'finish to prepare the data readed');
    log(LogLevel.Debug, staticLangFiles);
    return staticLangFiles;
}

/**
 * Check if the file content the correct output langage for the translation
 * @param fileOutLang the langage indicate by the file
 * @param staticTrParam the parameter to the static translation
 * @returns indicate if the output langages corresponding to the file data
 */
function checkFileOutLang(fileOutLang: string[] | undefined, staticTrParam: StaticTranslationParam): boolean {
    if(fileOutLang==undefined) {
        // no check if out lang is not indicated by the files
        return true;
    }
    if(fileOutLang.includes(staticTrParam.outLang)) {
        return true;
    }
    if(staticTrParam.fallbackLang != undefined) {
        for (let i = 0; i < staticTrParam.fallbackLang.length; i++) {
            if(fileOutLang.includes(staticTrParam.fallbackLang[i])) {
                return true;
            }
        }
    }
    return false;
}


/**
 * Choose a output langage translation, if possible
 * @param tr the data translation
 * @param outLangWanted the output langages wanted list
 * @returns the output langage to translate
 */
function chooseOutTr(tr: LangTranslation, outLangWanted: string[]): string | undefined {
    for (let i = 0; i < outLangWanted.length; i++) {
        if(tr[outLangWanted[i]] != undefined) {
            return tr[outLangWanted[i]];
        }
    }
    return undefined;
}

/**
 * add one translation to the static translation list
 * @param srcTr the source translation
 * @param outTr the output translation
 */
function addOneTranslation(staticTrArr: StaticTranslation[], srcTr: string, outTr: string) {
    if (StaticStrInterpolationTr.isStrInterpolationTr(srcTr)) {
        let staticStrInter = new StaticStrInterpolationTr(srcTr, outTr);
        if(staticStrInter.rdy) {
            staticTrArr.push(staticStrInter);
        }
    }
    else {
        staticTrArr.push({
            srcTr: new RegExp("(\'|\"|\`)" + RegExp.escape(srcTr) + "(\'|\"|\`)", 'gm'),
            outTr: '\"' + outTr + '\"' // TODO: warning to code injection !!!
        });
    }
}

/**
 * Static Translate to a file
 * @param distAbsPath the absolute path to the output directory
 * @param staticLangFile the static translation information for the file
 */
function translateFile(distAbsPath: string, staticLangFile: StaticLangFile) {
    if (distAbsPath.length == 0) {
        log(LogLevel.Error, `empty absolute dist path: ${distAbsPath}`);
        return;
    }

    log(LogLevel.Verbose, `Start to translate the '${staticLangFile.fileName}' file`);
    if (staticLangFile.pathToJs.length == 0) {
        log(LogLevel.Error, `empty path to file ${staticLangFile.fileName}`);
        return;
    }
    if (staticLangFile.tr.length == 0) {
        log(LogLevel.Error, `empty translation for ${staticLangFile.fileName}`);
        return;
    }

    readWriteTranslateFile(distAbsPath, staticLangFile, 0);
}

/**
 * Recursive read and write to translate a file
 * and try different path
 * @param distAbsPath the absolute path to the output directory
 * @param staticLangFile the static translation information for the file
 * @param pathToTest the path index to test
 */
function readWriteTranslateFile(distAbsPath: string, staticLangFile: StaticLangFile, pathToTest: number) {
    if(pathToTest >= staticLangFile.pathToJs.length) {
        log(LogLevel.Error, `Fail to find the file to translate: ${staticLangFile.fileName}`);
        return;
    }

    let absPath = path.format({ dir: distAbsPath, base: staticLangFile.pathToJs[pathToTest] });
    fastReadWrite( absPath,
        (dataReaded) => processDataTranslate(dataReaded, staticLangFile)
        , (err) => {
            // Error management
            if (err) {
                if(pathToTest+1 < staticLangFile.pathToJs.length) {
                    log(LogLevel.Verbose, `try an other path, fail to find the path: ${absPath}`);
                    readWriteTranslateFile(distAbsPath, staticLangFile, pathToTest+1);
                }
                else {
                    log(LogLevel.Error, err);
                }
            }
            else {
                log(LogLevel.Verbose, `Successfully translate the '${staticLangFile.fileName}' file`);
            }
        });
}

/**
 * process the data to translation
 * @param dataReaded the data readed from the file
 * @param staticLangFile the translation to apply
 */
function processDataTranslate(dataReaded: string, staticLangFile: StaticLangFile): string {
    log(LogLevel.Debug, 'start file translation');
    staticLangFile.tr.forEach(staticTr => {
        log(LogLevel.Debug, staticTr);
        if ((staticTr as StaticStrInterpolationTr).applyStaticTranslation != undefined) {
            dataReaded = (staticTr as StaticStrInterpolationTr).applyStaticTranslation(dataReaded);
        }
        else {
            log(LogLevel.Debug, 'apply one simple static translation');
            dataReaded = dataReaded.replaceAll((staticTr as SimpleStaticTranslation).srcTr, (staticTr as SimpleStaticTranslation).outTr);
        }
    });
    return dataReaded;
}

