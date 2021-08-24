"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Host = void 0;
const util_1 = require("util");
const fs_extra_1 = __importDefault(require("fs-extra"));
const shelljs_1 = require("shelljs");
const child_process_1 = require("child_process");
const pexec = util_1.promisify(child_process_1.exec);
const readline_1 = require("readline");
const chalk_1 = __importDefault(require("../node_modules/chalk"));
class Host {
    constructor() {
        if (Host.init)
            return;
        try {
            readline_1.emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.on('keypress', (str, key) => {
                if (key.ctrl && key.name === 'c') {
                    console.log(chalk_1.default `{red.bold exiting mid task}`);
                    process.exit();
                }
            });
        }
        catch (e) { }
        Host.init = true;
    }
    execSync(cmdline) {
        return Buffer.from(shelljs_1.exec(cmdline, { silent: true }).stdout);
    }
    exec(cmdline) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const output = shelljs_1.exec(cmdline, { async: false, silent: true });
                if (output.code !== 0) {
                    reject(output);
                }
                else {
                    resolve(output);
                }
            });
        });
    }
    writeJsonSync(filename, data) {
        fs_extra_1.default.outputJsonSync(filename, data);
    }
    readJsonSync(filename) {
        if (Host.jsonCache.has(filename)) {
            return Host.jsonCache.get(filename);
        }
        const file = fs_extra_1.default.readJsonSync(filename);
        Host.jsonCache.set(filename, file);
        return file;
    }
    existsSync(fileorfolder) {
        return fs_extra_1.default.existsSync(fileorfolder);
    }
    readdirSync(dir) {
        return fs_extra_1.default.readdirSync(dir);
    }
    statSync(fileorfolder) {
        if (Host.statCache.has(fileorfolder)) {
            return Host.statCache.get(fileorfolder);
        }
        const stat = fs_extra_1.default.statSync(fileorfolder);
        Host.statCache.set(fileorfolder, stat);
        return stat;
    }
    readFileSync(file, options) {
        return fs_extra_1.default.readFileSync(file, options);
    }
    writeFileSync(file, content, options) {
        fs_extra_1.default.outputFileSync(file, content, options);
    }
    mkdirSync(dirname) {
        fs_extra_1.default.mkdirSync(dirname);
    }
    static handleKeyPress(resolve, reject) {
        return (str, key) => {
            if (key.ctrl && key.name === 'c') {
                console.log(chalk_1.default `{red.bold exiting mid task}`);
                process.exit();
            }
            else {
                try {
                    resolve(key);
                }
                catch (e) {
                    reject();
                }
            }
        };
    }
    getKey() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                process.stdin.once('keypress', Host.handleKeyPress(resolve, reject));
            });
        });
    }
}
exports.Host = Host;
Host.statCache = new Map();
Host.jsonCache = new Map();
Host.init = false;
