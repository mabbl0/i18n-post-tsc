
export class AccessDynamicStrInterTr {
    readonly splitTr: string[] // the translation split between the ${}
    readonly mapIdOrder: number[]

    constructor(splitTr: string[], mapIdOrder: number[]) {
        this.splitTr = splitTr;
        this.mapIdOrder = mapIdOrder;
    }

    /**
     * Apply the translation with the arguments in run time
     * @param args the arguments give in run time
     * @returns the translation of this string interpolation
     */
    with(...args: string[]): string {
        let trRes = this.splitTr[0];
        for (let i = 0; i < this.splitTr.length-1; i++) {
            if(args[i] != undefined) {
                if(i < this.mapIdOrder.length && this.mapIdOrder[i] < args.length) {
                    trRes += args[ this.mapIdOrder[i] ];
                }
                else {
                    trRes += args[i];
                }
            }

            trRes += this.splitTr[i+1]
        }

        return trRes;
    }

}