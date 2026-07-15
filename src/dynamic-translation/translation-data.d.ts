import { DynamicStrInterpolationTr } from "../common/dynamic-str-interpolation-tr"

/**
 * path and data ready to prepare translation
 */
export interface PtscDynamicLangFile {
    fileName: string
    pathToJs: string[]
    data: PtscDynamicTrData[]
}

export type PtscDynamicTrData = SimplePtscDynamicTrData | DynamicStrInterpolationTr

/**
 * Simple post tsc Dynamic translation data for one files
 */
export interface SimplePtscDynamicTrData {
    srcTr: RegExp
    idTr: string
}


/*** DynamicTranslationData ***/

/**
 * Data for the dynamic translation
 */
export interface DynamicTranslationData {
    /**
     * the base of the translation in function of the source lang and the fallback lang 
     */
    baseTranslation: LangTranslationsData
    /**
     * the number of the translation in the base translation
     */
    nbBaseTr: number

    /**
     * Map to the translation data
     * key is the lang ; the value is the tranlsation for this value
     */
    data: Map<String,LangTranslationsData>
    /**
     * the number of the tranlsation for each lang
     * the lang is the key
     */
    dataNbTr: Map<String,number>
}



/**
 * The translation data for one lang
 * the key is the idTr, the value is the translation
 */
export interface LangTranslationsData {
    [key: string]: string | DynamicStrInterpolation
}

// TODO: class
interface DynamicStrInterpolation {}


/*** DynamicTranslationData for save ***/

/**
 * Data for the dynamic translation for save
 */
export interface DynamicTranslationDataJson {
    data: LangTranslationsDataJson[]
}

interface LangTranslationsDataJson {
    lang: string
    nbTr: number
    tr: TranslationsDataJson
}

export interface TranslationsDataJson {
    [key: string]: string | DynamicStrInterpolationJson
}

interface DynamicStrInterpolationJson {}