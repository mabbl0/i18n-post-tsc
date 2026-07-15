"use strict";
const dynamic_translation_1 = require("../../../../packages/dynamic-translation/dist/dynamic-translation/dynamic-translation");

dynamic_translation_1.initDynamicTr({
    dynamicLangPath: './src/test/dynamic-tr/str-inter-files-to-test-tmp/dynamicLangFile.lang.json',
    langStart: 'fr',
    fallbackLang: ['fr', 'en'],
    logLevel: 'debug'
});

for (let i = 0; i < 3; i++) {
    console.log(`may be ${i} person? or ${i * 2}?`);
}
let personName = 'Jean';
let nbCar = 3;
console.log(`${personName}'s ${nbCar} cars`);
