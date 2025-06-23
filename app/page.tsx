"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, BarChart3, Settings } from "lucide-react"
import { urlShortener, type ShortenedUrl } from "@/lib/url-shortener"
import { logger } from "@/middleware/logger"
import Link from "next/link"

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [result, setResult] = useState<ShortenedUrl | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentUrls, setRecentUrls] = useState<ShortenedUrl[]>([])

  useEffect(() => {
    logger.info("Home page loaded", {}, "PAGE_LOAD")
    loadRecentUrls()
  }, [])

  const loadRecentUrls = () => {
    const urls = urlShortener.getAllUrls().slice(0, 5)
    setRecentUrls(urls)
    logger.debug("Recent URLs loaded", { count: urls.length }, "RECENT_URLS_LOADED")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResult(null)

    logger.info(
      "Form submission started",
      {
        hasOriginalUrl: !!originalUrl,
        hasCustomCode: !!customCode,
      },
      "FORM_SUBMIT",
    )

    try {
      const response = urlShortener.shortenUrl(originalUrl, customCode || undefined)

      if (response.success && response.data) {
        setResult(response.data)
        setOriginalUrl("")
        setCustomCode("")
        loadRecentUrls()
        logger.info(
          "URL shortened via form",
          {
            shortCode: response.data.shortCode,
          },
          "FORM_SUCCESS",
        )
      } else {
        setError(response.error || "Failed to shorten URL")
        logger.error(
          "Form submission failed",
          {
            error: response.error,
          },
          "FORM_ERROR",
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      logger.error(
        "Unexpected error during form submission",
        {
          error: errorMessage,
        },
        "FORM_EXCEPTION",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      logger.info("URL copied to clipboard", { url: text }, "COPY_SUCCESS")
    } catch (err) {
      logger.error(
        "Failed to copy to clipboard",
        {
          error: err instanceof Error ? err.message : "Unknown error",
        },
        "COPY_FAILED",
      )
    }
  }

  const getShortUrl = (shortCode: string) => {
    return `${window.location.origin}/${shortCode}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">URL Shortener</h1>
          <p className="text-gray-600">Transform long URLs into short, shareable links</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" className="bg-white text-gray-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href="/logs">
            <Button variant="outline" className="bg-white text-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Logs
            </Button>
          </Link>
        </div>

        {/* Main Form */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Shorten Your URL</CardTitle>
            <CardDescription>Enter a long URL and optionally provide a custom short code</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="originalUrl">Original URL *</Label>
                <Input
                  id="originalUrl"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Short Code (optional)</Label>
                <Input
                  id="customCode"
                  placeholder="my-custom-code"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  pattern="[a-zA-Z0-9]{3,20}"
                  title="3-20 alphanumeric characters"
                />
                <p className="text-sm text-gray-500">
                  Leave empty for auto-generated code. Must be 3-20 alphanumeric characters.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Shortening..." : "Shorten URL"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">URL Shortened Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Short URL</Label>
                <div className="flex gap-2">
                  <Input value={getShortUrl(result.shortCode)} readOnly className="bg-white" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(getShortUrl(result.shortCode))}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Link href={`/${result.shortCode}`} target="_blank">
                    <Button variant="outline" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-gray-600">
                <span>Original: {result.originalUrl}</span>
                {result.customCode && <Badge variant="secondary">Custom Code</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent URLs */}
        {recentUrls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent URLs</CardTitle>
              <CardDescription>Your recently shortened URLs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUrls.map((url) => (
                  <div key={url.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{url.clicks} clicks</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(getShortUrl(url.shortCode))}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
