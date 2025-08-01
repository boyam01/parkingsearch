import { Navigation } from '@/components/Navigation';
import MembershipApplication from '@/components/MembershipApplication';

export default function MembershipApplicationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">月租車申請</h1>
            <p className="text-gray-600 mt-2">
              申請月租車位，享受固定停車位和優惠價格
            </p>
          </div>
          
          <MembershipApplication />
        </div>
      </div>
    </main>
  );
}
