import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const API_BASE = "http://127.0.0.1:8000"

type FeatureSuggestions = {
  available_features: string[]
  suggested_exclude: string[]
}

type ModelResult = {
  model_name: string
  accuracy: number
  precision: number
  recall: number
  f1_score: number
}

type TrainingResponse = {
  results: ModelResult[]
  target_classes: string[]
  test_size: number
}

async function fetchFeatureSuggestions(
  datasetId: string,
  targetColumn: string
): Promise<FeatureSuggestions> {
  const res = await fetch(
    `${API_BASE}/dataset/${datasetId}/feature-suggestions?target_column=${encodeURIComponent(
      targetColumn
    )}`
  )
  if (!res.ok) throw new Error("Failed to load feature suggestions")
  return res.json()
}

async function trainClassification(
  datasetId: string,
  targetColumn: string,
  excludedColumns: string[]
): Promise<TrainingResponse> {
  const res = await fetch(
    `${API_BASE}/dataset/${datasetId}/train/classification`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_column: targetColumn,
        excluded_columns: excludedColumns,
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Training failed")
  }
  return res.json()
}

type Props = {
  datasetId: string
  targetColumn: string
}

export default function ModelTrainingPanel({ datasetId, targetColumn }: Props) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set())

  const { data: suggestions } = useQuery({
    queryKey: ["feature-suggestions", datasetId, targetColumn],
    queryFn: () => fetchFeatureSuggestions(datasetId, targetColumn),
  })

  useEffect(() => {
    if (suggestions) {
      setExcluded(new Set(suggestions.suggested_exclude))
    }
  }, [suggestions])

  const trainMutation = useMutation({
    mutationFn: () =>
      trainClassification(datasetId, targetColumn, Array.from(excluded)),
  })

  function toggleFeature(feature: string) {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(feature)) {
        next.delete(feature)
      } else {
        next.add(feature)
      }
      return next
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Train Models</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Select features to exclude from training. Columns flagged below look
            like identifiers and are excluded by default.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggestions?.available_features.map((feature) => (
              <label
                key={feature}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={!excluded.has(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                {feature}
                {suggestions.suggested_exclude.includes(feature) && (
                  <Badge variant="secondary" className="text-xs">
                    likely ID
                  </Badge>
                )}
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={() => trainMutation.mutate()}
          disabled={trainMutation.isPending}
        >
          {trainMutation.isPending && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          Train Models
        </Button>

        {trainMutation.isError && (
          <p className="text-sm text-destructive">
            {(trainMutation.error as Error).message}
          </p>
        )}

        {trainMutation.data && (
          <div>
            <h3 className="mb-3 text-sm font-medium">Model Leaderboard</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Precision</TableHead>
                  <TableHead>Recall</TableHead>
                  <TableHead>F1 Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainMutation.data.results.map((result, i) => (
                  <TableRow key={result.model_name}>
                    <TableCell className="font-medium">
                      {i === 0 && "🏆 "}
                      {result.model_name}
                    </TableCell>
                    <TableCell>{(result.accuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(result.precision * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(result.recall * 100).toFixed(1)}%</TableCell>
                    <TableCell>{(result.f1_score * 100).toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}