#!/usr/bin/env node

const { Command } = require('commander');
const LangPacker = require('../lib/classes/LangPacker');

const program = new Command();

const DefaultDirectoryName = "./.output";

program.version('0.0.1');

program
    .option('-i, --input <path>', 'input directory name')
    .option('-o, --output <path>', 'output directory name', DefaultDirectoryName)
    .option('-pr, --prefix <value>', 'output filename prefix', "")
    .option('-po, --postfix <value>', 'output filename postfix', "")
    .option('-e, --extension <value>', 'extension for output filename', ".lng")


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

    const packer = new LangPacker(program.input, program.output, opts);

    packer.do();
} else {
    if (!program.input) throw new Error('You must specify an input directory path (-i attribute)');
    if (!program.output) throw new Error('You must specify an output directory path (-o attribute)');
}

console.log("Input directory path: ", program.input);
console.log("Output directory path: ", program.output);