'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChartConfig, Theme } from '@/contexts/ChartConfigContext';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function ChartConfigPanel() {
  const {
    theme,
    animation,
    animationDuration,
    showLegend,
    legendPosition,
    showGrid,
    showTooltips,
    borderWidth,
    borderRadius,
    updateConfig,
  } = useChartConfig();

  const [isOpen, setIsOpen] = useState(false);

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
  ];

  const legendPositions = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Chart Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 font-medium">Chart Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme" className="mb-1 block text-sm font-medium">
                  Theme
                </Label>
                <Select
                  value={theme}
                  onValueChange={(value: Theme) => updateConfig({ theme: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="animation" className="text-sm font-medium">
                    Animation
                  </Label>
                  <Switch
                    id="animation"
                    checked={animation}
                    onCheckedChange={(checked) => updateConfig({ animation: checked })}
                  />
                </div>
                {animation && (
                  <div className="mt-2">
                    <Label className="text-muted-foreground text-xs">
                      Animation Duration: {animationDuration}ms
                    </Label>
                    <Slider
                      value={[animationDuration]}
                      onValueChange={([value]) => updateConfig({ animationDuration: value })}
                      min={0}
                      max={3000}
                      step={100}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLegend" className="text-sm font-medium">
                    Show Legend
                  </Label>
                  <Switch
                    id="showLegend"
                    checked={showLegend}
                    onCheckedChange={(checked) => updateConfig({ showLegend: checked })}
                  />
                </div>
                {showLegend && (
                  <div>
                    <Label htmlFor="legendPosition" className="text-muted-foreground text-xs">
                      Legend Position
                    </Label>
                    <Select
                      value={legendPosition}
                      onValueChange={(value: any) => updateConfig({ legendPosition: value })}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {legendPositions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showGrid" className="text-sm font-medium">
                    Show Grid
                  </Label>
                  <Switch
                    id="showGrid"
                    checked={showGrid}
                    onCheckedChange={(checked) => updateConfig({ showGrid: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showTooltips" className="text-sm font-medium">
                    Show Tooltips
                  </Label>
                  <Switch
                    id="showTooltips"
                    checked={showTooltips}
                    onCheckedChange={(checked) => updateConfig({ showTooltips: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Border Width: {borderWidth}px</Label>
                  <Slider
                    value={[borderWidth]}
                    onValueChange={([value]) => updateConfig({ borderWidth: value })}
                    min={0}
                    max={10}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Border Radius: {borderRadius}px</Label>
                  <Slider
                    value={[borderRadius]}
                    onValueChange={([value]) => updateConfig({ borderRadius: value })}
                    min={0}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
