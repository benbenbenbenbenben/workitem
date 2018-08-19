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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// #!/usr/bin/env node
const chalk_1 = __importDefault(require("chalk"));
const command_1 = require("./commands/command");
const ErrorCodes_1 = require("./ErrorCodes");
const Host_1 = require("./Host");
const Git_1 = require("./Git");
class CLI {
    log(message = undefined) {
        if (message)
            console.log(message);
        else
            console.log();
    }
    fail(err, message) {
        if (err === ErrorCodes_1.ErrorCodes.NotInitialised) {
            this.log(chalk_1.default `{bgYellow warning} this directory is not initialised as a repo`);
            this.showHelp();
        }
        else {
            console.error(message);
        }
        process.exit(err);
    }
    showHelp() {
        this.log(`\ncommand usage:\n`);
        command_1.Command.printhelp(this);
        this.log();
    }
    constructor() {
        ;
    }
    run(argsraw) {
        return __awaiter(this, void 0, void 0, function* () {
            const fs = new Host_1.Host();
            const git = new Git_1.Git(fs);
            const commands = [
                "show",
                "init",
                "add",
                "note",
                "rename",
                "move",
                "collate"
            ];
            for (let command of commands) {
                yield Promise.resolve().then(() => __importStar(require(`./commands/${command}`)));
            }
            console.log(chalk_1.default `{bgRed.white.bold workitem 2.0.0}`);
            const parseok = yield command_1.Command.run(git, fs, this, argsraw);
            if (parseok === false) {
                if (argsraw.length) {
                    this.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, `Sorry, that command couldn't be understood`);
                }
                else {
                    this.showHelp();
                }
            }
        });
    }
}
new CLI().run(process.argv.slice(2).map(s => !s.includes(" ") ? s : ['"', s.replace(/\"/g, "\\\""), '"'].join("")).join(" "));