import { type Page } from "puppeteer";
import { v4 as uuidv4 } from "uuid";

/*
  ? Grabbing Dino Info from A-Z Dino Directory web page
*/
async function goToDinoWebpage(page: Page) {
  console.log(`Grabbing Dino Info...`);
  const dinoNames: string[] = await page.$$eval(
    `li.dinosaurfilter--dinosaur.dinosaurfilter--all-list > a > p`,
    (dino) => dino.map((d) => d.textContent.replace(/\s|\-/g, ""))
  );
  if (dinoNames) console.log(`Collected ${dinoNames.length} Dino Names...`);

  let dinoDB = [];
  for (let i = 0; i < dinoNames.length; i++) {
    console.log(`Navigating to and scraping ${dinoNames[i]}...`);
    await Promise.all([
      page.waitForNavigation(),
      // delay(2000),
      page.goto(
        `https://www.nhm.ac.uk/discover/dino-directory/${dinoNames[
          i
        ].toLowerCase()}.html`
      ),
    ]);
    const dinoData = await grabDinoInfo(page, dinoNames[i]);
    // ! Grab Dino Info
    dinoDB.push(dinoData);
  }

  return dinoDB;
}

async function grabDinoInfo(page: Page, dino: string) {
  try {
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
        const dino_info = document.querySelector(
          "dl.dinosaur--info.dinosaur--list"
        );
        const dino_info_dt = dino_info?.querySelectorAll("dt");
        const dino_info_dd = dino_info?.querySelectorAll("dd");
        let dinoInfoObj = {};
        for (let i = 0; i < dino_info_dt?.length; i++) {
          dinoInfoObj[
            dino_info_dt[i].textContent.replace(/\s/g, "_").toLowerCase()
          ] = dino_info_dd[i].textContent.replace(/\t|\n/g, "").trim();
        }
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
      },
      { id: uuidv4(), dino, page }
    );
  } catch (error) {
    console.error(error);
  }
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

  console.log(`Navigated to cookie preferences page...`);

  // ! Accept Cookies (F yo cookies)
  const saveCookiesBtn = await page.waitForSelector('button[type="submit"]');
  await saveCookiesBtn?.click();

  console.log(`Cookies accepted...`);

  // Waiting for page load....
  await delay(1000);

  // back to top of cookies page
  const backToTop = await page.waitForSelector(
    'a[data-return-to-previous="true"]'
  );
  const [res] = await Promise.all([
    page.waitForNavigation(),
    backToTop?.click(),
  ]);
  if (res?.ok()) console.log(`Navigating back to previous page...`);
}

// ! Delay function
function delay(ms): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { navigateCookiesPage, goToDinoWebpage, delay };
