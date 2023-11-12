import fs from "fs";
import puppeteer from "puppeteer";
import { navigateCookiesPage, goToDinoWebpage, delay } from "./lib";

const url = `https://www.nhm.ac.uk/discover/dino-directory/name/name-az-all.html`;

(async () => {
  let browser;
  let recorder;

  try {
    generateOutDir();

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    const res = await page.goto(url);

    if (!res?.ok()) {
      console.log(`Error navigating to webpage: ${url}`);
      process.exit(1);
    } else console.log(`Navigated to webpage: ${await page.title()}`);

    recorder = await page.screencast({ path: "outDir/recording.webm" });

    await navigateCookiesPage(page);

    const dinoDB = await Promise.all(await goToDinoWebpage(page));

    if (dinoDB.length > 0) {
      console.log(`Done!`);
      console.log("Writing to file...");

      if (!fs.existsSync(`./outDir/bot/dinos.json`)) {
        fs.writeFileSync(
          `./outDir/bot/dinoDB.json`,
          JSON.stringify(dinoDB, null, 2)
        );
      }

      console.log(`Generated dinoDB.json!, Goodbye! 🦕`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser?.close();
    await recorder.stop();
  }
})();

function generateOutDir() {
  const paths = {
    outDir: `./outDir`,
    bot: `./outDir/bot`,
  };

  for (const path in paths) {
    if (!fs.existsSync(paths[path])) {
      console.log(`Creating ${paths[path]}`);
      fs.mkdirSync(paths[path]);
    }
  }
}
