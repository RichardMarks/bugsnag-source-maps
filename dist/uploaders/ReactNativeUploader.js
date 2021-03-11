"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.fetchAndUploadOne = exports.uploadOne = void 0;
const path_1 = __importDefault(require("path"));
const querystring_1 = __importDefault(require("querystring"));
const Logger_1 = require("../Logger");
const File_1 = __importDefault(require("../File"));
const Request_1 = __importStar(require("../Request"));
const FormatErrorLog_1 = __importDefault(require("./lib/FormatErrorLog"));
const ApplyTransformations_1 = __importDefault(require("./lib/ApplyTransformations"));
const ReadBundleContent_1 = __importDefault(require("./lib/ReadBundleContent"));
const ReadSourceMap_1 = __importDefault(require("./lib/ReadSourceMap"));
const ParseSourceMap_1 = __importDefault(require("./lib/ParseSourceMap"));
const NetworkError_1 = require("../NetworkError");
const EndpointUrl_1 = require("./lib/EndpointUrl");
const UPLOAD_PATH = '/react-native-source-map';
function uploadOne({ apiKey, sourceMap, bundle, platform, dev = false, appVersion, codeBundleId, appVersionCode, appBundleVersion, overwrite = true, projectRoot = process.cwd(), endpoint = EndpointUrl_1.DEFAULT_UPLOAD_ORIGIN, requestOpts = {}, logger = Logger_1.noopLogger }) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Preparing upload of React Native source map (${dev ? 'dev' : 'release'} / ${platform})`);
        let url;
        try {
            url = EndpointUrl_1.buildEndpointUrl(endpoint, UPLOAD_PATH);
        }
        catch (e) {
            logger.error(e);
            throw e;
        }
        const [sourceMapContent, fullSourceMapPath] = yield ReadSourceMap_1.default(sourceMap, projectRoot, logger);
        const [bundleContent, fullBundlePath] = yield ReadBundleContent_1.default(bundle, projectRoot, sourceMap, logger);
        const sourceMapJson = ParseSourceMap_1.default(sourceMapContent, sourceMap, logger);
        const transformedSourceMap = yield ApplyTransformations_1.default(fullSourceMapPath, sourceMapJson, projectRoot, logger);
        const marshalledVersions = marshallVersionOptions({ appVersion, codeBundleId, appBundleVersion, appVersionCode }, platform);
        logger.debug(`Initiating upload to "${url}"`);
        const start = new Date().getTime();
        try {
            yield Request_1.default(url, Object.assign(Object.assign({ type: 1 /* ReactNative */, apiKey, sourceMap: new File_1.default(fullSourceMapPath, JSON.stringify(transformedSourceMap)), bundle: new File_1.default(fullBundlePath, bundleContent), platform,
                dev }, marshalledVersions), { overwrite }), requestOpts);
            logger.success(`Success, uploaded ${sourceMap} and ${bundle} to ${url} in ${(new Date()).getTime() - start}ms`);
        }
        catch (e) {
            if (e.cause) {
                logger.error(FormatErrorLog_1.default(e, true), e, e.cause);
            }
            else {
                logger.error(FormatErrorLog_1.default(e, true), e);
            }
            throw e;
        }
    });
}
exports.uploadOne = uploadOne;
function fetchAndUploadOne({ apiKey, platform, dev = false, appVersion, codeBundleId, appVersionCode, appBundleVersion, overwrite = true, projectRoot = process.cwd(), endpoint = EndpointUrl_1.DEFAULT_UPLOAD_ORIGIN, requestOpts = {}, bundlerUrl = 'http://localhost:8081', bundlerEntryPoint = 'index.js', logger = Logger_1.noopLogger }) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`Fetching React Native source map (${dev ? 'dev' : 'release'} / ${platform})`);
        let url;
        try {
            url = EndpointUrl_1.buildEndpointUrl(endpoint, UPLOAD_PATH);
        }
        catch (e) {
            logger.error(e);
            throw e;
        }
        const queryString = querystring_1.default.stringify({ platform, dev });
        const entryPoint = bundlerEntryPoint.replace(/\.(js|bundle)$/, '');
        const sourceMapUrl = `${bundlerUrl}/${entryPoint}.js.map?${queryString}`;
        const bundleUrl = `${bundlerUrl}/${entryPoint}.bundle?${queryString}`;
        let sourceMap;
        let bundle;
        try {
            logger.debug(`Fetching source map from ${sourceMapUrl}`);
            sourceMap = yield Request_1.fetch(sourceMapUrl);
        }
        catch (e) {
            logger.error(formatFetchError(e, bundlerUrl, bundlerEntryPoint), e);
            throw e;
        }
        try {
            logger.debug(`Fetching bundle from ${bundleUrl}`);
            bundle = yield Request_1.fetch(bundleUrl);
        }
        catch (e) {
            logger.error(formatFetchError(e, bundlerUrl, bundlerEntryPoint), e);
            throw e;
        }
        const sourceMapPath = path_1.default.resolve(projectRoot, bundlerEntryPoint);
        const sourceMapJson = ParseSourceMap_1.default(sourceMap, sourceMapPath, logger);
        const transformedSourceMap = yield ApplyTransformations_1.default(sourceMapPath, sourceMapJson, projectRoot, logger);
        const marshalledVersions = marshallVersionOptions({ appVersion, codeBundleId, appBundleVersion, appVersionCode }, platform);
        logger.debug(`Initiating upload to "${url}"`);
        const start = new Date().getTime();
        try {
            yield Request_1.default(url, Object.assign(Object.assign({ type: 1 /* ReactNative */, apiKey, sourceMap: new File_1.default(sourceMapUrl, JSON.stringify(transformedSourceMap)), bundle: new File_1.default(bundleUrl, bundle), platform,
                dev }, marshalledVersions), { overwrite }), requestOpts);
            logger.success(`Success, uploaded ${entryPoint}.js.map to ${url} in ${(new Date()).getTime() - start}ms`);
        }
        catch (e) {
            if (e.cause) {
                logger.error(FormatErrorLog_1.default(e, true), e, e.cause);
            }
            else {
                logger.error(FormatErrorLog_1.default(e, true), e);
            }
            throw e;
        }
    });
}
exports.fetchAndUploadOne = fetchAndUploadOne;
function marshallVersionOptions({ appVersion, codeBundleId, appVersionCode, appBundleVersion }, platform) {
    if (codeBundleId)
        return { codeBundleId };
    switch (platform) {
        case 'android':
            return { appVersion, appVersionCode };
        case 'ios':
            return { appVersion, appBundleVersion };
        default:
            return { appVersion };
    }
}
function formatFetchError(err, url, entryPoint) {
    if (!(err instanceof NetworkError_1.NetworkError)) {
        return `An unexpected error occurred during the request to ${url}.\n\n`;
    }
    switch (err.code) {
        case NetworkError_1.NetworkErrorCode.CONNECTION_REFUSED:
            return `Unable to connect to ${url}. Is the server running?\n\n`;
        case NetworkError_1.NetworkErrorCode.SERVER_ERROR:
            return `Received an error from the server at ${url}. Does the entry point file '${entryPoint}' exist?\n\n`;
        case NetworkError_1.NetworkErrorCode.TIMEOUT:
            return `The request to ${url} timed out.\n\n`;
        default:
            return `An unexpected error occurred during the request to ${url}.\n\n`;
    }
}
//# sourceMappingURL=ReactNativeUploader.js.map