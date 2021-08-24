"use strict";
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
exports.Show = void 0;
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token, all } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Show extends command_1.Command {
    run(argsRaw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            debugger;
            const result = this.parse(argsRaw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white show} could not proceed`);
            }
            else if (wim.isInitialised()) {
                logger.log(chalk_1.default `{bgGreen.white show}`);
                if (result.item) {
                    const itemSuccess = wim.idToWorkitem(result.item);
                    if (!itemSuccess.success) {
                        logger.fail(ErrorCodes_1.ErrorCodes.UnknownIdentifier, itemSuccess.error);
                    }
                    const item = itemSuccess.value;
                    if (item.type) {
                        logger.log(chalk_1.default `{bgBlue.white.bold @${wim.workitemToStage(item.id)} #${item.id}} {bgYellow.bold ${item.type}} ${item.description}`);
                    }
                    else {
                        logger.log(chalk_1.default `{bgBlue.white.bold @${wim.workitemToStage(item.id)} #${item.id}} ${item.description}`);
                    }
                    if (result.more) {
                        // load linked stuff
                        const comments = wim.getComments(item.id);
                        if (comments.length) {
                            logger.log(chalk_1.default `{bgBlack.yellowBright comments:}`);
                            for (const comment of comments) {
                                logger.log(chalk_1.default `${comment.content} {yellowBright.italic ${comment.who}}`);
                            }
                        }
                    }
                    if (item.tags) {
                        logger.log();
                        const tags = item.tags
                            .map((t) => chalk_1.default `{bgWhite.black ${t}}`)
                            .join(' ');
                        logger.log(tags);
                    }
                    const footer = [];
                    if (item.parent) {
                        footer.push(chalk_1.default `child of: {bgBlue.white ${item.parent}}`);
                    }
                    if (item.child) {
                        footer.push(`parent of: ${item.child
                            .map((c) => chalk_1.default `{bgBlue.white ${c}}`)
                            .join(' ')}`);
                    }
                    if (item.estimate) {
                        footer.push(`est: ${item.estimate}`);
                    }
                    if (footer.length) {
                        logger.log(footer.join('\n'));
                    }
                }
                else {
                    const logs = wim.show();
                    const top = result.more || result.stage ? undefined : 3;
                    logs.forEach((l, j) => {
                        if ([null, undefined].includes(result.stage) || l.stage === result.stage) {
                            logger.log(chalk_1.default `{bgBlueBright.yellowBright ${l.stage}}`);
                            l.items.slice(0, top).forEach((i, k) => {
                                logger.log(chalk_1.default `[${j.toString()}.${k.toString()}] {bold #${i.id}} ${i.description}`);
                            });
                            if (top) {
                                const x = l.items.length - top;
                                if (x > 0)
                                    logger.log(` +${x} more...`);
                            }
                        }
                    });
                }
            }
            else {
                logger.fail(ErrorCodes_1.ErrorCodes.NotInitialised, chalk_1.default `This directory is not a .workitem repository. Run workitem init to create a repository here.`);
            }
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsRaw) {
        const show = token('show', 'show');
        const more = token('more', 'more');
        const item = token('item', /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i);
        const stage = token('stage', /[\w_-]+/);
        let result = false;
        parse(argsRaw)(rule(optional(either(all(show, command_1.Command.ws, more), all(optional(show, command_1.Command.ws), '@', stage), show, more)), optional(command_1.Command.ws, item), command_1.Command.EOL).yields((r, c) => {
            var _a, _b, _c;
            result = {
                show: true,
                more: ((_a = r.one('more')) === null || _a === void 0 ? void 0 : _a.value) === 'more',
                item: (_b = r.one('item')) === null || _b === void 0 ? void 0 : _b.value,
                stage: (_c = r.one('stage')) === null || _c === void 0 ? void 0 : _c.value
            };
        }));
        return result;
    }
}
exports.Show = Show;
command_1.Command.register(Show, '(default) shows the current workitems', [
    { example: 'show', info: 'show a truncated view of workitems', options: [] },
    { example: 'show more | more', info: 'shows all work items', options: [] },
    {
        example: 'show [more] <item>',
        info: 'shows an item in detail',
        options: [
            {
                label: 'more',
                description: 'includes more detail'
            },
            {
                label: 'item',
                description: 'the item id or index, e.g; #f08472a or 1.1'
            }
        ]
    }
]);
