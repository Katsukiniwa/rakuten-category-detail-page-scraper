import { Dataset, createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
    // log.info(`enqueueing new URLs`);
    // await enqueueLinks({
    //     globs: ['https://apify.com/store'],
    //     label: 'store',
    // });
    console.log(`Processing: ${request.url}`)
    if (request.label === 'DETAIL') {
        // We're not doing anything with the details yet.
        const urlParts = request.url.split('/').slice(-2);
        const modifiedTimestamp = await page.locator('time[datetime]').getAttribute('datetime');
        const runsRow = page.locator('ul.ActorHeader-userMedallion > li').filter({ hasText: 'Runs' });
        const runCountString = await runsRow.textContent();

        const results = {
            url: request.url,
            uniqueIdentifier: urlParts.join('/'),
            owner: urlParts[0],
            title: page.locator('.ActorHeader-identificator h1'),
            description: await page.locator('p.ActorHeader-description').textContent(),
            modifiedDate: new Date(Number(modifiedTimestamp)),
            runCount: runCountString?.replace('Runs ', ''),
        };

        console.log(results);
    } else {
        await page.waitForSelector('.ActorStorePagination-buttons a');
        await enqueueLinks({
            selector: '.ActorStorePagination-buttons a',
            label: 'LIST',
        });
        await page.waitForSelector('div[data-test="actorCard"] a');
        await enqueueLinks({
            selector: 'div[data-test="actorCard"] a',
            label: 'DETAIL',
        });
    }
});

// router.addHandler('DETAIL', async ({ request, page, log, parseWithCheerio }) => {
//     const title = await page.title();
//     log.info(`${title}`, { url: request.loadedUrl });
//     // Wait for the actor cards to render.
//     await page.waitForSelector('div[data-test="actorCard"]');
//     // Extract the page's HTML from browser
//     // and parse it with Cheerio.
//     const $ = await parseWithCheerio();
//     // Use familiar Cheerio syntax to
//     // select all the actor cards.
//     $('div[data-test="actorCard"]').each((i: number, el: any) => {
//         const text = $(el).text();
//         console.log(`ACTOR_${i + 1}: ${text}\n`);
//     });

//     // await Dataset.pushData({
//     //     url: request.loadedUrl,
//     //     title,
//     // });
// });
