"use client"

import { useQuery } from "@tanstack/react-query"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  Briefcase,
  Building2,
  Mail,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react"
import Link from "next/link"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface Employee {
  id: number
  emp_code: string
  name: string
  photo: string
  email: string
  emp_designation: string
  emp_department: string
  access: number
}

async function fetchEmployees(): Promise<Employee[]> {
  const response = await fetch(`/api/employees`)
  if (!response.ok) {
    throw new Error("Failed to fetch employees")
  }
  return response.json()
}

function EmployeeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

class ImageCacheManager {
  private cache: Map<string, string> = new Map()
  private loading: Map<string, Promise<string>> = new Map()

  async getImage(url: string): Promise<string> {
    // Return cached image if available
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    // Return existing promise if already loading
    if (this.loading.has(url)) {
      return this.loading.get(url)!
    }

    // Start loading the image
    const loadPromise = this.loadImage(url)
    this.loading.set(url, loadPromise)

    try {
      const blobUrl = await loadPromise
      this.cache.set(url, blobUrl)
      this.loading.delete(url)
      return blobUrl
    } catch (error) {
      this.loading.delete(url)
      throw error
    }
  }

  private async loadImage(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to load image")
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error(`Failed to cache image: ${url}`, error)
      // Return original URL as fallback
      return url
    }
  }

  clear() {
    // Revoke all blob URLs to free memory
    this.cache.forEach((blobUrl) => {
      if (blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl)
      }
    })
    this.cache.clear()
    this.loading.clear()
  }
}

// Create singleton instance
const imageCache = new ImageCacheManager()

function LazyAvatar({
  src,
  alt,
  fallback,
  access,
}: {
  src: string
  alt: string
  fallback: string
  access: number
}) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [cachedSrc, setCachedSrc] = useState<string | null>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = imgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: "100px",
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (shouldLoad && src && !cachedSrc) {
      imageCache.getImage(src).then(setCachedSrc).catch(console.error)
    }
  }, [shouldLoad, src, cachedSrc])

  return (
    <div ref={imgRef} className="relative shrink-0">
      <Avatar className="h-20 w-20 border-2 border-border group-hover:border-primary transition-colors">
        {cachedSrc ? (
          <img
            src={cachedSrc || "/placeholder.svg"}
            alt={alt}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
          {fallback}
        </AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-1 -right-1">
        {access === 1 ? (
          <div
            className="h-4 w-4 rounded-full bg-green-500 border-2 border-background"
            title="Active"
          />
        ) : (
          <div
            className="h-4 w-4 rounded-full bg-gray-400 border-2 border-background"
            title="Inactive"
          />
        )}
      </div>
    </div>
  )
}

const EmployeeCard = memo(({ employee }: { employee: Employee }) => {
  const handleCopyEmail = (e: React.MouseEvent, email: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(email).then(() => {
      toast.success("Email copied to clipboard")
    })
  }

  return (
    <Link href={`/app/employees/${employee.id}`}>
      <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <LazyAvatar
              src={`http://intranet.bfginternational.com:88/storage/employee/${employee.photo}`}
              alt={employee.name}
              fallback={employee.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
              access={employee.access}
            />

            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {employee.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {employee.emp_code}
                </p>
              </div>

              <div className="space-y-2">
                {employee.emp_designation && (
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground line-clamp-1 flex-1">
                      {employee.emp_designation}
                    </span>
                  </div>
                )}
                {employee.emp_department && (
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground line-clamp-1 flex-1">
                      {employee.emp_department}
                    </span>
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(e, employee.email)}
                      className="text-muted-foreground hover:text-primary transition-colors line-clamp-1 flex-1 underline-offset-2 hover:underline text-left"
                      title={employee.email}
                    >
                      {employee.email}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
})

EmployeeCard.displayName = "EmployeeCard"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>(["active"])

  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  })

  useEffect(() => {
    return () => {
      imageCache.clear()
    }
  }, [])

  const employeesWithSearchText = useMemo(() => {
    return employees.map((employee: Employee) => ({
      ...employee,
      searchText: [
        employee.name,
        employee.emp_code,
        employee.email,
        employee.emp_designation,
        employee.emp_department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }))
  }, [employees])

  const departments = useMemo(() => {
    const uniqueDepts = new Set(
      employees
        .map((e) => e.emp_department)
        .filter((dept) => dept && dept.trim() !== "")
    )
    return Array.from(uniqueDepts).sort()
  }, [employees])

  const filteredEmployees = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase().trim()

    return employeesWithSearchText.filter((employee) => {
      if (statusFilter.length > 0) {
        const hasActiveFilter = statusFilter.includes("active")
        const hasInactiveFilter = statusFilter.includes("inactive")
        const isActive = employee.access === 1

        if (
          !((hasActiveFilter && isActive) || (hasInactiveFilter && !isActive))
        ) {
          return false
        }
      }

      if (
        departmentFilter.length > 0 &&
        !departmentFilter.includes(employee.emp_department)
      ) {
        return false
      }

      if (query) {
        return employee.searchText.includes(query)
      }

      return true
    })
  }, [
    employeesWithSearchText,
    debouncedSearchQuery,
    departmentFilter,
    statusFilter,
  ])

  const parentRef = useRef<HTMLDivElement>(null)

  const getColumnCount = useCallback(() => {
    if (typeof window === "undefined") return 3
    const width = window.innerWidth
    if (width < 768) return 1
    if (width < 1024) return 2
    return 3
  }, [])

  const [columns, setColumns] = useState(getColumnCount)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => setColumns(getColumnCount())
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [getColumnCount])

  const rows = Math.ceil(filteredEmployees.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240,
    overscan: 5,
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold">
            Error loading employees
          </div>
          <p className="text-muted-foreground mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
              {searchQuery !== debouncedSearchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {(departmentFilter.length > 0 ||
                    statusFilter.length === 0 ||
                    statusFilter.length === 2) && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1.5 py-0.5 text-xs"
                    >
                      {departmentFilter.length +
                        (statusFilter.length !== 1 ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("active")}
                  onCheckedChange={(checked) => {
                    setStatusFilter((prev) =>
                      checked
                        ? [...prev, "active"]
                        : prev.filter((s) => s !== "active")
                    )
                  }}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("inactive")}
                  onCheckedChange={(checked) => {
                    setStatusFilter((prev) =>
                      checked
                        ? [...prev, "inactive"]
                        : prev.filter((s) => s !== "inactive")
                    )
                  }}
                >
                  Inactive
                </DropdownMenuCheckboxItem>

                {departments.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Department</DropdownMenuLabel>
                    {departments.map((dept) => (
                      <DropdownMenuCheckboxItem
                        key={dept}
                        checked={departmentFilter.includes(dept)}
                        onCheckedChange={(checked) => {
                          setDepartmentFilter((prev) =>
                            checked
                              ? [...prev, dept]
                              : prev.filter((d) => d !== dept)
                          )
                        }}
                      >
                        {dept}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div
        ref={parentRef}
        className="container mx-auto px-4 py-8 flex-1 overflow-scroll"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <EmployeeCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-muted-foreground">
              {searchQuery ||
              departmentFilter.length > 0 ||
              statusFilter.length !== 1
                ? "Try adjusting your search or filters"
                : "No employees to display"}
            </p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns
              const employeesInRow = filteredEmployees.slice(
                startIndex,
                startIndex + columns
              )

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {employeesInRow.map((employee) => (
                      <EmployeeCard key={employee.id} employee={employee} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
