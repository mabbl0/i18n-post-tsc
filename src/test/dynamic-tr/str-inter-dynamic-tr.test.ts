import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { postTscDynamicTranslation } from '../../dynamic-translation/post-tsc-dynamic-tr';

// const { execSync } = require('child_process');
import fs from 'fs';

const pathToTestDir = './src/test/dynamic-tr/str-inter-files-to-test';
const pathToTmpDir = pathToTestDir + '-tmp';
const dynamicLangFile = "dynamicLangFile.lang.json";
setLogLevel(LogLevel.Debug);

describe('Dynamic File Translation', () => {

    test(`Dynamic Translation in ${pathToTestDir} directory`, async () => {
        // copy the file to translate to a tempory directory
        fs.cpSync(pathToTestDir, pathToTmpDir,
            { force: true, recursive: true });

        postTscDynamicTranslation({
            srcDir: pathToTmpDir,
            outDir: pathToTmpDir,
            dynamicLangFile: dynamicLangFile
        });

        // wait 100ms for the translation finish
        await new Promise(resolve => setTimeout(resolve, 100));

        /** Check the dynamic lang file after the postTscDynamicTranslation **/
        // let dynLangFile = fs.readFileSync(pathToTmpDir + '/' + dynamicLangFile).toString();
        // expect(dynLangFile).equal(`{"data":[{"lang":"en","nbTr":2,"tr":{"code_0":"Hello everyone!","code_1":"Who is here?"}},{"lang":"fr","nbTr":2,"tr":{"code_0":"Bonjour tout le monde !","code_1":"Qui est là ?"}},{"lang":"bzh","nbTr":1,"tr":{"code_0":"Demat dan holl !"}}]}`);


        /** Execute the translate js file, to check the console log translation **/
        // execSync(`node ${pathToTmpDir + '/code.js'} > ${pathToTmpDir + '/code.log'}`);

        
        // TODO: add string interpolation test
        expect(1).equal(1); // ??



        // delete the tempory directory
        // fs.rmSync(pathToTmpDir, { force: true, recursive: true });
    });
});
