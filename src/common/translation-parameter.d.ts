
/** the parameter to a translation */
export interface TranslationParam {
    /** path to the source directory */
    srcDir: string
    /** path to the output / dist directory */
    outDir: string
}

/**
 * The parameter to the static translation
 */
export interface StaticTranslationParam extends TranslationParam {
    /** output langage result after translation */
    outLang: string
    /** fallback langage if outLang is not possible */
    fallbackLang: string[]
}

export interface DynamicTranslationParam extends TranslationParam {
    dynamicLangFile: string
}