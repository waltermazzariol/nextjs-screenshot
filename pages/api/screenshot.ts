import type { NextApiRequest, NextApiResponse } from "next";
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';
// import puppeteer from 'puppeteer';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }
  
  const remoteExecutablePath = "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"
  
  let browser;

  try {
    // Configure Puppeteer with additional options to handle Chromium issues
    browser = await puppeteerCore.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      executablePath: await chromium.executablePath(remoteExecutablePath),
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
