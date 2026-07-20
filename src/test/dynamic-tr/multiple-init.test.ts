import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { dynamicTranslationPostTsc } from '../../dynamic-translation/post-tsc-dynamic-tr';

import { execSync } from 'child_process';
import fs from 'fs';

const pathToTestDir = './src/test/dynamic-tr/files-to-test-multiple-init';
const pathToTmpDir = pathToTestDir + '-tmp';
const dynamicTrData = "dynamicTrData.lang.json";

const pathToModule1 = pathToTmpDir + '/module1';
const idModuleName1 = "m1";
const pathToModule2 = pathToTmpDir + '/module2';
const idModuleName2 = "m2";

setLogLevel(LogLevel.Info);


describe('Dynamic File Translation with multiple module using dynamic translation post tsc', () => {

    test(`Dynamic Translation to test ${pathToTestDir} directory`, async () => {
        // copy the file to translate to a tempory directory
        fs.cpSync(pathToTestDir, pathToTmpDir,
            { force: true, recursive: true });

        // prepare module 1
        dynamicTranslationPostTsc({
            srcDir: pathToModule1,
            outDir: pathToModule1,
            dynamicTrData: dynamicTrData,
            idModuleName: idModuleName1
        });

        // prepare module 2
        dynamicTranslationPostTsc({
            srcDir: pathToModule2,
            outDir: pathToModule2,
            dynamicTrData: dynamicTrData,
            idModuleName: idModuleName2
        });

        // wait 100ms for the translation finish
        await new Promise(resolve => setTimeout(resolve, 300));

        /** Execute the translate js file, to check the console log translation **/
        execSync(`node ${pathToModule2 + '/code.js'} > ${pathToTmpDir + '/code.log'}`);
        
        /** The string interpolation dynamic translation **/
        let fileLog = fs.readFileSync(pathToTmpDir + '/code.log').toString();
        // expect the fr translation from module 1
        let indexFr1 = fileLog.indexOf("Salut depuis le module 'module1' !!");
        expect(indexFr1).to.not.equal(-1);
        // then the fr translation from module 2
        let indexFr2 = fileLog.indexOf("Bonjour depuis le module 'module2' !!");
        expect(indexFr2).to.not.equal(-1);
        expect(indexFr2).to.toBeGreaterThan(indexFr1);
        // expect the en translation from module 1
        let indexEn1 = fileLog.indexOf("Hi from the 'module1' module!!");
        expect(indexEn1).to.not.equal(-1);
        expect(indexEn1).to.toBeGreaterThan(indexFr2);
        // expect the en translation from module 2
        let indexEn2 = fileLog.indexOf("Hello from the 'module2' module!!");
        expect(indexEn2).to.not.equal(-1);
        expect(indexEn2).to.toBeGreaterThan(indexEn1);

        // delete the tempory directory
        fs.rmSync(pathToTmpDir, { force: true, recursive: true });
    });
});
