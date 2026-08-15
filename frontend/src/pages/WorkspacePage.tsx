import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, Loader2, FileText } from "lucide-react"

type UploadResponse = {
  filename: string
  rows: number
  columns: number
  column_names: string[]
}

async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("http://127.0.0.1:8000/upload", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const errorBody = await res.json()
    throw new Error(errorBody.detail || "Upload failed")
  }

  return res.json()
}

export default function WorkspacePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const mutation = useMutation({
    mutationFn: uploadFile,
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (file) {
      setSelectedFile(file)
      mutation.mutate(file)
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
          {!mutation.isPending && !mutation.isSuccess && (
            <>
              <UploadCloud className="size-10 text-muted-foreground" />

              <Button
                onClick={() =>
                  document.getElementById("csv-upload")?.click()
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

          {mutation.isPending && (
            <>
              <Loader2 className="size-8 animate-spin text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                Uploading {selectedFile?.name}...
              </p>
            </>
          )}

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}

          {mutation.isSuccess && (
            <>
              <FileText className="size-10 text-muted-foreground" />

              <div className="text-center">
                <p className="font-medium">
                  {mutation.data.filename}
                </p>

                <p className="text-sm text-muted-foreground">
                  {mutation.data.rows.toLocaleString()} rows ·{" "}
                  {mutation.data.columns} columns
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}