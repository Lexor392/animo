import type { DropdownOption } from '@/shared/types/ui.types';

export interface DropdownProps {
  label: string;
  onSelect: (value: string) => void;
  options: DropdownOption[];
}
