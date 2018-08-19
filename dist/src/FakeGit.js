"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FakeGit {
    getCurrentBranch() {
        throw new Error("Method not implemented.");
    }
    raw(command) {
        return "";
    }
}
exports.FakeGit = FakeGit;
