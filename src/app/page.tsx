import { Navigation } from '@/components/Navigation';
import { VehicleSearchPage } from '@/components/VehicleSearchPage';
import RealtimeStatus from '@/components/RealtimeStatus';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <RealtimeStatus />
      <div className="py-8 px-4">
        <VehicleSearchPage />
      </div>
    </main>
  );
}
