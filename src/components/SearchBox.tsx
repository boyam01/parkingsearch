'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  showClearButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SearchBox({
  value,
  onChange,
  onSearch,
  placeholder = '輸入車牌號碼或申請人姓名...',
  isLoading = false,
  disabled = false,
  autoFocus = false,
  className,
  showClearButton = true,
  size = 'md'
}: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-base px-4',
    lg: 'h-12 text-lg px-5'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex items-center w-full rounded-lg border bg-white transition-all duration-200',
          sizeClasses[size],
          isFocused
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
        )}
      >
        {/* 搜尋圖示 */}
        <div className="flex items-center justify-center pl-3">
          {isLoading ? (
            <Loader2 className="animate-spin text-gray-400" size={iconSizes[size]} />
          ) : (
            <Search className="text-gray-400" size={iconSizes[size]} />
          )}
        </div>

        {/* 輸入框 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            'flex-1 bg-transparent border-0 outline-none placeholder-gray-500',
            'disabled:cursor-not-allowed disabled:text-gray-500',
            size === 'sm' && 'px-2',
            size === 'md' && 'px-3',
            size === 'lg' && 'px-4'
          )}
          autoComplete="off"
          spellCheck="false"
        />

        {/* 清除按鈕 */}
        {showClearButton && value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center pr-3 text-gray-400 hover:text-gray-600',
              'transition-colors duration-150 disabled:cursor-not-allowed'
            )}
            aria-label="清除搜尋"
          >
            <X size={iconSizes[size]} />
          </button>
        )}
      </div>

      {/* 隱藏的提交按鈕，用於表單提交 */}
      <button type="submit" className="sr-only" tabIndex={-1}>
        搜尋
      </button>
    </form>
  );
}

// 搜尋建議元件
export interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isVisible: boolean;
  className?: string;
}

export function SearchSuggestions({
  suggestions,
  onSelect,
  isVisible,
  className
}: SearchSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 z-50 mt-1',
        'bg-white border border-gray-200 rounded-lg shadow-lg',
        'max-h-60 overflow-y-auto',
        className
      )}
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={cn(
            'w-full px-4 py-2 text-left text-sm',
            'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
            'first:rounded-t-lg last:rounded-b-lg',
            'border-b border-gray-100 last:border-b-0'
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

// 搜尋統計資訊元件
export interface SearchStatsProps {
  totalResults: number;
  searchTime: number;
  query: string;
  className?: string;
}

export function SearchStats({
  totalResults,
  searchTime,
  query,
  className
}: SearchStatsProps) {
  if (!query) return null;

  return (
    <div className={cn('text-sm text-gray-600', className)}>
      找到 <span className="font-semibold">{totalResults}</span> 筆結果
      {searchTime > 0 && (
        <>
          （<span className="font-mono">{searchTime.toFixed(1)}</span> 毫秒）
        </>
      )}
    </div>
  );
}
