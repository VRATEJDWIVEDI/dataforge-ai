import EdaPanel from "@/components/workspace/EdaPanel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  UploadCloud,
  Loader2,
  FileText,
} from "lucide-react"
import DataCleaningPanel from "@/components/workspace/DataCleaningPanel"

type UploadResponse = {
  dataset_id: string
  filename: string
  rows: number
  columns: number
  column_names: string[]
}

type ColumnInfo = {
  name: string
  dtype: string
  missing_count: number
  missing_percentage: number
  unique_values: number
}

type InspectionResponse = {
  rows: number
  columns: number
  missing_count: number
  missing_percentage: number
  duplicate_rows: number
  numerical_columns: string[]
  categorical_columns: string[]
  constant_columns: string[]
  columns_info: ColumnInfo[]
}

async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(
    "http://127.0.0.1:8000/upload",
    {
      method: "POST",
      body: formData,
    }
  )

  if (!res.ok) {
    const errorBody = await res.json()
    throw new Error(errorBody.detail || "Upload failed")
  }

  return res.json()
}

async function fetchInspection(
  datasetId: string
): Promise<InspectionResponse> {
  const res = await fetch(
    `http://127.0.0.1:8000/dataset/${datasetId}/inspect`
  )

  if (!res.ok) {
    throw new Error("Failed to load dataset inspection")
  }

  return res.json()
}

export default function WorkspacePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
  })

  const inspectionQuery = useQuery({
    queryKey: ["inspection", uploadMutation.data?.dataset_id],
    queryFn: () =>
      fetchInspection(uploadMutation.data!.dataset_id),
    enabled: !!uploadMutation.data?.dataset_id,
  })

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]

    if (file) {
      setSelectedFile(file)
      uploadMutation.mutate(file)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Upload Dataset
      </h1>

      <p className="mt-2 text-muted-foreground">
        Upload a CSV file to begin analyzing your data.
      </p>

      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          {!uploadMutation.isPending &&
            !uploadMutation.isSuccess && (
              <>
                <UploadCloud className="size-10 text-muted-foreground" />

                <Button
                  onClick={() =>
                    document
                      .getElementById("csv-upload")
                      ?.click()
                  }
                >
                  Choose CSV File
                </Button>

                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

          {uploadMutation.isPending && (
            <>
              <Loader2 className="size-8 animate-spin text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                Uploading {selectedFile?.name}...
              </p>
            </>
          )}

          {uploadMutation.isError && (
            <p className="text-sm text-destructive">
              {(uploadMutation.error as Error).message}
            </p>
          )}

          {uploadMutation.isSuccess && (
            <>
              <FileText className="size-10 text-muted-foreground" />

              <div className="text-center">
                <p className="font-medium">
                  {uploadMutation.data.filename}
                </p>

                <p className="text-sm text-muted-foreground">
                  {uploadMutation.data.rows.toLocaleString()} rows ·{" "}
                  {uploadMutation.data.columns} columns
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {inspectionQuery.isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">
          Analyzing dataset...
        </p>
      )}

      {inspectionQuery.data && (
        <>
          {/* Dataset Health */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dataset Health</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid grid-cols-2 gap-y-3 sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Rows
                  </dt>
                  <dd className="text-lg font-semibold">
                    {inspectionQuery.data.rows.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Columns
                  </dt>
                  <dd className="text-lg font-semibold">
                    {inspectionQuery.data.columns}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Missing
                  </dt>
                  <dd className="text-lg font-semibold">
                    {inspectionQuery.data.missing_percentage}%
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Duplicates
                  </dt>
                  <dd className="text-lg font-semibold">
                    {inspectionQuery.data.duplicate_rows}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Columns */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Columns</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Missing</TableHead>
                    <TableHead>Unique Values</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {inspectionQuery.data.columns_info.map((col) => (
                    <TableRow key={col.name}>
                      <TableCell className="font-medium">
                        {col.name}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {col.dtype}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {col.missing_percentage}%
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {col.unique_values}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Data Cleaning */}
          <DataCleaningPanel
            datasetId={uploadMutation.data!.dataset_id}
            columnsInfo={inspectionQuery.data.columns_info}
            onDataChanged={() => inspectionQuery.refetch()}
          />
          <EdaPanel datasetId={uploadMutation.data!.dataset_id} />
        </>
      )}
    </div>
  )
}