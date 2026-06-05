#!/usr/bin/env node

//import path from 'path';
import yargs from 'yargs';

type PtiMode = 'static';

interface ParsedArgs extends yargs.Arguments {
    mode: PtiMode
}

function parseArgs(): ParsedArgs {
    return yargs().parserConfiguration({})
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

    switch (args.mode) {
        case 'static':
            
            break;
        default:
            throw "";
    }
}



try {
	main();
} catch (ex) {
    console.error(`Error: ${(ex as Error).message}`);
	process.exit(1);
}
