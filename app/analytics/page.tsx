"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Trash2, Copy } from "lucide-react"
import { urlShortener, type UrlStats, type ShortenedUrl } from "@/lib/url-shortener"
import { logger } from "@/middleware/logger"
import Link from "next/link"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<UrlStats | null>(null)
  const [allUrls, setAllUrls] = useState<ShortenedUrl[]>([])

  useEffect(() => {
    logger.info("Analytics page loaded", {}, "ANALYTICS_PAGE_LOAD")
    loadData()
  }, [])

  const loadData = () => {
    const statsData = urlShortener.getStats()
    const urlsData = urlShortener.getAllUrls()

    setStats(statsData)
    setAllUrls(urlsData)

    logger.info(
      "Analytics data loaded",
      {
        totalUrls: statsData.totalUrls,
        totalClicks: statsData.totalClicks,
      },
      "ANALYTICS_DATA_LOADED",
    )
  }

  const handleDelete = (shortCode: string) => {
    if (confirm("Are you sure you want to delete this URL?")) {
      const success = urlShortener.deleteUrl(shortCode)
      if (success) {
        loadData()
        logger.info("URL deleted from analytics", { shortCode }, "ANALYTICS_DELETE")
      }
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      logger.info("URL copied from analytics", { url: text }, "ANALYTICS_COPY")
    } catch (err) {
      logger.error(
        "Failed to copy from analytics",
        {
          error: err instanceof Error ? err.message : "Unknown error",
        },
        "ANALYTICS_COPY_FAILED",
      )
    }
  }

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your URL performance and usage statistics</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-white text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalUrls}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalClicks}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalUrls > 0 ? Math.round(stats.totalClicks / stats.totalUrls) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing URLs */}
        {stats.topUrls.length > 0 && (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Top Performing URLs</CardTitle>
              <CardDescription>URLs with the most clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topUrls.map((url, index) => (
                  <div key={url.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/${url.shortCode}`} className="font-medium text-blue-600 hover:underline">
                            /{url.shortCode}
                          </Link>
                          {url.customCode && (
                            <Badge variant="secondary" className="text-xs">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{url.originalUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{url.clicks} clicks</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All URLs */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>All URLs</CardTitle>
            <CardDescription>Complete list of your shortened URLs</CardDescription>
          </CardHeader>
          <CardContent>
            {allUrls.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No URLs created yet</p>
            ) : (
              <div className="space-y-3">
                {allUrls.map((url) => (
                  <div
                    key={url.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/${url.shortCode}`} className="font-medium text-blue-600 hover:underline">
                          /{url.shortCode}
                        </Link>
                        {url.customCode && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {url.clicks} clicks
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-1">{url.originalUrl}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Created: {formatDate(url.createdAt)}</span>
                        {url.lastAccessed && <span>Last accessed: {formatDate(url.lastAccessed)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(getShortUrl(url.shortCode))}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Link href={`/${url.shortCode}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(url.shortCode)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
