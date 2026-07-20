"use strict";
const dynamic_translation_post_tsc_1 = require("../../../../packages/dynamic-translation-post-tsc/dist/dynamic-translation/dynamic-translation-post-tsc");

dynamic_translation_post_tsc_1.initDynamicTr({
    outDir: './src/test/dynamic-tr/files-to-test-tmp',
    dynamicTrData: 'dynamicTrData.lang.json',
    langStart: 'fr',
    fallbackLang: ['bzh', 'fr'],
    logLevel: 'none'
});

console.log("Hello everyone!");
dynamic_translation_post_tsc_1.lang('en');
console.log("Hello everyone!");
dynamic_translation_post_tsc_1.lang('bzh');
console.log("Hello everyone!");
console.log("Who is here?");
