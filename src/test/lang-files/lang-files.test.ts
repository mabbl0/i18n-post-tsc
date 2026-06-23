import { describe, expect, test } from 'vitest'
import { readLangFiles } from '../../lang-files';
import { LangFile } from '../../lang-file-type';
import { LogLevel, setLogLevel } from '../../tool/log';

setLogLevel(LogLevel.Verbose);

describe('Read lang files in test directory', () => {
    test("Read the files in ./src/test/lang-files/", async () => {
        expect.hasAssertions();

        const lFiles: LangFile[] = await new Promise((resolve) => {
            readLangFiles('./src/test/lang-files/', resolve);
        });
        // Read exactly 2, the other lang file are not added

        expect(lFiles.length).toBe(2);
        expect(lFiles).toEqual<LangFile[]>([
            {
                pathFromSrc: 'code.js',
                data: {
                    srcLang: 'en', translations: [
                        { en: "Hello everyone!", fr: "Bonjour tout le monde !", bzh: "Demat d'an holl !" },
                        { en: "Who is here?", fr: "Qui est là ?", bzh: "Piv zo aze ?" }
                    ]
                }
            },
            {
                pathFromSrc: 'sub-dir\\sub-code.js',
                data: {
                    srcFile: 'sub-code.ts', srcLang: 'en', translations: [
                        { en: "may be ${} person? ${}?", fr: "peut être ${} personne ? ${} ?" },
                        { en: "${1}'s ${2} cars", fr: "les ${2} voitures de ${1}" }
                    ]
                }
            },
        ]);
    });
});
