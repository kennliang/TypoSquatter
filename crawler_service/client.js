
//const HCCrawler = require('headless-chrome-crawler');
//const puppeteer = require('puppeteer');
const connection = require('./rabbitmq.js')

function process_task(msg){
	console.log(" [x] Received %s", msg.content.toString());
}


function htmlspecialchars(str) {
	if (typeof(str) == "string") {
	 str = str.replace(/&/g, "&amp;"); 
	 str = str.replace(/"/g, "&quot;");
	 str = str.replace(/'/g, "&#039;");
	 str = str.replace(/</g, "&lt;");
	 str = str.replace(/>/g, "&gt;</br>");
	 }
	return str;
}
/*
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
							page.setDefaultTimeout(10000);
							await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36");
						
							console.log(url)
							await page.goto("https://"+url);
							let screenshot = await page.screenshot({fullPage:true});
							let content = await page.content();
						
							let html_result = htmlspecialchars(content);
							let result_info = {url: "https://"+url+"/",html: html_result,imgid: id};
							typo_collection.insertOne(result_info);
					
						}
						catch(err)
						{
							//.shift();
							//total--;
							console.log("Error crawling"+err);
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

};
*/

module.exports = process_task