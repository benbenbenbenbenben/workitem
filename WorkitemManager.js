const fs = require('fs-extra')
const crypto = require('crypto')
const execSync = require('child_process').execSync

class WorkitemManager {
    constructor() {
        this._config = JSON.parse(fs.readFileSync(process.cwd() + '/.workitem/workitem.json', 'utf8').toString())
    }
    get config() {
        return this._config
    }
    add(description) {
        console.log(description)
        const hash = crypto.createHash('sha256')
        hash.update(JSON.stringify(description))
        hash.update(execSync(`git rev-parse HEAD`).toString())
        const digest = hash.digest("hex").substring(0, 7)

        execSync(`git checkout -B __workitem__`)
        fs.outputJsonSync(__dirname + `/.workitem/${digest}/index.json`, description)
        execSync(`git add .workitem/${digest}/index.json`)
        execSync(`git commit -m "[workitem:${digest}:add] ${description.description}"`)
        execSync(`git checkout -`)
        execSync(`git merge __workitem__`)
        return digest
    }
}

module.exports = {
    WorkitemManager
}