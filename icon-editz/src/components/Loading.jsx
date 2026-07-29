import React from 'react';
import Logo from './common/Logo';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="flex flex-col items-center gap-4">
        <Logo size="w-28 h-28" showText={false} />
        <div className="text-center">
          <p className="text-sm text-text-muted">Loading Icon Editz</p>
        </div>
      </div>
    </div>
  );
}
