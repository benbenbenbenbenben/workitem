"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
            this.log(chalk_1.default `\n{bgYellow warning} NotInitialised ${message}`);
            this.showHelp();
        }
        else {
            console.error(message);
        }
        process.exit(err);
    }
    showHelp() {
        this.log(`\n`);
        command_1.Command.printhelp(this);
        this.log();
        this.log(chalk_1.default `use {bgGreen help} [command] for specific help`);
        this.log();
    }
    constructor() { }
    explain(thisrule) {
        const asarr = thisrule;
        return asarr
            .map((p) => {
            if (p.__token__) {
                if (p.__token__ === p.toString()) {
                    return p.__token__;
                }
                else {
                    return `${p.__token__}:${p.toString()}`;
                }
            }
            else {
                if (p.pattern) {
                    switch (p.name) {
                        case 'many':
                            return `${this.explain(p.pattern)}*`;
                        case 'optional':
                            return `${this.explain(p.pattern)}?`;
                    }
                    return `${p.name}(${this.explain(p.pattern)})`;
                }
                else {
                    return null;
                }
            }
        })
            .filter((x) => x)
            .join(' ');
    }
    run(argsraw) {
        return __awaiter(this, void 0, void 0, function* () {
            process.stdout.write(chalk_1.default `{bgRed.white.bold workitem 2.0.0} `);
            const fs = new Host_1.Host();
            const git = new Git_1.Git(fs);
            const currentBranch = git.getCurrentBranch();
            if ((yield currentBranch) === '__workitem__') {
                // TODO: when this happens it's likely to be that git didn't successfully switch back to the previous branch
                this.fail(ErrorCodes_1.ErrorCodes.WorkitemBranchDetected, chalk_1.default `workitem is in an invalid state because a previous command did complete correctly. Run {green workitem fix} to diagnose and fix the problem.`);
            }
            const commands = [
                'init',
                'show',
                'add',
                'note',
                'rename',
                'move',
                'collate',
                'search',
                'tag'
            ];
            for (const command of commands) {
                yield Promise.resolve().then(() => __importStar(require(`./commands/${command}`)));
            }
            // short circuit for help
            if (/^(\-\-help|\-h|help|\/help|\/h)$/i.test(argsraw)) {
                this.showHelp();
                process.exit();
            }
            if (/^(\-\-help|\-h|help|\/help|\/h)\s+(\w+)$/i.test(argsraw)) {
                // this.log()
                this.log(chalk_1.default `{bgGreen help} {bold.hex('#cedaed') ${argsraw.split(' ')[1]}}`);
                this.log();
                command_1.Command.printhelp(this, argsraw.split(' ')[1]);
                process.exit();
            }
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
new CLI()
    .run(process.argv
    .slice(2)
    .map((s) => !s.includes(' ') ? s : ['"', s.replace(/\"/g, '\\"'), '"'].join(''))
    .join(' '))
    .then((x) => process.exit())
    .catch((x) => process.exit(ErrorCodes_1.ErrorCodes.UnknownError));
