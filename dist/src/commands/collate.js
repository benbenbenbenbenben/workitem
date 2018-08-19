"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const command_1 = require("./command");
class Collate extends command_1.Command {
    run(argsraw, logger) {
        throw new Error("Method not implemented.");
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const collate = token("collate", "collate");
        const auto = token("auto", "auto");
        let result = false;
        parse(argsraw)(rule(collate, optional(command_1.Command.ws, auto), command_1.Command.EOL).yields(r => {
            result = {
                collate: true,
                auto: r.one("auto") === "auto"
            };
        }));
    }
}
exports.Collate = Collate;
command_1.Command.register(Collate);
