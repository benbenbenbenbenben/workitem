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
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Tag extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.parse(argsraw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white tag} could not proceed`);
            }
            const workitemsuccess = wim.idToWorkitem(result.item);
            if (!workitemsuccess.success) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownIdentifier, workitemsuccess.error);
            }
            const workitem = workitemsuccess.value;
            wim.tag(result.item, result.tag);
            logger.log(chalk_1.default `{bgGreen.white tag} #${workitem.id} ${workitem.description} {yellow added} {bgWhite.black ${result.tag}}`);
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const tag = token("tag", "tag");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i);
        const thetag = token("thetag", /#[\w_][\w_-]+/i);
        // const rm = token("rm", "rm")
        let result = false;
        parse(argsraw)(rule(tag, command_1.Command.ws, item, command_1.Command.ws, thetag, command_1.Command.EOL).yields((r, c) => {
            result = {
                item: r.one("item"),
                tag: r.one("thetag"),
            };
        }));
        return result;
    }
}
exports.Tag = Tag;
command_1.Command.register(Tag, "adds commentary to a work item", [
    { example: 'tag <item> "new tag"', info: "adds a new commentary tag to an item", options: [
            {
                label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
            }
        ] }
]);
