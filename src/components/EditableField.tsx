"use client";

import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableFieldProps {
  label: string;
  field: string;
  value: string;
  isEditing: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export default function EditableField({
  label,
  field,
  value,
  isEditing,
  isAdmin,
  onEdit,
  onSave,
  onCancel,
}: EditableFieldProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSave(inputValue);
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
        {isAdmin && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={label}
            autoFocus
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => onSave(inputValue)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      )}
    </div>
  );
}
