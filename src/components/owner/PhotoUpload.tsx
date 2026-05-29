// ============================================
// Photo Upload Component
// Path: src/components/owner/PhotoUpload.tsx
// - Drag & drop or click to upload
// - Auto-compresses before upload
// - Max 10 photos, 5MB each input
// - Shows preview + progress
// - Uploads to Supabase Storage
// ============================================

'use client'

import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Upload, X, Loader2, ImagePlus, AlertCircle } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface PhotoUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
  maxPhotos?: number
  bucket?: string
}

interface UploadingPhoto {
  id: string
  preview: string
  progress: number
  error?: string
}

export default function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 10,
  bucket = 'property-photos',
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState<UploadingPhoto[]>([])
  const [dragOver, setDragOver]   = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const remaining = maxPhotos - photos.length
    const toUpload  = Array.from(files).slice(0, remaining)

    for (const file of toUpload) {
      const id      = Math.random().toString(36).slice(2)
      const preview = URL.createObjectURL(file)

      setUploading(prev => [...prev, { id, preview, progress: 0 }])

      try {
        // Validate type
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed')
        }

        // Compress
        setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 30 } : u))
        const { file: compressed } = await compressImage(file, { maxWidth: 1200, maxHeight: 900, quality: 0.82, maxSizeMB: 5 })

        // Upload
        setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 60 } : u))
        const fileName = `${user.id}/${Date.now()}-${id}.jpg`

        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressed, { contentType: 'image/jpeg' })

        if (uploadErr) throw uploadErr

        // Get URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName)

        setUploading(prev => prev.map(u => u.id === id ? { ...u, progress: 100 } : u))

        // Add to photos
        onChange([...photos, publicUrl])

        // Remove from uploading after delay
        setTimeout(() => {
          setUploading(prev => prev.filter(u => u.id !== id))
          URL.revokeObjectURL(preview)
        }, 500)

      } catch (err: any) {
        setUploading(prev => prev.map(u =>
          u.id === id ? { ...u, error: err.message || 'Upload failed', progress: 0 } : u
        ))
      }
    }
  }

  const removePhoto = async (url: string) => {
    // Extract filename from URL
    const parts = url.split(`/${bucket}/`)
    if (parts.length > 1) {
      await supabase.storage.from(bucket).remove([parts[1]])
    }
    onChange(photos.filter(p => p !== url))
  }

  const removeUploading = (id: string) => {
    setUploading(prev => prev.filter(u => u.id !== id))
  }

  const atLimit = photos.length + uploading.length >= maxPhotos

  return (
    <div>
      {/* Upload area */}
      {!atLimit && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          style={{
            border: `2px dashed ${dragOver ? '#2C3A6B' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: 14, padding: '28px 20px',
            textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(44,58,107,0.03)' : '#fafafa',
            transition: 'all 0.2s', marginBottom: 16,
          }}
        >
          <ImagePlus size={28} color="#9ca3af" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
            Click to upload or drag & drop
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>
            JPG, PNG, WEBP · Max 5MB each · Up to {maxPhotos} photos
          </p>
          <p style={{ fontSize: 11, color: '#D4A843', marginTop: 6 }}>
            ✓ Auto-compressed for fast loading
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Photo grid */}
      {(photos.length > 0 || uploading.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>

          {/* Uploaded photos */}
          {photos.map((url, i) => (
            <div key={url} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', background: '#f3f4f6' }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {i === 0 && (
                <div style={{ position: 'absolute', bottom: 4, left: 4, background: '#2C3A6B', color: '#D4A843', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.1em' }}>
                  COVER
                </div>
              )}
              <button onClick={() => removePhoto(url)} style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}>
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Uploading photos */}
          {uploading.map(u => (
            <div key={u.id} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', background: '#f3f4f6' }}>
              <img src={u.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />

              {u.error ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', padding: 8 }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <p style={{ fontSize: 10, color: '#ef4444', textAlign: 'center', marginTop: 4 }}>{u.error}</p>
                </div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Loader2 size={20} color="#2C3A6B" style={{ animation: 'spin 0.8s linear infinite' }} />
                  <div style={{ width: '70%', height: 3, background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
                    <div style={{ width: `${u.progress}%`, height: '100%', background: '#2C3A6B', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              <button onClick={() => removeUploading(u.id)} style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
        {photos.length} / {maxPhotos} photos uploaded
        {photos.length > 0 && ' · First photo is the cover'}
      </p>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}