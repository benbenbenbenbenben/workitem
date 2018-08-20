"use strict";
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
        return this.fs.execSync("git " + raw).toString();
    }
    getCurrentBranch() {
        const gitout = this.git("branch");
        let branch = "";
        parse(gitout)(rule("* ", token("branch", /\w+/))
            .yields(r => {
            branch = r.one("branch");
        }));
        return branch;
    }
    getUsername() {
        return this.git("config user.name");
    }
    getEmail() {
        return this.git("config user.email");
    }
    getWho() {
        return `${this.getUsername()} <${this.getEmail()}>`;
    }
}
exports.Git = Git;
