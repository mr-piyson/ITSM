"use client"

import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Heart,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react"
import Link from "next/link"
import { use } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Employee {
  id: number
  emp_id: string
  emp_code: string
  cpr: string
  name: string
  photo: string
  email: string
  mobile: string
  telephone: string
  emp_designation: string
  emp_department: string
  emp_location: string
  designation: string
  department: string
  date_of_joining: string
  date_of_birth: string
  left_date: string
  gender: string
  nationality: string
  address: string
  emergency_name: string
  emergency_number: string
  allergies: string
  diseases: string
  disabilities: string
  is_active: number
  emp_type: string
  supplier: string
  reporting_to: string
}

interface Attendance {
  person_id: string
  person_name: string
  card_no: string
  datetime: string
  device_ip: string
  device_model: string
  device_serial: string
}

async function fetchEmployee(id: string) {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_BASE_API}/api/employees.php?id=${id}`
  )
  if (!response.ok) {
    throw new Error("Failed to fetch employee")
  }
  return response.json()
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: string | null | undefined
}) {
  if (!value) return null

  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  )
}

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const {
    data: employee,
    isLoading: employeeLoading,
    error: employeeError,
  } = useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: async () => (await fetchEmployee(id))[0],
  })

  if (employeeError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-destructive">
          Error loading employee: {(employeeError as Error).message}
        </div>
      </div>
    )
  }

  if (employeeLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-40" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Employee not found</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Employee Details</h1>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-32 w-32 border-4 border-border">
              <AvatarImage
                src={`http://intranet.bfginternational.com:88/storage/employee/${employee.photo}`}
                alt={employee.name}
                style={{ objectFit: "cover" }}
              />
              <AvatarFallback className="text-3xl">
                {employee.name}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-muted-foreground mt-1">
                  {employee.emp_code} • {employee.emp_id}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {employee.is_active === 1 ? (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {employee.emp_type && (
                  <Badge variant="outline">{employee.emp_type}</Badge>
                )}
                {employee.gender && (
                  <Badge variant="outline">{employee.gender}</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {employee.emp_designation && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.emp_designation}</span>
                  </div>
                )}
                {employee.emp_department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.emp_department}</span>
                  </div>
                )}
                {employee.emp_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.emp_location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={Mail} label="Email" value={employee.email} />
            <DetailItem icon={Phone} label="Mobile" value={employee.mobile} />
            <DetailItem
              icon={Phone}
              label="Telephone"
              value={employee.telephone}
            />
            <DetailItem
              icon={MapPin}
              label="Address"
              value={employee.address}
            />
            <DetailItem
              icon={User}
              label="Nationality"
              value={employee.nationality}
            />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem icon={User} label="CPR" value={employee.cpr} />
            <DetailItem
              icon={Calendar}
              label="Date of Birth"
              value={
                employee.date_of_birth
                  ? new Date(employee.date_of_birth).toLocaleDateString()
                  : null
              }
            />
            <DetailItem
              icon={Calendar}
              label="Date of Joining"
              value={
                employee.date_of_joining
                  ? new Date(employee.date_of_joining).toLocaleDateString()
                  : null
              }
            />
            {employee.left_date && (
              <DetailItem
                icon={Calendar}
                label="Left Date"
                value={new Date(employee.left_date).toLocaleDateString()}
              />
            )}
            <DetailItem
              icon={Users}
              label="Reporting To"
              value={employee.reporting_to}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(employee.emergency_name || employee.emergency_number) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem
                icon={User}
                label="Name"
                value={employee.emergency_name}
              />
              <DetailItem
                icon={Phone}
                label="Phone"
                value={employee.emergency_number}
              />
            </CardContent>
          </Card>
        )}

        {/* Medical Information */}
        {(employee.allergies || employee.diseases || employee.disabilities) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem
                icon={AlertCircle}
                label="Allergies"
                value={employee.allergies}
              />
              <DetailItem
                icon={AlertCircle}
                label="Diseases"
                value={employee.diseases}
              />
              <DetailItem
                icon={AlertCircle}
                label="Disabilities"
                value={employee.disabilities}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
