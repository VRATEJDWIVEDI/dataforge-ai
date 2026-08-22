import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ChartRenderer from "./ChartRenderer"

const API_BASE = "http://127.0.0.1:8000"

type Recommendation = {
  chart_type: string
  x: string
  y: string | null
  reason: string
}

type ColumnInfo = {
  name: string
  dtype: string
}

async function fetchRecommendations(datasetId: string) {
  const res = await fetch(
    `${API_BASE}/dataset/${datasetId}/visualizations/recommendations`
  )
  if (!res.ok) throw new Error("Failed to load recommendations")
  const json = await res.json()
  return json.recommendations as Recommendation[]
}

async function fetchChart(
  datasetId: string,
  chartType: string,
  x: string,
  y: string | null
) {
  const params = new URLSearchParams({ chart_type: chartType, x })
  if (y) params.append("y", y)

  const res = await fetch(
    `${API_BASE}/dataset/${datasetId}/chart?${params.toString()}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to load chart")
  }
  return res.json()
}

function RecommendedChart({
  datasetId,
  rec,
}: {
  datasetId: string
  rec: Recommendation
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["chart", datasetId, rec.chart_type, rec.x, rec.y],
    queryFn: () => fetchChart(datasetId, rec.chart_type, rec.x, rec.y),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{rec.reason}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        ) : data ? (
          <ChartRenderer data={data} />
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function VisualizationsPanel({
  datasetId,
  columnsInfo,
}: {
  datasetId: string
  columnsInfo: ColumnInfo[]
}) {
  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", datasetId],
    queryFn: () => fetchRecommendations(datasetId),
  })

  const [manualType, setManualType] = useState("histogram")
  const [manualX, setManualX] = useState("")
  const [manualY, setManualY] = useState("")
  const [activeChart, setActiveChart] = useState<{
    type: string
    x: string
    y: string | null
  } | null>(null)

  const manualChartQuery = useQuery({
    queryKey: [
      "manual-chart",
      datasetId,
      activeChart?.type,
      activeChart?.x,
      activeChart?.y,
    ],
    queryFn: () =>
      fetchChart(datasetId, activeChart!.type, activeChart!.x, activeChart!.y),
    enabled: !!activeChart,
  })

  const needsY = manualType === "scatter" || manualType === "box"

  function handleGenerate() {
    if (!manualX || (needsY && !manualY)) return
    setActiveChart({ type: manualType, x: manualX, y: needsY ? manualY : null })
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Recommended Visualizations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations?.map((rec, i) => (
            <RecommendedChart key={i} datasetId={datasetId} rec={rec} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Build Your Own Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={manualType} onValueChange={setManualType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="histogram">Histogram</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
                <SelectItem value="box">Box Plot</SelectItem>
              </SelectContent>
            </Select>

            <Select value={manualX} onValueChange={setManualX}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="X column" />
              </SelectTrigger>
              <SelectContent>
                {columnsInfo.map((col) => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {needsY && (
              <Select value={manualY} onValueChange={setManualY}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Y column" />
                </SelectTrigger>
                <SelectContent>
                  {columnsInfo.map((col) => (
                    <SelectItem key={col.name} value={col.name}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={handleGenerate}>Generate</Button>
          </div>

          {manualChartQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          )}
          {manualChartQuery.data && (
            <ChartRenderer data={manualChartQuery.data} />
          )}
          {manualChartQuery.isError && (
            <p className="text-sm text-destructive">
              {(manualChartQuery.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}