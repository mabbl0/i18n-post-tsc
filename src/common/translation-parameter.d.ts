
/** the parameter for a translation */
export interface TranslationParam {
    /** path to the source directory */
    srcDir: string
    /** path to the output / dist directory */
    outDir: string
}

/**
 * The parameter for the static translation
 */
export interface StaticTranslationParam extends TranslationParam {
    /** output langage result after translation */
    outLang: string
    /** fallback langage if outLang is not possible */
    fallbackLang?: string[]
}

/**
 * The parameter for the dynamic translation
 */
export interface DynamicTranslationParam extends TranslationParam {
    dynamicLangFile: string
    idModuleName?: string
}