import FirecrawlApp from "@mendable/firecrawl-js";

// Define interfaces for the FireCrawl responses and options
interface CrawlOptions {
  limit: number;
  scrapeOptions: {
    formats: string[];
  };
}

type FirecrawlResponse = {
  success: boolean;
  status: string;
  total: number;
  completed: number;
  creditsUsed: number;
  expiresAt: string;
  next: string;
  data: {
    markdown: string;
    html: string;
    metadata: {
      title: string;
      language: string;
      sourceURL: string;
      description: string;
      ogLocaleAlternate: string[];
      statusCode: number;
    };
  }[];
};

/**
 * Scrapes content from a given URL using FireCrawl
 * @param linkToScrap - The URL to scrape
 * @returns Promise<string | undefined>
 */

async function getAllText(linkToScrap: string): Promise<string | undefined> {
  if (!linkToScrap) {
    console.log("no link to screap");
    return;
  }

  console.log("link to scrap", linkToScrap);

  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

  if (!FIRECRAWL_API_KEY) {
    console.log("FIRECRAWL_API_KEY not found");
    return;
  }

  const app = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

  const crawlOptions: CrawlOptions = {
    limit: 10,
    scrapeOptions: {
      formats: ["markdown", "html"],
    },
  };

  try {
    //@ts-ignore
    const crawlResponse: FirecrawlResponse = await app.crawlUrl(linkToScrap);

    if (!crawlResponse.success) {
      throw new Error(`Failed to crawl: ${crawlResponse.data}`);
    }

    console.log(crawlResponse);

    return crawlResponse.data[0].markdown;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Crawl operation failed: ${error.message}`);
    }
    // Handle cases where the thrown value is not an Error object
    throw new Error("An unknown error occurred during crawling");
  }
}

export default getAllText;
