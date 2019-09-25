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
class Note extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.parse(argsraw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white note} could not proceed`);
            }
            const who = yield this.git.getWho();
            const workitem = yield wim.idToWorkitem(result.item);
            if (!workitem.success) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownIdentifier, workitem.error);
            }
            wim.comment(result.item, result.comment, who);
            logger.log(chalk_1.default `{bgGreen.white note}`);
            logger.log(chalk_1.default `{bgBlue.white.bold ${wim.workitemToStage(workitem.value.id)} #${workitem.value.id}} ${workitem.value.description}`);
            logger.log(chalk_1.default `{yellow added comment:} ${result.comment} {yellow ${who}}`);
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const move = token("note", "note");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i);
        let result = false;
        parse(argsraw)(rule(move, command_1.Command.ws, item, command_1.Command.ws, command_1.Command.msg, command_1.Command.EOL).yields((r, c) => {
            result = {
                item: r.one("item"),
                comment: r.one("msg"),
            };
        }));
        return result;
    }
}
exports.Note = Note;
command_1.Command.register(Note, "adds commentary to a work item", [
    { example: 'note <item> "new note"', info: "adds a new commentary note to an item", options: [
            {
                label: "item", description: "the item id or index, e.g; #f08472a or 1.1"
            }
        ] }
]);
