import { logger } from "@/middleware/logger"

export interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  customCode?: boolean
  createdAt: string
  clicks: number
  lastAccessed?: string
  clickHistory: Array<{
    timestamp: string
    userAgent?: string
    referrer?: string
  }>
}

export interface UrlStats {
  totalUrls: number
  totalClicks: number
  topUrls: ShortenedUrl[]
  recentActivity: ShortenedUrl[]
}

class UrlShortenerService {
  private urls: Map<string, ShortenedUrl> = new Map()
  private readonly STORAGE_KEY = "shortened-urls"

  constructor() {
    this.loadFromStorage()
    logger.info(
      "UrlShortenerService initialized",
      {
        existingUrls: this.urls.size,
      },
      "SERVICE_INIT",
    )
  }

  private loadFromStorage() {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          this.urls = new Map(Object.entries(data))
          logger.info(
            "URLs loaded from storage",
            {
              count: this.urls.size,
            },
            "LOAD_STORAGE",
          )
        }
      }
    } catch (error) {
      logger.error(
        "Failed to load URLs from storage",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "LOAD_STORAGE_ERROR",
      )
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== "undefined") {
        const data = Object.fromEntries(this.urls)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
        logger.debug(
          "URLs saved to storage",
          {
            count: this.urls.size,
          },
          "SAVE_STORAGE",
        )
      }
    } catch (error) {
      logger.error(
        "Failed to save URLs to storage",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "SAVE_STORAGE_ERROR",
      )
    }
  }

  private generateShortCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidShortCode(code: string): boolean {
    // Alphanumeric, 3-20 characters
    const regex = /^[a-zA-Z0-9]{3,20}$/
    return regex.test(code)
  }

  shortenUrl(originalUrl: string, customCode?: string): { success: boolean; data?: ShortenedUrl; error?: string } {
    logger.info(
      "URL shortening requested",
      {
        originalUrl,
        customCode: !!customCode,
        customCodeValue: customCode,
      },
      "SHORTEN_REQUEST",
    )

    // Validate original URL
    if (!this.isValidUrl(originalUrl)) {
      logger.warn("Invalid URL provided", { originalUrl }, "INVALID_URL")
      return { success: false, error: "Invalid URL format" }
    }

    let shortCode = customCode

    // Validate custom code if provided
    if (customCode) {
      if (!this.isValidShortCode(customCode)) {
        logger.warn("Invalid custom shortcode format", { customCode }, "INVALID_SHORTCODE")
        return { success: false, error: "Custom shortcode must be 3-20 alphanumeric characters" }
      }

      if (this.urls.has(customCode)) {
        logger.warn("Custom shortcode already exists", { customCode }, "SHORTCODE_EXISTS")
        return { success: false, error: "Custom shortcode already exists" }
      }
    } else {
      // Generate unique shortcode
      do {
        shortCode = this.generateShortCode()
      } while (this.urls.has(shortCode))

      logger.debug("Generated shortcode", { shortCode }, "SHORTCODE_GENERATED")
    }

    const shortenedUrl: ShortenedUrl = {
      id: Math.random().toString(36).substr(2, 9),
      originalUrl,
      shortCode: shortCode!,
      customCode: !!customCode,
      createdAt: new Date().toISOString(),
      clicks: 0,
      clickHistory: [],
    }

    this.urls.set(shortCode!, shortenedUrl)
    this.saveToStorage()

    logger.info(
      "URL shortened successfully",
      {
        shortCode: shortCode!,
        originalUrl,
        isCustom: !!customCode,
      },
      "SHORTEN_SUCCESS",
    )

    return { success: true, data: shortenedUrl }
  }

  getUrl(shortCode: string): ShortenedUrl | null {
    logger.debug("URL lookup requested", { shortCode }, "URL_LOOKUP")

    const url = this.urls.get(shortCode)
    if (!url) {
      logger.warn("URL not found", { shortCode }, "URL_NOT_FOUND")
    }

    return url || null
  }

  recordClick(shortCode: string, userAgent?: string, referrer?: string): boolean {
    logger.info(
      "Click recording requested",
      {
        shortCode,
        hasUserAgent: !!userAgent,
        hasReferrer: !!referrer,
      },
      "RECORD_CLICK",
    )

    const url = this.urls.get(shortCode)
    if (!url) {
      logger.warn("Cannot record click - URL not found", { shortCode }, "CLICK_RECORD_FAILED")
      return false
    }

    url.clicks++
    url.lastAccessed = new Date().toISOString()
    url.clickHistory.push({
      timestamp: new Date().toISOString(),
      userAgent,
      referrer,
    })

    // Keep only last 100 clicks for performance
    if (url.clickHistory.length > 100) {
      url.clickHistory = url.clickHistory.slice(-100)
    }

    this.saveToStorage()

    logger.info(
      "Click recorded successfully",
      {
        shortCode,
        totalClicks: url.clicks,
      },
      "CLICK_RECORDED",
    )

    return true
  }

  getAllUrls(): ShortenedUrl[] {
    logger.debug("All URLs requested", { count: this.urls.size }, "GET_ALL_URLS")
    return Array.from(this.urls.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  getStats(): UrlStats {
    logger.debug("Statistics requested", {}, "GET_STATS")

    const allUrls = this.getAllUrls()
    const totalClicks = allUrls.reduce((sum, url) => sum + url.clicks, 0)

    const stats: UrlStats = {
      totalUrls: allUrls.length,
      totalClicks,
      topUrls: allUrls
        .filter((url) => url.clicks > 0)
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10),
      recentActivity: allUrls
        .filter((url) => url.lastAccessed)
        .sort((a, b) => new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime())
        .slice(0, 10),
    }

    logger.info(
      "Statistics generated",
      {
        totalUrls: stats.totalUrls,
        totalClicks: stats.totalClicks,
        topUrlsCount: stats.topUrls.length,
      },
      "STATS_GENERATED",
    )

    return stats
  }

  deleteUrl(shortCode: string): boolean {
    logger.info("URL deletion requested", { shortCode }, "DELETE_REQUEST")

    const existed = this.urls.has(shortCode)
    if (existed) {
      this.urls.delete(shortCode)
      this.saveToStorage()
      logger.info("URL deleted successfully", { shortCode }, "DELETE_SUCCESS")
    } else {
      logger.warn("Cannot delete - URL not found", { shortCode }, "DELETE_FAILED")
    }

    return existed
  }
}

export const urlShortener = new UrlShortenerService()
