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
exports.Command = void 0;
const tibu_1 = require("tibu");
const chalk_1 = __importDefault(require("chalk"));
const { rule, token, either, all, many, optional } = tibu_1.Tibu;
class Command {
    constructor(git, fs) {
        this.git = git;
        this.fs = fs;
    }
    static register(c, help = '', explain = []) {
        if (Command.registry === undefined) {
            Command.registry = [];
        }
        if (Command.registry.find((x) => x.name === c.name) === undefined) {
            Command.registry.push({
                name: c.name,
                ctor: c,
                help,
                explain
            });
        }
    }
    static run(git, fs, logger, argsraw) {
        return __awaiter(this, void 0, void 0, function* () {
            let parseok = false;
            for (const reg of Command.registry) {
                const cmd = new reg.ctor(git, fs);
                if (cmd.parse(argsraw)) {
                    parseok = true;
                    yield cmd.run(argsraw, logger);
                    break;
                }
            }
            return parseok;
        });
    }
    static printhelp(logger, command) {
        if (command) {
            const cmd = Command.registry.find((c) => c.name.toLowerCase() === command.toLowerCase());
            if (cmd) {
                cmd.explain.forEach((example) => {
                    logger.log(chalk_1.default `{bgRgb(237, 237, 237).black example:} ${example.example}`);
                    logger.log(chalk_1.default `         ${example.info}`);
                    logger.log(chalk_1.default `{bgRgb(180, 180, 180).black options:} ${example.options
                        .map((o) => `${(o.label + '          ').substr(0, example.options
                        .map((o) => o.label.length + 1)
                        .reduce((a, b) => (a > b ? a : b)))}: ${o.description}`)
                        .join('\n         ')}`);
                });
            }
        }
        else {
            for (const reg of Command.registry) {
                logger.log(chalk_1.default `{bgGreen.white ${reg.name.toLowerCase()}}\t${reg.help}`);
            }
        }
    }
}
exports.Command = Command;
Command.ws = rule(/\s*/);
Command.msg = rule(either(rule("'", token('msg', /[^\']*/), "'"), rule('"', token('msg', /[^\"]*/), '"'), rule(token('msg', /[^\s\~\+\<\>\+\-\@\#][\w]*/))));
Command.EOL = (input) => input.location === input.source.length
    ? tibu_1.Result.pass(input)
    : tibu_1.Result.fault(input);
