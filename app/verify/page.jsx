// app/verify/page.tsx
import { Suspense } from 'react';
import VerifyContent from './VerifyContent';
import LoadingSkeleton from './LoadingSkeleton'; // Optional: create a nice loading UI

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VerifyContent />
    </Suspense>
  );
}