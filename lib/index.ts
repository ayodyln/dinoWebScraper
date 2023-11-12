import { ConsoleMessage, type Page } from "puppeteer";
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

  let dinoDB = [];

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

    const dinoData = grabDinoInfo(page, dinoNames[i]);

    // ! Grab Dino Info
    dinoDB.push(dinoData);
  }

  return dinoDB;
}

async function grabDinoInfo(page: Page, dino: string) {
  return await page.evaluate(
    ({ id, dino, page }) => {
      const pronounciation = document.querySelector(
        "dd.dinosaur--pronunciation"
      );

      const name_meaning = document.querySelector("dd.dinosaur--meaning");

      const type = document.querySelector("dl[data-dino-length] > dd > a");
      const diet = document.querySelector(
        `dl.dinosaur--info.dinosaur--list > dd:first-of-type > a`
      );

      const length = document.querySelector(
        "dl[data-dino-length] > dd:last-child"
      );

      const period = document.querySelector(
        "dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2) > a"
      );

      const epoch = document.querySelector(
        "dl.dinosaur--info.dinosaur--list > dd:nth-of-type(2)"
      );

      const location = document.querySelector(
        "dl.dinosaur--info.dinosaur--list > dd:last-child"
      );

      let description = document.querySelector(
        "dinosaur--content-container layout-row"
      );

      const taxonomy = document.querySelector(
        "dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(1)"
      );
      const named_by = document.querySelector(
        "dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(2)"
      );
      const type_species = document.querySelector(
        "dl.dinosaur--taxonomy.dinosaur--list > dd:nth-of-type(3)"
      );

      return {
        id,
        name: dino,
        pronounciation: pronounciation ? pronounciation.textContent : null,
        name_meaning: name_meaning
          ? name_meaning.textContent.replace(/'/g, "")
          : null,
        type: type ? type.textContent.replace(/\s/g, "") : null,
        diet: diet ? diet.textContent.replace(/\s/g, "") : null,
        length: length ? length.textContent : null,
        era: {
          period: period ? period.textContent : null,
          epoch: epoch ? epoch.textContent.split(",")[1] : null,
        },
        location: location ? location.textContent.replace(/\t|\n/g, "") : null,
        description: description
          ? description.textContent.replace(/\t|\n/g, "")
          : null,
        taxonomic_details: {
          taxonomy: taxonomy ? taxonomy.textContent.split(", ") : null,
          named_by: named_by ? named_by.textContent : null,
          type_species: type_species ? type_species.textContent : null,
        },
      };
    },
    { id: uuidv4(), dino, page }
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
