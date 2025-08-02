'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Car, Plus, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

interface NavigationProps {
  showAddButton?: boolean;
  className?: string;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: '車牌查詢',
    icon: Search,
    description: '快速查詢車輛資訊'
  },
  {
    href: '/apply',
    label: '車輛申請',
    icon: Plus,
    description: '自助申請車輛停車權限'
  },
  {
    href: '/membership/apply',
    label: '月租申請',
    icon: Car,
    description: '申請月租車位'
  },
  {
    href: '/force-write',
    label: '🔥 強制寫入',
    icon: Settings,
    description: '測試強制寫入 Ragic 資料庫'
  },
  {
    href: '/manage',
    label: '車輛管理',
    icon: Settings,
    description: '完整的車輛資料管理系統'
  },
  {
    href: '/dashboard',
    label: '儀錶板',
    icon: BarChart3,
    description: '統計分析與報表'
  },
  {
    href: '/search-test',
    label: '搜尋測試',
    icon: Search,
    description: '測試子序列模糊搜尋功能'
  },
  {
    href: '/test-new',
    label: '功能測試',
    icon: Settings,
    description: '測試所有新功能'
  }
];

export function Navigation({ showAddButton = true, className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('bg-white border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和主導航 */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/"
              className="flex items-center space-x-2"
            >
              <Car className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                車牌查詢系統
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    title={item.description}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右側操作按鈕 */}
          <div className="flex items-center space-x-4">
            {showAddButton && (
              <Link
                href="/apply"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>車輛申請</span>
              </Link>
            )}
            
            {/* 移動端下拉菜單 */}
            <div className="md:hidden">
              <select
                value={pathname}
                onChange={(e) => {
                  if (e.target.value) {
                    window.location.href = e.target.value;
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {navItems.map((item) => (
                  <option key={item.href} value={item.href}>
                    {item.label}
                  </option>
                ))}
                <option value="/apply">車輛申請</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// 面包屑導航
interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex mb-6', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="text-gray-400 mr-2">/</span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// 頁面標題組件
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-gray-600">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// 側邊欄導航
interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-64 bg-white border-r border-gray-200 h-full', className)}>
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5" />
                <div>
                  <div>{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
          
          <hr className="my-4" />
          
          <Link
            href="/add"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-green-700 hover:text-green-900 hover:bg-green-50 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <div>
              <div>新增車牌</div>
              <div className="text-xs text-gray-500 mt-1">
                申請新的車輛記錄
              </div>
            </div>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
