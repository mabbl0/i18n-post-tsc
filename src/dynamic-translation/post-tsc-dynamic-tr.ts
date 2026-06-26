import path from "path";
import { readLangFiles } from "../common/lang-files";
import { DynamicTranslationParam } from "../common/translation-parameter";
import { log, LogLevel } from "../tool/log";
import { LangFile, LangTranslation } from "../common/lang-file-type";
import { DynamicTranslationDataJson, PtscDynamicLangFile, PtscDynamicTrData } from "./translation-data";


const postTscReplaceBase = "post_tsc_i18n_1.translate.";

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

        saveDynamicTranslationData(dynamicParameter.outDir, dynamicParameter.dynamicLangFile, dynamicTranslationJson);
        
        let distAbsPath = path.resolve(dynamicParameter.outDir);
        dynamicLangFiles.forEach(dynamicLangF => {
            ptscDynamicTrFile(distAbsPath, dynamicLangF);
        });
    });

}


function processLangFilesData(langFiles: LangFile[], dynamicLangFiles: PtscDynamicLangFile[], dynamicTranslationJson: DynamicTranslationDataJson) {
    let dynamicLangF: PtscDynamicLangFile;
    let idTrBaseList: {name: string, nb: number}[] = [];
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
        if(langFiles[i].data.srcFile != undefined) {
            if( path.extname(langFiles[i].data.srcFile as string).length == 0) {
                dynamicLangF.pathToJs.push((langFiles[i].data.srcFile as string) + '.js');
            }
            else {
                dynamicLangF.pathToJs.push(langFiles[i].data.srcFile as string);
            }
        }

        // get a unique idTr base for the file
        idTrBase = path.basename(dynamicLangF.fileName, '.js') + '_';
        indexIdTr = idTrBaseList.findIndex(idTrB => idTrB.name == idTrBase);
        if(indexIdTr==-1) {
            idTrBaseList.push({name: idTrBase, nb: 1});
        }
        else {
            idTrBase += idTrBaseList[indexIdTr].nb + '_';
            idTrBaseList[indexIdTr].nb += 1;
        }


        // prepare and add every translation for the json save and the post tsc 
        langFiles[i].data.translations.forEach((trLangFile, i) =>{
            srcTr = trLangFile[langFiles[i].data.srcLang];
            if(srcTr != undefined) {
                idTr = idTrBase + '_' + i;
                addOneTrToJson(trLangFile, idTr, dynamicTranslationJson);
                dynamicLangF.data.push( prepareOneTrToPtsc(srcTr, idTr) );
            }
        });

        dynamicLangFiles.push(dynamicLangF);
    }
}


function addOneTrToJson(trLangFile: LangTranslation, idTr: string, dynamicTranslationJson: DynamicTranslationDataJson) {
    const keysLang = Object.keys(trLangFile);
    let langIndex: number;
    keysLang.forEach((keyLang) => {
        langIndex = dynamicTranslationJson.data.findIndex(langDataTr => langDataTr.lang == keyLang);
        if(langIndex == -1) {
            langIndex = dynamicTranslationJson.data.length;
            dynamicTranslationJson.data.push({
                lang: keyLang,
                tr: {}
            });
        }
        dynamicTranslationJson.data[langIndex].tr[idTr] = trLangFile[keyLang];
    });
}


function prepareOneTrToPtsc(srcTr: string, idTr: string): PtscDynamicTrData {
    return {
        srcTr: new RegExp("(\'|\"|\`)" + RegExp.escape(srcTr) + "(\'|\"|\`)", 'g'),
        outPostTsc: postTscReplaceBase + idTr
    }
}





function saveDynamicTranslationData(_outDir: string, _dynamicLangFile: string, _dynamicTranslationJson: DynamicTranslationDataJson) {

}


function ptscDynamicTrFile(_distAbsPath: string, _dynamicLangF: PtscDynamicLangFile) {

}