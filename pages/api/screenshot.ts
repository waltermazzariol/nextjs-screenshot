import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
const puppeteer = require('puppeteer-core');

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
    // Configure Puppeteer with additional options to handle Chromium issues
    browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Use a custom Chrome path if specified in environment variables
      executablePath: process.env.CHROME_PATH || undefined
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
