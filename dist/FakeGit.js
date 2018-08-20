"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeGit {
    getUsername() {
        throw new Error("Method not implemented.");
    }
    getEmail() {
        throw new Error("Method not implemented.");
    }
    getWho() {
        throw new Error("Method not implemented.");
    }
    getCurrentBranch() {
        throw new Error("Method not implemented.");
    }
    raw(command) {
        return "";
    }
}
exports.FakeGit = FakeGit;
