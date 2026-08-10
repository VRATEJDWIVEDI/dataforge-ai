import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <div className="flex flex-col items-start gap-6">
        <Badge variant="secondary" className="text-xs font-medium">
          Agentic AI Data Workspace
        </Badge>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Analyze data. Train models.
          <br />
          Ask questions in plain English.
        </h1>

        <p className="max-w-2xl text-lg text-muted-foreground">
          DataForge AI takes your CSV from raw upload to trained machine-learning
          model — with an AI analyst that explains every result using real,
          computed data, not guesses.
        </p>

        <Button size="lg" className="mt-2 gap-2">
          Launch Workspace
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}