import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type NumericalSummary = {
  column: string
  mean: number
  median: number
  std: number
  min: number
  max: number
  q1: number
  q3: number
  outlier_count: number
}

type CategoricalSummary = {
  column: string
  unique_count: number
  top_values: { value: string; count: number }[]
}

type CorrelationData = {
  columns: string[]
  matrix: number[][]
}

type EdaResponse = {
  numerical_summary: NumericalSummary[]
  categorical_summary: CategoricalSummary[]
  correlation: CorrelationData
}

const API_BASE = "http://127.0.0.1:8000"

async function fetchEda(datasetId: string): Promise<EdaResponse> {
  const res = await fetch(`${API_BASE}/dataset/${datasetId}/eda`)
  if (!res.ok) {
    throw new Error("Failed to load EDA")
  }
  return res.json()
}

function correlationColor(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 0.7) return value > 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"
  if (abs >= 0.4) return value > 0 ? "text-emerald-500" : "text-red-500"
  return "text-muted-foreground"
}

export default function EdaPanel({ datasetId }: { datasetId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["eda", datasetId],
    queryFn: () => fetchEda(datasetId),
  })

  if (isLoading) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Computing statistics...
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="mt-6 text-sm text-destructive">
        Could not load exploratory data analysis.
      </p>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {data.numerical_summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Numerical Summary</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Mean</TableHead>
                  <TableHead>Median</TableHead>
                  <TableHead>Std Dev</TableHead>
                  <TableHead>Min</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Outliers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.numerical_summary.map((row) => (
                  <TableRow key={row.column}>
                    <TableCell className="font-medium">{row.column}</TableCell>
                    <TableCell>{row.mean}</TableCell>
                    <TableCell>{row.median}</TableCell>
                    <TableCell>{row.std}</TableCell>
                    <TableCell>{row.min}</TableCell>
                    <TableCell>{row.max}</TableCell>
                    <TableCell>
                      {row.outlier_count > 0 ? (
                        <Badge variant="secondary">{row.outlier_count}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {data.categorical_summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorical Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {data.categorical_summary.map((col) => (
              <div key={col.column} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{col.column}</span>
                  <span className="text-xs text-muted-foreground">
                    {col.unique_count} unique
                  </span>
                </div>
                <div className="space-y-1">
                  {col.top_values.map((tv) => (
                    <div
                      key={tv.value}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{tv.value}</span>
                      <span>{tv.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.correlation.columns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  {data.correlation.columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.correlation.matrix.map((row, i) => (
                  <TableRow key={data.correlation.columns[i]}>
                    <TableCell className="font-medium">
                      {data.correlation.columns[i]}
                    </TableCell>
                    {row.map((value, j) => (
                      <TableCell key={j} className={correlationColor(value)}>
                        {value.toFixed(2)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}