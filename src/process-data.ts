

// /**
//  * regroup the files content in a unique content
//  * @param langFiles the content of the files content
//  * @returns the content regrouped
//  */
// function regroupFilesContent(langFiles: LangFile[]): GlobalLangFile {
//     let globalLangFile: GlobalLangFile = {
//         lang: [],
//         ressources: new Map<string, LangFile>()
//     };

// path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// // Returns: 'quux'

//     let match : RegExpMatchArray | null
//     let keyBase: string;
//     langFiles.forEach((langFile, i) => {
//         match = langFile.path.match(/\w+(?=\.lang\.json$)/g);
//         if(match != null && match.length == 1) {
//             keyBase = match[0];
//         }
//         else {
//             keyBase = i + '_';
//         }

//         if(langFile.data.srcLang != undefined && 
//             globalLangFile.lang.includes(langFile.data.srcLang) == false)
//         {
//             globalLangFile.lang.push(langFile.data.srcLang);
//         }

//         if(langFile.data.outputLang != undefined) {
//             langFile.data.outputLang.forEach(lang => {
//                 if(globalLangFile.lang.includes(lang) == false) {
//                     globalLangFile.lang.push(lang);
//                 }
//             });
//         }

        
//     });

//     return globalData;
// }
