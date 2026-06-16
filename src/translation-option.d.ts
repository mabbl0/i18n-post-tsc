

export interface TranslationOption {
    srcDir: string
    outDir: string
}


export interface StaticTranslationOption extends TranslationOption {
    outLang: string
    fallbackLang: string[]
}