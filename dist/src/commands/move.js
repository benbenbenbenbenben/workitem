"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const command_1 = require("./command");
class Move extends command_1.Command {
    run(argsraw, logger) {
        throw new Error("Method not implemented.");
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const move = token("move", "move");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i);
        const stage = token("stage", /\w+/);
        let result = false;
        parse(argsraw)(rule(move, command_1.Command.ws, item, command_1.Command.ws, optional(/to\s+/), stage).yields((r, c) => {
            result = {
                item: r.one("item"),
                stage: r.one("stage"),
            };
        }));
        return result;
    }
}
exports.Move = Move;
command_1.Command.register(Move);
