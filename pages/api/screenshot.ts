import type { NextApiRequest, NextApiResponse } from "next";
import chromium from '@sparticuz/chromium';
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
      args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Prevents crashes in limited memory environments
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Important: This helps with memory issues
        '--disable-gpu'],
      defaultViewport: {
          width: 640,
          height: 480,
        },
      timeout: 30000,
      executablePath: await chromium.executablePath(remoteExecutablePath),
    });
    const page = await browser.newPage();
    console.log(`Navigating to: ${url}`);
    await page.goto(url as string, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({ type: "png" });
    console.log('Screenshot taken');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
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
