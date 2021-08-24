"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeGit = void 0;
class FakeGit {
    constructor(fs) {
        this.fs = fs;
    }
    setEmail(email) {
        throw new Error('Method not implemented.');
    }
    setUsername(username) {
        throw new Error('Method not implemented.');
    }
    init() {
        throw new Error('Method not implemented.');
    }
    add(pattern) {
        throw new Error('Method not implemented.');
    }
    commit(message) {
        throw new Error('Method not implemented.');
    }
    getCurrentBranch() {
        throw new Error('Method not implemented.');
    }
    getUsername() {
        throw new Error('Method not implemented.');
    }
    getEmail() {
        throw new Error('Method not implemented.');
    }
    getWho() {
        throw new Error('Method not implemented.');
    }
    isRepo() {
        throw new Error('Method not implemented.');
    }
    isInit() {
        throw new Error('Method not implemented.');
    }
    createRepo() {
        throw new Error('Method not implemented.');
    }
}
exports.FakeGit = FakeGit;
