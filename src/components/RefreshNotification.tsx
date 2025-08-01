'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RefreshNotificationProps {
  isVisible: boolean;
  status: 'loading' | 'success' | 'error';
  message?: string;
  duration?: number;
  onHide?: () => void;
}

export function RefreshNotification({
  isVisible,
  status,
  message,
  duration = 3000,
  onHide
}: RefreshNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      if (status === 'success' || status === 'error') {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(() => onHide?.(), 300); // 動畫結束後才隱藏
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, status, duration, onHide]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getDefaultMessage = () => {
    switch (status) {
      case 'loading':
        return '正在重新整理資料...';
      case 'success':
        return '資料重新整理完成';
      case 'error':
        return '重新整理失敗';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={cn(
          'flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg',
          'transform transition-all duration-300 ease-out',
          show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
          getStatusColor()
        )}
      >
        {getIcon()}
        <span className="text-sm font-medium">
          {message || getDefaultMessage()}
        </span>
      </div>
    </div>
  );
}

// Hook 用於管理重新整理通知
export function useRefreshNotification() {
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    status: 'loading' | 'success' | 'error';
    message?: string;
  }>({
    isVisible: false,
    status: 'loading'
  });

  const showLoading = (message?: string) => {
    setNotification({
      isVisible: true,
      status: 'loading',
      message
    });
  };

  const showSuccess = (message?: string) => {
    setNotification({
      isVisible: true,
      status: 'success',
      message
    });
  };

  const showError = (message?: string) => {
    setNotification({
      isVisible: true,
      status: 'error',
      message
    });
  };

  const hide = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    notification,
    showLoading,
    showSuccess,
    showError,
    hide
  };
}
