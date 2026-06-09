`post-tsc-i18n` is a i18n (internationalization / translation) package for your TS project.  
The idea is to inject the translation after the compilation into the JS code, to keep the TS code clean with the minimum i18n.

`post-tsc-i18n` gives the possibilities to:  
- get a dynamic and/or static tanslation


# Install

```
npm install post-tsc-i18n
```

# Usage

## static translation

A translate file index.lang.json:
```json
{
    "srcLang": "en",
    "outputLang": ["fr", "bzh"],
    "ressources": [
        {
            "en": "hello everyone!",
            "fr": "bonjour tout le monde !",
            "bzh": "demat d'an holl !"
        },
        {
            "en": "who is here?",
            "fr": "Qui est là ?",
            "bzh": "Piv zo aze ?"
        }
    ]
}
```

The TS code:
```ts
console.log("hello everyone!");
console.log("who is here?");
```

After TS compilation, execute the command: `npx post-tsc-i18n --mode static --lang fr`  
to obtain the JS code:
```js
console.log("bonjour tout le monde !");
console.log("Qui est là ?");
```


## dynamic translation

A translate file index.lang.json:
```json
{
    "srcLang": "en",
    "outputLang": ["fr", "bzh"],
    "ressources": [
        {
            "en": "hello everyone!",
            "fr": "bonjour tout le monde !",
            "bzh": "demat d'an holl !"
        }
    ]
}
```

The TS code:
```ts
import { lang } from "post-tsc-i18n"

console.log("hello everyone!");
console.log("who is here?");

lang("fr");
console.log("hello everyone!");

lang("bzh");
console.log("hello everyone!");
```

After TS compilation, execute the command: `npx post-tsc-i18n --mode dynamic`  
to obtain a new translate file to your output directory, that concatenate all translate files from your project.
```json
{
    "lang": ["en", "fr", "bzh"],
    "ressources": [
        {
            "key": "indexLang0",
            "translation": {
                "en": "hello everyone!",
                "fr": "bonjour tout le monde !",
                "bzh": "demat d'an holl !"
            }
        }
    ]
}
```

to obtain the JS code:
```js
const post_tsc_i18n_1 = require("post-tsc-i18n");

console.log( post_tsc_i18n_1.translate.indexLang0 ); // "hello everyone!"

post_tsc_i18n_1.lang( 1 ); // 1 is the index to the "fr" lang
console.log( post_tsc_i18n_1.translate.indexLang0 ); // "bonjour tout le monde !"

post_tsc_i18n_1.lang( 2 ); // 2 is the index to the "bzh" lang
console.log( post_tsc_i18n_1.translate.indexLang0 ); // "demat d'an holl !"
```
