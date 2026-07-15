import path from "path";
import fs from "fs";
import { readLangFiles } from "../common/lang-files";
import { DynamicTranslationParam } from "../common/translation-parameter";
import { log, LogLevel } from "../tool/log";
import { LangFile, LangTranslation } from "../common/lang-file-type";
import { DynamicTranslationDataJson, PtscDynamicLangFile, PtscDynamicTrData, SimplePtscDynamicTrData } from "./translation-data";
import { fastReadWrite } from "../tool/file";
import { DynamicStrInterpolationTr } from "../common/dynamic-str-interpolation-tr";

const postTscModule = "dynamic-translation";
const postTscModuleName = "dynamic_translation";
const postTscTrAccess = ".translate.";
const postTscStrInterTrAccess = ".translateStrInter(";

// (?<=const)\s*dynamic_translation[a-zA-Z_1-9]*(?=\s*\=\s*require\s*\(\s*\"[a-zA-Z1-9\._\/-]*dynamic-translation\"\s*\))
const reModuleNameRequire = new RegExp("(?<=const)\\s*" + RegExp.escape(postTscModuleName) + "[A-Z_1-9]*(?=\\s*\\=\\s*require\\s*\\(\\s*\\\"[a-zA-Z1-9\\._\\/-]*" + RegExp.escape(postTscModule) + "\\\"\\s*\\))", 'g');
const ptscRequire = `const ${postTscModuleName} = require("${postTscModule}");\n`;

/**
 * Read the lang files and prepare the data for a dynamic translation
 * @param dynamicParameter parameter to prepare the translation data for dynamic translation
 */
export function postTscDynamicTranslation(dynamicParameter: DynamicTranslationParam) {
    log(LogLevel.Verbose, `Post tsc Translation of the '${dynamicParameter.srcDir}' source path`);
    readLangFiles(dynamicParameter.srcDir, langFiles => {
        let dynamicLangFiles: PtscDynamicLangFile[] = [];
        let dynamicTranslationJson: DynamicTranslationDataJson = {
            data: []
        }
        processLangFilesData(langFiles, dynamicLangFiles, dynamicTranslationJson);

        let distAbsPath = path.resolve(dynamicParameter.outDir);
        saveDynamicTranslationData(distAbsPath, dynamicParameter.dynamicLangFile, dynamicTranslationJson);

        dynamicLangFiles.forEach(dynamicLangF => {
            ptscDynamicTrFile(distAbsPath, dynamicLangF);
        });
    });

}

/**
 * Process the data from the 
 * @param langFiles the data from the lang files
 * @param dynamicLangFiles the lang file data for the post tsc dynamic translation
 * @param dynamicTranslationJson the dynamic translation data to save
 */
function processLangFilesData(langFiles: LangFile[], dynamicLangFiles: PtscDynamicLangFile[], dynamicTranslationJson: DynamicTranslationDataJson) {
    let dynamicLangF: PtscDynamicLangFile;
    let idTrBaseList: { name: string, nb: number }[] = [];
    let indexIdTr: number;
    let idTrBase: string, idTr: string, srcTr: string;
    for (let i = 0; i < langFiles.length; i++) {

        // initiate the translation object for the file
        dynamicLangF = {
            fileName: langFiles[i].pathFromSrc,
            pathToJs: [langFiles[i].pathFromSrc],
            data: []
        };

        // add possible path to the file
        if (langFiles[i].data.srcFile != undefined) {
            if (path.extname(langFiles[i].data.srcFile as string).length == 0) {
                dynamicLangF.pathToJs.push((langFiles[i].data.srcFile as string) + '.js');
            }
            else {
                dynamicLangF.pathToJs.push(langFiles[i].data.srcFile as string);
            }
        }

        // get a unique idTr base for the file
        idTrBase = fileNameToIdTrBase(dynamicLangF.fileName);
        indexIdTr = idTrBaseList.findIndex(idTrB => idTrB.name == idTrBase);
        if (indexIdTr == -1) {
            idTrBaseList.push({ name: idTrBase, nb: 1 });
        }
        else {
            idTrBase += idTrBaseList[indexIdTr].nb + '_';
            idTrBaseList[indexIdTr].nb += 1;
        }


        // prepare and add every translation for the json save and the post tsc 
        langFiles[i].data.translations.forEach((trLangFile, j) => {
            srcTr = trLangFile[langFiles[i].data.srcLang];
            if (srcTr != undefined) {
                idTr = idTrBase + j;
                addOneTrToJson(trLangFile, idTr, dynamicTranslationJson);
                dynamicLangF.data.push(prepareOneTrForPtsc(srcTr, idTr));
            }
        });

        dynamicLangFiles.push(dynamicLangF);
    }
}

/**
 * Get base of id translation for a file
 * @param fileName file name
 * @returns the base of id translation for the file
 */
function fileNameToIdTrBase(fileName: string): string {
    return path.basename(fileName, '.js').replaceAll('-', '_') + '_';
}

/**
 * add one translation to the data to save
 * @param trLangFile a translation from a lang file
 * @param idTr the id translation for this translation
 * @param dynamicTranslationJson the dynamic translation to save
 */
function addOneTrToJson(trLangFile: LangTranslation, idTr: string, dynamicTranslationJson: DynamicTranslationDataJson) {
    const keysLang = Object.keys(trLangFile);
    let langIndex: number;
    keysLang.forEach((keyLang) => {
        langIndex = dynamicTranslationJson.data.findIndex(langDataTr => langDataTr.lang == keyLang);
        if (langIndex == -1) {
            langIndex = dynamicTranslationJson.data.length;
            dynamicTranslationJson.data.push({
                lang: keyLang,
                nbTr: 0,
                tr: {}
            });
        }
        // TODO: warning to code injection !!!
        dynamicTranslationJson.data[langIndex].tr[idTr] = trLangFile[keyLang];
        dynamicTranslationJson.data[langIndex].nbTr += 1;
    });
}

/**
 * Prepare the one translation for the post tsc
 * @param srcTr the source translation to find in the file
 * @param idTr the translation id
 * @returns the data for the post tsc
 */
function prepareOneTrForPtsc(srcTr: string, idTr: string): PtscDynamicTrData {
    // TODO: add str interpolation
    if(DynamicStrInterpolationTr.isStrInterpolationTr(srcTr)) {
        // a string interpolation tr
        return new DynamicStrInterpolationTr(srcTr, idTr);
    }
    else {
        // a simple tr
        return {
            srcTr: new RegExp("(\'|\"|\`)" + RegExp.escape(srcTr) + "(\'|\"|\`)", 'g'),
            idTr: idTr
        }
    }
}


/**
 * Save the dynamic translation data
 * @param distAbsPath the absolute path to the output directory
 * @param dynamicLangFile the dynamic lang file to save
 * @param dynamicTranslationJson the dynamic translation data to save
 */
function saveDynamicTranslationData(distAbsPath: string, dynamicLangFile: string, dynamicTranslationJson: DynamicTranslationDataJson) {
    let dynamicLangFabsPath = path.resolve(path.format({ dir: distAbsPath, base: dynamicLangFile }));
    fs.writeFile(dynamicLangFabsPath, JSON.stringify(dynamicTranslationJson), "utf-8", (err) => {
        if (err) {
            log(LogLevel.Error, "");
            throw err;
        }
        log(LogLevel.Verbose, "Sucessfully save the data for the dynamic translation", dynamicLangFabsPath);
    });
}

/**
 * Update the js file after the tsc for the dynamic translation
 * @param distAbsPath the absolute path to the output directory
 * @param dynamicLangFiles the lang file data for the post tsc dynamic translation
 */
function ptscDynamicTrFile(distAbsPath: string, dynamicLangF: PtscDynamicLangFile) {
    if (distAbsPath.length == 0) {
        log(LogLevel.Error, `empty absolute dist path: ${distAbsPath}`);
        return;
    }

    log(LogLevel.Verbose, `Start to update '${dynamicLangF.fileName}' file for the dynamic translation`);
    if (dynamicLangF.pathToJs.length == 0) {
        log(LogLevel.Error, `empty path to file ${dynamicLangF.fileName}`);
        return;
    }
    if (dynamicLangF.data.length == 0) {
        log(LogLevel.Error, `empty data for ${dynamicLangF.fileName}`);
        return;
    }


    readWriteFiles(distAbsPath, dynamicLangF, 0);
}

/**
 * Recursive read and write to update a file
 * and try different path
 * @param distAbsPath the absolute path to the output directory
 * @param dynamicLangFile the lang file data for the post tsc dynamic translation
 * @param pathToTest the path index to test
 */
function readWriteFiles(distAbsPath: string, dynamicLangFile: PtscDynamicLangFile, pathToTest: number) {
    if (pathToTest >= dynamicLangFile.pathToJs.length) {
        log(LogLevel.Error, `Fail to find the file to update: ${dynamicLangFile.fileName}`);
        return;
    }

    let absPath = path.format({ dir: distAbsPath, base: dynamicLangFile.pathToJs[pathToTest] });
    fastReadWrite(absPath,
        (dataReaded) => processFileUpdate(dataReaded, dynamicLangFile)
        , (err) => {
            // Error management
            if (err) {
                if (pathToTest + 1 < dynamicLangFile.pathToJs.length) {
                    log(LogLevel.Verbose, `try an other path, fail to find the path: ${absPath}`);
                    readWriteFiles(distAbsPath, dynamicLangFile, pathToTest + 1);
                }
                else {
                    log(LogLevel.Error, err);
                }
            }
            else {
                log(LogLevel.Verbose, `Successfully update the '${dynamicLangFile.fileName}' file`);
            }
        });
}

/**
 * update the file for the dynamic translation
 * @param dataReaded the data readed from the file
 * @param dynamicLangFile the data to apply
 */
function processFileUpdate(dataReaded: string, dynamicLangFile: PtscDynamicLangFile): string {
    log(LogLevel.Debug, 'start file update');

    // Get and update the module name
    let moduleNameUsed = postTscModuleName;
    let requireMatch = dataReaded.match(reModuleNameRequire);
    if( requireMatch == null || requireMatch.length==0) {
        dataReaded = ptscRequire + dataReaded;
    }
    else {
        moduleNameUsed = requireMatch[0].trim();
    }
    log(LogLevel.Debug, "module name used: ", moduleNameUsed);

    let trAccessStr = moduleNameUsed + postTscTrAccess;
    let trAccessStrForStrInter = moduleNameUsed + postTscStrInterTrAccess;
    // find a replace the string by the access to the dynamic translation
    dynamicLangFile.data.forEach(dataTr => {
        log(LogLevel.Debug, dataTr);
        if((dataTr as DynamicStrInterpolationTr).applySrcUpdate != undefined) {
            log(LogLevel.Debug, 'apply one string interpolation update');
            dataReaded = (dataTr as DynamicStrInterpolationTr).applySrcUpdate(dataReaded, trAccessStrForStrInter);
        }
        else {
            log(LogLevel.Debug, 'apply one simple update');
            dataReaded = dataReaded.replaceAll((dataTr as SimplePtscDynamicTrData).srcTr, trAccessStr + (dataTr as SimplePtscDynamicTrData).idTr);
        }
    });
    return dataReaded;
}

