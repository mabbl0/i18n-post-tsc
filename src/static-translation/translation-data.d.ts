import { StrInterpolationTranslation } from "./str-interpolation-translation";

/**
 * path and data ready for static translation
 */
export interface StaticLangFile {
    fileName: string
    pathToJs: string[]
    tr: StaticTranslation[]
}

type StaticTranslation = SimpleStaticTranslation | StrInterpolationTranslation;

/**
 * Static translation for one files
 */
interface SimpleStaticTranslation {
    srcTr: RegExp,
    outTr: string
}
