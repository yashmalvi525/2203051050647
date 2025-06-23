"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trash2, Search, Download } from "lucide-react"
import { logger, type LogEntry } from "@/middleware/logger"
import Link from "next/link"

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")

  useEffect(() => {
    logger.info("Logs page loaded", {}, "LOGS_PAGE_LOAD")
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, levelFilter])

  const loadLogs = () => {
    const allLogs = logger.getLogs()
    setLogs(allLogs)
    logger.debug("Logs loaded for display", { count: allLogs.length }, "LOGS_DISPLAY_LOADED")
  }

  const filterLogs = () => {
    let filtered = logs

    // Filter by level
    if (levelFilter !== "all") {
      filtered = filtered.filter((log) => log.level === levelFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(term) ||
          log.action?.toLowerCase().includes(term) ||
          JSON.stringify(log.context).toLowerCase().includes(term),
      )
    }

    setFilteredLogs(filtered)
  }

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear all logs? This action cannot be undone.")) {
      logger.clearLogs()
      loadLogs()
    }
  }

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `url-shortener-logs-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    logger.info("Logs exported", { count: logs.length }, "LOGS_EXPORTED")
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-200"
      case "WARN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "INFO":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "DEBUG":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Logs</h1>
            <p className="text-gray-600">Monitor application activity and debug issues</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-white text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Log Controls</CardTitle>
            <CardDescription>Filter and manage application logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="WARN">Warning</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="DEBUG">Debug</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportLogs} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleClearLogs} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white shadow">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Total Logs</div>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent className="p-4">
              <div className="text-sm text-red-600">Errors</div>
              <div className="text-2xl font-bold text-red-600">
                {logs.filter((log) => log.level === "ERROR").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent className="p-4">
              <div className="text-sm text-yellow-600">Warnings</div>
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter((log) => log.level === "WARN").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent className="p-4">
              <div className="text-sm text-blue-600">Info</div>
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter((log) => log.level === "INFO").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Debug</div>
              <div className="text-2xl font-bold text-gray-600">
                {logs.filter((log) => log.level === "DEBUG").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs List */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
            <CardDescription>
              {searchTerm || levelFilter !== "all" ? "Filtered log entries" : "All log entries"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {logs.length === 0 ? "No logs available" : "No logs match your filters"}
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(log.level)}>{log.level}</Badge>
                        {log.action && (
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                    </div>

                    <p className="text-sm font-medium text-gray-900 mb-1">{log.message}</p>

                    {log.context && Object.keys(log.context).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          View Context
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
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
