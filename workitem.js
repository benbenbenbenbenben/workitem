const fs = require('fs')
const crypto = require('crypto')
const hash = crypto.createHash('sha256')
const execSync = require('child_process').execSync

class WorkitemManager {
    constructor() {
        this._config = JSON.parse(fs.readFileSync(process.cwd() + '/.workitem/workitem.json', 'utf8').toString())
    }
    get config() {
        return this._config
    }
    add(description) {

        hash.update(description)
        hash.update(execSync(`git rev-parse HEAD`).toString())
        return hash.digest("base64").substring(0, 7)
    }
}

module.exports = {
    WorkitemManager
}