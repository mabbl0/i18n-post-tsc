`i18n-post-tsc` is a simple i18n (internationalization / translation) package for your TS project.  
The idea is to inject the translation after the tsc compilation into the JS code, to not impact your TS code.

`i18n-post-tsc` features:  
- easy to implement / minimum impact with your existing code.
- Static translation. Inject the target translation once after the tsc.  
Perfect for an open source project with a specific usage.
- Dynamic translation. The access to the translation is injected in the JS files. You just need to add an initiation and a way to change the langage.
- switch easily between the Static and Dynamic translation mode.
- string interpolation "`${}`" translation in static and dynamic mode.


# Install

The `i18n-post-tsc` module to inject the modification into the JS files:

```
npm install i18n-post-tsc --save-dev
```

The `dynamic-translation-post-tsc` module for the dynamic translation in run time:

```
npm install dynamic-translation-post-tsc
```


# Usage

Write your TS code with the string in the langage you want:

```ts
// src/code.ts
console.log("hello everyone!!"); // "bonjour tout le monde !!"
const userName = "Jean";
console.log(`Hello ${userName}!`); // "Bonjour Jean !!"
```

Add a translate file index.lang.json:
```json
{
    "srcFile": "code",
    "srcLang": "en",
    "translations": [
        {
            "en": "hello everyone!!",
            "fr": "bonjour tout le monde !!",
            "bzh": "demat d'an holl !!"
        },
        {
            "en": "Hello ${}!",
            "fr": "Bonjour ${} !"
        }
    ]
}
```

## Static translation

Compile your TS project to obtain the JS code files:
```
npx tsc
```

Then, run the `i18n-post-tsc` command with the `static` mode to apply the translation in your JS code.  
Indicate the source directory, the JS output directory, and the target translation.

```
npx i18n-post-tsc --mode static --srcDir src --outDir dist --outLang fr
```

The module reads the translation files in the source directory, and replace the string in the JS files output with the target translation.
Your project is translate.

You can indicate some fallback langages, if the translation is not available for target translation.

## Dynamic translation

Add an initiation to the `dynamic-translation-post-tsc` module at the start of your project, and a way to change the langage:
```ts
// src/code.ts
import dynamic_translation_post_tsc from "dynamic-translation-post-tsc";

dynamic_translation_post_tsc.initDynamicTr({
    outDir: 'dist',
    langStart: 'fr'
});

console.log("hello everyone!!"); // "bonjour tout le monde !!"
dynamic_translation_post_tsc.lang('en');
const userName = "Jean";
console.log(`Hello ${userName}!`); // "Hello Jean!"
```

Compile your TS project to obtain the JS code files:
```
npx tsc
```

Then, run the `i18n-post-tsc` command with the `dynamic` mode to apply the translation in your JS code.  
Indicate the source directory and the JS output directory.

```
npx i18n-post-tsc --mode dynamic --srcDir src --outDir dist
```

The `i18n-post-tsc` reads the translation files in the source directory, save the data in a dynamic translation file data, and replace the string in the JS files to access to the dynamic translation in run time.  
In run time, the initialization of the `dynamic-translation-post-tsc` module reads the dynamic translation file data, and apply the wanted langage. The replaced string access to the current translation.

See the (dynamic-translation-post-tsc readme)[https://github.com/mabbl0/i18n-post-tsc/blob/main/packages/dynamic-translation-post-tsc/readme.md] for more details about dynamic translation.
