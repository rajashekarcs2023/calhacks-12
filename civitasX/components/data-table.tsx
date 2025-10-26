"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps {
  data: any[]
  columns: string[]
}

export function DataTable({ data, columns }: DataTableProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>
  }

  // Format column names for display
  const formatColumnName = (col: string) => {
    return col
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Format cell values
  const formatValue = (value: any, column: string) => {
    if (value === null || value === undefined) return "-"

    // Format dates
    if (column.includes("date") || column.includes("created_at")) {
      return new Date(value).toLocaleDateString()
    }

    // Format currency
    if (column.includes("amount") || column.includes("usd")) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(value)
    }

    // Format numbers
    if (typeof value === "number" && !column.includes("id")) {
      return new Intl.NumberFormat("en-US").format(value)
    }

    return String(value)
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{formatColumnName(col)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col}>{formatValue(row[col], col)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
