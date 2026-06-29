import { log, LogLevel, setLogLevelByStr, StrLogLevel } from "../tool/log";
import { DynamicTranslationData, DynamicTranslationDataJson, LangTranslationsData, TranslationsDataJson } from "./translation-data";
import fs from 'fs';
import path from 'path';


/** Initiat the global variable **/

var dynamicTranslationData: DynamicTranslationData = {
    data: new Map<string, LangTranslationsData>(),
    tr: {}
};

interface InitDynamicTrParameter {
    dynamicLangPath: string,
    langStart: string,
    logLevel?: StrLogLevel
}
function initDynamicTr(initParameter: InitDynamicTrParameter) {
    setLogLevelByStr(initParameter.logLevel);

    let dynamicTrJson = loadDynamicLangFile(initParameter.dynamicLangPath);
    log(LogLevel.Debug, 'dynamic data loaded:', dynamicTrJson);
    if( dynamicTrJson==undefined || !checkDynamicTrData(dynamicTrJson) ) {
        log(LogLevel.Error, `dynamic translation data from '${initParameter.dynamicLangPath}' lang file is incorrect`);
        return;
    }

    initDynamicTrData(dynamicTrJson, initParameter.langStart);
    log(LogLevel.Verbose, `Sucessfully initiate the dynamic translation data from '${initParameter.dynamicLangPath}' with the '${initParameter.langStart}' langage`);
}


function loadDynamicLangFile(dynamicLangPath: string): DynamicTranslationDataJson | undefined {
    const fileContent = fs.readFileSync( path.resolve(dynamicLangPath), 'utf-8');
    if(fileContent.length!=0) {
        return JSON.parse(fileContent) as DynamicTranslationDataJson;
    }
    return undefined;
}

function checkDynamicTrData(dynamicTrJson: DynamicTranslationDataJson | undefined): boolean {
    if(dynamicTrJson!=undefined && 
        dynamicTrJson.data != undefined && 
        dynamicTrJson.data.length!=0)
    {
        for (let i = 0; i < dynamicTrJson.data.length; i++) {
            if(dynamicTrJson.data[i].lang == undefined || dynamicTrJson.data[i].tr == undefined) {
                return false;
            }
        }
        return true;
    }
    return false;
}



function initDynamicTrData(dynamicTrJson: DynamicTranslationDataJson, langStart: string) {
    // Initiate data
    dynamicTrJson.data.forEach( langTrDataJson =>
        dynamicTranslationData.data.set(langTrDataJson.lang, trDataJsonToTrData(langTrDataJson.tr))
    );

    // intiate the translation with the start langage
    lang(langStart);
}

function trDataJsonToTrData(trDataJson: TranslationsDataJson): LangTranslationsData {
    // TODO: complete with str interpolation object
    return trDataJson;
}

export function translate(idTr: string, ..._strInterpolationParams: string[]): string {
    return dynamicTranslationData.tr[idTr] as string;
}


export function lang(newLang: string) {
    let trDataStart = dynamicTranslationData.data.get(newLang);
    if(trDataStart!=undefined) {
        dynamicTranslationData.tr = trDataStart;
        log(LogLevel.Debug, 'new translate:', dynamicTranslationData.tr);
    }
    else {
        log(LogLevel.Error, `the lang '${newLang}' is not available for the dynamic translation`);
    }
}


export default {translate, initDynamicTr, lang};