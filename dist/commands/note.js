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
const chalk_1 = __importDefault(require("../../node_modules/chalk"));
class Note extends command_1.Command {
    run(argsraw, logger) {
        const result = this.parse(argsraw);
        const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
        if (result === false) {
            logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white add} could not proceed`);
        }
        wim.comment(result.item, result.comment);
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const move = token("note", "note");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i);
        let result = false;
        parse(argsraw)(rule(move, command_1.Command.ws, item, command_1.Command.ws, command_1.Command.msg).yields((r, c) => {
            result = {
                item: r.one("item"),
                comment: r.one("msg"),
            };
        }));
        return result;
    }
}
exports.Note = Note;
command_1.Command.register(Note, "adds commentary to a work item");
