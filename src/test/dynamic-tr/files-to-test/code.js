"use strict";
const dynamic_translation_1 = require("../../../../packages/dynamic-translation/dist/dynamic-translation/dynamic-translation");

dynamic_translation_1.initDynamicTr({
    dynamicLangPath: './src/test/dynamic-tr/files-to-test-tmp/dynamicLangFile.lang.json',
    langStart: 'fr',
    fallbackLang: ['bzh', 'fr'],
    logLevel: 'none'
});

console.log("Hello everyone!");
dynamic_translation_1.lang('en');
console.log("Hello everyone!");
dynamic_translation_1.lang('bzh');
console.log("Hello everyone!");
console.log("Who is here?");
