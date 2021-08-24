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
exports.Rename = void 0;
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
const WorkitemManager_1 = require("../WorkitemManager");
const command_1 = require("./command");
const ErrorCodes_1 = require("../ErrorCodes");
const chalk_1 = __importDefault(require("chalk"));
class Rename extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.parse(argsraw);
            const wim = new WorkitemManager_1.WorkitemManager(this.git, this.fs);
            if (result === false) {
                logger.fail(ErrorCodes_1.ErrorCodes.UnknownCommand, chalk_1.default `{bgGreen.white add} could not proceed`);
            }
            wim.rename(result.item, result.newname);
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const rename = token('rename', 'rename');
        const item = token('item', /((\d+\.)+(\d+))|(\#?([a-f0-9]{3,7}))/i);
        let result = false;
        parse(argsraw)(rule(rename, command_1.Command.ws, item, command_1.Command.ws, command_1.Command.msg, command_1.Command.EOL).yields((r, c) => {
            result = {
                item: r.one('item'),
                newname: r.one('msg')
            };
        }));
        return result;
    }
}
exports.Rename = Rename;
command_1.Command.register(Rename, 'renames a workitem', [
    {
        example: 'rename <item> "new name"',
        info: 'renames an item',
        options: [
            {
                label: 'item',
                description: 'the item id or index, e.g; #f08472a or 1.1'
            }
        ]
    }
]);
