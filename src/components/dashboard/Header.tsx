import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  return (
    <header className="relative z-10 flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-colors lg:hidden">
      <div className="flex items-center px-4 sm:px-6">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}