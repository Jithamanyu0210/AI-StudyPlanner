import { useApp } from '../context/AppContext';

export default function SyncIndicator() {
  const { syncing, isOnline } = useApp();

  if (syncing) {
    return (
      <span title="Syncing to cloud..." style={{
        fontSize: 11, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
        Syncing
      </span>
    );
  }

  return (
    <span title={isOnline ? 'Data synced to MongoDB' : 'Offline — saved locally'} style={{
      fontSize: 11,
      color: isOnline ? '#10b981' : '#f59e0b',
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {isOnline ? '☁️ Synced' : '💾 Local'}
    </span>
  );
}
