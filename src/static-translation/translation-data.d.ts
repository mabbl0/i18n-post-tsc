import { StaticStrInterpolationTr } from "../common/static-str-interpolation-tr";

/**
 * path and data ready for static translation
 */
export interface StaticLangFile {
    fileName: string
    pathToJs: string[]
    tr: StaticTranslation[]
}

type StaticTranslation = SimpleStaticTranslation | StaticStrInterpolationTr;

/**
 * Static translation for one files
 */
interface SimpleStaticTranslation {
    srcTr: RegExp,
    outTr: string
}
