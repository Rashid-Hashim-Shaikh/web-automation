// node AutomationScript.js --url="https://www.hackerrank.com" --config=config.json

// moderators = [
     // "lakshaykhurana01",
        // "sagarsingh",
        // "kartikeyabhatt0",
        // "devy2k87",
        // "uma_sanjay1972",
        // "aryanxofficial"
// ]

// npm init -y
// npm install minimist 
// npm install puppeteer


let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");

let args = minimist(process.argv);  // passing the arguments to args varialble
// console.log(args.url);
// console.log(args.config);

let configJSON = fs.readFileSync(args.config, "utf-8");  // reading the config file
let configJSO = JSON.parse(configJSON); //converting the JSON file to JSO(javscript object)

run()

async function run(){
    // Launching the browser
    let browser = await puppeteer.launch({
        defaultViewport: null,      // to show the content in full screen
        args:[
            "--start-maximized"
        ],                          // to show the browser in full screen
        headless: false             // browser to be displayed on screen
});
    // get a tab

    let pages = await browser.pages();
    let page = pages[0];

    // go to url
    await page.goto(args.url);

    // click login1
    await page.waitForSelector("a[data-event-action='Login']"); // waiting for page to get loaded
    await page.click("a[data-event-action='Login']"); // click on the login button

    // click on login2
   await page.waitForSelector("a[href='https://www.hackerrank.com/login']"); // waiting for page to get loaded
   await page.click("a[href='https://www.hackerrank.com/login']"); // click on the login button

    // type userid
    await page.waitForSelector("input[id='input-1']");
    await page.type("input[id='input-1']", configJSO.userid, {delay:100} );    

    // type password
    await page.waitForSelector("input[id='input-2']");
    await page.type("input[id='input-2']", configJSO.password, {delay:100});

    // click on login
    await page.waitForSelector("button[data-analytics='LoginPassword']"); // waiting for page to get loaded
    await page.click("button[data-analytics='LoginPassword']"); // click on the login button

    // click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']"); // waiting for page to get loaded
    await page.click("a[data-analytics='NavBarContests']"); // click on the login button
    
    // click on manage contest
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    // fetching number of pages in contest list 
    await page.waitForSelector("a[data-attr1='Last']");

    let numPages = await page.$eval("a[data-attr1='Last']", function(atag){   // it will go to the last page and fetch the anchor tag
        let np = parseInt(atag.getAttribute('data-page'));  // get the attribut having number of pages and converting it into integer            
        return np;
    })

    // move through all pages
    for(let i = 0; i < numPages; i++){
       await handlePage(browser, page);
    }
}
async function handlePage(browser, page){

    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center", function (atags) {
        
        // let urls = [];
        // for (let i = 0; i < atags.length; i++) {
        //     let url = atags[i].getAttribute("href");
        //     urls.push(url);
        // }

        return atags.map(atag => atag.getAttribute("href"));
    });

    // looping over each contest url
    for (let i = 0; i < curls.length; i++) {
        await handleContest(browser, page, curls[i]);
    }

    // move to next page
    await page.waitFor(1500);
    await page.waitForSelector("a[data-attr1='Right']");
    await page.click("a[data-attr1='Right']");
}

async function handleContest(browser, page, curl) {
    let npage = await browser.newPage();     // creating new tab
    await npage.goto(args.url + curl);       // go to the contest in new tab
    await npage.waitFor(2000);

    await npage.waitForSelector("li[data-tab='moderators']");    
    await npage.click("li[data-tab='moderators']");     // click on modertors

    // inserting each moderator
    for (let i = 0; i < configJSO.moderators.length; i++) {
        let moderator = configJSO.moderators[i];

        await npage.waitForSelector("input#moderator");
        await npage.type("input#moderator", moderator, { delay: 100 });

        await npage.keyboard.press("Enter");
    }


    await npage.waitFor(1000);
    await npage.close();
    await page.waitFor(2000);
}
    

