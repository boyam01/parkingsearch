import { Navigation } from '@/components/Navigation';
import { VehicleSearchPage } from '@/components/VehicleSearchPage';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <VehicleSearchPage />
      </div>
    </main>
  );
}
