'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, File } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadZoneProps {
  onFilesChange: (files: File[]) => void
  accept?: string
  maxFiles?: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FileUploadZone({
  onFilesChange,
  accept,
  maxFiles = 10,
}: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (incoming: File[]) => {
      setSelectedFiles((prev) => {
        const combined = [...prev, ...incoming].slice(0, maxFiles)
        onFilesChange(combined)
        return combined
      })
    },
    [maxFiles, onFilesChange]
  )

  function removeFile(index: number) {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index)
      onFilesChange(next)
      return next
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    addFiles(files)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:bg-muted/50',
        ].join(' ')}
      >
        <Upload className="w-6 h-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Drag &amp; drop files here, or{' '}
          <span className="text-foreground font-medium">click to browse</span>
        </p>
        {maxFiles > 1 && (
          <p className="text-xs text-muted-foreground">Up to {maxFiles} files</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <ul className="space-y-1.5">
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
            >
              <File className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatBytes(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeFile(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
