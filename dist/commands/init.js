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
const command_1 = require("./command");
const chalk_1 = __importDefault(require("chalk"));
const ErrorCodes_1 = require("../ErrorCodes");
class Init extends command_1.Command {
    run(argsraw, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger = logger;
            const result = this.parse(argsraw);
            if (result.init) {
                const _ = (yield this.git.isRepo()) || (result.git && (yield this.gitInit(result.force)))
                    ? (yield this.git.isInit())
                        ? this.isinitialised()
                            ? logger.fail(-1, chalk_1.default `{bold Done! This directory is already a workitem repo!}`)
                            : this.hasworkitemdir()
                                ? logger.fail(-3, 'This workitem repository is broken. There is a directory structure but I cannot find the configuration file workitem.json')
                                : this.isgitclean()
                                    ? this.gotoworkitembranch() && (yield this.setupworkitem())
                                        ? logger.log(chalk_1.default `{bgBlue.white Done!}`)
                                        : this.revert()
                                    : logger.fail(-4, 'You have uncommited changes in this repository. Use \'git status\' to view these. Once resolved you can initialise this workitem repository.')
                        : logger.fail(ErrorCodes_1.ErrorCodes.NotInitialised, 'This directory is a git repository but there are no branches. Please perform an initial commit.')
                    : logger.fail(ErrorCodes_1.ErrorCodes.NotInitialised, 'This directory is not a git repository.\n        Please run the command again from a git repository or add +git to your command; i.e. workitem init +git [+force]');
            }
        });
    }
    gitInit(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const who = yield this.git.getWho().then(who => who).catch(error => false);
            if (who) {
                return this.git.init()
                    .then(x => this.fs.writeFileSync("workitem.md", "project initialised by workitem"))
                    .then(x => this.git.add("workitem.md"))
                    .then(x => this.git.commit("[workitem:createRepo]"));
            }
            else {
                if (force) {
                    return this.git.init()
                        .then(x => this.git.setUsername("workitem"))
                        .then(x => this.git.setEmail("workitem@example.com"))
                        .then(x => this.fs.writeFileSync("workitem.md", "project initialised by workitem"))
                        .then(x => this.git.add("workitem.md"))
                        .then(x => this.git.commit("[workitem:createRepo]"));
                    // TODO: add workitem to update auto username/email
                }
                else {
                    this.logger.fail(-100, chalk_1.default `workitem cannot initialize a git repository before a user.name and user.email are set. Alternatively, add +force to use a default user.name and user.email value; i.e. workitem init +git +force`);
                    return false;
                }
            }
        });
    }
    constructor(git, fs) {
        super(git, fs);
    }
    parse(argsraw) {
        const init = token("init", "init");
        const auto = token("auto", "auto");
        const git = token("git", "+git");
        const force = token("force", "+force");
        let result = false;
        parse(argsraw)(rule(init, optional(command_1.Command.ws, auto), optional(command_1.Command.ws, git), optional(command_1.Command.ws, force), command_1.Command.EOL).yields(r => {
            result = {
                init: true,
                auto: r.one("auto") === "auto",
                git: r.one("git") !== null,
                force: r.one("force") !== null
            };
        }));
        return result;
    }
    isinitialised() {
        return this.fs.existsSync('./.workitem/workitem.json');
    }
    hasworkitemdir() {
        return this.fs.existsSync('./.workitem');
    }
    isgitclean() {
        return this.fs.execSync("git status --porcelain").toString().length == 0;
    }
    gotoworkitembranch() {
        // branch to a randomised branch
        // const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.branch = `__workitem__`; // _init_${rand}`
        require('child_process').execSync(`git checkout -b ${this.branch}`).toString();
        //
        return true;
    }
    revert() {
        if (this.branch) {
            require('child_process').execSync(`git reset --hard`).toString();
            require('child_process').execSync(`git clean -fd`).toString();
            require('child_process').execSync(`git checkout -`).toString();
            require('child_process').execSync(`git branch -d ${this.branch}`).toString();
        }
        return true;
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            require('child_process').execSync(`git add --all`).toString();
            require('child_process').execSync(`git commit -m "[workitem:admin:initialised]"`).toString();
            require('child_process').execSync(`git checkout -`).toString();
            require('child_process').execSync(`git merge ${this.branch}`).toString();
            return true;
        });
    }
    createdirectories() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.fs.getKey();
            switch (key.sequence) {
                case "1":
                    this.logger.log('[1]: todo -> doing -> done');
                    this.fs.mkdirSync('./.workitem');
                    this.fs.mkdirSync('./.workitem/.secrets');
                    this.fs.mkdirSync('./.workitem/todo');
                    this.fs.mkdirSync('./.workitem/doing');
                    this.fs.mkdirSync('./.workitem/done');
                    this.fs.writeJsonSync("./.workitem/workitem.json", {
                        directories: ["todo", "doing", "done"],
                        incoming: "todo",
                        active: ["doing"],
                        completed: "done",
                        transitions: [
                            ["todo", "doing"],
                            ["doing", "done"]
                        ],
                        workbranch: this.branch
                    });
                    this.fs.writeJsonSync("./.workitem/todo/index.json", {});
                    this.fs.writeJsonSync("./.workitem/doing/index.json", {});
                    this.fs.writeJsonSync("./.workitem/done/index.json", {});
                    return true;
                case "2":
                    this.logger.log('[2]: backlog -> analysis -> dev -> test -> review -> done');
                    this.fs.mkdirSync('./.workitem');
                    this.fs.mkdirSync('./.workitem/.secrets');
                    this.fs.mkdirSync('./.workitem/backlog');
                    this.fs.mkdirSync('./.workitem/analysis');
                    this.fs.mkdirSync('./.workitem/dev');
                    this.fs.mkdirSync('./.workitem/test');
                    this.fs.mkdirSync('./.workitem/review');
                    this.fs.mkdirSync('./.workitem/done');
                    this.fs.writeJsonSync("./.workitem/workitem.json", {
                        directories: ["todo", "doing", "done"],
                        incoming: "backlog",
                        active: ["analysis", "dev", "test", "review"],
                        completed: "done",
                        transitions: [
                            ["backlog", "analysis"],
                            ["analysis", "dev"],
                            ["dev", "test"],
                            ["test", "review"],
                            ["review", "done"]
                        ],
                        workbranch: this.branch
                    });
                    this.fs.writeJsonSync("./.workitem/backlog/index.json", {});
                    this.fs.writeJsonSync("./.workitem/analysis/index.json", {});
                    this.fs.writeJsonSync("./.workitem/dev/index.json", {});
                    this.fs.writeJsonSync("./.workitem/test/index.json", {});
                    this.fs.writeJsonSync("./.workitem/review/index.json", {});
                    this.fs.writeJsonSync("./.workitem/done/index.json", {});
                    return true;
                case "3":
                    this.logger.log("[3]: I'll create my own folders");
                    this.fs.mkdirSync('./.workitem');
                    this.fs.mkdirSync('./.workitem/.secrets');
                    this.fs.writeJsonSync("./.workitem/workitem.json", {
                        directories: ["todo", "doing", "done"],
                        incoming: "",
                        active: [],
                        completed: "",
                        transitions: [],
                        workbranch: this.branch
                    });
                    return true;
                default:
                    this.logger.log('Unknown option');
                    return false;
            }
        });
    }
    updategitignore() {
        if (this.fs.existsSync('.gitignore')) {
            let ignore = this.fs.readFileSync('.gitignore', 'utf8').toString();
            if (!/^\.workitem\/\.secrets/mi.test(ignore)) {
                const eolmatch = ignore.match(/\r\n|\r|\n/);
                if (eolmatch) {
                    ignore += `${eolmatch[0]} # workitem secrets path${eolmatch[0]}.workitem/.secrets`;
                }
                else {
                    ignore += '\r\n # workitem secrets path\r\n.workitem/.secrets';
                }
                this.fs.writeFileSync('.gitignore', ignore, 'utf8');
            }
        }
        else {
            this.fs.writeFileSync('.gitignore', '# workitem secrets path\r\n.workitem/.secrets', 'utf8');
        }
        return true;
    }
    configurehook() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.fs.getKey();
            switch (key.sequence.toLowerCase()) {
                case "y":
                    // detect existing hooks
                    // 1. if existing pre-commit hook, create pre-commit dir and move pre-commit hook there, renaming to pre-commit.0
                    // 2. create a file pre-commit that calls all files (execs) in the pre-commit subdirectory that match pattern pre-commit.\d+
                    // 3. commit changes and checkout last branch
                    return true;
                case "n":
                    // TODO: done, commit changes and checkout last branch
                    return true;
                case 'w':
                    this.logger.log(chalk_1.default `{bgBlue.white About the Commit Hook}\nThe commit hook makes sure that git commit messages reference a workitem.\n\nFor example: git commit -a -m "[workitem:2992:close] fixed pesky bug"\n\nIf you try to commit without a workitem reference like this one, workitem will prevent the commit from succeeding.`);
                    return false;
                default:
                    return false;
            }
        });
    }
    setupworkitem() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log("Which workflow would you like?\n" +
                "[1]: todo -> doing -> done\n" +
                "[2]: backlog -> analysis -> dev -> test -> review -> done\n" +
                "[3]: I'll create my own folders");
            while (!(yield this.createdirectories())) { }
            while (!this.updategitignore) { }
            this.logger.log("Would you like to install a git commit hook for workitem?\n" +
                "[Y]es, let's do that\n" +
                "[N]o\n" +
                "[W]hat does the hook do?");
            while (!(yield this.configurehook())) { }
            yield this.commit().catch(err => {
                this.revert();
            });
            return true;
        });
    }
}
exports.Init = Init;
command_1.Command.register(Init, "initialises a workitem repo in the current git repo", [
    { example: 'init [auto] [+git]', info: "intialises a workitem repository in the current directory", options: [
            { label: "auto", description: "doesn't prompt for user interaction and assumes default options" },
            { label: "+git", description: "initialises a git repository if the directory is not already a git repository" },
        ] }
]);
