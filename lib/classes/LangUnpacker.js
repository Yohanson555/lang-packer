const fs = require('fs');
const lc = require('langcode-info');
const Path = require('path');
const { parse } = require('commander');
const LANGS = require('../const/lang');
const _ = require('lodash');

class LangUnpacker {
    constructor(inputDir, outputDir, opts) {
        this.prefix = '';
        this.postfix = '';
        this.extension = ".lng";
        this.index = false;

        if (!inputDir || typeof inputDir !== 'string' || !fs.existsSync(inputDir)) {
            throw new Error('You must provide correct input directory path');
        }

        let f = fs.statSync(inputDir);

        if (f.isDirectory()) {
            this.input = inputDir;
        } else {
            throw new Error('You must provide correct input directory path that contains lang files')
        }

        try {
            f = fs.statSync(outputDir);

            if (!f.isDirectory()) {
                throw new Error('You must provide correct ouput directory path')
            }

            this.output = outputDir;
        } catch (err) {
            if (err.code === 'ENOENT') {
                fs.mkdirSync(outputDir);
                this.output = outputDir;
            } else {
                throw err;
            }
        }

        if (opts && typeof opts === 'object') {
            const { prefix, postfix, extension } = opts;

            if (prefix && typeof prefix === 'string') {
                this.prefix = prefix;
            }

            if (postfix && typeof postfix === 'string') {
                this.postfix = postfix;
            }

            if (extension && typeof extension === 'string') {
                this.extension = extension;
            }

            this.index = !!opts.index;
        }

    }

    do() {
        let res = {};
        const files = fs.readdirSync(this.input);

        let code = null;
        let langFiles = {};

        for (var i in files) {
            var filePath = Path.join(this.input, files[i]);
            var stat = fs.statSync(filePath);

            if (stat.isFile()) {
                let code = this.checkFileName(files[i]);

                if (code !== null) {
                    langFiles[code] = filePath;
                }
            }
        }

        if (_.size(langFiles) > 0) {
            let codes = Object.keys(langFiles);

            _.forEach(langFiles, (f, c) => {
                const res = this.parseFile(f);

                this.writeResult(c, res, codes);
            })
        }
    }

    writeResult(langCode, data, codes) {
        if (langCode && _.size(data) > 0) {
            _.forEach(data, (map, path) => {
                let fullPath = Path.join(this.output || "./", path);

                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }

                if (this.index) {
                    this.writeIndex(fullPath, codes);
                }

                let fileName = this.getFileName(langCode);

                if (fileName !== null) {
                    let filePath = Path.join(fullPath, fileName);

                    fs.writeFileSync(filePath, JSON.stringify(map, null, 4));
                } else {
                    throw new Error("Undefined language with code: " + langCode);
                }
            });
        }
    }

    writeIndex(path, codes) {
        if (_.size(codes) > 0) {
            let fileContent = "";

            _.forEach(codes, (hex) => {
                let code = lc.langByHex(hex).code();

                if (code != null) {
                    fileContent += `import ${lc.langByHex(hex).lex()} from "./${code}.json"; \n`;
                }
            });

            fileContent += "\n\nexport {\n"

            _.forEach(codes, (hex) => {
                let lex = lc.langByHex(hex).lex();

                if (lex) {
                    fileContent += `    ${lex},\n`
                }
            });

            fileContent += "};\n";

            fs.writeFileSync(Path.join(path, "index.js"), fileContent);
        }
    }

    getFileName(code) {
        let name = lc.langByHex(code).code();

        if (name) return `${name}.json`;

        return null;
    }

    parseFile(file) {
        let res = {};
        let content = fs.readFileSync(file).toString();
        let language = null;
        let key = null;
        let path = null;

        if (content.indexOf("\r\n") > 0) {
            content = content.replace("\r\n", "\n");
        }

        const lines = content.split("\n");

        lines.forEach(line => {
            if (line.startsWith("$LANGUAGE")) {
                const arr = line.split("\t");

                language = arr[1];
            } else if (line.startsWith("$FORMNAME")) {
                const l = line.replace("\r", "");
                const [_, ...rest] = l.split("\t");
                const tempPath = rest.join("");

                const arr = tempPath.split(":");

                key = arr[0];
                path = arr[1];
            } else {
                const l = line.replace("\r", "");
                const [k, v] = l.split("\t");

                let p = [key];
                if (path && path != "") p.push(path);
                p.push(k);

                _.set(res, p, v);
            }
        });

        return res;
    }

    checkFileName(filename) {
        let regex = "^";

        if (this.prefix) regex += this.prefix;

        regex += "(\\w+)";

        if (this.postfix) regex += this.postfix;
        if (this.extension) regex += this.extension;

        regex += "$"

        const re = new RegExp(regex, "si");

        const arr = filename.match(re);

        if (arr) return arr[1];

        return null;
    }
}

module.exports = LangUnpacker