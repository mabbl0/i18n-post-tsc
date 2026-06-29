import dynamiTr from '../../dynamic-translation/dynamic-translation'

dynamiTr.initDynamicTr({
    dynamicLangPath: './src/test/dynamic-tr/dynamicLangFile.lang.json',
    langStart: 'fr',
    logLevel: 'debug'
});

console.log( dynamiTr.translate('code_1') );

dynamiTr.lang('en');

console.log( dynamiTr.translate.data.code_1 );

dynamiTr.lang('bzh');

console.log( dynamiTr.translate.data.code_1 );

// console.log("Hello everyone!");
// console.log("Who is here?");
// console.log("Who is here?");
// console.log("Who is here? in the bottle?");


