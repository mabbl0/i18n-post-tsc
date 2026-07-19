"use strict";

const dynamic_translation_1 = require("../../../../../packages/dynamic-translation-post-tsc/dist/dynamic-translation/dynamic-translation");
const helloFromModule1 = require("../module1/code");

dynamic_translation_1.initDynamicTr({
    dynamicLangPath: `./src/test/dynamic-tr/files-to-test-multiple-init-tmp/module2/dynamicLangFile.lang.json`,
    langStart: 'fr',
    fallbackLang: ['fr', 'en'],
    logLevel: 'none'
});


const moduleName = "module2";
function helloFromModule2() {
    console.log(`Hello from the '${moduleName}' module!!`);
}

helloFromModule1();
helloFromModule2();
dynamic_translation_1.lang('en');
helloFromModule1();
helloFromModule2();
