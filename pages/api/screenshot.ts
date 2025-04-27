import type { NextApiRequest, NextApiResponse } from "next";
const puppeteer = require('puppeteer');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  let browser;

  try {
    // When using regular puppeteer (not puppeteer-core):
    // 1. It will use the automatically downloaded Chromium
    // 2. You can override with executablePath if needed
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Optional: You can still specify a custom path if needed
      // executablePath: process.env.CHROME_PATH,
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1200 });
    await page.goto(url as string, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({ type: "png" });
    res.status(200).send(screenshot);
  } catch (error) {
    console.error('Puppeteer error:', error);
    res.status(500).json({ error: (error as any).message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
