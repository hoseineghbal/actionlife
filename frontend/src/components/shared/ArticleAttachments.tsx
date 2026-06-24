import type { ArticleAttachment } from '@/types';

interface ArticleAttachmentsProps {
  attachments: ArticleAttachment[];
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType?: string): string {
  if (!mimeType) return '📄';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎬';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('text') || mimeType.includes('document')) return '📄';
  return '📄';
}

export default function ArticleAttachments({ attachments }: ArticleAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h2 className="text-lg font-bold text-white mb-4">فایل‌های پیوست</h2>
      <div className="space-y-2">
        {attachments.map((att, index) => (
          <a
            key={index}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-dark-light border border-white/10 rounded-xl hover:border-primary/50 transition-all group"
          >
            <span className="text-xl">{getFileIcon(att.mimeType)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate group-hover:text-primary transition-colors">
                {att.filename}
              </p>
              <p className="text-xs text-gray-custom">{formatFileSize(att.size)}</p>
            </div>
            <svg className="w-5 h-5 text-gray-custom group-hover:text-primary transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
