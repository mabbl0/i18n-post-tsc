import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { dynamicTranslationPostTsc } from '../../dynamic-translation/post-tsc-dynamic-tr';

import { execSync } from 'child_process';
import fs from 'fs';

const pathToTestDir = './src/test/dynamic-tr/files-to-test';
const pathToTmpDir = pathToTestDir + '-tmp';
const dynamicTrData = "dynamicTrData.lang.json";
setLogLevel(LogLevel.Info);

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
        expect(dynLangFile).equal(`{"data":[{"lang":"en","nbTr":2,"tr":{"code_0":"Hello everyone!","code_1":"Who is here?"}},{"lang":"fr","nbTr":2,"tr":{"code_0":"Bonjour tout le monde !","code_1":"Qui est là ?"}},{"lang":"bzh","nbTr":1,"tr":{"code_0":"Demat dan holl !"}}]}`);


        /** Execute the translate js file, to check the console log translation **/
        execSync(`node ${pathToTmpDir + '/code.js'} > ${pathToTmpDir + '/code.log'}`);

        /** The simple dynamic translation **/
        let file1Log = fs.readFileSync(pathToTmpDir + '/code.log').toString();
        // expect the fr translation
        let indexFr = file1Log.indexOf("Bonjour tout le monde !");
        expect(indexFr).to.not.equal(-1);
        // then the en translation
        let indexEn = file1Log.indexOf("Hello everyone!");
        expect(indexEn).to.not.equal(-1);
        expect(indexEn).to.toBeGreaterThan(indexFr);
        // then the bzh translation
        let indexBzh = file1Log.indexOf("Demat dan holl !");
        expect(indexBzh).to.not.equal(-1);
        expect(indexBzh).to.toBeGreaterThan(indexEn);
        // the fr fallback translation
        expect(file1Log.indexOf("Qui est là ?")).to.not.equal(-1);



        // delete the tempory directory
        fs.rmSync(pathToTmpDir, { force: true, recursive: true });
    });
});
