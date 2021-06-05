var net = require('net');
const HCCrawler = require('headless-chrome-crawler');
const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const ObjectID = require('mongodb').ObjectID;

const { Readable } = require('stream');

console.log("cool");
var url_collection;
let typo_collection;
var database;

var num_results;

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
							page.setDefaultTimeout(10000);
							await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36");
							//let url = urls.shift();
							//let url = urls[0];
							console.log(url)
							await page.goto("https://"+url);
							let screenshot = await page.screenshot({fullPage:true});
							let content = await page.content();
							//urls.shift();
							const readableTrackStream = new Readable();
							readableTrackStream.push(screenshot);
							readableTrackStream.push(null);

							let bucket = new mongodb.GridFSBucket(database, {
								bucketName: 'images'
							});

							let uploadStream = bucket.openUploadStream(url);
							let id = uploadStream.id;
							readableTrackStream.pipe(uploadStream);
							console.log("executed to here");

							uploadStream.on('error', () => {
								console.log("worker node unable to upload image file");
							//return res.status(500).json({ message: "Error uploading file" });
							});
							
							uploadStream.on('finish', () => {
								console.log("finished");
							
							});
							let html_result = htmlspecialchars(content);
							let result_info = {url: "https://"+url+"/",html: html_result,imgid: id};
							typo_collection.insertOne(result_info);
							//total--;
							console.log("success visiting",);
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
	//console.log(urls,urls.length);
	//console.log(socket);
	console.log("completed");
	socket.write(JSON.stringify(["Done"]))
};
/*

async function crawl(websites,socket){
	try
	{	
	const crawler = await HCCrawler.launch({
	  // Function to be evaluated in browsers
	  customCrawl: async (page, crawl) => {
	  
		// The result contains options, links, cookies and etc.
		const result = await crawl();
		result.content = await page.content();
	  
		return result;
	  },
	  args: ['--no-sandbox' ,
	  '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'],
	  maxConcurrency: 10,
	  // Function to be called with evaluated results from browsers
	  onSuccess: (result => {
		  try{
		num_results--;
		console.log("Success result"+ num_results);
		//console.log(result.options.url);
		//console.log(result);
		const readableTrackStream = new Readable();
		readableTrackStream.push(result.screenshot);
		readableTrackStream.push(null);

		let bucket = new mongodb.GridFSBucket(database, {
			bucketName: 'images'
		});

		let uploadStream = bucket.openUploadStream(result.options.url);
		let id = uploadStream.id;
		readableTrackStream.pipe(uploadStream);
		console.log("executed to here");

		uploadStream.on('error', () => {
			console.log("worker node unable to upload image file");
		//return res.status(500).json({ message: "Error uploading file" });
		});
		
		uploadStream.on('finish', () => {
			console.log("finished");
			//let result_info = {url: result.options.url,html: result.content,imgid: id};
			//typo_collection.insertOne(result_info);
			//socket.write('START'+JSON.stringify(result.options.url)+'END');
			//socket.write(JSON.stringify(result.options.url));
			//return res.status(201).json({ message: "File uploaded successfully, stored under Mongo ObjectID: " + id });
		});
		let html_result = htmlspecialchars(result.content);
		let result_info = {url: result.options.url,html: html_result,imgid: id};
		typo_collection.insertOne(result_info);
		//socket.write('START'+JSON.stringify(result.options.url)+'END');
		//socket.write(JSON.stringify(result.options.url));
	}
	catch(err){
		console.log(err);
	}
	  }),
	  onError: (result =>{
		num_results--;
		console.log("Error results"+ result+num_results);
		//result.success = false;
		
		//socket.write('START'+JSON.stringify(result.options.url)+'END');
	
		//let success_send = client.write(JSON.stringify(result));
		//socket.write(JSON.stringify(result.options.url));
	
	  })
	});
	for(let i = 0 ; i < websites.length; i++){
		await crawler.queue({
			url: 'https://'+ websites[i],
			screenshot: {
				fullPage:true
			},
			waitUntil: ['networkidle0'],
			skipRequestedRedirect: true,
			obeyRobotsTxt: false,
			retryCount: 0,
		});
	}
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

async function runcrawl(result,socket){
	console.log(result);
	await crawl(result,socket);
	//client.destroy();
}*/

const server = net.createServer((socket) => {
	socket.setEncoding('utf-8');
	console.log('Connection from', socket.remoteAddress, 'port', socket.remotePort);
	
	var url = "mongodb://"+ socket.remoteAddress+":27017/";
	console.log(url);
	//var url = "mongodb://130.245.171.203:27017/";

	var mongo_client = new MongoClient(url,{useUnifiedTopology:true});
	mongo_client.connect(function(err,db){
		if(err)
			throw err;
	
		console.log("connected to mongo db");
		  var typo_db = db.db("typo_db");
		  database = typo_db;
	  	url_collection = typo_db.collection("url");
		typo_collection = typo_db.collection("typo_result");
		

	});
  
	socket.on('data', (string) => {
	  console.log('Request from', socket.remoteAddress, 'port', socket.remotePort);
		let result = JSON.parse(string);
		num_results = result.length;
		console.log(result);
		runcrawl(result,socket);
	});
	socket.on('end', () => {
	  console.log('Closed', socket.remoteAddress, 'port', socket.remotePort);
	});
  });
  
  server.listen(Number(process.argv[2]),'0.0.0.0');
