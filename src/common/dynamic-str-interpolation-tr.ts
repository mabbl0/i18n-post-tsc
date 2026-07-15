import { log, LogLevel } from "../tool/log";
import { reStrInter, StrInterpolationTr } from "./str-interpolation-tr";

/**
 * Prepare and process a dynamic translation
 * to a string interpolation `${}`
 */
export class DynamicStrInterpolationTr extends StrInterpolationTr {
    // protected outTrSplit: string[] // the output translation split between the ${}
    readonly idTr: string; // the id of this translation
    private trAccessStr: string; // the string to access to the translation object in run time

    /**
     * Prepare and process to a translation to a string interpolation `${}`
     * @param langFileSrcTr the source translation from the langage file
     * @param idTr the id of this translation
     */
    constructor(langFileSrcTr: string, idTr: string) {
        super(langFileSrcTr, "");
        this.idTr = idTr;
        this.trAccessStr = "";

        // // initiate the output translation split
        // this.outTrSplit = langFileOutTr.split(reStrInter);

        log(LogLevel.Debug, 'new Dynamic Str Interpolation Translation created');
        log(LogLevel.Debug, this);
    }

    /**
     * Prepare source file after tsc to the dynamic translation
     * for this translation
     * @param text the source file js text after tsc
     * @param trAccessStr the string to access to the translation object in run time
     * @returns the text with the update
     */
    applySrcUpdate(text: string, trAccessStr: string): string {
        log(LogLevel.Debug, 'apply one str interpolation Update for dynamic translation');
        this.trAccessStr = trAccessStr + this.idTr + ',';
        return text.replaceAll(this.reSrcTr, this.updateOneStr.bind(this));
    }

    /**
     * Update one string for the dynamic trnaslation
     * @param strInterText the text match in the file
     * @returns the string interpolation translated
     */
    private updateOneStr(strInterText: string): string {
        let strInterContentMatch = strInterText.match(reStrInter);
        if (strInterContentMatch == null) {
            return strInterText;
        }

        // the call to translation with the content in the source file
        return strInterContentMatch.reduce( ((r,c) => r + ',' + c), this.trAccessStr ) + ')';
    }

}