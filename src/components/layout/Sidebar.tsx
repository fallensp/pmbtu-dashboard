import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Package,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Pot Health',
    href: '/pot-health',
    icon: Activity,
    children: [
      { name: 'Potline Overview', href: '/pot-health' },
      { name: 'Alerts', href: '/pot-health/alerts' },
    ],
  },
  {
    name: 'Production',
    href: '/production',
    icon: Package,
    children: [
      { name: 'Order Queue', href: '/production' },
      { name: 'Tapping Arrangement', href: '/production/arrangement' },
      { name: 'Tapping Planner V2', href: '/production-v2' },
      { name: 'Schedule', href: '/production/schedule' },
    ],
  },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>('Pot Health');

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-slate-900 text-slate-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
            PM
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-white">PMBTU</span>
              <span className="text-xs text-slate-400">AI Operations</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <>
                <button
                  onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                  className={cn(
                    'flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    'hover:bg-slate-800 text-slate-300 hover:text-white',
                    expandedItem === item.name && 'bg-slate-800 text-white'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 transition-transform',
                          expandedItem === item.name && 'rotate-90'
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && expandedItem === item.name && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        end={child.href === '/pot-health' || child.href === '/production'}
                        className={({ isActive }) =>
                          cn(
                            'block px-3 py-2 text-sm rounded-lg transition-colors',
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          )
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.href}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 py-4 border-t border-slate-800 space-y-1">
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-slate-800 hover:bg-slate-800 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
