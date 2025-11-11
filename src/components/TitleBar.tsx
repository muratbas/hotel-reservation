import React, { useState, useEffect } from 'react';

interface TitleBarProps {
  title?: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title = 'Otel Rezervasyon Sistemi' }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    checkMaximized();
  }, []);

  const checkMaximized = async () => {
    const maximized = await window.electronAPI.isWindowMaximized();
    setIsMaximized(maximized);
  };

  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = async () => {
    await window.electronAPI.maximizeWindow();
    checkMaximized();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className="sticky top-0 z-50 h-8 bg-sidebar-dark border-b border-border-color flex items-center justify-between px-4 select-none" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* Left side - App title */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg">hotel</span>
        <span className="text-text-secondary text-xs font-semibold tracking-wide">{title}</span>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="h-8 w-12 flex items-center justify-center hover:bg-hover-dark transition-colors"
          title="Küçült"
        >
          <span className="material-symbols-outlined text-text-secondary text-base">minimize</span>
        </button>

        {/* Maximize/Restore */}
        <button
          onClick={handleMaximize}
          className="h-8 w-12 flex items-center justify-center hover:bg-hover-dark transition-colors"
          title={isMaximized ? "Geri Al" : "Büyüt"}
        >
          <span className="material-symbols-outlined text-text-secondary text-base">
            {isMaximized ? 'filter_none' : 'crop_square'}
          </span>
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="h-8 w-12 flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Kapat"
        >
          <span className="material-symbols-outlined text-text-secondary hover:text-white text-base">close</span>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;

