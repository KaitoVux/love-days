'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SongForm } from '@/components/song-form'
import { Song, CreateSongInput, UpdateSongInput } from '@/types/song'
import { Plus, Edit, Trash2, LogOut, Search } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | undefined>()
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const router = useRouter()
  const { user, signOut } = useAuth()

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockSongs: Song[] = [
      {
        id: '1',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: 355,
        genre: 'Rock',
        releaseYear: 1975,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        duration: 391,
        genre: 'Rock',
        releaseYear: 1976,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'Imagine',
        artist: 'John Lennon',
        album: 'Imagine',
        duration: 183,
        genre: 'Pop',
        releaseYear: 1971,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    setSongs(mockSongs)
    setFilteredSongs(mockSongs)
  }, [])

  // Filter songs based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = songs.filter(
        song =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.album?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.genre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSongs(filtered)
    } else {
      setFilteredSongs(songs)
    }
  }, [searchTerm, songs])

  const handleCreateSong = (songData: CreateSongInput) => {
    const newSong: Song = {
      id: Date.now().toString(),
      ...songData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSongs(prev => [...prev, newSong])
  }

  const handleUpdateSong = (songData: UpdateSongInput) => {
    setSongs(prev =>
      prev.map(song =>
        song.id === songData.id
          ? { ...song, ...songData, updatedAt: new Date() }
          : song
      )
    )
    setEditingSong(undefined)
  }

  const handleDeleteSong = (id: string) => {
    if (confirm('Are you sure you want to delete this song?')) {
      setSongs(prev => prev.filter(song => song.id !== id))
    }
  }

  const openCreateForm = () => {
    setFormMode('create')
    setEditingSong(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (song: Song) => {
    setFormMode('edit')
    setEditingSong(song)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSong(undefined)
  }

  const handleFormSubmit = (songData: CreateSongInput | UpdateSongInput) => {
    if (formMode === 'create') {
      handleCreateSong(songData as CreateSongInput)
    } else {
      handleUpdateSong(songData as UpdateSongInput)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Song Management</h1>
            <p className="text-muted-foreground">
              Manage your music collection
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.name || user?.email}
            </span>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Songs</CardTitle>
            <CardDescription>
              A list of all songs in your collection
            </CardDescription>
            <div className="flex justify-between items-center">
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search songs..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Song
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Album</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm
                        ? 'No songs found matching your search.'
                        : 'No songs available. Add your first song!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSongs.map(song => (
                    <TableRow key={song.id}>
                      <TableCell className="font-medium">
                        {song.title}
                      </TableCell>
                      <TableCell>{song.artist}</TableCell>
                      <TableCell>{song.album || 'N/A'}</TableCell>
                      <TableCell>{formatDuration(song.duration)}</TableCell>
                      <TableCell>{song.genre || 'N/A'}</TableCell>
                      <TableCell>{song.releaseYear || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(song)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSong(song.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <SongForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
          song={editingSong}
          mode={formMode}
        />
      </div>
    </ProtectedRoute>
  )
}
