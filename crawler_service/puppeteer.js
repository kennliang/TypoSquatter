const puppeteer = require('puppeteer')

const init = async() => {
    try {
        const browser = await createBrowser()
        const page = await createPage(browser)
        await setUserAgent(page)
        return page
    }
    catch(err)
    {
        console.log(err)
    }
}

const createBrowser = async() => {
	try {
		const browser = await puppeteer.launch()
		return browser
	}
	catch(err)
	{
		console.log("Error launching browser")
		console.log(err)
	}
}

const createPage = async(browser) => {
	try {
		const page = await browser.newPage()
		return page
	}
	catch(err)
	{
		console.log("Error creating new page")
		console.log(err)
	}
}

const setUserAgent = async(page) => {
    try {
        await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36");
    }
    catch(err) 
    {
        console.log("Error setting user agent")
        console.log(err)
    }
}

module.exports = init()