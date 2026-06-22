import path from "path";
import { LangFile, LangTranslation, SimpleStaticTranslation, StaticLangFile, StaticTranslation } from "./lang-file-type";
import { fastReadWrite } from "./tool/file";
import { StrInterpolationTranslation } from "./str-interpolation-translation";
import { readLangFiles } from "./lang-files";
import { StaticTranslationOption } from "./translation-option";
import { log, LogLevel } from "./log";


/**
 * Translate the js files after tsc
 * @param distDir the directory to translate the files
 * @param srcPath the path to the source directory
 */
export function staticTranslation(staticOptionTr: StaticTranslationOption) {
    log(LogLevel.Verbose, `Static Translation of the '${staticOptionTr.srcDir}' source path`);
    readLangFiles(staticOptionTr.srcDir, langFiles => {
        let distAbsPath = path.resolve(staticOptionTr.outDir);
        let staticLangFiles = prepareTranslationData(langFiles, staticOptionTr);

        staticLangFiles.forEach(staticLangF => {
            translateFile(distAbsPath, staticLangF);
        });
    });
}

function prepareTranslationData(langFiles: LangFile[], staticOptTr: StaticTranslationOption): StaticLangFile[] {
    let staticLangFiles: StaticLangFile[] = [];
    let staticLangF: StaticLangFile;
    let outTr: string|undefined;
    let outLangWanted: string[];
    for (let i = 0; i < langFiles.length; i++) {
        log(LogLevel.Debug, `start to prepare '${langFiles[i].pathFromSrc}' file data`);
        log(LogLevel.Debug, langFiles[i].data);

        if (langFiles[i].data.srcLang == staticOptTr.outLang) {
            continue;
        }
        if ( !checkFileOutLang(langFiles[i].data.outLang, staticOptTr) ) {
            continue;
        }

        // initiate the list of the lang output wanted
        outLangWanted = [staticOptTr.outLang].concat(staticOptTr.fallbackLang);

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
                    staticLangF.tr.push( prepareOneTranslation(tr[langFiles[i].data.srcLang], outTr) );
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

function checkFileOutLang(fileOutLang: string[] | undefined, staticOptTr: StaticTranslationOption): boolean {
    if(fileOutLang==undefined) {
        // no check if out lang is not indicated by the files
        return true;
    }
    if(fileOutLang.includes(staticOptTr.outLang)) {
        return true;
    }
    for (let i = 0; i < staticOptTr.fallbackLang.length; i++) {
        if(fileOutLang.includes(staticOptTr.fallbackLang[i])) {
            return true;
        }
    }
    return false;
}



function chooseOutTr(tr: LangTranslation, outLangWanted: string[]): string | undefined {
    for (let i = 0; i < outLangWanted.length; i++) {
        if(tr[outLangWanted[i]] != undefined) {
            return tr[outLangWanted[i]];
        }
    }
    return undefined;
}


function prepareOneTranslation(srcTr: string, outTr: string): StaticTranslation {
    if (StrInterpolationTranslation.isStrInterpolationTr(srcTr)) {
        return new StrInterpolationTranslation(srcTr, outTr);
    }
    else {
        return {
            srcTr: new RegExp("(\'|\"|\`)" + RegExp.escape(srcTr) + "(\'|\"|\`)", 'g'),
            outTr: '\"' + outTr + '\"'
        }
    }
}

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
        if ((staticTr as StrInterpolationTranslation).applyTranslation != undefined) {
            dataReaded = (staticTr as StrInterpolationTranslation).applyTranslation(dataReaded);
        }
        else {
            log(LogLevel.Debug, 'apply simple static translation');
            dataReaded = dataReaded.replaceAll((staticTr as SimpleStaticTranslation).srcTr, (staticTr as SimpleStaticTranslation).outTr);
        }
    });
    return dataReaded;
}

