import { Button, ButtonProps } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { ReactNode } from 'react';

interface RefreshButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: () => void;
  isRefreshing?: boolean;
  children?: ReactNode;
}

export function RefreshButton({
  onClick,
  isRefreshing = false,
  children,
  size = 'icon',
  variant = 'ghost',
  className = '',
  ...props
}: RefreshButtonProps) {
  const hasChildren = !!children;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isRefreshing}
      className={`${className} ${isRefreshing ? 'animate-spin' : ''}`}
      aria-label={hasChildren ? undefined : 'Refresh data'}
      {...props}
    >
      <RotateCw className={`h-4 w-4 ${hasChildren ? 'mr-2' : ''}`} />
      {children}
    </Button>
  );
}
