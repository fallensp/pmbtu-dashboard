import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Package,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Pot Health',
    href: '/pot-health',
    icon: Flame,
    children: [
      { name: 'Potline Overview', href: '/pot-health' },
      { name: 'Alert Management', href: '/pot-health/alerts' },
    ],
  },
  {
    name: 'Production v1',
    href: '/production',
    icon: Package,
    children: [
      { name: 'Order Queue', href: '/production' },
      { name: 'Tapping Arrangement', href: '/production/arrangement' },
      { name: 'Pot Selection', href: '/production/select-pots' },
      { name: 'Schedule', href: '/production/schedule' },
    ],
  },
  {
    name: 'Production v2',
    href: '/production-v2',
    icon: Sparkles,
    badge: 'NEW',
    children: [
      { name: 'Daily Tapping Planner', href: '/production-v2' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Pot Health', 'Production v1', 'Production v2']);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-slate-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">PMBTU AI</h1>
          <p className="text-xs text-slate-400">Operations Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-1 bg-blue-600 text-xs px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {expandedItems.includes(item.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.name) && (
                    <ul className="mt-1 ml-4 space-y-1 border-l border-slate-700 pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavLink
                            to={child.href}
                            className={({ isActive: active }) =>
                              cn(
                                'block rounded-lg px-3 py-2 text-sm transition-colors',
                                active
                                  ? 'bg-blue-600 text-white'
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              )
                            }
                          >
                            {child.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive: active }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
