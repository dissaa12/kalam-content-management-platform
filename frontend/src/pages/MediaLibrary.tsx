import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  Chip,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as PreviewIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { mediaService } from '../services/mediaService';
import { MediaItem } from '../types/media';

const FILE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Media Assets' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'document', label: 'Documents' },
];

export const MediaLibrary: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'size'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Fetch Media
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mediaService.list({
        search: searchQuery || undefined,
        file_type: selectedType !== 'all' ? selectedType : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setMediaList(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load media assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedType, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  // Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      await mediaService.upload(selectedFile);
      setIsUploadOpen(false);
      setSelectedFile(null);
      fetchMedia();
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  // Delete Handler
  const handleDelete = async (item: MediaItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.original_filename}"?`)) {
      try {
        await mediaService.delete(item.id);
        fetchMedia();
        if (previewItem?.id === item.id) {
          setIsPreviewOpen(false);
        }
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete asset.');
      }
    }
  };

  // Format Bytes helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Icon Helper for File Type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon sx={{ color: '#E59B2F' }} />;
      case 'video':
        return <VideoIcon sx={{ color: '#C96B4B' }} />;
      case 'pdf':
        return <PdfIcon sx={{ color: '#9A3412' }} />;
      case 'document':
        return <DocIcon sx={{ color: '#171717' }} />;
      default:
        return <FileIcon sx={{ color: '#7A7067' }} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Digital Media Library"
        subtitle="Centralized enterprise storage for images, marketing videos, PDFs, and documents."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Media Library' }]}
        actions={[{ label: 'Upload Asset', icon: <UploadIcon />, onClick: () => setIsUploadOpen(true) }]}
      />

      {/* Filter and View Bar */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={4}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#7A7067', mr: 1 }} />,
                }}
              />
            </Box>
          </Grid>

          {/* Type Filter */}
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Asset Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {FILE_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sort Control */}
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <MenuItem value="created_at-desc">Upload Date (Newest)</MenuItem>
              <MenuItem value="created_at-asc">Upload Date (Oldest)</MenuItem>
              <MenuItem value="name-asc">File Name (A-Z)</MenuItem>
              <MenuItem value="size-desc">File Size (Largest)</MenuItem>
            </TextField>
          </Grid>

          {/* View Mode Toggle */}
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, val) => val && setViewMode(val)}
              sx={{ borderColor: '#E8DFD2' }}
            >
              <ToggleButton value="grid" sx={{ '&.Mui-selected': { bgcolor: '#171717', color: '#FAF7F0' } }}>
                <GridViewIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" sx={{ '&.Mui-selected': { bgcolor: '#171717', color: '#FAF7F0' } }}>
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#E59B2F' }} />
        </Box>
      ) : mediaList.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
          <UploadIcon sx={{ fontSize: 48, color: '#C96B4B', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
            No media assets found.
          </Typography>
          <Typography variant="body2" sx={{ color: '#4A4540', mb: 3 }}>
            Upload images, promotional videos, PDFs, or brand documents to populate your library.
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setIsUploadOpen(true)}
            sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { bgcolor: '#333333' } }}
          >
            Upload First Asset
          </Button>
        </Paper>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <Grid container spacing={3}>
          {mediaList.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  borderColor: '#DCD2C4',
                  bgcolor: '#FFFFFF',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    borderColor: '#E59B2F',
                  },
                }}
              >
                {/* Media Preview Box */}
                <Box
                  sx={{
                    height: 160,
                    backgroundColor: '#FAF7F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: '1px solid #DCD2C4',
                  }}
                >
                  {item.file_type === 'image' ? (
                    <CardMedia
                      component="img"
                      height="160"
                      image={item.file_path}
                      alt={item.original_filename}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : item.file_type === 'video' ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <VideoIcon sx={{ fontSize: 48, color: '#C96B4B', mb: 1 }} />
                      <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                        Video File
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      {getFileIcon(item.file_type)}
                      <Typography variant="caption" display="block" sx={{ color: '#4A4540', mt: 1 }}>
                        {item.file_type.toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ p: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap title={item.original_filename} sx={{ color: '#171717' }}>
                    {item.original_filename}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Chip label={item.file_type.toUpperCase()} size="small" variant="outlined" sx={{ fontSize: '0.65rem', borderColor: '#DCD2C4', color: '#171717', fontWeight: 600 }} />
                    <Typography variant="caption" sx={{ color: '#4A4540' }}>
                      {formatFileSize(item.file_size)}
                    </Typography>
                  </Box>

                  <Typography variant="caption" display="block" sx={{ mt: 1, color: '#4A4540' }}>
                    Uploaded by <strong style={{ color: '#171717' }}>{item.uploaded_by_name}</strong> on {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 1, px: 2, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #DCD2C4', bgcolor: '#FAF7F0' }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setPreviewItem(item);
                      setIsPreviewOpen(true);
                    }}
                    sx={{ color: '#C96B4B' }}
                  >
                    <PreviewIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: '#DC2626' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* LIST VIEW */
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: '#DCD2C4', bgcolor: '#FFFFFF' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FAF7F0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Asset</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Uploaded By</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }}>Upload Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#171717', borderColor: '#DCD2C4' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mediaList.map((item) => (
                <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#FAF7F0' } }}>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {getFileIcon(item.file_type)}
                      <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#171717' }}>
                        {item.original_filename}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4' }}>
                    <Chip label={item.file_type.toUpperCase()} size="small" variant="outlined" sx={{ borderColor: '#DCD2C4', color: '#171717' }} />
                  </TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4', color: '#4A4540' }}>{formatFileSize(item.file_size)}</TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4', color: '#171717' }}>{item.uploaded_by_name}</TableCell>
                  <TableCell sx={{ borderColor: '#DCD2C4', color: '#4A4540' }}>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right" sx={{ borderColor: '#DCD2C4' }}>
                    <Tooltip title="Preview Asset">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setPreviewItem(item);
                          setIsPreviewOpen(true);
                        }}
                        sx={{ color: '#C96B4B' }}
                      >
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Asset">
                      <IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: '#DC2626' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload File Modal */}
      <Dialog open={isUploadOpen} onClose={() => setIsUploadOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, borderColor: '#DCD2C4', border: '1px solid #DCD2C4' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
            Upload Digital Media Asset
          </Typography>
          <IconButton size="small" onClick={() => setIsUploadOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: '#DCD2C4' }}>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {uploadError}
            </Alert>
          )}

          <Paper
            variant="outlined"
            sx={{
              p: 4,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: selectedFile ? '#E59B2F' : '#DCD2C4',
              backgroundColor: '#FAF7F0',
              cursor: 'pointer',
              borderRadius: 2,
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.pptx"
              onChange={handleFileChange}
            />
            <UploadIcon sx={{ fontSize: 48, color: '#C96B4B', mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#171717' }}>
              {selectedFile ? selectedFile.name : 'Click or Drag File Here to Upload'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#4A4540' }}>
              Supported: Images (JPG, PNG, WebP), Videos (MP4, WebM), PDFs, Documents (DOCX, PPTX). Max 50MB.
            </Typography>
            {selectedFile && (
              <Chip
                label={formatFileSize(selectedFile.size)}
                size="small"
                sx={{ mt: 1.5, fontWeight: 700, bgcolor: '#E59B2F', color: '#171717' }}
              />
            )}
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsUploadOpen(false)} sx={{ color: '#4A4540' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={18} sx={{ color: '#FAF7F0' }} /> : <UploadIcon />}
            sx={{ bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700, '&:hover': { bgcolor: '#333333' } }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Preview Modal */}
      <Dialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, borderColor: '#DCD2C4', border: '1px solid #DCD2C4' } }}>
        {previewItem && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={700} noWrap sx={{ maxWidth: '80%', fontFamily: 'Newsreader, serif', color: '#171717' }}>
                {previewItem.original_filename}
              </Typography>
              <IconButton size="small" onClick={() => setIsPreviewOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: '#DCD2C4' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                {previewItem.file_type === 'image' ? (
                  <Box
                    component="img"
                    src={previewItem.file_path}
                    alt={previewItem.original_filename}
                    sx={{ maxHeight: 400, maxWidth: '100%', borderRadius: 2, border: '1px solid #DCD2C4' }}
                  />
                ) : previewItem.file_type === 'video' ? (
                  <Box component="video" controls sx={{ width: '100%', maxHeight: 400, borderRadius: 2 }}>
                    <source src={previewItem.file_path} type={previewItem.mime_type} />
                    Your browser does not support HTML video playback.
                  </Box>
                ) : (
                  <Paper variant="outlined" sx={{ p: 4, bgcolor: '#FAF7F0', borderColor: '#DCD2C4', borderRadius: 2 }}>
                    {getFileIcon(previewItem.file_type)}
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 1, color: '#171717' }}>
                      {previewItem.original_filename}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4A4540' }}>
                      File Format: {previewItem.mime_type} ({formatFileSize(previewItem.file_size)})
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ mt: 2, bgcolor: '#171717', color: '#FAF7F0', fontWeight: 700 }}
                      component="a"
                      href={previewItem.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open / Download File
                    </Button>
                  </Paper>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" sx={{ color: '#3A3530' }}>
                    File URL
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={previewItem.file_path}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + previewItem.file_path);
                            alert('URL copied to clipboard!');
                          }}
                          sx={{ color: '#C96B4B' }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#171717',
                        '& fieldset': { borderColor: '#DCD2C4' },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" display="block" sx={{ color: '#3A3530' }}>
                    Size
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#171717' }}>
                    {formatFileSize(previewItem.file_size)}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" display="block" sx={{ color: '#3A3530' }}>
                    Uploaded By
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#171717' }}>
                    {previewItem.uploaded_by_name}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(previewItem)} sx={{ color: '#DC2626' }}>
                Delete Asset
              </Button>
              <Button onClick={() => setIsPreviewOpen(false)} sx={{ color: '#4A4540' }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
