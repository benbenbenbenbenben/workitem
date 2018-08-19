"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Add extends command_1.Command {
    run(argsraw, logger) {
        const result = this.parse(argsraw);
        const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
        if (result === false) {
            logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white add} could not proceed`);
        }
        wim.add(result);
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const add = token("add", /^add/i);
        const type = token("type", /\w+/);
        const xats = rule(command_1.Command.ws, token("xats", /\@\w+/));
        const xtags = rule(command_1.Command.ws, token("xtags", /\#\w+/));
        const xest = rule(command_1.Command.ws, token("xest", /\~\w+/));
        const xplus = token("xplus", /\+\w+/);
        const xmin = token("xmin", /\-\w+/);
        const xbigger = rule(command_1.Command.ws, token("xbigger", /\>\w+/));
        const xsmaller = rule(command_1.Command.ws, token("xsmaller", /\<\w+/));
        let result = false;
        parse(argsraw)(rule(either(rule(add, command_1.Command.ws, optional(type, command_1.Command.ws), command_1.Command.msg, many(xtags), optional(xats), optional(xest), optional(either(xbigger, xsmaller)), command_1.Command.EOL).yields((r, c) => {
            result = {
                description: r.one("msg"),
                tags: r.get("xtags"),
                type: r.one("type"),
                location: r.one("xats"),
                estimate: r.one("xest"),
                child: r.one("xsmaller"),
                parent: r.one("xbigger"),
            };
        }), rule(add).yields(() => {
            result = true;
        }))));
        return result;
    }
}
exports.Add = Add;
command_1.Command.register(Add);
