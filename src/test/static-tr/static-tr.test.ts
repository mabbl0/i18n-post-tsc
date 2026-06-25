import { describe, expect, test } from "vitest";
import { LogLevel, setLogLevel } from "../../tool/log";
import { staticTranslation } from '../../static-translation';
import fs from 'fs';

const pathToTestDir = './src/test/static-tr/file-to-test';
const pathToTmpDir = pathToTestDir + '-tmp';
setLogLevel(LogLevel.Verbose);

describe('Static File Translation', () => {
    
    test(`Static Files Translation in ${pathToTestDir} directory`, async () => {
        // copy the file to translate to a tempory directory
        fs.cpSync(pathToTestDir, pathToTmpDir, 
            {force: true, recursive: true});

        staticTranslation({
            srcDir: pathToTmpDir,
            outDir: pathToTmpDir,
            outLang: 'bzh',
            fallbackLang: ['fr']
        });

        // wait 100ms for the translation finish
        await new Promise(resolve => setTimeout(resolve, 100));
        

        /** The simple translation **/
        let file1Tr = fs.readFileSync(pathToTmpDir + '/code.js').toString();
        // the correct bzh translation
        expect(file1Tr.indexOf("Demat d'an holl !")).to.not.equal(-1);
        // the fr fallback translation if no bzh translation
        expect(file1Tr.split("Qui est là \?")?.length).toEqual(3);
        // the no translation, if string include in bigger one
        expect(file1Tr.indexOf("Who is here? in the bottle?")).to.not.equal(-1);


        /** The string interpolation translation **/
        let file2Tr = fs.readFileSync(pathToTmpDir + '/sub-dir/sub-code.js').toString();
        // translate the string interpolation
        expect(file2Tr.indexOf("`peut être ${i} personne ? ${i * 2} ?`")).to.not.equal(-1);
        // translate reverse string interpolation, by id
        expect(file2Tr.indexOf("`les ${nbCar} voitures de ${personName}`")).to.not.equal(-1);


        // delete the tempory directory
        fs.rmSync(pathToTmpDir, {force: true, recursive: true});
    });
});