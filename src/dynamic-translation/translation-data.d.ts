
/**
 * path and data ready to prepare translation
 */
export interface PtscDynamicLangFile {
    fileName: string
    pathToJs: string[]
    data: PtscDynamicTrData[]
}

type PtscDynamicTrData = SimplePtscDynamicTrData | StrInterpolationPtscData

/**
 * Simple post tsc Dynamic translation data for one files
 */
interface SimplePtscDynamicTrData {
    srcTr: RegExp
    outPostTsc: string
}

/**
 * string interpolation post tsc Dynamic translation data for one files
 */
interface StrInterpolationPtscData extends SimplePtscDynamicTrData {
    idStrInter: number[]
}


/*** DynamicTranslationData ***/

/**
 * Data for the dynamic translation
 */
export interface DynamicTranslationData {
    tr: LangTranslationsData
    /**
     * Map to the translation data
     * key is the lang ; the value is the tranlsation for this value
     */
    data: Map<String,LangTranslationsData>
}



/**
 * The translation data for one lang
 * the key is the idTr, the value is the translation
 */
interface LangTranslationsData {
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
    lang: string,
    tr: TranslationsDataJson
}

interface TranslationsDataJson {
    [key: string]: string | DynamicStrInterpolationJson
}

interface DynamicStrInterpolationJson {}