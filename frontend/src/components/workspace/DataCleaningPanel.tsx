import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Check } from "lucide-react"

type ColumnInfo = {
  name: string
  dtype: string
  missing_count: number
  missing_percentage: number
  unique_values: number
}

type Props = {
  datasetId: string
  columnsInfo: ColumnInfo[]
  onDataChanged: () => void
}

const API_BASE = "http://127.0.0.1:8000"

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Cleaning action failed")
  }
  return res.json()
}

export default function DataCleaningPanel({
  datasetId,
  columnsInfo,
  onDataChanged,
}: Props) {
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({})
  const [strategies, setStrategies] = useState<Record<string, string>>({})
  const [customValues, setCustomValues] = useState<Record<string, string>>({})

  const removeDuplicates = useMutation({
    mutationFn: () =>
      postJson(`${API_BASE}/dataset/${datasetId}/clean/remove-duplicates`),
    onSuccess: onDataChanged,
  })

  const removeConstantColumns = useMutation({
    mutationFn: () =>
      postJson(
        `${API_BASE}/dataset/${datasetId}/clean/remove-constant-columns`
      ),
    onSuccess: onDataChanged,
  })

  const dropColumn = useMutation({
    mutationFn: (columnName: string) =>
      postJson(`${API_BASE}/dataset/${datasetId}/clean/drop-columns`, {
        columns: [columnName],
      }),
    onSuccess: onDataChanged,
  })

  const renameColumn = useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      postJson(`${API_BASE}/dataset/${datasetId}/clean/rename-column`, {
        old_name: oldName,
        new_name: newName,
      }),
    onSuccess: onDataChanged,
  })

  const handleMissing = useMutation({
    mutationFn: ({
      column,
      strategy,
      customValue,
    }: {
      column: string
      strategy: string
      customValue?: string
    }) =>
      postJson(`${API_BASE}/dataset/${datasetId}/clean/handle-missing`, {
        column,
        strategy,
        custom_value: customValue,
      }),
    onSuccess: onDataChanged,
  })

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Clean Dataset</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeDuplicates.mutate()}
            disabled={removeDuplicates.isPending}
          >
            Remove Duplicate Rows
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeConstantColumns.mutate()}
            disabled={removeConstantColumns.isPending}
          >
            Remove Constant Columns
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>Missing %</TableHead>
              <TableHead>Fill Strategy</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {columnsInfo.map((col) => {
              const strategy = strategies[col.name] ?? ""
              return (
                <TableRow key={col.name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-32"
                        defaultValue={col.name}
                        onChange={(e) =>
                          setRenameDrafts((prev) => ({
                            ...prev,
                            [col.name]: e.target.value,
                          }))
                        }
                      />
                      {renameDrafts[col.name] &&
                        renameDrafts[col.name] !== col.name && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() =>
                              renameColumn.mutate({
                                oldName: col.name,
                                newName: renameDrafts[col.name],
                              })
                            }
                          >
                            <Check className="size-4" />
                          </Button>
                        )}
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {col.missing_percentage}%
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={strategy}
                        onValueChange={(value) =>
                          setStrategies((prev) => ({
                            ...prev,
                            [col.name]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mean">Mean</SelectItem>
                          <SelectItem value="median">Median</SelectItem>
                          <SelectItem value="mode">Mode</SelectItem>
                          <SelectItem value="drop_rows">Drop rows</SelectItem>
                          <SelectItem value="custom_value">
                            Custom value
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {strategy === "custom_value" && (
                        <Input
                          className="h-8 w-24"
                          placeholder="Value"
                          onChange={(e) =>
                            setCustomValues((prev) => ({
                              ...prev,
                              [col.name]: e.target.value,
                            }))
                          }
                        />
                      )}

                      {strategy && (
                        <Button
                          size="sm"
                          className="h-8"
                          disabled={handleMissing.isPending}
                          onClick={() =>
                            handleMissing.mutate({
                              column: col.name,
                              strategy,
                              customValue: customValues[col.name],
                            })
                          }
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive"
                      onClick={() => dropColumn.mutate(col.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}