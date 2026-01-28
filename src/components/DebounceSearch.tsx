"use client"

import { Search } from "lucide-react"
import { useEffect } from "react"

import { useDebounce } from "@/hooks/use-debounce"

import { Input } from "./ui/input"

type DebounceSearchProps = {
  delay?: number
  onDebouncedChange: (value: string) => void
  placeholder?: string
}

export function DebounceSearch({
  delay = 500,
  onDebouncedChange,
  placeholder = "Search...",
}: DebounceSearchProps) {
  const [value, setValue, debouncedValue] = useDebounce("", delay)

  // Notify parent whenever the debounced value changes
  useEffect(() => {
    onDebouncedChange(debouncedValue)
  }, [debouncedValue, onDebouncedChange])

  return (
    <>
      <div className="relative flex-1 ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, serial, owner..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pl-10"
        />
      </div>
    </>
  )
}
