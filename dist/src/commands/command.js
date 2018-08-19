"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const chalk_1 = __importDefault(require("../../node_modules/chalk"));
const { rule, token, either, all, many, optional } = tibu_1.Tibu;
class Command {
    constructor(git, fs) {
        this.git = git;
        this.fs = fs;
    }
    static register(c, help = "") {
        if (Command.registry === undefined) {
            Command.registry = [];
        }
        if (Command.registry.find(x => x.name === c.name) === undefined) {
            Command.registry.push({
                name: c.name,
                ctor: c,
                help,
            });
        }
    }
    static run(git, fs, logger, argsraw) {
        return __awaiter(this, void 0, void 0, function* () {
            let parseok = false;
            for (let reg of Command.registry) {
                const cmd = new reg.ctor(git, fs);
                if (cmd.parse(argsraw)) {
                    parseok = true;
                    cmd.run(argsraw, logger);
                    break;
                }
            }
            return parseok;
        });
    }
    static printhelp(logger) {
        for (let reg of Command.registry) {
            logger.log(chalk_1.default `{bgGreen.white ${reg.name}} ${reg.help}`);
        }
    }
}
Command.ws = rule(/\s*/);
Command.msg = rule(either(rule("'", token("msg", /[^\']*/), "'"), rule('"', token("msg", /[^\"]*/), '"')));
Command.EOL = (input) => input.location === input.source.length
    ? tibu_1.Result.pass(input)
    : tibu_1.Result.fault(input);
exports.Command = Command;
