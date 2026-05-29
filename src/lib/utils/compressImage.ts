// ============================================
// Image Compression Utility
// Path: src/lib/utils/compressImage.ts
// Compresses images client-side before upload
// Max: 1200px wide, 80% quality, ~200-400KB
// Saves 70-80% storage vs raw uploads
// ============================================

export interface CompressOptions {
  maxWidth?:   number  // default 1200
  maxHeight?:  number  // default 900
  quality?:    number  // default 0.82 (82%)
  maxSizeMB?:  number  // default 5MB input limit
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<{ file: File; originalSize: number; compressedSize: number; ratio: number }> {
  const {
    maxWidth  = 1200,
    maxHeight = 900,
    quality   = 0.82,
    maxSizeMB = 5,
  } = options

  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    throw new Error(`Image too large. Maximum size is ${maxSizeMB}MB.`)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return }

          const compressed = new File([blob], file.name, { type: 'image/jpeg' })
          resolve({
            file:           compressed,
            originalSize:   file.size,
            compressedSize: compressed.size,
            ratio:          Math.round((1 - compressed.size / file.size) * 100),
          })
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

// ── Upload to Supabase Storage ───────────────
export async function uploadPropertyPhoto(
  supabase: any,
  file: File,
  ownerId: string
): Promise<string> {
  // Compress first
  let uploadFile = file
  try {
    const { file: compressed, ratio } = await compressImage(file)
    uploadFile = compressed
    console.log(`Compressed by ${ratio}%`)
  } catch {
    // Use original if compression fails
  }

  const ext      = 'jpg'
  const fileName = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('property-photos')
    .upload(fileName, uploadFile, { contentType: 'image/jpeg', upsert: false })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('property-photos')
    .getPublicUrl(fileName)

  return publicUrl
}