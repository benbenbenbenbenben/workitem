const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const crypto = require('crypto')
const execSync = require('child_process').execSync

class WorkitemManager {
    constructor() {
        this._config = JSON.parse(fs.readFileSync(process.cwd() + '/.workitem/workitem.json', 'utf8').toString())
    }
    get workitems() {
        const dirs = this.config.directories
        const tree = dirs.map(d => {
            return {
                stage: d,
                items: fs.readdirSync(__dirname + `/.workitem/${d}`)
                    .filter(f => fs.statSync(__dirname + `/.workitem/${d}/${f}`).isDirectory())
                    .map(f => {
                        let res = fs.readJsonSync(__dirname + `/.workitem/${d}/${f}/index.json`)
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
        if (!fs.existsSync(__dirname + `/.workitem/${dir}`)) {
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
            fs.outputJsonSync(__dirname + `/.workitem/${dir}/${digest}/index.json`, description)
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