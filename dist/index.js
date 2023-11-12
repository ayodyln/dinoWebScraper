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
const fs_1 = __importDefault(require("fs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const lib_1 = require("./lib");
const url = `https://www.nhm.ac.uk/discover/dino-directory/name/name-az-all.html`;
(() => __awaiter(void 0, void 0, void 0, function* () {
    let browser;
    try {
        generateOutDir();
        const browser = yield puppeteer_1.default.launch({ headless: true });
        const page = yield browser.newPage();
        yield page.setViewport({ width: 1080, height: 1024 });
        const res = yield page.goto(url);
        if (!(res === null || res === void 0 ? void 0 : res.ok())) {
            console.log(`Error navigating to webpage: ${url}`);
            process.exit(1);
        }
        else
            console.log(`Navigated to webpage: ${yield page.title()}`);
        yield page.screenshot({ path: "outDir/bot/1.png" });
        yield (0, lib_1.navigateCookiesPage)(page);
        const dinoDB = yield Promise.all(yield (0, lib_1.goToDinoWebpage)(page));
        if (dinoDB.length > 0) {
            console.log(`Done!`);
            console.log("Writing to file...");
            if (!fs_1.default.existsSync(`./outDir/bot/dinos.json`)) {
                fs_1.default.writeFileSync(`./outDir/bot/result/dinoDB.json`, JSON.stringify(dinoDB, null, 2));
            }
            console.log(`Generated dinoDB.json!, Goodbye! 🦕`);
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        yield (browser === null || browser === void 0 ? void 0 : browser.close());
    }
}))();
function generateOutDir() {
    const paths = {
        outDir: `./outDir`,
        botImgs: `./outDir/bot`,
        dinoImgs: `./outDir/bot/dinos`,
        resulte: `./outDir/bot/result`,
    };
    for (const path in paths) {
        if (!fs_1.default.existsSync(paths[path])) {
            console.log(`Creating ${paths[path]}`);
            fs_1.default.mkdirSync(paths[path]);
        }
    }
}
//# sourceMappingURL=index.js.map