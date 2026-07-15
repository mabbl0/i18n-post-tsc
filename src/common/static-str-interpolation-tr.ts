import { log, LogLevel } from "../tool/log";
import { reStrInter, StrInterpolationTr } from "./str-interpolation-tr";

/**
 * Prepare and process a static translation
 * to a string interpolation `${}`
 */
export class StaticStrInterpolationTr extends StrInterpolationTr {
    protected outTrSplit: string[] // the output translation split between the ${}
    
    /**
     * Prepare and process to a translation to a string interpolation `${}`
     * @param langFileSrcTr the source translation from the langage file
     * @param langFileOutTr the output translation from the langage file
     */
    constructor(langFileSrcTr: string, langFileOutTr: string) {
        super(langFileSrcTr, langFileOutTr);

        // initiate the output translation split
        this.outTrSplit = '`'.concat(langFileOutTr, '`').split(reStrInter);

        log(LogLevel.Debug, 'new Static Str Interpolation Translation created');
        log(LogLevel.Debug, this);
    }

    /**
     * apply the translation to a text
     * @param text the text to apply the translation
     * @returns the text with the translation
     */
    applyStaticTranslation(text: string): string {
        log(LogLevel.Debug, 'apply one str interpolation Translation');
        return text.replaceAll(this.reSrcTr, this.translateOneStr.bind(this));
    }

    /**
     * Translate one string for the static trnaslation
     * @param strInterText the text match in the file
     * @returns the string interpolation translated
     */
    private translateOneStr(strInterText: string): string {
        let strInterContentMatch = strInterText.match(reStrInter);
        if(strInterContentMatch == null || strInterContentMatch.length+1 != this.outTrSplit.length) {
            return strInterText;
        }

        // return the translation with ${} order give by the id
        let outTrArr: string[] = [];
        let outTrIndexOrder: number|undefined;
        for (let i = 0; i < strInterContentMatch.length; i++) {
            outTrArr.push(this.outTrSplit[i]);

            if(this.strInterSrcId[i].length == 0) {
                // no str inter id
                outTrArr.push(strInterContentMatch[i]);
            }
            else {
                outTrIndexOrder = this.mapIdOutTrOrder.get(this.strInterSrcId[i]);
                if(outTrIndexOrder == undefined) {
                    throw `string interpolation id '${this.strInterSrcId[i]}' not found in the id map`;
                }
                outTrArr.push(strInterContentMatch[outTrIndexOrder]);
            }
        }
        outTrArr.push(this.outTrSplit[this.outTrSplit.length-1]);

        return ''.concat(...outTrArr);
    }

}