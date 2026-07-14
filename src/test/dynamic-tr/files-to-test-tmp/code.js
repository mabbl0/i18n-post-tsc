"use strict";
const dynamic_translation_1 = require("../../../../packages/dynamic-translation/dist/dynamic-translation/dynamic-translation");

dynamic_translation_1.initDynamicTr({
    dynamicLangPath: './src/test/dynamic-tr/files-to-test-tmp/dynamicLangFile.lang.json',
    langStart: 'fr',
    fallbackLang: ['bzh', 'fr'],
    logLevel: 'none'
});

console.log(dynamic_translation_1.translate.code_0);
dynamic_translation_1.lang('en');
console.log(dynamic_translation_1.translate.code_0);
dynamic_translation_1.lang('bzh');
console.log(dynamic_translation_1.translate.code_0);
console.log(dynamic_translation_1.translate.code_1);
