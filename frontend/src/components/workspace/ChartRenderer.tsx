import Plot from "react-plotly.js"

type ChartData = {
  chart_type: string
  labels?: string[]
  values?: number[]
  x_values?: number[]
  y_values?: number[]
  groups?: { category: string; values: number[] }[]
  x_label: string
  y_label: string
}

export default function ChartRenderer({ data }: { data: ChartData }) {
  if (data.chart_type === "histogram" || data.chart_type === "bar") {
    return (
      <Plot
        data={[
          {
            x: data.labels,
            y: data.values,
            type: "bar",
            marker: { color: "#6366f1" },
          },
        ]}
        layout={{
          autosize: true,
          height: 320,
          margin: { t: 20, r: 20, b: 60, l: 50 },
          xaxis: { title: { text: data.x_label } },
          yaxis: { title: { text: data.y_label } },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%" }}
      />
    )
  }

  if (data.chart_type === "scatter") {
    return (
      <Plot
        data={[
          {
            x: data.x_values,
            y: data.y_values,
            type: "scatter",
            mode: "markers",
            marker: { color: "#6366f1", size: 6, opacity: 0.7 },
          },
        ]}
        layout={{
          autosize: true,
          height: 320,
          margin: { t: 20, r: 20, b: 60, l: 50 },
          xaxis: { title: { text: data.x_label } },
          yaxis: { title: { text: data.y_label } },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%" }}
      />
    )
  }

  if (data.chart_type === "box" && data.groups) {
    return (
      <Plot
        data={data.groups.map((group) => ({
          y: group.values,
          type: "box",
          name: group.category,
          marker: { color: "#6366f1" },
        }))}
        layout={{
          autosize: true,
          height: 320,
          margin: { t: 20, r: 20, b: 60, l: 50 },
          yaxis: { title: { text: data.y_label } },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          showlegend: false,
        }}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: "100%" }}
      />
    )
  }

  return <p className="text-sm text-muted-foreground">Unsupported chart type.</p>
}