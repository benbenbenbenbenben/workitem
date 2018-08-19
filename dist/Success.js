"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Success {
    constructor(success, torerror) {
        this.success = success;
        if (typeof torerror === "string") {
            this.error = torerror;
        }
        else {
            this.value = torerror;
        }
    }
}
exports.Success = Success;
