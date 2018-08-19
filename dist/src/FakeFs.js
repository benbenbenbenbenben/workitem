"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeFs {
    execSync(cmdline) {
        throw new Error("Method not implemented.");
    }
    exec(cmdline, options, callback) {
        throw new Error("Method not implemented.");
    }
    outputJsonSync(filename, data) {
        throw new Error("Method not implemented.");
    }
    writeJsonSync(filename, data) {
        throw new Error("Method not implemented.");
    }
    readJsonSync(filename) {
        throw new Error("Method not implemented.");
    }
    existsSync(fileorfolder) {
        throw new Error("Method not implemented.");
    }
    readdirSync(dir) {
        throw new Error("Method not implemented.");
    }
    statSync(fileorfolder) {
        throw new Error("Method not implemented.");
    }
}
exports.FakeFs = FakeFs;
