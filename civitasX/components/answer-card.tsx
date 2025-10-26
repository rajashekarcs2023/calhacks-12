"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "./data-table"
import { CityChart } from "./city-chart"
import { CityMap } from "./city-map"
import { WorkflowCard } from "./workflow-card"
import type { QueryResult, WorkflowResponse } from "@/lib/types"

interface AnswerCardProps {
  result: QueryResult
  workflow?: WorkflowResponse
}

export function AnswerCard({ result, workflow }: AnswerCardProps) {
  const { viz, rows, columns } = result

  return (
    <div className="space-y-3">
      {workflow && <WorkflowCard workflow={workflow} />}

      <Card className="overflow-hidden backdrop-blur-sm bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {viz === "table" && <DataTable data={rows} columns={columns} />}
          {(viz === "bar" || viz === "line" || viz === "pie") && <CityChart data={rows} type={viz} />}
          {viz === "map" && <CityMap data={rows} />}
          {viz === "text" && <p className="text-sm text-muted-foreground">{result.explanation}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
