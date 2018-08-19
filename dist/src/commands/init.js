"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const command_1 = require("./command");
class Init extends command_1.Command {
    run(argsraw, logger) {
        throw new Error("Method not implemented.");
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const init = token("init", "init");
        const auto = token("auto", /auto/);
        let result = false;
        parse(argsraw)(rule(init, optional(command_1.Command.ws, auto), command_1.Command.EOL).yields(r => {
            result = {
                init: true,
                auto: r.one("auto") === "auto"
            };
        }));
        return result;
    }
}
exports.Init = Init;
command_1.Command.register(Init);
