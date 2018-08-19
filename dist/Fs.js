"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
class Fs {
    execSync(cmdline) {
        return child_process_1.execSync(cmdline);
    }
    exec(cmdline, options, callback) {
        child_process_1.exec(cmdline, options, callback);
    }
    outputJsonSync(filename, data) {
        fs_extra_1.default.outputJsonSync(filename, data);
    }
    writeJsonSync(filename, data) {
        this.outputJsonSync(filename, data);
    }
    readJsonSync(filename) {
        return fs_extra_1.default.readJsonSync(filename);
    }
    existsSync(fileorfolder) {
        return fs_extra_1.default.existsSync(fileorfolder);
    }
    readdirSync(dir) {
        return fs_extra_1.default.readdirSync(dir);
    }
    statSync(fileorfolder) {
        return fs_extra_1.default.statSync(fileorfolder);
    }
    readFileSync(file, options) {
        return fs_extra_1.default.readFileSync(file, options);
    }
    writeFileSync(file, content, options) {
        fs_extra_1.default.writeFileSync(file, content, options);
    }
    mkdirSync(dirname) {
        fs_extra_1.default.mkdirSync(dirname);
    }
}
exports.Fs = Fs;
