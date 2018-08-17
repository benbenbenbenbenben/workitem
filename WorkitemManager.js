const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const crypto = require('crypto')
const execSync = require('child_process').execSync

class WorkitemManager {
    constructor() {
        this._config = JSON.parse(fs.readFileSync('.workitem/workitem.json', 'utf8').toString())
    }
    get workitems() {
        const dirs = this.config.directories
        const tree = dirs.map(d => {
            return {
                stage: d,
                items: fs.readdirSync(`.workitem/${d}`)
                    .filter(f => fs.statSync(`.workitem/${d}/${f}`).isDirectory())
                    .map(f => {
                        let res = fs.readJsonSync(`.workitem/${d}/${f}/index.json`)
                        res.id = f
                        return res
                })
            }
        })
        return tree
    }
    get config() {
        return this._config
    }
    gitDo(func) {        
        execSync(`git checkout -B __workitem__`)
        func()        
        execSync(`git checkout -`)
        execSync(`git merge __workitem__`)
        execSync(`git branch -D __workitem__`)
    }
    add(description) {
        const dir = (description.location || "+" + this.config.incoming).substring(1)
        delete description.location
        if (!fs.existsSync(`.workitem/${dir}`)) {
            return null
        }
        if (dir == ".secrets") {
            return null
        }
        const hash = crypto.createHash('sha256')
        hash.update(JSON.stringify(description))
        hash.update(execSync(`git rev-parse HEAD`).toString())
        const digest = hash.digest("hex").substring(0, 7)

        this.gitDo(() => {
            fs.outputJsonSync(`.workitem/${dir}/${digest}/index.json`, description)
            execSync(`git add .workitem/${dir}/${digest}/index.json`)
            execSync(`git commit -m "[workitem:${digest}:add] ${description.description}"`)
        })
        return digest
    }
    show() {
        const workitems = this.workitems
        return workitems
    }
    idToWorkitem(item) {        
        let itemid = /^(\d+\.\d+)|((?<=#)?[a-f0-9]{7})$/i.exec(item)
        if (itemid === null) {
            return {success:false, message:`Didn't recognise workitem identity pattern "${item}"`}
        }
        itemid = itemid[0]
        let workitem = null
        if (itemid.indexOf(".") > 0) {
            let [istage, iitem] = itemid.split('.')            
            workitem = this.workitems[istage].items[iitem]
            workitem.stage = this.workitems[istage].stage
        } else {
            workitem = this.workitems.map(s => s.items.map(t => Object.assign({stage: s.stage}, t))).reduce((a, b) => a.concat(b)).find(x => x.id == itemid)
        }
        return {success: true, workitem}
    }
    move(item, stage) {
        let targetstage = this.workitems.filter(w => w.stage == stage)
        if (targetstage.length == 0) {
            return {success:false, message:`No stage named ${stage}`}
        }
        let workitem = this.idToWorkitem(item)
        if (workitem.success) {
            workitem = workitem.workitem
        } else {
            return workitem
        }
        console.log(workitem)
        if (workitem.stage == stage) {
            return {success:false, message:`Cannot move a workitem from ${stage} to ${stage} because it's the same stage`}
        }
        this.gitDo(() => {
            execSync(`git mv .workitem/${workitem.stage}/${workitem.id} .workitem/${stage}/${workitem.id}`)
            execSync(`git commit -m "[workitem:${workitem.id}:move] ${workitem.stage} to ${stage}"`)
        })
        return workitem
    }
    rename(item, newname) {
        let workitem = this.idToWorkitem(item)
        if (workitem.success) {
            workitem = workitem.workitem
        } else {
            return workitem
        }
        workitem.description = newname
        this.save(workitem)
    }
    comment(item, comment) {
        let workitem = this.idToWorkitem(item)
        if (workitem.success) {
            workitem = workitem.workitem
        } else {
            return workitem
        }
        this.appendItem(workitem, {type:"comment", content: comment})
    }
    save(workitem) {
        this.gitDo(() => {
            const filename = `.workitem/${workitem.stage}/${workitem.id}/index.json`
            fs.writeJSONSync(filename, workitem)
            execSync(`git add ${filename}`)
            execSync(`git commit -m "[workitem:${workitem.id}:edit]"`)
        })
    }
    previewcollate() {
        let branches = execSync('git branch').toString().split(/\r\n|\r|\n/)
        let here = branches.find(b => b.indexOf("*") == 0).substring(2)
        branches = branches.filter(b => b[0] == " ").map(b => b.replace(/^  /, ""))
        branches.forEach(branch => {
            // add, del, ren: git diff --stat --diff-filter=ADR master..dcdcreadme .workitem
            // ^ we don't actually care about deletes in secondary branches
            // git checkout frombranch filetomove.ext

            // diff we don't know how to handle: git diff --stat --diff-filter=CMTUXB master..dcdcreadme .workitem
            /*
            added in secondary:  .workitem/doing/36ef7ea/index.json           | 1 +
            added in primary:    .workitem/doing/423a302/index.json           | 1 -
            relocated:           .workitem/{todo => doing}/4c4c9a7/index.json | 0
            */
            let added = execSync(`git diff --stat --name-only --diff-filter=A ${here}..${branch} .workitem`).toString()
            let renamed = execSync(`git diff --stat --diff-filter=R ${here}..${branch} .workitem`).toString()
            if (added) {
                added = added.split(/\r\n|\r|\n/).filter(x => x)
                console.log(chalk`{bgYellow !} found ${added.length} files in {bgBlue.white ${branch}} that ${added.length == 1 ? "is" : "are"} missing in {bgRed.white ${here}}`)
                console.log(added)
            }
            if (renamed) {
                renamed = renamed.match(/^.*\{.*\}[^\|]*/gm).map(m => m.substring(1).replace(/.$/,""))
                console.log(chalk`{bgYellow !} found ${renamed.length} files in {bgBlue.white ${branch}} that ${renamed.length == 1 ? "is" : "are"} moved in {bgRed.white ${here}}`)
                console.log(renamed)
            }
        })
        return {
            here,
            branches
        }
    }
    appendItem(workitem, data) {
        // generate identity
        const hash = crypto.createHash('sha256')
        hash.update(JSON.stringify(data))
        hash.update(execSync(`git rev-parse HEAD`).toString())
        const digest = hash.digest("hex").substring(0, 7)
        const stamp = this.timestamp()
        const outfilename = `${stamp}.${digest}.${data.type}.json`
        this.gitDo(() => {
            const filename = `.workitem/${workitem.stage}/${workitem.id}/${outfilename}`
            fs.writeJSONSync(filename, data)
            execSync(`git add ${filename}`)
            execSync(`git commit -m "[workitem:${workitem.id}:${data.type}]"`)
        })
    }
    timestamp() {
        return new Date().toISOString().replace(/[^0-9]/g,"")
    }
}

module.exports = {
    WorkitemManager
}