"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const command_1 = require("./command");
class Note extends command_1.Command {
    run(argsraw, logger) {
        throw new Error("Method not implemented.");
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
