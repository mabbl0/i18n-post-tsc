#!/usr/bin/env node

import yargs from 'yargs';
import { staticTranslation } from '../static-translation';
import { setLogLevelByStr } from '../log';

type PtiMode = 'static' | 'dynamic';

interface ParsedArgs extends yargs.Arguments {
    mode: PtiMode
}

function parseArgs(): ParsedArgs {
    return yargs( process.argv.slice(2) ).parserConfiguration({})
        .usage('Usage: $0 [options]')
        .demandCommand(0)
        .option('mode', {
            type: 'string',
            default: "static",
            description: "execution mode"
        })
        .version()
        .strict()
        .example('$0 --mode static', '')
        .argv as ParsedArgs;
}



function main(): void {
	const args = parseArgs();
    setLogLevelByStr('debug');

    switch (args.mode) {
        case 'static':
            staticTranslation({
                srcDir: 'src/test/',
                outDir: 'dist/test/',
                outLang: 'bzh',
                fallbackLang: ['fr']
            });
            break;
        case 'dynamic':
            throw "no available yet";
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
