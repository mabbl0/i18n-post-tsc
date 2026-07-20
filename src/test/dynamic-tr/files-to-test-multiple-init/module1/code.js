"use strict";
const dynamic_translation_post_tsc_1 = require("../../../../../packages/dynamic-translation-post-tsc/dist/dynamic-translation/dynamic-translation-post-tsc");


dynamic_translation_post_tsc_1.initDynamicTr({
    outDir: './src/test/dynamic-tr/files-to-test-multiple-init-tmp/module1',
    dynamicTrData: 'dynamicTrData.lang.json',
    langStart: 'fr',
    fallbackLang: ['fr', 'en'],
    logLevel: 'none'
});

const moduleName = "module1";
module.exports = function helloFromModule1() {
    console.log(`Hi from the '${moduleName}' module!!`);
}

