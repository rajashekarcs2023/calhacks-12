"use client"

import { useRef } from "react"
import { MapPin } from "lucide-react"

interface CityMapProps {
  data: any[]
}

export function CityMap({ data }: CityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  // Filter data to only include items with valid coordinates
  const geoData = data.filter((item) => item.lat && item.lng)

  if (geoData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">No location data available</p>
      </div>
    )
  }

  // Calculate center point
  const centerLat = geoData.reduce((sum, item) => sum + item.lat, 0) / geoData.length
  const centerLng = geoData.reduce((sum, item) => sum + item.lng, 0) / geoData.length

  return (
    <div className="space-y-4">
      {/* Static map placeholder with markers */}
      <div className="relative h-[300px] bg-muted rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 mx-auto text-primary" />
            <p className="text-sm font-medium">
              {geoData.length} location{geoData.length !== 1 ? "s" : ""} found
            </p>
            <p className="text-xs text-muted-foreground">
              Center: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Location list */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {geoData.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {item.type || "Location"} - {item.district || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
