import { type Page } from "puppeteer";
import type { DinosaurObject } from "./.d.ts";
import { v4 as uuidv4 } from "uuid";

/*
  ? Grabbing Dino Info from A-Z Dino Directory web page
*/
async function goToDinoWebpage(page: Page) {
  console.log(`Grabbing Dino Info...`);
  const dinoNames: string[] = await page.$$eval(
    `li.dinosaurfilter--dinosaur.dinosaurfilter--all-list > a > p`,
    (dino) => dino.map((d) => d.textContent.replace(/\s/g, ""))
  );
  if (dinoNames) console.log(`Collected ${dinoNames.length} Dino Names...`);

  let dinoDB: Promise<DinosaurObject>[] = [];

  for (let i = 0; i < dinoNames.length; i++) {
    console.log(`Navigating to and scraping ${dinoNames[i]}...`);

    await Promise.all([
      page.waitForNavigation(),
      page.goto(
        `https://www.nhm.ac.uk/discover/dino-directory/${dinoNames[
          i
        ].toLowerCase()}.html`
      ),
    ]);

    await page.screenshot({ path: `outDir/bot/dinos/${i}.png` });

    const dinoData: Promise<DinosaurObject> = grabDinoInfo(page, dinoNames[i]);

    // ! Grab Dino Info
    dinoDB.push(dinoData);
  }

  return dinoDB;
}

async function grabDinoInfo(page: Page, dino: string): Promise<DinosaurObject> {
  return await page.evaluate(
    ({ id, dino }) => {
      const pronounciation = document.querySelector(
        "dd.dinosaur--pronunciation"
      )?.textContent;
      const name_meaning = document
        .querySelector("dd.dinosaur--meaning")
        ?.textContent.replace(/'/g, "");
      const type = document
        .querySelector("dl[data-dino-length] > dd > a")
        ?.textContent.replace(/\s/g, "");
      const diet = document
        .querySelector(
          `dl.dinosaur--info.dinosaur--list > dd:first-of-type > a`
        )
        ?.textContent.replace(/\s/g, "");
      const length = document.querySelector(
        "dl[data-dino-length] > dd:last-child"
      )?.textContent;
      const period = document.querySelector(
        "dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2) > a"
      )?.textContent;
      const epoch = document
        .querySelector("dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2)")
        ?.textContent.split(",")[1]
        .trim();
      const location = document
        .querySelector("dl.dinosaur--info.dinosaur--list > dd:last-child")
        ?.textContent.replace(/\t|\n/g, "");
      const description = document
        .querySelector("dinosaur--content-container layout-row")
        ?.textContent.replace(/\t|\n/g, "");

      const taxonomy = document
        .querySelector(
          "dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(1)"
        )
        .textContent.split(", ");
      const named_by = document.querySelector(
        "dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(2)"
      )?.textContent;
      const type_species = document.querySelector(
        "dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(3)"
      )?.textContent;

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
    },
    { id: uuidv4(), dino }
  );
}

/*
  ? Navigate the Cookies Page for wwww.nhm.ac.uk and return back to previous page
*/
async function navigateCookiesPage(page: Page) {
  console.log(`Handling webpage cookies prompt...`);
  // ? Navigate Cookies Prompts
  await Promise.all([
    page.waitForNavigation(),
    page.click(`a[href="/about-us/cookie-preferences.html"]`), // Clicking the link will indirectly cause a navigation
  ]);
  await page.screenshot({ path: "outDir/bot/2.png" }); // The promise resolves after navigation has finished

  console.log(`Navigated to cookie preferences page...`);

  // ! Accept Cookies (F yo cookies)
  const saveCookiesBtn = await page.waitForSelector('button[type="submit"]');
  await saveCookiesBtn?.click();
  await page.screenshot({ path: "outDir/bot/3.png" });

  console.log(`Cookies accepted...`);

  // Waiting for page load....
  await delay(1000);
  await page.screenshot({ path: "outDir/bot/4.png" });

  // back to top of cookies page
  const backToTop = await page.waitForSelector(
    'a[data-return-to-previous="true"]'
  );
  const [res] = await Promise.all([
    page.waitForNavigation(),
    backToTop?.click(),
  ]);
  if (res?.ok()) console.log(`Navigating back to previous page...`);
  await page.screenshot({ path: "outDir/bot/5.png" });
}

// ! Delay function
function delay(ms): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { navigateCookiesPage, goToDinoWebpage, delay };
