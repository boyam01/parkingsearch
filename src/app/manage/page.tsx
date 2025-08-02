'use client';

import { Navigation } from '@/components/Navigation';
import { VehicleManagementPage } from '@/components/VehicleManagementPage';
import RealtimeStatus from '@/components/RealtimeStatus';

export default function ManageVehiclesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <RealtimeStatus />
      <div className="py-8">
        <VehicleManagementPage />
      </div>
    </main>
  );
}
