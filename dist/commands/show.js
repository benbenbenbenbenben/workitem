"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token, all } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Show extends command_1.Command {
    run(argsraw, logger) {
        const result = this.parse(argsraw);
        const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
        if (result === false) {
            logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white show} could not proceed`);
        }
        else if (wim.isInitialised()) {
            logger.log(chalk_1.default `{bgGreen.white show}`);
            if (result.item) {
                const item = wim.idToWorkitem(result.item).value;
                if (item.type) {
                    logger.log(chalk_1.default `{bgBlue.white.bold ${item.stage} #${item.id}} {bgYellow.bold ${item.type}} ${item.description}`);
                }
                else {
                    logger.log(chalk_1.default `{bgBlue.white.bold ${item.stage} #${item.id}} ${item.description}`);
                }
                if (result.more) {
                    // load linked stuff
                }
                if (item.tags) {
                    logger.log();
                    const tags = item.tags.map((t) => chalk_1.default `{bgWhite.black ${t}}`).join(" ");
                    logger.log(tags);
                }
                let footer = [];
                if (item.parent) {
                    footer.push(chalk_1.default `child of: {bgBlue.white ${item.parent}}`);
                }
                if (item.child) {
                    footer.push(`parent of: ${item.child.map((c) => chalk_1.default `{bgBlue.white ${c}}`).join(" ")}`);
                }
                if (item.estimate) {
                    footer.push(`est: ${item.estimate}`);
                }
                if (footer.length) {
                    logger.log(footer.join("\n"));
                }
            }
            else {
                const logs = wim.show();
                const top = result.more ? 9999 : 3;
                logs.forEach((l, j) => {
                    logger.log(chalk_1.default `{bgBlue.yellow ${l.stage}}`);
                    l.items.slice(0, top).forEach((i, k) => {
                        logger.log(chalk_1.default `[${j.toString()}.${k.toString()}] {bold #${i.id}} {yellow ${i.description}}`);
                    });
                    let x = l.items.length - top;
                    if (x > 0)
                        logger.log(` +${x} more...`);
                });
            }
        }
        else {
            logger.fail(ErrorCodes_1.ErrorCodes.NotInitialised, chalk_1.default `this repo is not initialised`);
        }
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const show = token("show", "show");
        const more = token("more", "more");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{7}))/i);
        let result = false;
        parse(argsraw)(rule(optional(either(all(show, command_1.Command.ws, more), show, more)), optional(command_1.Command.ws, item), command_1.Command.EOL).yields((r, c) => {
            result = {
                show: true,
                more: r.one("more") === "more",
                item: r.one("item"),
            };
        }));
        return result;
    }
}
exports.Show = Show;
command_1.Command.register(Show, "(default) shows the current workitems");
