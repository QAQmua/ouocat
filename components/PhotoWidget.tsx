import React, { useState, useRef, useEffect } from 'react';

export const DEFAULT_PHOTO_URL =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80';

interface PhotoWidgetProps {
  id?: string;
  isDarkMode?: boolean;
  isEditing?: boolean;
  currentPhotoUrl?: string;
  onPhotoChange?: (newUrl: string) => void;
}

export const PhotoWidget: React.FC<PhotoWidgetProps> = ({
  id = 'photo-widget',
  isEditing = false,
  currentPhotoUrl,
  onPhotoChange,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    return currentPhotoUrl || localStorage.getItem('ios_photo_widget_url') || DEFAULT_PHOTO_URL;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentPhotoUrl && currentPhotoUrl !== photoUrl) {
      setPhotoUrl(currentPhotoUrl);
    }
  }, [currentPhotoUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setPhotoUrl(dataUrl);
          try {
            localStorage.setItem('ios_photo_widget_url', dataUrl);
          } catch {
            // ignore storage quota error
          }
          if (onPhotoChange) {
            onPhotoChange(dataUrl);
          }
        }
      };
      reader.readAsDataURL(file);
    }
    // 重置 input 允许重复选同一张图
    e.target.value = '';
  };

  return (
    <div
      id={id}
      onClick={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          fileInputRef.current?.click();
        }
      }}
      className={`w-full h-full relative rounded-[26px] overflow-hidden select-none group transition-all duration-200 ${
        !isEditing ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
      title="点击选择相册照片"
    >
      <img
        src={photoUrl}
        alt="相册"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        referrerPolicy="no-referrer"
        onError={() => setPhotoUrl(DEFAULT_PHOTO_URL)}
      />

      {/* 隐藏的本地相册/文件选择器，点击面板直接唤出 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default PhotoWidget;
