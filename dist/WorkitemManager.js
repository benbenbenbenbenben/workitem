"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const Success_1 = require("./Success");
class WorkitemManager {
    constructor(git, fs) {
        this.git = git;
        this.fs = fs;
        try {
            this.config = fs.readJsonSync(".workitem/workitem.json");
        }
        catch (e) {
            this.config = undefined;
        }
    }
    isInitialised() {
        return this.config !== undefined;
    }
    gitDo(func) {
        this.fs.execSync(`git checkout -B __workitem__`);
        func();
        this.fs.execSync(`git checkout -`);
        this.fs.execSync(`git merge __workitem__`);
        this.fs.execSync(`git branch -D __workitem__`);
    }
    get workitems() {
        const dirs = this.config.directories;
        const tree = dirs.map((d) => {
            return {
                stage: d,
                items: this.fs.readdirSync(`.workitem/${d}`)
                    .filter(f => this.fs.statSync(`.workitem/${d}/${f}`).isDirectory())
                    .map(f => {
                    const res = this.fs.readJsonSync(`.workitem/${d}/${f}/index.json`);
                    res.id = f;
                    return res;
                }),
            };
        });
        return tree;
    }
    add(def) {
        const dir = (def.location || "+" + this.config.incoming).substring(1);
        delete def.location;
        if (!this.fs.existsSync(`.workitem/${dir}`)) {
            return null;
        }
        if (dir === ".secrets") {
            return null;
        }
        const hash = crypto_1.default.createHash("sha256");
        hash.update(JSON.stringify(def));
        hash.update(this.fs.execSync(`git rev-parse HEAD`).toString());
        const digest = hash.digest("hex").substring(0, 7);
        this.gitDo(() => {
            this.fs.outputJsonSync(`.workitem/${dir}/${digest}/index.json`, def);
            this.fs.execSync(`git add .workitem/${dir}/${digest}/index.json`);
            this.fs.execSync(`git commit -m "[workitem:${digest}:add] ${def.description}"`);
        });
        return digest;
    }
    show() {
        return this.workitems;
    }
    idToWorkitem(item) {
        const itemids = /^(\d+\.\d+)|(#?[a-f0-9]{7})$/i.exec(item);
        if (itemids === null) {
            return new Success_1.Success(false, `Didn't recognise workitem identity pattern "${item}"`);
        }
        const itemid = itemids[0].replace(/^#/, "");
        let workitem = null;
        if (itemid.indexOf(".") > 0) {
            const [istage, iitem] = itemid.split(".").map(x => parseInt(x));
            workitem = this.workitems[istage].items[iitem];
            workitem.stage = this.workitems[istage].stage;
        }
        else {
            workitem = this.workitems
                .map((s) => s.items.map((t) => Object.assign({ stage: s.stage }, t)))
                .reduce((a, b) => a.concat(b)).find((x) => x.id === itemid);
        }
        return new Success_1.Success(true, workitem);
    }
    getComments(item) {
        const workitem = this.idToWorkitem(item).value;
        const dir = `.workitem/${workitem.stage}/${workitem.id}`;
        const files = this.fs.readdirSync(dir);
        return files.map(f => this.fs.readJsonSync(`${dir}/${f}`)).filter(f => f.type === "comment");
    }
    move(item, stage) {
        const targetstage = this.workitems.filter((w) => w.stage === stage);
        if (targetstage.length === 0) {
            return { success: false, message: `No stage named ${stage}` };
        }
        const workitem = this.idToWorkitem(item);
        if (!workitem.success) {
            return workitem;
        }
        // tslint:disable-next-line:no-console
        console.log(workitem.value);
        if (workitem.value.stage === stage) {
            return new Success_1.Success(false, `Cannot move a workitem from ${stage} to ${stage} because it's the same stage`);
        }
        this.gitDo(() => {
            this.fs.execSync(`git mv .workitem/${workitem.value.stage}/${workitem.value.id} .workitem/${stage}/${workitem.value.id}`);
            this.fs.execSync(`git commit -m "[workitem:${workitem.value.id}:move] ${workitem.value.stage} to ${stage}"`);
        });
        return workitem;
    }
    rename(item, newname) {
        const workitem = this.idToWorkitem(item);
        if (!workitem.success) {
            return workitem;
        }
        workitem.value.description = newname;
        this.save(workitem.value);
        return new Success_1.Success(true, workitem.value);
    }
    comment(item, comment, who) {
        const workitem = this.idToWorkitem(item);
        if (!workitem.success) {
            return workitem;
        }
        this.appendItem(workitem.value, { type: "comment", content: comment, who });
    }
    save(workitem) {
        this.gitDo(() => {
            const filename = `.workitem/${workitem.stage}/${workitem.id}/index.json`;
            this.fs.writeJsonSync(filename, workitem);
            this.fs.execSync(`git add ${filename}`);
            this.fs.execSync(`git commit -m "[workitem:${workitem.id}:edit]"`);
        });
    }
    previewcollate(progress, done) {
        progress({
            total: 100,
            current: 0,
        });
        let branches = this.fs.execSync("git branch").toString().split(/\r\n|\r|\n/);
        let here = branches.find((b) => b.indexOf("*") === 0) || "";
        here = here.substring(2);
        branches = branches.filter((b) => b[0] === " ").map(b => b.replace(/^  /, ""));
        branches.forEach((branch, i) => {
            // add, del, ren: git diff --stat --diff-filter=ADR master..dcdcreadme .workitem
            // ^ we don't actually care about deletes in secondary branches
            // git checkout frombranch filetomove.ext
            // diff we don't know how to handle: git diff --stat --diff-filter=CMTUXB master..dcdcreadme .workitem
            /*
            added in secondary:  .workitem/doing/36ef7ea/index.json           | 1 +
            added in primary:    .workitem/doing/423a302/index.json           | 1 -
            relocated:           .workitem/{todo => doing}/4c4c9a7/index.json | 0
            */
            // tslint:disable-next-line:max-line-length
            this.fs.exec(`git diff --stat --name-only --diff-filter=A ${here}..${branch} .workitem`).then(result => {
                let added = result.stdout;
                this.fs.exec(`git diff --stat --diff-filter=R ${here}..${branch} .workitem`).then(result => {
                    let renamed = result.stdout;
                    let addedarr = [];
                    let renamedarr = [];
                    if (added)
                        addedarr = added.toString().split(/\r\n|\r|\n/).filter(x => x);
                    if (renamed)
                        renamedarr = renamed.toString().match(/^.*\{.*\}[^\|]*/gm).map(m => m.substring(1).replace(/.$/, ""));
                    progress({
                        total: branches.length - 1,
                        current: i
                    });
                    if (branches.length - 1 === i) {
                        done();
                    }
                });
            });
            // console.log(chalk`{bgYellow !} found ${added.length} files in {bgBlue.white ${branch}} that ${added.length == 1 ? "is" : "are"} missing in {bgRed.white ${here}}`)
            // console.log(added)
            // console.log(chalk`{bgYellow !} found ${renamed.length} files in {bgBlue.white ${branch}} that ${renamed.length == 1 ? "is" : "are"} moved in {bgRed.white ${here}}`)
            // console.log(renamed)
        });
    }
    appendItem(workitem, data) {
        // generate identity
        const hash = crypto_1.default.createHash("sha256");
        hash.update(JSON.stringify(data));
        hash.update(this.fs.execSync(`git rev-parse HEAD`).toString());
        const digest = hash.digest("hex").substring(0, 7);
        const stamp = this.timestamp();
        const outfilename = `${stamp}.${digest}.${data.type}.json`;
        this.gitDo(() => {
            const filename = `.workitem/${workitem.stage}/${workitem.id}/${outfilename}`;
            this.fs.writeJsonSync(filename, data);
            this.fs.execSync(`git add ${filename}`);
            this.fs.execSync(`git commit -m "[workitem:${workitem.id}:${data.type}]"`);
        });
    }
    timestamp() {
        return new Date().toISOString().replace(/[^0-9]/g, "");
    }
}
exports.WorkitemManager = WorkitemManager;
