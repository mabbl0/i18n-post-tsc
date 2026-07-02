"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dynamic_translation_1 = __importDefault(require("../../../dist/dynamic-translation/dynamic-translation"));


dynamic_translation_1.default.initDynamicTr({
    dynamicLangPath: './src/test/dynamic-tr/dynamicLangFile.lang.json',
    langStart: 'fr',
    fallbackLang: ['bzh', 'esp'],
    logLevel: 'none'
});

console.log(dynamic_translation_1.default.translate.code_1);
dynamic_translation_1.default.lang('en');
console.log(dynamic_translation_1.default.translate.code_1);
dynamic_translation_1.default.lang('bzh');
console.log(dynamic_translation_1.default.translate.code_1);
