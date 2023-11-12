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
        const dinoNames = yield page.$$eval(`li.dinosaurfilter--dinosaur.dinosaurfilter--all-list > a > p`, (dino) => dino.map((d) => d.textContent.replace(/\s|\-/g, "")));
        if (dinoNames)
            console.log(`Collected ${dinoNames.length} Dino Names...`);
        let dinoDB = [];
        for (let i = 0; i < dinoNames.length; i++) {
            console.log(`Navigating to and scraping ${dinoNames[i]}...`);
            yield Promise.all([
                page.waitForNavigation(),
                // delay(2000),
                page.goto(`https://www.nhm.ac.uk/discover/dino-directory/${dinoNames[i].toLowerCase()}.html`),
            ]);
            // await page.screenshot({ path: `outDir/bot/dinos/${i}.png` });
            const dinoData = yield grabDinoInfo(page, dinoNames[i]);
            // ! Grab Dino Info
            dinoDB.push(dinoData);
        }
        return dinoDB;
    });
}
exports.goToDinoWebpage = goToDinoWebpage;
function grabDinoInfo(page, dino) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield page.evaluate(({ id, dino, page }) => {
                const pronounciation = document.querySelector("dd.dinosaur--pronunciation");
                const name_meaning = document.querySelector("dd.dinosaur--meaning");
                const type = document.querySelector("dl[data-dino-length] > dd > a");
                const diet = document.querySelector(`dl.dinosaur--info.dinosaur--list > dd:first-of-type > a`);
                const length = document.querySelector("dl[data-dino-length] > dd:last-child");
                const period = document.querySelector("dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2) > a");
                const epoch = document.querySelector("dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2)");
                const dino_info = document.querySelector("dl.dinosaur--info.dinosaur--list");
                const dino_info_dt = dino_info === null || dino_info === void 0 ? void 0 : dino_info.querySelectorAll("dt");
                const dino_info_dd = dino_info === null || dino_info === void 0 ? void 0 : dino_info.querySelectorAll("dd");
                let dinoInfoObj = {};
                for (let i = 0; i < (dino_info_dt === null || dino_info_dt === void 0 ? void 0 : dino_info_dt.length); i++) {
                    dinoInfoObj[dino_info_dt[i].textContent.replace(/\s/g, "_").toLowerCase()] = dino_info_dd[i].textContent.replace(/\t|\n/g, "").trim();
                }
                let description = document.querySelector("dinosaur--content-container layout-row");
                const taxonomy = document.querySelector("dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(1)");
                const named_by = document.querySelector("dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(2)");
                const type_species = document.querySelector("dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(3)");
                const dino_imgs = [
                    ...document.querySelectorAll("img.dinosaur--image"),
                ].map((i) => i["src"]);
                return {
                    id,
                    name: dino,
                    pronounciation: pronounciation ? pronounciation.textContent : null,
                    dino_imgs,
                    name_meaning: name_meaning
                        ? name_meaning.textContent.replace(/'/g, "")
                        : null,
                    type: type ? type.textContent.replace(/\s/g, "") : null,
                    diet: diet ? diet.textContent.replace(/\s/g, "") : null,
                    length: length ? length.textContent : null,
                    dinoInfoObj,
                    description: description
                        ? description.textContent.replace(/\t|\n/g, "")
                        : null,
                    taxonomic_details: {
                        taxonomy: taxonomy ? taxonomy.textContent.split(", ") : null,
                        named_by: named_by ? named_by.textContent : null,
                        type_species: type_species ? type_species.textContent : null,
                    },
                };
            }, { id: (0, uuid_1.v4)(), dino, page });
        }
        catch (error) {
            console.error(error);
        }
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
        // await page.screenshot({ path: "outDir/bot/2.png" }); // The promise resolves after navigation has finished
        console.log(`Navigated to cookie preferences page...`);
        // ! Accept Cookies (F yo cookies)
        const saveCookiesBtn = yield page.waitForSelector('button[type="submit"]');
        yield (saveCookiesBtn === null || saveCookiesBtn === void 0 ? void 0 : saveCookiesBtn.click());
        // await page.screenshot({ path: "outDir/bot/3.png" });
        console.log(`Cookies accepted...`);
        // Waiting for page load....
        yield delay(1000);
        // await page.screenshot({ path: "outDir/bot/4.png" });
        // back to top of cookies page
        const backToTop = yield page.waitForSelector('a[data-return-to-previous="true"]');
        const [res] = yield Promise.all([
            page.waitForNavigation(),
            backToTop === null || backToTop === void 0 ? void 0 : backToTop.click(),
        ]);
        if (res === null || res === void 0 ? void 0 : res.ok())
            console.log(`Navigating back to previous page...`);
        // await page.screenshot({ path: "outDir/bot/5.png" });
    });
}
exports.navigateCookiesPage = navigateCookiesPage;
// ! Delay function
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
//# sourceMappingURL=index.js.map