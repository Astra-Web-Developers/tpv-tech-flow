import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ConfigurableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  allowCustom?: boolean;
}

export const ConfigurableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  allowCustom = true,
}: ConfigurableSelectProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    // Si el valor actual no está en las opciones, mostrar input personalizado
    if (value && !options.includes(value)) {
      setShowCustomInput(true);
      setCustomValue(value);
    }
  }, [value, options]);

  const handleSelectChange = (newValue: string) => {
    if (newValue === "__custom__") {
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      setShowCustomInput(false);
      onChange(newValue);
    }
  };

  const handleCustomSave = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      setShowCustomInput(false);
    }
  };

  if (showCustomInput) {
    return (
      <div className="flex gap-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Valor personalizado..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCustomSave();
            }
          }}
        />
        <Button onClick={handleCustomSave} size="sm">
          OK
        </Button>
        <Button
          onClick={() => {
            setShowCustomInput(false);
            setCustomValue("");
          }}
          variant="outline"
          size="sm"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        {allowCustom && (
          <SelectItem value="__custom__">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Valor personalizado
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};
