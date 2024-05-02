const fs = require("fs");
const lc = require("langcode-info").default;
const Path = require("path");
const { parse } = require("commander");
const LANGS = require("../const/lang");
const _ = require("lodash");

class LangPacker {
  constructor(inputDir, outputDir, opts) {
    this.prefix = "";
    this.postfix = "";
    this.extension = ".lng";

    if (!inputDir || typeof inputDir !== "string" || !fs.existsSync(inputDir)) {
      throw new Error("You must provide correct input directory path");
    }

    if (!outputDir || typeof outputDir !== "string") {
      throw new Error("You must provide correct ouput directory path");
    }

    let f = fs.statSync(inputDir);

    if (f.isDirectory()) {
      this.input = inputDir;
    } else {
      throw new Error("You must provide correct input directory path");
    }

    try {
      f = fs.statSync(outputDir);

      if (!f.isDirectory()) {
        throw new Error("You must provide correct ouput directory path");
      }

      this.output = outputDir;
    } catch (err) {
      if (err.code === "ENOENT") {
        fs.mkdirSync(outputDir);
        this.output = outputDir;
      } else {
        throw err;
      }
    }

    if (opts && typeof opts === "object") {
      const { prefix, postfix, extension } = opts;

      if (prefix && typeof prefix === "string") {
        this.prefix = prefix;
      }

      if (postfix && typeof postfix === "string") {
        this.postfix = postfix;
      }

      if (extension && typeof extension === "string") {
        this.extension = extension;
      }
    }
  }

  do() {
    const res = {};

    let isLangDir =
      this.input.endsWith("/.lang") || this.input.endsWith("/.lang/");

    this.checkDir(this.input, "", res, isLangDir);

    if (_.size(res) > 0) {
      this.buildLngFiles(res);
    }
  }

  checkDir(dir, path, res, isLangDir) {
    var files = fs.readdirSync(dir);

    for (var i in files) {
      var name = dir + "/" + files[i];

      if (fs.statSync(name).isDirectory()) {
        this.checkDir(
          name,
          `${path}/${files[i]}`,
          res,
          isLangDir || files[i] === ".lang"
        );
      } else if (isLangDir) {
        this.checkFile(name, path, res);
      }
    }
  }

  checkFile(file, path, res) {
    const p = Path.parse(file);

    if (p.ext === ".json" && LANGS[p.name]) {
      const b = fs.readFileSync(file);
      _.set(res, [p.name, path], JSON.parse(b));
    }
  }

  buildLngFiles(languages) {
    _.forEach(languages, (data, locale) => {
      let content = "";
      content += `$LANGUAGE\t${lc.langByCode(locale).name()}\n`;

      _.forEach(data, (obj, path) => {
        content += this.buildObject(obj, `${path}:`);
      });

      const file = Path.join(this.output, this.getLangFilename(locale));

      fs.writeFileSync(file, content);
    });
  }

  buildObject(o, path) {
    let res = "";

    if (_.isObject(o)) {
      const strings = {};
      const objects = {};

      _.forEach(o, (v, k) => {
        if (_.isObject(v)) {
          objects[k] = v;
        } else {
          strings[k] = v;
        }
      });

      if (_.size(strings) > 0) {
        res += `$FORMNAME\t${path}\n`;

        _.forEach(strings, (s, key) => {
          res += `${key}\t${s}\n`;
        });
      }

      if (_.size(objects) > 0) {
        _.forEach(objects, (obj, key) => {
          res += this.buildObject(
            obj,
            `${path}${path.endsWith(":") ? "" : "."}${key}`
          );
        });
      }
    }

    return res;
  }

  getCode(lng) {
    return LANGS[lng];
  }

  getLangFilename(lng) {
    return `${this.prefix}${this.getCode(lng)}${this.postfix}${this.extension}`;
  }
}

module.exports = LangPacker;
