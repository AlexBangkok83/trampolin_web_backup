import { Bell, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Header({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
  return (
    <header className="relative z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white shadow-sm lg:justify-end">
      <div className="flex items-center px-4 sm:px-6 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:justify-end">
        <div className="w-full max-w-lg lg:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Input
              id="search"
              name="search"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              placeholder="Search"
              type="search"
            />
          </div>
        </div>
        <div className="ml-4 flex items-center gap-4 md:ml-6">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </Button>

          {/* Profile dropdown */}
          <div className="relative ml-3">
            <div>
              <button
                type="button"
                className="flex max-w-xs items-center rounded-full bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                id="user-menu"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                  <span className="font-medium text-indigo-600">TU</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
