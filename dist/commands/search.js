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
Object.defineProperty(exports, "__esModule", { value: true });
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
            logger.log(chalk_1.default `{bgGreen.white search} ${argsraw.substr(7)}`);
            const items = wim.search(result);
            items.forEach(stage => {
                logger.log(chalk_1.default `{bgBlue.yellow ${stage.stage}}`);
                if (stage.items.length > 0) {
                    stage.items.forEach(item => {
                        logger.log(chalk_1.default `{white.bold #${item.id}} ${item.description} ` +
                            item.tags.map(tag => chalk_1.default `{yellow ${tag}}`).join(" "));
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
        const search = token("search", /search|find|\?/);
        const operator = rule(either(rule(token("and", /and|\&/)).yields(_ => (l, r) => item => l(item) && r(item)), rule(token("or", /or|\|/)).yields(_ => (l, r) => item => l(item) || r(item))));
        const term = rule(either(rule(token("tag", /\#[\w_-]+/i)).yields(x => item => item.tags && item.tags.find(tag => tag === x.one("tag"))), rule(token("word", /[\w_-]+/i)).yields(x => item => item.description && item.description.indexOf(x.one("word")) >= 0)));
        const query = rule(either(rule(term, command_1.Command.ws, operator, command_1.Command.ws, () => query).yields((t, c) => {
            const [l, o, r] = flat(c);
            const f = o(l, r);
            //f.toString = () => o + "(" + l + ", " + r + ")"
            return f;
        }), rule(term, command_1.Command.ws, () => query).yields((t, c) => {
            const [l, r] = flat(c);
            return item => l(item) && r(item);
        }), rule(term)));
        let result = false;
        parse(argsraw)(rule(search, command_1.Command.ws, query, command_1.Command.EOL).yields((r, c) => {
            result = flat(c).filter(x => x)[0];
        }));
        return result;
    }
}
exports.Search = Search;
command_1.Command.register(Search, "searchs a workitem", [
    { example: 'search <item> "new name"', info: "searchs an item", options: [{
                label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
            }] }
]);
