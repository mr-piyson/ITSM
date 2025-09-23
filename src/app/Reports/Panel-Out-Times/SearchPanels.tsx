import { useState } from "react";
import { atom, useAtom } from "jotai";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, SearchIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initData, filteredData, ReportData } from "./atoms";

const searchOptions: { value: keyof ReportData; label: string }[] = [
  { value: "panel_serial", label: "Panel Serial" },
];

interface ImportDialogProps {
  children?: React.ReactNode;
}

export function SearchPanels(
  props: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
) {
  return (
    <SearchDialog>
      <Button {...props}>
        <SearchIcon />
        Search
      </Button>
    </SearchDialog>
  );
}

export function SearchDialog(props: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchBy, setSearchBy] = useState<keyof ReportData>();
  const [searchQuery, setSearchQuery] = useState("");
  const [initPanels] = useAtom(initData);
  const [_, setPanels] = useAtom(filteredData);

  const handleSearch = () => {
    if (!searchBy || !searchQuery) {
      console.warn("Please select a search field and enter a query.");
      return;
    }
    const filteredData = searchReportDataByKey(
      initPanels,
      searchBy,
      searchQuery
    );
    setPanels(filteredData);
    setOpen(false);
  };

  function searchReportDataByKey(
    data: ReportData[],
    key: keyof ReportData,
    prompt: string
  ): ReportData[] {
    const searchSet = new Set(
      prompt
        .split("\n")
        .map((item) => item.trim().toLocaleUpperCase())
        .filter((item) => item.length > 0)
    );
    return data.filter((item) => {
      const value = item[key];
      if (typeof value === "string") {
        return searchSet.has(value);
      } else if (typeof value === "number") {
        return searchSet.has(String(value));
      }
      return false;
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Report Data</DialogTitle>
          <DialogDescription>
            Select a field to search by and enter your search criteria.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="search-field">Search By</Label>
            <Select
              value={searchBy as string | undefined}
              onValueChange={(value) => setSearchBy(value as keyof ReportData)}
            >
              <SelectTrigger id="search-field">
                <SelectValue placeholder="Select a field to search by" />
              </SelectTrigger>
              <SelectContent>
                {searchOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="search-query">Search Query</Label>
            <Textarea
              id="search-query"
              placeholder="Enter your search criteria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[200px] max-h-[200px] bg-muted"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
