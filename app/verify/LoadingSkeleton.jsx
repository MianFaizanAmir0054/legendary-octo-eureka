// app/verify/LoadingSkeleton.tsx
export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ fontSize: '20px', color: '#666' }}>Loading verification page...</div>
    </div>
  );
}