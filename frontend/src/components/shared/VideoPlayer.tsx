'use client';

import { useState } from 'react';
import type { VideoEmbed } from '@/types';

interface VideoPlayerProps {
  video: VideoEmbed;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  return match ? match[1] : null;
}

function getAparatId(url: string): string | null {
  const match = url.match(/aparat\.com\/v\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const source = video.source || 'upload';
  const youtubeId = source === 'youtube' ? getYouTubeId(video.url) : null;
  const aparatId = source === 'aparat' ? getAparatId(video.url) : null;

  return (
    <div className="relative">
      <div className="aspect-video bg-black rounded-xl overflow-hidden">
        {source === 'youtube' && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
            title={video.title || 'YouTube video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        ) : source === 'aparat' && aparatId ? (
          <iframe
            src={`https://www.aparat.com/video/video/embed/videohash/${aparatId}/vt/frame`}
            title={video.title || 'Aparat video'}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <video
            src={video.url}
            title={video.title}
            className="w-full h-full"
            controls
            playsInline
            preload="metadata"
            onLoadedData={() => setIsLoading(false)}
          >
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
          </video>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {video.title && (
        <h3 className="text-white font-bold mt-3 text-base">{video.title}</h3>
      )}

      <div className="flex items-center gap-2 mt-1">
        {source === 'youtube' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-600/20 text-red-400 rounded-full">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            یوتیوب
          </span>
        )}
        {source === 'aparat' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-600/20 text-purple-400 rounded-full">
            آپارات
          </span>
        )}
        {source === 'upload' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-600/20 text-blue-400 rounded-full">
            ویدیو
          </span>
        )}
        {video.duration && (
          <span className="text-xs text-gray-custom">{video.duration}</span>
        )}
      </div>
    </div>
  );
}
