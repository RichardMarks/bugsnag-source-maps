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
const command_line_args_1 = __importDefault(require("command-line-args"));
const command_line_usage_1 = __importDefault(require("command-line-usage"));
const Logger_1 = __importDefault(require("../Logger"));
const consola_1 = require("consola");
const CommandDefinitions_1 = require("./CommandDefinitions");
const ReactNativeUploader_1 = require("../uploaders/ReactNativeUploader");
function uploadReactNative(argv, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.help) {
            return reactNativeUsage();
        }
        const defs = [
            ...CommandDefinitions_1.commonCommandDefs.filter(def => def.name !== 'overwrite'),
            ...reactNativeCommonDefs,
            ...reactNativeProvideOpts,
            ...reactNativeFetchOpts,
        ];
        let reactNativeOpts;
        try {
            reactNativeOpts = command_line_args_1.default(defs, { argv, camelCase: true });
            if (reactNativeOpts.quiet) {
                Logger_1.default.level = consola_1.LogLevel.Success;
            }
            validateReactNativeOpts(reactNativeOpts);
        }
        catch (e) {
            process.exitCode = 1;
            if (e.name === 'UNKNOWN_VALUE' || e.name === 'UNKNOWN_OPTION') {
                Logger_1.default.error(`Invalid argument provided. ${e.message}`);
            }
            else {
                Logger_1.default.error(e.message);
            }
            return reactNativeUsage();
        }
        try {
            if (reactNativeOpts.fetch) {
                yield ReactNativeUploader_1.fetchAndUploadOne({
                    apiKey: reactNativeOpts.apiKey,
                    projectRoot: reactNativeOpts.projectRoot,
                    overwrite: !reactNativeOpts.noOverwrite,
                    appVersion: reactNativeOpts.appVersion,
                    codeBundleId: reactNativeOpts.codeBundleId,
                    appBundleVersion: reactNativeOpts.appBundleVersion,
                    appVersionCode: reactNativeOpts.appVersionCode,
                    platform: reactNativeOpts.platform,
                    dev: reactNativeOpts.dev,
                    endpoint: reactNativeOpts.endpoint,
                    bundlerUrl: reactNativeOpts.bundlerUrl,
                    bundlerEntryPoint: reactNativeOpts.bundlerEntryPoint,
                    logger: Logger_1.default
                });
            }
            else {
                yield ReactNativeUploader_1.uploadOne({
                    apiKey: reactNativeOpts.apiKey,
                    sourceMap: reactNativeOpts.sourceMap,
                    bundle: reactNativeOpts.bundle,
                    projectRoot: reactNativeOpts.projectRoot,
                    overwrite: !reactNativeOpts.noOverwrite,
                    appVersion: reactNativeOpts.appVersion,
                    codeBundleId: reactNativeOpts.codeBundleId,
                    appBundleVersion: reactNativeOpts.appBundleVersion,
                    appVersionCode: reactNativeOpts.appVersionCode,
                    platform: reactNativeOpts.platform,
                    dev: reactNativeOpts.dev,
                    endpoint: reactNativeOpts.endpoint,
                    logger: Logger_1.default
                });
            }
        }
        catch (e) {
            process.exitCode = 1;
        }
    });
}
exports.default = uploadReactNative;
function reactNativeUsage() {
    console.log(command_line_usage_1.default([
        { content: 'bugsnag-source-maps upload-react-native [...opts]' },
        {
            header: 'Options',
            optionList: [...CommandDefinitions_1.commonCommandDefs, ...reactNativeCommonDefs]
        },
        {
            header: 'Provide souce map and bundle',
            content: 'Options for uploading a source map and bundle'
        },
        {
            optionList: [...reactNativeProvideOpts]
        },
        {
            header: 'Fetch source map and bundle',
            content: 'Options for fetching a source map and bundle from the React Native bundler'
        },
        {
            optionList: [...reactNativeFetchOpts]
        }
    ]));
}
const reactNativeCommonDefs = [
    {
        name: 'platform',
        type: String,
        description: 'the application platform, either "android" or "ios" {bold required}',
    },
    {
        name: 'app-version',
        type: String,
    },
    {
        name: 'code-bundle-id',
        type: String,
    },
    {
        name: 'app-version-code',
        type: String,
    },
    {
        name: 'app-bundle-version',
        type: String,
    },
    {
        name: 'dev',
        type: Boolean,
        description: 'indicates this is a debug build',
    },
    {
        name: 'no-overwrite',
        type: Boolean,
        description: 'prevent exiting source maps uploaded with the same version from being replaced'
    }
];
const reactNativeProvideOpts = [
    {
        name: 'source-map',
        type: String,
        description: 'the path to the source map {bold required}',
        typeLabel: '{underline filepath}',
    },
    {
        name: 'bundle',
        type: String,
        description: 'the path to the bundle {bold required}',
        typeLabel: '{underline filepath}',
    },
];
const reactNativeFetchOpts = [
    {
        name: 'fetch',
        type: Boolean,
        description: 'enable fetch mode',
    },
    {
        name: 'bundler-url',
        type: String,
        description: 'the URL of the React Native bundle server (defaults to http://localhost:8081)',
        typeLabel: '{underline url}',
    },
    {
        name: 'bundler-entry-point',
        type: String,
        description: 'the entry point file of your React Native app (defaults to index.js)',
        typeLabel: '{underline filepath}',
    },
];
function validateReactNativeOpts(opts) {
    if (!opts.apiKey || typeof opts.apiKey !== 'string') {
        throw new Error('--api-key is a required parameter');
    }
    validatePlatform(opts);
    validateVersion(opts);
    validatePlatformOptions(opts);
    validateRetrieval(opts);
}
function validatePlatform(opts) {
    if (!opts.platform) {
        throw new Error('--platform is a required parameter');
    }
    if (opts.platform !== 'ios' && opts.platform !== 'android') {
        throw new Error('--platform must be either "android" or "ios"');
    }
}
function validateVersion(opts) {
    if (opts.codeBundleId) {
        if (opts.appVersion) {
            throw new Error('--app-version and --code-bundle-id cannot both be given');
        }
        if (opts.appBundleVersion) {
            throw new Error('--app-bundle-version and --code-bundle-id cannot both be given');
        }
        if (opts.appVersionCode) {
            throw new Error('--app-version-code and --code-bundle-id cannot both be given');
        }
        return;
    }
    if (!opts.appVersion && !opts.appVersionCode && !opts.appBundleVersion) {
        throw new Error('--code-bundle-id or at least one of --app-version, --app-version-code or --app-bundle-version must be given');
    }
}
function validatePlatformOptions(opts) {
    switch (opts.platform) {
        case 'ios': {
            if (opts.appVersionCode)
                throw new Error('--app-version-code cannot be given with --platform "ios"');
            break;
        }
        case 'android': {
            if (opts.appBundleVersion)
                throw new Error('--app-bundle-version cannot be given with --platform "android"');
            break;
        }
    }
}
function validateRetrieval(opts) {
    if (!opts.fetch && !opts.sourceMap && !opts.bundle) {
        throw new Error('Not enough arguments provided. Either use --fetch mode, or provide both --source-map and --bundle.');
    }
    if (!opts.fetch) {
        if (!opts.sourceMap || typeof opts.sourceMap !== 'string') {
            throw new Error('--source-map is a required parameter');
        }
        if (!opts.bundle || typeof opts.bundle !== 'string') {
            throw new Error('--bundle is a required parameter');
        }
    }
    else {
        if (opts.bundle || opts.sourceMap)
            throw new Error('--bundle and --source-map cannot be given with --fetch');
    }
}
//# sourceMappingURL=UploadReactNativeCommand.js.map