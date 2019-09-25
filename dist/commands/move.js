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
class Move extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.parse(argsraw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white move} could not proceed`);
            }
            const workitem = wim.idToWorkitem(result.item);
            if (!workitem.success) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownIdentifier, workitem.error);
            }
            const fromstage = wim.workitemToStage(workitem.value.id);
            const fullid = workitem.value.id;
            const moveresult = wim.move(result.item, result.stage, result.force);
            if (moveresult.success === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `${moveresult.error}`);
            }
            logger.log(chalk_1.default `{bgGreen.white move} moved {bold #${fullid}} from {bold ${fromstage}} to {bold ${result.stage}}`);
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const move = token("move", "move");
        const item = token("item", /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i);
        const stage = token("stage", /\w+/);
        const force = token("force", /\+force/);
        let result = false;
        parse(argsraw)(rule(move, command_1.Command.ws, item, command_1.Command.ws, optional(/to\s+/), stage, optional(/\s+/, force), command_1.Command.EOL).yields((r, c) => {
            result = {
                item: r.one("item"),
                stage: r.one("stage"),
                force: r.one("force") !== null
            };
        }));
        return result;
    }
}
exports.Move = Move;
command_1.Command.register(Move, "moves a workitem", [
    { example: 'move <item> [to] <stage> [+force]', info: "moves an item to another stage", options: [
            { label: "item", description: "the workitem id or index, e.g; #f08472a or 1.1" },
            { label: "stage", description: "the name of the stage to move the workitem to" },
            { label: "+force", description: "moves the workitem even when the move is not a valid transition" },
        ] }
]);
