"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tibu_1 = require("tibu");
const { parse, rule, optional, many, either, token } = tibu_1.Tibu;
class Git {
    /**
     *
     */
    constructor(fs) {
        this.fs = fs;
    }
    git(raw) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.fs.exec(`git ${raw}`)
                .then(x => x.stdout);
        });
    }
    getCurrentBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            const gitout = yield this.git("branch");
            let branch = "";
            parse(gitout)(rule("* ", token("branch", /\w+/))
                .yields(r => {
                branch = r.one("branch");
            }));
            return branch;
        });
    }
    getUsername() {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.git("config user.name");
            return user.replace(/\r\n|\r|\n/g, "");
        });
    }
    getEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            let email = yield this.git("config user.name");
            return email.replace(/\r\n|\r|\n/g, "");
        });
    }
    getWho() {
        return __awaiter(this, void 0, void 0, function* () {
            return `${yield this.getUsername()} <${yield this.getEmail()}>`;
        });
    }
    isRepo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git("status")
                .then(x => true)
                .catch(x => false);
        });
    }
    isInit() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git("branch")
                .then(x => x.indexOf("*") >= 0)
                .catch(x => false);
        });
    }
    createRepo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.git("init")
                .then(x => this.fs.writeFileSync("workitem.md", "project initialised by workitem"))
                .then(x => this.git("add ."))
                .then(x => this.git(`commit -a -m "[workitem:createRepo]"`))
                .then(x => true)
                .catch(x => false);
        });
    }
}
exports.Git = Git;
