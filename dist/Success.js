"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Success = void 0;
class Success {
    constructor(success, torerror) {
        this.success = success;
        if (typeof torerror === 'string') {
            this.error = torerror;
        }
        else {
            this.value = torerror;
        }
    }
}
exports.Success = Success;
