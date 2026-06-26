
/**
 * Lang file data write by the developer
 */
export interface LangFileData {
    srcFile?: string
    srcLang: string
    outLang?: string[]
    translations: LangTranslation[]
}

/**
 * path and data from a lang file
 */
export interface LangFile {
    pathFromSrc: string
    data: LangFileData
}

/**
 * The differentes translation for 1 content:
 * {
 *  "en": "hello everyone!",
 *  "fr": "bonjour tout le monde !",
 *  "bzh": "demat d'an holl !"
 * }
 */
interface LangTranslation {
    [key: string]: string
}

/**
 * the data of all lang files
 * regrouped by the post-tsc-i18n for the dynamic translation
 */
export interface GlobalLangFile {
    lang: string[],
    ressources: Map<string, LangFile>
}

/**
 * the data of all lang files regrouped
 * ready to be save
 */
export interface GlobalLangFileData {
    lang: string[],
    ressources: {
        key: string
        translation: LangTranslation
    }[]
}
