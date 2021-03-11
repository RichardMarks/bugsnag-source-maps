"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const StringifyFileAccessError_1 = __importDefault(require("./StringifyFileAccessError"));
function readSourceMap(sourceMapPath, basePath, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug(`Reading source map "${sourceMapPath}"`);
        const fullSourceMapPath = path_1.default.resolve(basePath, sourceMapPath);
        try {
            let content = yield fs_1.promises.readFile(fullSourceMapPath, 'utf-8');
            if (content.startsWith(')]}')) {
                content = content.slice(4);
            }
            return [content, fullSourceMapPath];
        }
        catch (e) {
            logger.error(`The source map "${sourceMapPath}" could not be found. ${StringifyFileAccessError_1.default(e)}\n\n  "${fullSourceMapPath}"`);
            throw e;
        }
    });
}
exports.default = readSourceMap;
//# sourceMappingURL=ReadSourceMap.js.map