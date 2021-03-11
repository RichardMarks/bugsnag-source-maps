"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NetworkError_1 = require("../../NetworkError");
function formatErrorLog(e, isReactNative) {
    let str = '';
    switch (e.code) {
        case NetworkError_1.NetworkErrorCode.EMPTY_FILE:
            str += 'The uploaded source map was empty.';
            break;
        case NetworkError_1.NetworkErrorCode.INVALID_API_KEY:
            str += 'The provided API key was invalid.';
            break;
        case NetworkError_1.NetworkErrorCode.MISC_BAD_REQUEST:
            str += 'The request was rejected by the server as invalid.';
            str += `\n\n  responseText = ${e.responseText}`;
            break;
        case NetworkError_1.NetworkErrorCode.DUPLICATE:
            str += !isReactNative
                ? 'A source map matching the same criteria has already been uploaded. If you want to replace it, use the "overwrite" flag.'
                : 'A source map matching the same criteria has already been uploaded. If you want to replace it, remove the "no-overwrite" flag.';
            break;
        case NetworkError_1.NetworkErrorCode.SERVER_ERROR:
            str += 'A server side error occurred while processing the upload.';
            str += `\n\n  responseText = ${e.responseText}`;
            break;
        case NetworkError_1.NetworkErrorCode.TIMEOUT:
            str += 'The request timed out.';
            break;
        default:
            str += 'An unexpected error occurred.';
    }
    str += `\n\n`;
    return str;
}
exports.default = formatErrorLog;
//# sourceMappingURL=FormatErrorLog.js.map