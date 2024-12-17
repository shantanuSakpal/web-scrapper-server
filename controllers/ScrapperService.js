const puppeteer = require("puppeteer");

const getAllText = async (linkToScrap) => {
  console.log("link to scrap", linkToScrap);
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const visitedUrls = new Set();
  const allPageContent = [];

  // Get the actual base URL after redirection
  let baseUrl;
  try {
    await page.goto(linkToScrap, { waitUntil: "domcontentloaded" });
    baseUrl = await page.evaluate(() => window.location.origin);
    console.log("Actual base URL after redirect:", baseUrl);
  } catch (error) {
    console.error("Error getting base URL:", error);
    await browser.close();
    return;
  }

  async function scrapeTextFromPage(url) {
    if (visitedUrls.has(url)) return;
    visitedUrls.add(url);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });

      // Get all text content from the page
      const pageContent = await page.evaluate(() => {
        function getTextContent(element) {
          const text = element.textContent.trim();
          const tagName = element.tagName.toLowerCase();
          return {
            tag: tagName,
            text: text,
            path: getElementPath(element),
          };
        }

        function getElementPath(element) {
          if (!element) return "";
          if (element.id) return "#" + element.id;
          if (element === document.body) return "body";

          const siblings = Array.from(element.parentNode.childNodes).filter(
            (node) => node.nodeType === 1
          );

          const index = siblings.indexOf(element) + 1;
          return (
            getElementPath(element.parentNode) +
            " > " +
            element.tagName.toLowerCase() +
            (siblings.length > 1 ? ":nth-child(" + index + ")" : "")
          );
        }

        const textElements = document.querySelectorAll(
          "div, p, span, h1, h2, h3, h4, h5, h6, a, li"
        );
        return Array.from(textElements)
          .map(getTextContent)
          .filter((item) => item.text.length > 0);
      });

      allPageContent.push({
        url: url,
        content: pageContent,
      });

      // Find all links on the current page, using the actual baseUrl
      const links = await page.evaluate((baseUrl) => {
        return Array.from(document.querySelectorAll("a"))
          .map((a) => a.href)
          .filter((href) => href.startsWith(baseUrl)); // Use dynamic baseUrl
      }, baseUrl);

      // Visit each link recursively
      for (const link of links) {
        await scrapeTextFromPage(link);
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }

  // Start scraping from the redirected URL
  await scrapeTextFromPage(baseUrl);
  let content = "";
  console.log("\nScraped Content:");
  allPageContent.forEach((page) => {
    // console.log("\nURL:", page.url);
    page.content.forEach((item) => {
      // console.log(`\n${item.text}`);
      content = content + item.text;
    });
  });
  console.log("Content:");

  await browser.close();
  console.log(content);
  return content;
};

module.exports = { getAllText };
