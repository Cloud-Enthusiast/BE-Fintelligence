
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IndianRupeeIcon } from 'lucide-react';

interface SliderWithInputProps {
  label: string;
  icon: React.ReactNode;
  name: string;
  value: number;
  tempValue: string;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onSliderChange: (name: string, value: number[]) => void;
  onInputChange: (name: string, value: string, min: number, max: number) => void;
  onBlur: (name: string, min: number, max: number) => void;
  showCurrencyIcon?: boolean;
}

const SliderWithInput = ({
  label,
  icon,
  name,
  value,
  tempValue,
  min,
  max,
  step,
  formatValue,
  onSliderChange,
  onInputChange,
  onBlur,
  showCurrencyIcon = true
}: SliderWithInputProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-3 items-center">
          {icon}
          <Label className="text-sm font-medium">{label}</Label>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider 
            value={[value]} 
            min={min} 
            max={max} 
            step={step} 
            onValueChange={value => onSliderChange(name, value)} 
            className="w-full" 
          />
          <div className="flex justify-between mt-1 text-sm text-gray-500">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        </div>
        <div className="relative w-32">
          {showCurrencyIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IndianRupeeIcon className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <Input
            type="text"
            value={tempValue}
            onChange={(e) => onInputChange(name, e.target.value, min, max)}
            onBlur={() => onBlur(name, min, max)}
            className={`${showCurrencyIcon ? 'pl-8' : 'pl-3'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default SliderWithInput;
