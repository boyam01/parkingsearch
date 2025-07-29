'use client';

import React from 'react';
import { Phone, Calendar, Clock, User, Building, Car, Palette } from 'lucide-react';
import { VehicleRecord, IDENTITY_TYPES, VEHICLE_TYPES, APPROVAL_STATUS } from '@/types/vehicle';
import { cn, formatDate, formatTime, formatPhone, getRelativeTime } from '@/lib/utils';

export interface VehicleCardProps {
  vehicle: VehicleRecord;
  onClick?: (vehicle: VehicleRecord) => void;
  className?: string;
  showDetails?: boolean;
  highlight?: string;
}

export function VehicleCard({
  vehicle,
  onClick,
  className,
  showDetails = true,
  highlight
}: VehicleCardProps) {
  const identityConfig = IDENTITY_TYPES[vehicle.identityType as keyof typeof IDENTITY_TYPES] || IDENTITY_TYPES.visitor;
  const vehicleConfig = VEHICLE_TYPES[vehicle.vehicleType as keyof typeof VEHICLE_TYPES] || VEHICLE_TYPES.other;
  const statusConfig = APPROVAL_STATUS[vehicle.approvalStatus];

  const handleClick = () => {
    if (onClick) {
      onClick(vehicle);
    }
  };

  const highlightText = (text: string) => {
    if (!highlight) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200',
        'hover:shadow-md hover:border-gray-300',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {/* 標題列 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* 車型圖示 */}
          <div className="text-2xl" title={vehicleConfig.label}>
            {vehicleConfig.icon}
          </div>
          
          {/* 車牌號碼 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {highlightText(vehicle.plate)}
            </h3>
            <p className="text-sm text-gray-600">
              {vehicleConfig.label}
            </p>
          </div>
        </div>

        {/* 審核狀態 */}
        <span
          className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            statusConfig.color
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* 申請人資訊 */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {highlightText(vehicle.applicantName)}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded',
              identityConfig.color
            )}
          >
            {identityConfig.label}
          </span>
        </div>

        {vehicle.contactPhone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <a
              href={`tel:${vehicle.contactPhone}`}
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {formatPhone(vehicle.contactPhone)}
            </a>
          </div>
        )}

        {vehicle.department && (
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {highlightText(vehicle.department)}
            </span>
          </div>
        )}
      </div>

      {/* 詳細資訊 */}
      {showDetails && (
        <div className="space-y-2 text-sm text-gray-600">
          {/* 車輛資訊 */}
          {(vehicle.brand || vehicle.color) && (
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-gray-400" />
              <span>
                {vehicle.brand && highlightText(vehicle.brand)}
                {vehicle.brand && vehicle.color && ' • '}
                {vehicle.color && (
                  <span className="flex items-center space-x-1">
                    <Palette className="w-3 h-3" />
                    <span>{highlightText(vehicle.color)}</span>
                  </span>
                )}
              </span>
            </div>
          )}

          {/* 申請日期 */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {formatDate(vehicle.applicationDate)}
              <span className="text-gray-500 ml-1">
                ({getRelativeTime(vehicle.applicationDate)})
              </span>
            </span>
          </div>

          {/* 到訪時間 */}
          {vehicle.visitTime && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{formatTime(vehicle.visitTime)}</span>
            </div>
          )}

          {/* 備註 */}
          {vehicle.notes && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <strong>備註：</strong>
              {highlightText(vehicle.notes)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 車輛卡片骨架載入元件
export function VehicleCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      <div className="animate-pulse">
        {/* 標題列 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div>
              <div className="h-6 bg-gray-300 rounded w-24 mb-1"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>

        {/* 申請人資訊 */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>

        {/* 詳細資訊 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-28"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 車輛卡片網格元件
export interface VehicleGridProps {
  vehicles: VehicleRecord[];
  onVehicleClick?: (vehicle: VehicleRecord) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  highlight?: string;
  className?: string;
  cardClassName?: string;
}

export function VehicleGrid({
  vehicles,
  onVehicleClick,
  isLoading = false,
  emptyMessage = '沒有找到相符的車輛記錄',
  highlight,
  className,
  cardClassName
}: VehicleGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <VehicleCardSkeleton key={index} className={cardClassName} />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onClick={onVehicleClick}
          highlight={highlight}
          className={cardClassName}
        />
      ))}
    </div>
  );
}
