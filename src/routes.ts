import { Dataset, createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

router.addHandler('DETAIL', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`)
    const urlParts = request.url.split('/').slice(-2);
    const modifiedTimestamp = await page.locator('time[datetime]').getAttribute('datetime');
    const runsRow = page.locator('ul.ActorHeader-userMedallion > li').filter({ hasText: 'Runs' });
    const runCountString = await runsRow.textContent();

    const results = {
        url: request.url,
        uniqueIdentifier: urlParts.join('/'),
        owner: urlParts[0],
        title: await page.locator('.ActorHeader-identificator h1').textContent(),
        description: await page.locator('p.ActorHeader-description').textContent(),
        modifiedDate: new Date(Number(modifiedTimestamp)),
        runCount: runCountString?.replace('Runs ', ''),
    }

    log.debug(`Saving data: ${request.url}`)
    console.dir(results);
    await Dataset.pushData(results);
});

// This is a fallback route which will handle the start URL
// as well as the LIST labeled URLs.
router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
    log.debug(`Enqueueing pagination: ${request.url}`)
    await page.waitForSelector('.ActorStorePagination-buttons a');
    await enqueueLinks({
        selector: '.ActorStorePagination-buttons a',
        label: 'LIST',
    })
    log.debug(`Enqueueing actor details: ${request.url}`)
    await page.waitForSelector('div[data-test="actorCard"] a');
    await enqueueLinks({
        selector: 'div[data-test="actorCard"] a',
        label: 'DETAIL', // <= note the different label
    })
});
