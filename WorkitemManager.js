const fs = require('fs-extra')
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
                items: fs.readdirSync(__dirname + `/.workitem/${d}`).map(f => {
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

        execSync(`git checkout -B __workitem__`)
        fs.outputJsonSync(__dirname + `/.workitem/${dir}/${digest}/index.json`, description)
        execSync(`git add .workitem/${dir}/${digest}/index.json`)
        execSync(`git commit -m "[workitem:${digest}:add] ${description.description}"`)
        execSync(`git checkout -`)
        execSync(`git merge __workitem__`)
        return digest
    }
    show() {
        const workitems = this.workitems
        return workitems
    }
    move(item, stage) {
        let targetstage = this.workitems.filter(w => w.stage == stage)
        if (targetstage.length == 0) {
            return {success:false, message:`No stage named ${stage}`}
        }
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
        console.log(workitem)
        // git mv ./.workitem/doing/3c4a09c ./.workitem/todo/3c4a09c
       // console.log(chalk`{red ${JSON.stringify(workitem)}}`)
        return;
        execSync(`git checkout -B __workitem__`)
        execSync(`git mv .workitem/${workitem.stage}/${workitem.id} .workitem/${targetstage}/${workitem.id}`)
        execSync(`git commit -m "[workitem:${workitem.id}:move] ${workitem.stage} to ${targetstage}"`)
        execSync(`git checkout -`)
        execSync(`git merge __workitem__`)
    }
}

module.exports = {
    WorkitemManager
}