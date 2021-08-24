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
exports.Search = void 0;
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, flat, token, all } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Search extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.parse(argsraw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white search} could not proceed`);
            }
            logger.log(chalk_1.default `{bgGreen.white search} ${argsraw.split(' ').slice(1).join(' ')}`);
            const items = wim.search(result);
            items.forEach((stage) => {
                logger.log(chalk_1.default `{bgBlueBright.yellowBright ${stage.stage}}`);
                if (stage.items.length > 0) {
                    stage.items.forEach((item) => {
                        logger.log(chalk_1.default `{white.bold #${item.id}} ${item.description} ` +
                            (item.tags
                                ? item.tags.map((tag) => chalk_1.default `{yellow ${tag}}`).join(' ')
                                : ''));
                    });
                }
                else {
                    logger.log(chalk_1.default `{grey <no results>}`);
                }
            });
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
        const search = token('search', /search|find|\?/);
        const operator = rule(either(rule(token('and', /and|\&/)).yields((_) => (l, r) => (item) => l(item) && r(item)), rule(token('or', /or|\|/)).yields((_) => (l, r) => (item) => l(item) || r(item))));
        const term = rule(either(rule(token('tag', /\#[\w_-]+/i)).yields((x) => (item) => item.tags && item.tags.find((tag) => { var _a; return tag === ((_a = x.one('tag')) === null || _a === void 0 ? void 0 : _a.value); })), rule(token('word', /[\w_-]+/i)).yields((x) => (item) => {
            var _a;
            return (item.description &&
                item.description.indexOf((_a = x.one('word')) === null || _a === void 0 ? void 0 : _a.value) >= 0) ||
                wim
                    .getComments(item.id)
                    .find((content) => { var _a; return content.content.indexOf((_a = x.one('word')) === null || _a === void 0 ? void 0 : _a.value) >= 0; });
        })));
        const query = rule(either(rule(term, command_1.Command.ws, operator, command_1.Command.ws, () => query).yields((t, c) => {
            const [l, o, r] = flat(c);
            const f = o(l, r);
            //f.toString = () => o + "(" + l + ", " + r + ")"
            return f;
        }), rule(term, command_1.Command.ws, () => query).yields((t, c) => {
            const [l, r] = flat(c);
            return (item) => l(item) && r(item);
        }), rule(term)));
        let result = false;
        parse(argsraw)(rule(search, command_1.Command.ws, query, command_1.Command.EOL).yields((r, c) => {
            result = flat(c).filter((x) => x)[0];
        }));
        return result;
    }
}
exports.Search = Search;
command_1.Command.register(Search, 'searches a workitem', [
    {
        example: 'search #bug [and] #defect [and] word',
        info: 'searches for items with tag #bug and #defect and containing "word"',
        options: [
            { label: 'tag', description: 'a tag to search for' },
            { label: 'word', description: 'a word to search for' },
            {
                label: 'and',
                description: 'forces left and right hand side to be found; e.g. search #bug [and] ui'
            },
            {
                label: 'or',
                description: 'allows either left or right to be found; e.g. search crash or freeze'
            }
        ]
    }
]);
