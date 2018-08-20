"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const command_1 = require("./command");
class Collate extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
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
command_1.Command.register(Collate, "collates workitems across local branches");
