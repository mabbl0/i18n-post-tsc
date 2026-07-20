"use strict";
const dynamic_translation_post_tsc_1 = require("../../../../packages/dynamic-translation-post-tsc/dist/dynamic-translation/dynamic-translation-post-tsc");

dynamic_translation_post_tsc_1.initDynamicTr({
    outDir: './src/test/dynamic-tr/str-inter-files-to-test-tmp',
    dynamicTrData: 'dynamicTrData.lang.json',
    langStart: 'fr',
    fallbackLang: ['fr', 'en'],
    logLevel: 'none'
});

for (let i = 0; i < 2; i++) {
    console.log(`may be ${i} person? or ${i * 2}?`);

    dynamic_translation_post_tsc_1.lang('en');
}

let personName = 'Jean';
let nbCar = 3;
console.log(`${personName}'s ${nbCar} cars`);
dynamic_translation_post_tsc_1.lang('fr');
console.log(`${personName}'s ${nbCar} cars`);
