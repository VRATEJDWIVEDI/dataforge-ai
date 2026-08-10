import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowRight,
  Table2,
  BrainCircuit,
  MessageSquareText,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-start gap-6"
        >
          <Badge variant="secondary">
            Agentic AI Data Workspace
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Analyze data. Train models.
            <br />
            Ask questions in plain English.
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            DataForge AI takes your CSV from raw upload to trained
            machine-learning model — with an AI analyst that explains every
            result using real, computed data, not guesses.
          </p>

          <Button size="lg" className="mt-2 gap-2">
            Launch Workspace
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            delay: 0.15,
          }}
          className="mt-24 grid gap-4 sm:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <Table2 className="size-5 text-muted-foreground" />

              <CardTitle className="mt-3">
                Clean & Explore
              </CardTitle>

              <CardDescription>
                Upload a CSV and get automatic data-quality checks,
                cleaning tools, and exploratory statistics in seconds.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BrainCircuit className="size-5 text-muted-foreground" />

              <CardTitle className="mt-3">
                Train & Compare Models
              </CardTitle>

              <CardDescription>
                Pick a target column and DataForge trains multiple
                classification or regression models, then ranks them
                on real metrics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquareText className="size-5 text-muted-foreground" />

              <CardTitle className="mt-3">
                Ask the AI Analyst
              </CardTitle>

              <CardDescription>
                A LangChain-powered agent answers questions about your
                data by calling real tools — never guessing at numbers.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}