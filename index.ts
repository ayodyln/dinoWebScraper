import puppeteer from "puppeteer";
import { delay } from "./lib";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: true });

  if (!browser) return;

  const page = await browser.newPage();
  await page.goto(
    "https://www.nhm.ac.uk/discover/dino-directory/name/name-az-all.html"
  );
  await page.setViewport({ width: 1080, height: 1024 });
  const pageTitle = await page.title();
  console.log(pageTitle);
  await page.screenshot({ path: "imgs/1.png" });

  // ? Navigate Cookies Prompts
  const [cookiesPageRes] = await Promise.all([
    page.waitForNavigation(),
    page.click(`a[href="/about-us/cookie-preferences.html"]`), // Clicking the link will indirectly cause a navigation
  ]);
  await page.screenshot({ path: "imgs/2.png" }); // The promise resolves after navigation has finished

  // ! Accept Cookies (F yo cookies)
  const saveCookiesBtn = await page.waitForSelector('button[type="submit"]');
  await saveCookiesBtn?.click();
  await page.screenshot({ path: "imgs/3.png" });

  // Waiting for page load....
  await delay(2000);
  await page.screenshot({ path: "imgs/4.png" });

  // back to top of cookies page
  const backToTop = await page.waitForSelector(
    'a[data-return-to-previous="true"]'
  );
  const [_] = await Promise.all([page.waitForNavigation(), backToTop?.click()]);
  await page.screenshot({ path: "imgs/5.png" });

  const dinoNames = await page.$$eval(
    `li.dinosaurfilter--dinosaur.dinosaurfilter--all-list > a > p`,
    (dino) => dino.map((d) => d.textContent.replace(/\s/g, ""))
  );

  // ! End of Bot
  await browser.close();
})();
