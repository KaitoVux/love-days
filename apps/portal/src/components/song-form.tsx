'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Song, CreateSongInput, UpdateSongInput } from '@/types/song'

interface SongFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (song: CreateSongInput | UpdateSongInput) => void
  song?: Song
  mode: 'create' | 'edit'
}

export function SongForm({
  isOpen,
  onClose,
  onSubmit,
  song,
  mode,
}: SongFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration: '',
    genre: '',
    releaseYear: '',
  })

  useEffect(() => {
    if (mode === 'edit' && song) {
      setFormData({
        title: song.title,
        artist: song.artist,
        album: song.album || '',
        duration: song.duration?.toString() || '',
        genre: song.genre || '',
        releaseYear: song.releaseYear?.toString() || '',
      })
    } else {
      setFormData({
        title: '',
        artist: '',
        album: '',
        duration: '',
        genre: '',
        releaseYear: '',
      })
    }
  }, [mode, song, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const songData = {
      title: formData.title,
      artist: formData.artist,
      album: formData.album || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      genre: formData.genre || undefined,
      releaseYear: formData.releaseYear
        ? parseInt(formData.releaseYear)
        : undefined,
    }

    if (mode === 'edit' && song) {
      onSubmit({ id: song.id, ...songData })
    } else {
      onSubmit(songData)
    }

    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Song' : 'Edit Song'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill in the details to add a new song to your collection.'
              : 'Update the song details below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="artist" className="text-right">
                Artist *
              </Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={e => handleChange('artist', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="album" className="text-right">
                Album
              </Label>
              <Input
                id="album"
                value={formData.album}
                onChange={e => handleChange('album', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (s)
              </Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={e => handleChange('duration', e.target.value)}
                className="col-span-3"
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genre" className="text-right">
                Genre
              </Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={e => handleChange('genre', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="releaseYear" className="text-right">
                Release Year
              </Label>
              <Input
                id="releaseYear"
                type="number"
                value={formData.releaseYear}
                onChange={e => handleChange('releaseYear', e.target.value)}
                className="col-span-3"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Add Song' : 'Update Song'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
