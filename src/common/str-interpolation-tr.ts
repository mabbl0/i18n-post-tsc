// regex to find the ${} content
export const reStrInter = /\$\{[^\}]*\}/g;
const reStrInterContent = /(?<=\$\{)[^\}]*(?=\})/g;

/**
 * Prepare and process a static or dynamic translation
 * to a string interpolation `${}`
 */
export class StrInterpolationTr {
    protected reSrcTr: RegExp // regex to find the sring to translate in the source langage
    protected strInterSrcId: string[] // the id of the string interpolation in source translation
    // private strInterOutId: string[] // the id of the string interpolation in output translation
    
    // map to link the id in the ${} to the output ${} order 
    protected mapIdOutTrOrder: Map<string, number>

    /**
     * Prepare and process to a translation to a string interpolation `${}`
     * @param langFileSrcTr the source translation from the langage file
     * @param langFileOutTr the output translation from the langage file
     */
    constructor(langFileSrcTr: string, langFileOutTr: string) {
        // initiate the id in the ${}
        let srcTrMatch = langFileSrcTr.match(reStrInterContent);
        if(srcTrMatch == null) {
            throw `translation '${langFileSrcTr}' should have a string interpolation \${}`;
        }
        this.strInterSrcId = srcTrMatch;
        
        let outTrMatch = langFileOutTr.match(reStrInterContent);
        if(outTrMatch == null) {
            throw `translation '${langFileOutTr}' should have a string interpolation \${}`;
        }
        // this.strInterOutId = outTrMatch;

        if(outTrMatch.length != srcTrMatch.length) {
            throw `translation '${langFileOutTr}' should have the same number of string interpolation in the tranlsation '${langFileSrcTr}'`;
        }

        this.mapIdOutTrOrder = new Map<string, number>();
        let outIdIndex: number;
        for (let i = 0; i < this.strInterSrcId.length; i++) {
            if(this.strInterSrcId[i].length == 0) {
                continue;
            }
            outIdIndex = outTrMatch.indexOf(this.strInterSrcId[i]);
            if(outIdIndex==-1) {
                throw `string interpolation id '${this.strInterSrcId[i]}' in the output translation '${langFileOutTr}' not found`;
            }
            this.mapIdOutTrOrder.set(this.strInterSrcId[i], outIdIndex);
        }

        // initiate regex to find the source to translate
        let srcTrSplit = langFileSrcTr.split(reStrInterContent);
        let strReSrcTr = '\`';
        for (let i = 0; i < srcTrSplit.length-1; i++) {
            strReSrcTr += RegExp.escape(srcTrSplit[i]) + '.*';
        }
        strReSrcTr += RegExp.escape(srcTrSplit[srcTrSplit.length-1]) + '\`';
        this.reSrcTr = new RegExp(strReSrcTr, 'g');
    }


    
    protected mapIdTrOrder(){

    }

    
    /**
     * indicate if the translation is a string interpolation translation
     * @param langFileTr the translation from the langage file
     * @returns indicate if the translation is a string interpolation translation
     */
    static isStrInterpolationTr(langFileTr: string): boolean {
        return langFileTr.search(reStrInter) != -1;
    }
}