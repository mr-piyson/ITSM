"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  Mail,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Employee {
  id: number;
  emp_code: string;
  name: string;
  photo: string;
  email: string;
  emp_designation: string;
  emp_department: string;
  access: number;
}

async function fetchEmployees(): Promise<Employee[]> {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_BASE_API}/api/employees.php`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch employees");
  }
  return response.json();
}

function EmployeeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
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
  );
}

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>(["active"]);

  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  // Extract unique departments from all employees
  const departments = useMemo(() => {
    const uniqueDepts = new Set(
      employees
        .map((e) => e.emp_department)
        .filter((dept) => dept && dept.trim() !== "")
    );
    return Array.from(uniqueDepts).sort();
  }, [employees]);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee: Employee) => {
      // Status filter - must pass if any status is selected
      const matchesStatus =
        statusFilter.length === 0 ||
        (statusFilter.includes("active") && employee.access === 1) ||
        (statusFilter.includes("inactive") && employee.access === 0);

      if (!matchesStatus) return false;

      // Department filter - must pass if any departments are selected
      const matchesDepartment =
        departmentFilter.length === 0 ||
        departmentFilter.includes(employee.emp_department);

      if (!matchesDepartment) return false;

      // Search filter - check multiple fields
      if (searchQuery.trim() === "") return true;

      const query = searchQuery.toLowerCase().trim();
      const searchableFields = [
        employee.name,
        employee.emp_code,
        employee.email,
        employee.emp_designation,
        employee.emp_department,
      ];

      return searchableFields.some(
        (field) => field && field.toLowerCase().includes(query)
      );
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const handleCopyEmail = (e: React.MouseEvent, email: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email).then(() => {
      toast.success("Email copied to clipboard");
    });
  };

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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                Team Directory
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {isLoading
                  ? "Loading employees..."
                  : `${filteredEmployees.length} of ${employees.length} employees`}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                    );
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
                    );
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
                          );
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

      <div className="container mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <Link href={`/app/employees/${employee.id}`} key={employee.id}>
                <Card className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group h-full">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-20 w-20 border-2 border-border group-hover:border-primary transition-colors">
                          <AvatarImage
                            src={`http://intranet.bfginternational.com:88/storage/employee/${employee.photo}`}
                            alt={employee.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                            {employee.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          {employee.access === 1 ? (
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
                              <Briefcase className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                              <span className="text-muted-foreground line-clamp-1 flex-1">
                                {employee.emp_designation}
                              </span>
                            </div>
                          )}
                          {employee.emp_department && (
                            <div className="flex items-start gap-2 text-sm">
                              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                              <span className="text-muted-foreground line-clamp-1 flex-1">
                                {employee.emp_department}
                              </span>
                            </div>
                          )}
                          {employee.email && (
                            <div className="flex items-start gap-2 text-sm">
                              <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
                              <button
                                onClick={(e) =>
                                  handleCopyEmail(e, employee.email)
                                }
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
