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
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.goToDinoWebpage = exports.navigateCookiesPage = void 0;
const uuid_1 = require("uuid");
/*
  ? Grabbing Dino Info from A-Z Dino Directory web page
*/
function goToDinoWebpage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Grabbing Dino Info...`);
        const dinoNames = yield page.$$eval(`li.dinosaurfilter--dinosaur.dinosaurfilter--all-list > a > p`, (dino) => dino.map((d) => d.textContent.replace(/\s/g, "")));
        if (dinoNames)
            console.log(`Collected ${dinoNames.length} Dino Names...`);
        let dinoDB = [];
        for (let i = 0; i < 5; i++) {
            console.log(`Navigating to and scraping ${dinoNames[i]}...`);
            yield Promise.all([
                page.waitForNavigation(),
                page.goto(`https://www.nhm.ac.uk/discover/dino-directory/${dinoNames[i].toLowerCase()}.html`),
            ]);
            yield page.screenshot({ path: `outDir/bot/dinos/${i}.png` });
            const dinoData = grabDinoInfo(page, dinoNames[i]);
            // ! Grab Dino Info
            dinoDB.push(dinoData);
        }
        return dinoDB;
    });
}
exports.goToDinoWebpage = goToDinoWebpage;
function grabDinoInfo(page, dino) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(({ id, dino }) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const pronounciation = (_a = document.querySelector("dd.dinosaur--pronunciation")) === null || _a === void 0 ? void 0 : _a.textContent;
            const name_meaning = (_b = document
                .querySelector("dd.dinosaur--meaning")) === null || _b === void 0 ? void 0 : _b.textContent.replace(/'/g, "");
            const type = (_c = document
                .querySelector("dl[data-dino-length] > dd > a")) === null || _c === void 0 ? void 0 : _c.textContent.replace(/\s/g, "");
            const diet = (_d = document
                .querySelector(`dl.dinosaur--info.dinosaur--list > dd:first-of-type > a`)) === null || _d === void 0 ? void 0 : _d.textContent.replace(/\s/g, "");
            const length = (_e = document.querySelector("dl[data-dino-length] > dd:last-child")) === null || _e === void 0 ? void 0 : _e.textContent;
            const period = (_f = document.querySelector("dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2) > a")) === null || _f === void 0 ? void 0 : _f.textContent;
            const epoch = (_g = document
                .querySelector("dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2)")) === null || _g === void 0 ? void 0 : _g.textContent.split(",")[1].trim();
            const location = (_h = document
                .querySelector("dl.dinosaur--info.dinosaur--list > dd:last-child")) === null || _h === void 0 ? void 0 : _h.textContent.replace(/\t|\n/g, "");
            const description = (_j = document
                .querySelector("dinosaur--content-container layout-row")) === null || _j === void 0 ? void 0 : _j.textContent.replace(/\t|\n/g, "");
            const taxonomy = document
                .querySelector("dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(1)")
                .textContent.split(", ");
            const named_by = (_k = document.querySelector("dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(2)")) === null || _k === void 0 ? void 0 : _k.textContent;
            const type_species = (_l = document.querySelector("dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(3)")) === null || _l === void 0 ? void 0 : _l.textContent;
            return {
                id,
                name: dino,
                pronounciation,
                name_meaning,
                type,
                diet,
                length,
                era: {
                    period,
                    epoch,
                },
                location,
                description,
                taxonomic_details: {
                    taxonomy,
                    named_by,
                    type_species,
                },
            };
        }, { id: (0, uuid_1.v4)(), dino });
    });
}
/*
  ? Navigate the Cookies Page for wwww.nhm.ac.uk and return back to previous page
*/
function navigateCookiesPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Handling webpage cookies prompt...`);
        // ? Navigate Cookies Prompts
        yield Promise.all([
            page.waitForNavigation(),
            page.click(`a[href="/about-us/cookie-preferences.html"]`), // Clicking the link will indirectly cause a navigation
        ]);
        yield page.screenshot({ path: "outDir/bot/2.png" }); // The promise resolves after navigation has finished
        console.log(`Navigated to cookie preferences page...`);
        // ! Accept Cookies (F yo cookies)
        const saveCookiesBtn = yield page.waitForSelector('button[type="submit"]');
        yield (saveCookiesBtn === null || saveCookiesBtn === void 0 ? void 0 : saveCookiesBtn.click());
        yield page.screenshot({ path: "outDir/bot/3.png" });
        console.log(`Cookies accepted...`);
        // Waiting for page load....
        yield delay(1000);
        yield page.screenshot({ path: "outDir/bot/4.png" });
        // back to top of cookies page
        const backToTop = yield page.waitForSelector('a[data-return-to-previous="true"]');
        const [res] = yield Promise.all([
            page.waitForNavigation(),
            backToTop === null || backToTop === void 0 ? void 0 : backToTop.click(),
        ]);
        if (res === null || res === void 0 ? void 0 : res.ok())
            console.log(`Navigating back to previous page...`);
        yield page.screenshot({ path: "outDir/bot/5.png" });
    });
}
exports.navigateCookiesPage = navigateCookiesPage;
// ! Delay function
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
//# sourceMappingURL=index.js.map