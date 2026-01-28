"use client"

import { useEffect, useRef } from "react"

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (qrRef.current && typeof window !== "undefined") {
      // Clear previous QR code
      qrRef.current.innerHTML = ""

      // Create QR code using a placeholder for now
      // In a real implementation, you'd use a QR code library like qrcode
      const qrPlaceholder = document.createElement("div")
      qrPlaceholder.style.width = `${size}px`
      qrPlaceholder.style.height = `${size}px`
      qrPlaceholder.style.backgroundColor = "#f3f4f6"
      qrPlaceholder.style.border = "2px solid #e5e7eb"
      qrPlaceholder.style.borderRadius = "8px"
      qrPlaceholder.style.display = "flex"
      qrPlaceholder.style.alignItems = "center"
      qrPlaceholder.style.justifyContent = "center"
      qrPlaceholder.style.fontSize = "14px"
      qrPlaceholder.style.color = "#6b7280"
      qrPlaceholder.style.textAlign = "center"
      qrPlaceholder.style.padding = "16px"
      qrPlaceholder.innerHTML = `QR Code<br/><small>for ${value}</small>`

      qrRef.current.appendChild(qrPlaceholder)
    }
  }, [value, size])

  return <div ref={qrRef} className="flex justify-center" />
}
