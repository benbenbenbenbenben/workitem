"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeGit {
    constructor(fs) {
        this.fs = fs;
    }
    getCurrentBranch() {
        throw new Error("Method not implemented.");
    }
    getUsername() {
        throw new Error("Method not implemented.");
    }
    getEmail() {
        throw new Error("Method not implemented.");
    }
    getWho() {
        throw new Error("Method not implemented.");
    }
    isRepo() {
        throw new Error("Method not implemented.");
    }
    isInit() {
        throw new Error("Method not implemented.");
    }
    createRepo() {
        throw new Error("Method not implemented.");
    }
}
exports.FakeGit = FakeGit;
