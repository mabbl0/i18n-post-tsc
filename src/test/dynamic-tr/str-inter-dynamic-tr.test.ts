import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { dynamicTranslationPostTsc } from '../../dynamic-translation/post-tsc-dynamic-tr';

import { execSync } from 'child_process';
import fs from 'fs';

const pathToTestDir = './src/test/dynamic-tr/str-inter-files-to-test';
const pathToTmpDir = pathToTestDir + '-tmp';
const dynamicTrData = "dynamicTrData.lang.json";
setLogLevel(LogLevel.None);

describe('Dynamic File Translation', () => {

    test(`Dynamic Translation in ${pathToTestDir} directory`, async () => {
        // copy the file to translate to a tempory directory
        fs.cpSync(pathToTestDir, pathToTmpDir,
            { force: true, recursive: true });

        dynamicTranslationPostTsc({
            srcDir: pathToTmpDir,
            outDir: pathToTmpDir,
            dynamicTrData: dynamicTrData
        });

        // wait 100ms for the translation finish
        await new Promise(resolve => setTimeout(resolve, 300));

        /** Check the dynamic lang file after the dynamicTranslationPostTsc **/
        let dynLangFile = fs.readFileSync(pathToTmpDir + '/' + dynamicTrData).toString();
        expect(dynLangFile).equal(`{"data":[{"lang":"en","nbTr":2,"tr":{"code_0":{"splitTr":["may be "," person? or ","?"],"mapIdOrder":[]},"code_1":{"splitTr":["","'s "," cars"],"mapIdOrder":[0,1]}}},{"lang":"fr","nbTr":2,"tr":{"code_0":{"splitTr":["peut être "," personne ? ou "," ?"],"mapIdOrder":[]},"code_1":{"splitTr":["les "," voitures de ",""],"mapIdOrder":[1,0]}}}]}`);


        /** Execute the translate js file, to check the console log translation **/
        execSync(`node ${pathToTmpDir + '/code.js'} > ${pathToTmpDir + '/code.log'}`);

        
        /** The string interpolation dynamic translation **/
        let fileLog = fs.readFileSync(pathToTmpDir + '/code.log').toString();
        // expect the fr translation with 0 and 0
        let indexFr = fileLog.indexOf("peut être 0 personne ? ou 0 ?");
        expect(indexFr).to.not.equal(-1);
        // then the en translation with 1 and 2
        let indexEn = fileLog.indexOf("may be 1 person? or 2?");
        expect(indexEn).to.not.equal(-1);
        expect(indexEn).to.toBeGreaterThan(indexFr);
        // expect the en translation
        let indexEn2 = fileLog.indexOf("Jean's 3 cars");
        expect(indexEn2).to.not.equal(-1);
        expect(indexEn2).to.toBeGreaterThan(indexEn);
        // then the fr translation, with the reverse order
        let indexFr2 = fileLog.indexOf("les 3 voitures de Jean");
        expect(indexFr2).to.not.equal(-1);
        expect(indexFr2).to.toBeGreaterThan(indexEn2);

        // delete the tempory directory
        fs.rmSync(pathToTmpDir, { force: true, recursive: true });
    });
});
