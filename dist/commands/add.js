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
exports.Add = void 0;
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token, all } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Add extends command_1.Command {
    run(argsRaw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.parse(argsRaw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white add} could not proceed`);
            }
            if (result === true) {
                logger.fail(ErrorCodes_1.ErrorCodes.NotImplemented, chalk_1.default `wizard not implemented`);
            }
            const id = wim.add(result);
            logger.log(chalk_1.default `{bgGreen.white add} added {bold #${id}} ${result.description}`);
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsRaw) {
        const add = token('add', /^add/i);
        const type = token('type', /\w+/);
        const xats = rule(command_1.Command.ws, token('xats', /\@\w+/));
        const xtags = rule(command_1.Command.ws, token('xtags', /\#\w+/));
        const xest = rule(command_1.Command.ws, token('xest', /\~\w+/));
        const xplus = token('xplus', /\+\w+/);
        const xmin = token('xmin', /\-\w+/);
        const xbigger = rule(command_1.Command.ws, /\>\s*/, token('xbigger', /w+/));
        const xsmaller = rule(command_1.Command.ws, /\<\s*/, token('xsmaller', /\w+/));
        let result = false;
        parse(argsRaw)(rule(either(rule(add, command_1.Command.ws, either(all(type, command_1.Command.ws, command_1.Command.msg), command_1.Command.msg), many(xtags), optional(xats), optional(xest), optional(either(xbigger, xsmaller)), command_1.Command.EOL).yields((r, c) => {
            result = {
                description: r.one('msg'),
                tags: r.get('xtags'),
                type: r.one('type'),
                location: r.one('xats'),
                estimate: r.one('xest'),
                child: r.one('xbigger'),
                parent: r.one('xsmaller')
            };
        }), rule(add, command_1.Command.EOL).yields(() => {
            result = true;
        }))));
        return result;
    }
}
exports.Add = Add;
command_1.Command.register(Add, 'adds a workitem', [
    {
        example: 'add [type] "description of item" [#tag, ...] [@location] [~estimate] [> child] [< parent]',
        info: 'intialises a workitem repository in the current directory',
        options: [
            {
                label: 'type',
                description: 'specifies an arbitrary workitem type e.g; task, story, defect'
            },
            { label: '#tag', description: 'adds a tag' },
            {
                label: '@location',
                description: 'specifies the workitem will start in the specified non-default stage e.g; @doing'
            },
            {
                label: '~estimate',
                description: 'specifies an arbitrary estimate for the workitem e.g; 10, 5pts, 2hrs, xxl'
            },
            {
                label: '> child',
                description: 'specifies a child workitem where child is a workitem index or id'
            },
            {
                label: '< parent',
                description: 'specifies a parent workitem where parent is a workitem index or id'
            }
        ]
    }
]);
