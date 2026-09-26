import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"

const API_BASE = "http://127.0.0.1:8000"

type ColumnInfo = {
  name: string
  dtype: string
}

type TargetRecommendation = {
  recommendation: "classification" | "regression"
  reason: string
  unique_values: number
  is_numeric: boolean
}

async function fetchTargetRecommendation(
  datasetId: string,
  targetColumn: string
): Promise<TargetRecommendation> {
  const res = await fetch(
    `${API_BASE}/dataset/${datasetId}/target-recommendation?target_column=${encodeURIComponent(
      targetColumn
    )}`
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to get recommendation")
  }
  return res.json()
}

type Props = {
  datasetId: string
  columnsInfo: ColumnInfo[]
  onTargetSelected: (target: string, problemType: "classification" | "regression") => void
}

export default function TargetSelector({
  datasetId,
  columnsInfo,
  onTargetSelected,
}: Props) {
  const [selectedTarget, setSelectedTarget] = useState<string>("")

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["target-recommendation", datasetId, selectedTarget],
    queryFn: () => fetchTargetRecommendation(datasetId, selectedTarget),
    enabled: !!selectedTarget,
  })

  function handleSelect(value: string) {
    setSelectedTarget(value)
  }

useEffect(() => {
  if (data && selectedTarget) {
    onTargetSelected(selectedTarget, data.recommendation)
  }
}, [data, selectedTarget, onTargetSelected])

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Select Target Column</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTarget} onValueChange={handleSelect}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Choose a column to predict..." />
          </SelectTrigger>
          <SelectContent>
            {columnsInfo.map((col) => (
              <SelectItem key={col.name} value={col.name}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Analyzing target column...</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        )}

        {data && (
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Target className="mt-0.5 size-5 text-muted-foreground" />
            <div>
              <Badge
                variant={data.recommendation === "classification" ? "default" : "secondary"}
                className="mb-2"
              >
                {data.recommendation === "classification"
                  ? "Classification"
                  : "Regression"}
              </Badge>
              <p className="text-sm text-muted-foreground">{data.reason}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}