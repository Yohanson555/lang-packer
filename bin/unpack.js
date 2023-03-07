#!/usr/bin/env node

const { Command } = require('commander');
const LangUnpacker = require('../lib/classes/LangUnpacker');

const program = new Command();

const DefaultDirectoryName = "./";

program.version('0.0.1');

program
    .option('-i, --input <path>', 'input directory name')
    .option('-o, --output <path>', 'output directory name', DefaultDirectoryName)
    .option('-in, --index', 'should generate index', false)
    .option('-pr, --prefix <value>', 'output filename prefix', "")
    .option('-po, --postfix <value>', 'output filename postfix', "")
    .option('-e, --extension <value>', 'extension for output filename', ".lng")
    .option('-s, --skip', 'should skip empty strings', false)


program.parse(process.argv);


if (program.input && program.output) {
    const opts = {};

    if (program.prefix) {
        opts.prefix = program.prefix;
    }

    if (program.postfix) {
        opts.postfix = program.postfix;
    }

    if (program.extension) {
        opts.extension = program.extension;
    }

    if (program.index) {
        opts.index = true;
    } else {
        opts.index = false;
    }

    if (program.skip) {
        opts.skip = true;
    } else {
        opts.skip = false;
    }

    const packer = new LangUnpacker(program.input, program.output, opts);

    packer.do();
} else {
    if (!program.input) console.log('You must specify an input directory path (-i attribute)');
    if (!program.output) console.log('You must specify an output directory path (-o attribute)');

    throw new Error("Something went wrong; view logs for more details");
}