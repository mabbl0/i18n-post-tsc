#!/usr/bin/env node

import yargs from 'yargs';
import { staticTranslation } from '../static-translation/static-translation';
import { LogLevel, setLogLevel, setLogLevelByStr, StrLogLevel } from '../tool/log';
import { dynamicTranslationPostTsc } from '../dynamic-translation/dynamic-tr-post-tsc';

// TODO: add a config file with the arg option

type PtiMode = 'static' | 'dynamic';

interface ParsedArgs extends yargs.Arguments {
    verbose: boolean
    log: StrLogLevel

    mode: PtiMode
    srcDir: string
    outDir: string

    outLang: string
    fallbackLang: string[]

    dynamicLangFile: string
    idModuleName: string
}

function parseArgs(): ParsedArgs {
    return yargs( process.argv.slice(2) ).parserConfiguration({})
        .usage('Usage: $0 [options]')
        .demandCommand(0)
        .option('verbose', {
            alias: "v",
            type: 'boolean',
            default: "false",
            description: "the translation is executate with a verbose log level"
        })
        .option('log', {
            type: 'string',
            choices: ['none', 'error', 'warning', 'info', 'verbose', 'debug'],
            default: "info",
            description: "the log level for the execution"
        })

        // common parameter
        .option('mode', {
            alias: "m",
            demandOption: true,
            type: 'string',
            choices: ['static', 'dynamic'],
            description: "execution mode. Static to translate once after ts compilation. Dynamic to change translation langage in run time."
        })
        .option('srcDir', {
            alias: "s",
            type: 'string',
            default: "src",
            description: "the source directory"
        })
        .option('outDir', {
            alias: "o",
            type: 'string',
            default: "dist",
            description: "the output directory"
        })

        // static mode parameter
        .option('outLang', {
            alias: "l",
            type: 'string',
            description: "the output langage for the static translation"
        })
        .option('fallbackLang', {
            alias: "f",
            type: 'array',
            description: "the fallback langage for the static translation"
        })

        // dynamic mode parameter
        .option('dynamicLangFile', {
            type: 'string',
            description: "path to the langage file data for the dynamic translation"
        })
        .option('idModuleName', {
            type: 'string',
            description: "identifer name form the module to add to every identifer in dynamic translation"
        })
        .version()
        .strict()
        .example('$0 --mode static --srcDir src --outDir dist', '')

        .argv as ParsedArgs;
}



function main(): void {
	const args = parseArgs();
    if(args.verbose) {
        setLogLevel(LogLevel.Verbose);
    }
    else {
        setLogLevelByStr(args.log);
    }

    switch (args.mode) {
        case 'static':
            if(!args.srcDir || !args.outDir || !args.outLang) {
                throw "Static mode require the options: srcDir ; outDir ; outLang";
            }

            staticTranslation({
                srcDir: args.srcDir,
                outDir: args.outDir,
                outLang: args.outLang,
                fallbackLang: args.fallbackLang
            });
            break;
        case 'dynamic':
            if(!args.srcDir || !args.outDir || !args.dynamicLangFile) {
                throw "Dynamic mode require the options: srcDir ; outDir ; dynamicLangFile";
            }

            dynamicTranslationPostTsc({
                srcDir: args.srcDir,
                outDir: args.outDir,
                dynamicLangFile: args.dynamicLangFile,
                idModuleName: args.idModuleName
            })
            break;
        default:
            throw "mode unknow";
    }
}



try {
	main();
} catch (e) {
    console.error(`Error: ${(e)}`);
	process.exit(1);
}
