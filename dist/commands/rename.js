"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const command_1 = require("./command");
class Rename extends command_1.Command {
    run(argsraw, logger) {
        throw new Error("Method not implemented.");
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const rename = token("rename", "rename");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i);
        let result = false;
        parse(argsraw)(rule(rename, command_1.Command.ws, item, command_1.Command.ws, command_1.Command.msg).yields((r, c) => {
            result = {
                item: r.one("item"),
                newname: r.one("msg"),
            };
        }));
        return result;
    }
}
exports.Rename = Rename;
command_1.Command.register(Rename, "renames a workitem");
