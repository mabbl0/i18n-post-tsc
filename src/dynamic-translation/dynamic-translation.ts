import { log, LogLevel, setLogLevelByStr, StrLogLevel } from "../tool/log";
import { DynamicTranslationData, DynamicTranslationDataJson, LangTranslationsData, TranslationsDataJson } from "./translation-data";
import fs from 'fs';
import path from 'path';


/** Initiat the global variable **/

var dynamicTranslationData: DynamicTranslationData = {
    baseTranslation: {},
    nbBaseTr: 0,
    data: new Map<string, LangTranslationsData>(),
    dataNbTr: new Map<string,number>()
};
var translate: LangTranslationsData = {};

interface InitDynamicTrParameter {
    dynamicLangPath: string,
    langStart: string,
    fallbackLang?: string[],
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

    initDynamicTrData(dynamicTrJson, initParameter.langStart, initParameter.fallbackLang);
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



function initDynamicTrData(dynamicTrJson: DynamicTranslationDataJson, langStart: string, fallbackLang: string[]|undefined) {
    // Initiate data
    // find the lang with the more translation (may be the source lang)
    let maxNbTr = 0;
    let langMaxTr: string[] = [];
    dynamicTrJson.data.forEach( langTrDataJson => {
        // TODO: manage multiple init from different files
        dynamicTranslationData.data.set(langTrDataJson.lang, trDataJsonToTrData(langTrDataJson.tr));
        dynamicTranslationData.dataNbTr.set(langTrDataJson.lang, langTrDataJson.nbTr);

        if(langTrDataJson.nbTr > maxNbTr) {
            maxNbTr = langTrDataJson.nbTr;
            langMaxTr = [langTrDataJson.lang];
        }
        else if(langTrDataJson.nbTr == maxNbTr) {
            langMaxTr.push(langTrDataJson.lang);
        }
    });


    // intiate the translation to be sure to get a value for each translation
    let trData: LangTranslationsData | undefined;
    if(langMaxTr.length > 1 && langMaxTr.includes('en')) {
        // choose 'en' lang by default, if several choose
        trData = dynamicTranslationData.data.get('en');
        if(trData!=undefined) {
            Object.assign(dynamicTranslationData.baseTranslation, trData);
        }
    }
    else if(langMaxTr.length != 0) {
        trData = dynamicTranslationData.data.get( langMaxTr[0] );
        if(trData!=undefined) {
            Object.assign(dynamicTranslationData.baseTranslation, trData);
        }
    }

    // complete the base translation with the fallbasck lang
    if(fallbackLang!=undefined) {
        for (let i = fallbackLang.length-1 ; i >= 0 ; i--) { // reverse process
            trData = dynamicTranslationData.data.get( fallbackLang[i] );
            if(trData!=undefined) {
                Object.assign(dynamicTranslationData.baseTranslation, trData);
            } 
        }
    }

    // make sure the base translation is completed with all translation available
    let trKeys: string[];
    dynamicTranslationData.data.forEach(dTrData => {
        trKeys = Object.keys(dTrData);
        trKeys.forEach(k => {
            if(dynamicTranslationData.baseTranslation[k] == undefined) {
                dynamicTranslationData.baseTranslation[k] = dTrData[k];
            }
        });
    });
    log(LogLevel.Debug, 'base translation completed:', dynamicTranslationData.baseTranslation);


    // change the lang to start lang
    lang(langStart);
}

function trDataJsonToTrData(trDataJson: TranslationsDataJson): LangTranslationsData {
    // TODO: complete with str interpolation object
    return trDataJson;
}




export function lang(newLang: string) {
    // find and apply the new lang
    let newTrData = dynamicTranslationData.data.get(newLang);
    if(newTrData!=undefined) {
        let nbNewTr = dynamicTranslationData.dataNbTr.get(newLang);
        if(nbNewTr!=undefined && nbNewTr>=dynamicTranslationData.nbBaseTr) {
            // new tr to apply is complete
            Object.assign(translate, newTrData); // replace the property already in the object
        }
        else {
            // re-initiate the translation with the base
            Object.assign(translate, dynamicTranslationData.baseTranslation);
            // then apply the translation choosen
            Object.assign(translate, newTrData); // replace the property already in the object
        }
        log(LogLevel.Verbose, `Change lang translation to '${newLang}'`);
        log(LogLevel.Debug, 'new translate:', translate);
    }
    else {
        log(LogLevel.Error, `the lang '${newLang}' is not available for the dynamic translation`);
    }
}


export default {translate, initDynamicTr, lang};