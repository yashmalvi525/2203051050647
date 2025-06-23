"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Clock } from "lucide-react"
import { urlShortener } from "@/lib/url-shortener"
import { logger } from "@/middleware/logger"
import Link from "next/link"

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [url, setUrl] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)

  const shortCode = params.shortCode as string

  useEffect(() => {
    if (!shortCode) return

    logger.info("Redirect page accessed", { shortCode }, "REDIRECT_PAGE_ACCESS")

    // Look up the URL
    const foundUrl = urlShortener.getUrl(shortCode)

    if (!foundUrl) {
      setNotFound(true)
      logger.warn("Redirect attempted for non-existent URL", { shortCode }, "REDIRECT_NOT_FOUND")
      return
    }

    setUrl(foundUrl)

    // Record the click
    const userAgent = navigator.userAgent
    const referrer = document.referrer

    urlShortener.recordClick(shortCode, userAgent, referrer)

    logger.info(
      "Click recorded and redirect initiated",
      {
        shortCode,
        originalUrl: foundUrl.originalUrl,
        totalClicks: foundUrl.clicks + 1,
      },
      "REDIRECT_CLICK_RECORDED",
    )

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect to the original URL
          window.location.href = foundUrl.originalUrl
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [shortCode])

  const handleImmediateRedirect = () => {
    if (url) {
      logger.info(
        "Immediate redirect requested",
        {
          shortCode,
          originalUrl: url.originalUrl,
        },
        "IMMEDIATE_REDIRECT",
      )
      window.location.href = url.originalUrl
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">URL Not Found</CardTitle>
            <CardDescription>The short URL "/{shortCode}" does not exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">This could happen if:</p>
            <ul className="text-sm text-gray-500 text-left space-y-1">
              <li>• The URL was never created</li>
              <li>• The URL has been deleted</li>
              <li>• There's a typo in the short code</li>
            </ul>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Home Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-lg">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600">Redirecting...</CardTitle>
          <CardDescription>You will be redirected to your destination in {countdown} seconds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Countdown Circle */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"
                style={{ animationDuration: "1s" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">{countdown}</span>
              </div>
            </div>
          </div>

          {/* URL Info */}
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Short URL</p>
              <p className="font-mono text-blue-600">/{shortCode}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Destination</p>
              <p className="text-sm break-all text-gray-700 bg-gray-50 p-2 rounded">{url.originalUrl}</p>
            </div>

            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {url.clicks + 1} total clicks
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleImmediateRedirect} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Go Now
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full bg-white text-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel & Go Home
              </Button>
            </Link>
          </div>

          {/* Safety Notice */}
          <div className="text-xs text-gray-500 text-center bg-yellow-50 p-3 rounded border border-yellow-200">
            <p className="font-medium text-yellow-800 mb-1">Safety Notice</p>
            <p>Always verify the destination URL before proceeding to ensure it's safe and legitimate.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
