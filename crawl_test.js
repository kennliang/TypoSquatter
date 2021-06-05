var net = require('net');
const HCCrawler = require('headless-chrome-crawler');
const puppeteer = require('puppeteer');
const WebsiteTypo = require('./typo.js');
var total;
/*
(async () => {
	const browser = await puppeteer.launch( {args: ['--no-sandbox', '--ignore-certificate-errors','--ignoreHTTPSErrors',
	'--ignore-certificate-errors-spki-list']});
	const page = await browser.newPage();
	
  // Emitted when a request, which is produced by the page, fails
  page.on('requestfailed', request => console.log('Failed request: '+request.url()));

  // Emitted when a request, which is produced by the page, finishes successfully
  page.on('requestfinished', request => console.log('Finished request: '+request.url()));

  // Emitted when a response is received
  page.on('response', response => {
	  console.log(response.status());
  });
  
  // Emitted when the page emits an error event (for example, the page crashes)
  page.on('error', error => console.error('❌ ${error}'));

  // Emitted when a script within the page has uncaught exception
  page.on('pageerror', error => console.error('❌ ${error}'));

	//let url = 'https://www.ytoutube.com';
	let url = 'https://www.6outube.com';
	//await page.goto('https://www.youutube.com',{waitUntil:'networkidle0'});
	//await page.waitForNavigation({'waitUntil': ['networkidle0'],'timeout':10000000});
	//await page.waitFor(20000);
	
	
	let response = await page.goto(url,{waitUntil:['networkidle0','load','domcontentloaded']});
	//console.log(response);
	//await page.waitFor(20000);
	//const chain = response.request().redirectChain();
	//console.log(chain);
	let content = await response.text();
	console.log("Content"+ content);
	

	await page.screenshot({
		path: 'public/images/test.png',
		type: 'png',
		fullPage:true
	});
	

  /*
	const result = await page.evaluate(() => {
		
	})
  
	console.log(result)*/
  
	//browser.close()
 // })()

 /*
  

async function crawl(websites){
	try
	{	
	const crawler = await HCCrawler.launch({
	  // Function to be evaluated in browsers
	  customCrawl: async (page, crawl) => {
		//await page.waitForNavigation({'waitUntil': ['domcontentloaded','networkidle0','load','networkidle2'],'timeout':100000});
		//await page.goto();
		//console.log(page);
		//console.log(crawl);
		// The result contains options, links, cookies and etc.
		console.log("here before");

		const result = await crawl();
		console.log(result);
		//await page.waitForNavigation({'waitUntil': ['domcontentloaded','networkidle0','load','networkidle2'],'timeout':100000});
		console.log("idk");
		result.content = await page.content();
		console.log("did execute");
		return result;
	  },
      args: ['--no-sandbox'],
      ignoreHTTPSErrors:true,
	  maxConcurrency: 1,
	  // Function to be called with evaluated results from browsers
	  onSuccess: (result => {
		  total--;
		//console.log("Success result",total);
		//console.log(result);
		//console.log(result.options.url);
        //console.log(result);
		//console.log(result.content);
		let s = result.options.url.substring(8);
		let ss = s.slice(0,-1);
		console.log("Success",ss);
		
		var index = typo_result.indexOf(ss);
        if (index > -1) 
			typo_result.splice(index, 1);
		//console.log(typo_result);
		//console.log("Error results"+ result+total);
		
	  }),
	  onError: (result =>{
		  total--;
		 
		let s = result.options.url.substring(8);
		let ss = s.slice(0,-1);
		var index = typo_result.indexOf(ss);
        if (index > -1) 
			typo_result.splice(index, 1);
		console.log("Error",ss);
		//console.log("Error results"+ result+total);
		//console.log(typo_result);

	
	  })
	});
	for(let i = 0 ; i < websites.length; i++){
		await crawler.queue({
			url: 'https://'+ websites[i],
			screenshot: {
				fullPage:true,
                path: 'public/images/'+websites[i]+'.png'
			},
			waitUntil: ['networkidle0'],
			obeyRobotsTxt: false,
			retryCount: 0,
			
			
		});
	}
	//waitUntil: ['domcontentloaded','networkidle0','load','networkidle2'],
    //	waitUntil: ['domcontentloaded'],
    //  path: './public/images/'+websites[i],
	//skipRequestedRedirect: true,
	//omitBackground:true,
	//encoding: 'base64',
	//skipDuplicates:false,
  
	await crawler.onIdle(); // Resolved when no queue is left
	await crawler.close(); // Close the crawler
	console.log("crawler closed");
	}
	catch(err){
		console.log("catched");
		console.log(err);
	}
  }

async function runcrawl(result){
	//console.log(result);
	await crawl(result);
	//client.destroy();
}

//runcrawl(['www.youutube.com']);
//runcrawl(['www.youutube.com','www.youtiube.com','www.ytoutube.com','www.youtuve.com']);

 */
let web_typo = new WebsiteTypo("www.youtube.com");
//web_typo.missing_dot();
//web_typo.char_omission();
//web_typo.char_permut();
//web_typo.char_replace();
web_typo.char_insert();
//console.log(web_typo.typo_list);
//var previous_queue_size = queue.length;

let typo_result = web_typo.typo_list;
total = typo_result.length;
//console.log(typo_result);


const runcrawl = async function(urls,socket){
	
	const BROWERS = 2;
	const PAGES = 2;
	const promBrowser = [];
	for(let i = 0 ; i < BROWERS; i++)
	{
		promBrowser.push(new Promise(async(respondBrowser) =>{
			const browser = await puppeteer.launch({args: ['--no-sandbox',],ignoreHTTPSErrors:true});
			browser.on('disconnected',err =>{
				console.log("brower crashed");
			});
			const promPage = [];
			for(let j = 0; j < PAGES; j++)
			{
				promPage.push(new Promise(async(respondPage) =>{
					while(urls.length != 0)
					{
						console.log(urls.length);
						let url = urls.shift();
						let page = await browser.newPage();
						page.on('error',err =>{
							console.log("page crashed");
						});
						try
						{
							
							//let page = await browser.newPage();
							await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36");
							//let url = urls.shift();
							//let url = urls[0];
							await page.goto("https://"+url);
							let screenshot = await page.screenshot({fullPage:true});
							let content = await page.content();
							//urls.shift();
							total--;
							console.log("success visiting",total);
						}
						catch(err)
						{
							//.shift();
							total--;
							console.log("Error crawling"+err,total);
						}
						finally
						{
							await page.close();
						}
					}
					respondPage();
				}));
			}
			await Promise.all(promPage);
            await browser.close();
            respondBrowser();
		}));
	}
	await Promise.all(promBrowser);
	console.log(urls,urls.length);
	console.log(socket);
}
runcrawl(["www.example.com"],"hello");
