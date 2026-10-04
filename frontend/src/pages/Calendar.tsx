import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  ButtonGroup,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { calendarService } from '../services/calendarService';
import { campaignService } from '../services/campaignService';
import { CalendarEvent } from '../types/calendar';
import { Campaign } from '../types/campaign';
import { useNavigate } from 'react-router-dom';

const CONTENT_TYPES = [
  { value: 'blog', label: 'Blog', color: '#E59B2F' },
  { value: 'landing_page', label: 'Landing Page', color: '#C96B4B' },
  { value: 'email', label: 'Email', color: '#171717' },
  { value: 'social_post', label: 'Social Media Post', color: '#B45309' },
  { value: 'ad', label: 'Advertisement', color: '#9A3412' },
  { value: 'case_study', label: 'Case Study', color: '#78350F' },
  { value: 'announcement', label: 'Announcement', color: '#374151' },
];

const STATUS_LIST = ['draft', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'archived'];

export const Calendar: React.FC = () => {
  const navigate = useNavigate();

  // Calendar State
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // October 2026 for seed data alignment
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Event Detail & Reschedule Dialog
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [newScheduleDate, setNewScheduleDate] = useState<string>('');
  const [rescheduling, setRescheduling] = useState<boolean>(false);
  const [rescheduleMessage, setRescheduleMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch campaigns for dropdown filter
  useEffect(() => {
    campaignService.list().then(setCampaigns).catch(() => {});
  }, []);

  // Fetch calendar events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calendarService.getEvents({
        campaign_id: selectedCampaign !== 'all' ? Number(selectedCampaign) : undefined,
        content_type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setEvents(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load calendar events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCampaign, selectedType, selectedStatus]);

  // Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event click handler
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    const dateObj = new Date(event.scheduled_at);
    const localIso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setNewScheduleDate(localIso);
    setRescheduleMessage(null);
    setIsEventModalOpen(true);
  };

  // Reschedule handler
  const handleRescheduleSubmit = async () => {
    if (!selectedEvent || !newScheduleDate) return;
    try {
      setRescheduling(true);
      setRescheduleMessage(null);
      const isoDate = new Date(newScheduleDate).toISOString();
      await calendarService.reschedule(selectedEvent.id, isoDate);
      setRescheduleMessage({ type: 'success', text: 'Publication scheduled date updated successfully!' });
      fetchEvents();
      setTimeout(() => {
        setIsEventModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setRescheduleMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to reschedule content.' });
    } finally {
      setRescheduling(false);
    }
  };

  // Helpers for grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean }> = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  const remaining = 35 - calendarDays.length;
  const totalGridCells = remaining >= 0 ? 35 : 42;
  while (calendarDays.length < totalGridCells) {
    const nextDay = calendarDays.length - daysInMonth - startDayOfWeek + 1;
    calendarDays.push({
      date: new Date(year, month + 1, nextDay),
      isCurrentMonth: false,
    });
  }

  const currentDayOfWeek = (currentDate.getDay() + 6) % 7;
  const weekStartDate = new Date(currentDate);
  weekStartDate.setDate(currentDate.getDate() - currentDayOfWeek);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate);
    d.setDate(weekStartDate.getDate() + i);
    weekDays.push(d);
  }

  const getContentTypeColor = (type: string) => {
    const found = CONTENT_TYPES.find((t) => t.value === type);
    return found ? found.color : '#E59B2F';
  };

  const getEventsForDate = (targetDate: Date) => {
    return events.filter((ev) => {
      const evDate = new Date(ev.scheduled_at);
      return (
        evDate.getFullYear() === targetDate.getFullYear() &&
        evDate.getMonth() === targetDate.getMonth() &&
        evDate.getDate() === targetDate.getDate()
      );
    });
  };

  return (
    <Box>
      <PageHeader
        title="Content Publishing Calendar"
        subtitle="Visual editorial calendar and channel publication timeline with drag-and-drop scheduling."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Content Calendar' }]}
      />

      {/* Filter and Navigation Header Bar */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Month / Week Navigation Controls */}
          <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ButtonGroup variant="outlined" size="small" sx={{ borderColor: '#E8DFD2' }}>
              <Button onClick={handlePrev} sx={{ color: '#171717', borderColor: '#E8DFD2' }}>
                <ChevronLeftIcon />
              </Button>
              <Button onClick={handleToday} startIcon={<TodayIcon />} sx={{ color: '#171717', borderColor: '#E8DFD2', fontWeight: 600 }}>
                Today
              </Button>
              <Button onClick={handleNext} sx={{ color: '#171717', borderColor: '#E8DFD2' }}>
                <ChevronRightIcon />
              </Button>
            </ButtonGroup>

            <Typography variant="h5" fontWeight={700} sx={{ ml: 1, minWidth: 180, fontFamily: 'Newsreader, serif', color: '#171717' }}>
              {viewMode === 'month'
                ? monthName
                : `Week of ${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
            </Typography>

            <ButtonGroup variant="contained" size="small" sx={{ ml: 'auto' }}>
              <Button
                variant={viewMode === 'month' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('month')}
                sx={{
                  bgcolor: viewMode === 'month' ? '#171717' : 'transparent',
                  color: viewMode === 'month' ? '#FAF7F0' : '#171717',
                  borderColor: '#E8DFD2',
                  '&:hover': { bgcolor: viewMode === 'month' ? '#2D2926' : 'rgba(0,0,0,0.04)' },
                }}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('week')}
                sx={{
                  bgcolor: viewMode === 'week' ? '#171717' : 'transparent',
                  color: viewMode === 'week' ? '#FAF7F0' : '#171717',
                  borderColor: '#E8DFD2',
                  '&:hover': { bgcolor: viewMode === 'week' ? '#2D2926' : 'rgba(0,0,0,0.04)' },
                }}
              >
                Week
              </Button>
            </ButtonGroup>
          </Grid>

          {/* Filters Bar */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Campaign"
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                >
                  <MenuItem value="all">All Campaigns</MenuItem>
                  {campaigns.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Content Type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {CONTENT_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {STATUS_LIST.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
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
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E8DFD2', bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ p: 2.5 }}>
            {/* Days Header Row */}
            <Grid container spacing={1} sx={{ mb: 1, textAlign: 'center' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayStr) => (
                <Grid item xs={12 / 7} key={dayStr}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.8, color: '#3A3530' }}>
                    {dayStr}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ mb: 1.5, borderColor: '#DCD2C4' }} />

            {/* MONTH VIEW GRID */}
            {viewMode === 'month' && (
              <Grid container spacing={1}>
                {calendarDays.map((dayItem, idx) => {
                  const dayEvents = getEventsForDate(dayItem.date);
                  const isToday = new Date().toDateString() === dayItem.date.toDateString();

                  return (
                    <Grid item xs={12 / 7} key={idx}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.25,
                          minHeight: 125,
                          borderRadius: 1.5,
                          backgroundColor: !dayItem.isCurrentMonth
                            ? '#F8F6F0'
                            : isToday
                            ? '#FAF7F0'
                            : '#FFFFFF',
                          borderColor: isToday ? '#E59B2F' : '#DCD2C4',
                          borderWidth: isToday ? 2 : 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: dayItem.isCurrentMonth ? (isToday ? '#E59B2F' : '#171717') : '#6B625A' }}
                          >
                            {dayItem.date.getDate()}
                          </Typography>
                          {dayEvents.length > 0 && (
                            <Chip
                              label={dayEvents.length}
                              size="small"
                              sx={{ height: 16, fontSize: '0.65rem', bgcolor: '#FAF7F0', color: '#171717', border: '1px solid #DCD2C4', fontWeight: 700 }}
                            />
                          )}
                        </Box>

                        <Stack spacing={0.75}>
                          {dayEvents.map((ev) => (
                            <Paper
                              key={ev.id}
                              elevation={0}
                              onClick={() => handleEventClick(ev)}
                              sx={{
                                p: 0.85,
                                cursor: 'pointer',
                                bgcolor: '#FAF7F0',
                                borderLeft: `4px solid ${getContentTypeColor(ev.content_type)}`,
                                borderTop: '1px solid #DCD2C4',
                                borderRight: '1px solid #DCD2C4',
                                borderBottom: '1px solid #DCD2C4',
                                borderRadius: '0 6px 6px 0',
                                '&:hover': { opacity: 0.88, transform: 'translateY(-1px)' },
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Typography variant="caption" fontWeight={700} display="block" noWrap sx={{ color: '#171717' }}>
                                {ev.title}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#4A4540' }}>
                                  {new Date(ev.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                <Chip
                                  label={ev.status}
                                  size="small"
                                  sx={{
                                    height: 14,
                                    fontSize: '0.55rem',
                                    fontWeight: 700,
                                    bgcolor: ev.status === 'published' ? '#E59B2F' : '#FAF7F0',
                                    color: '#171717',
                                    border: ev.status === 'published' ? 'none' : '1px solid #DCD2C4',
                                  }}
                                />
                              </Box>
                            </Paper>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* WEEK VIEW GRID */}
            {viewMode === 'week' && (
              <Grid container spacing={1}>
                {weekDays.map((wDate, idx) => {
                  const dayEvents = getEventsForDate(wDate);
                  const isToday = new Date().toDateString() === wDate.toDateString();

                  return (
                    <Grid item xs={12 / 7} key={idx}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          minHeight: 400,
                          borderRadius: 2,
                          backgroundColor: isToday ? '#FAF7F0' : '#FFFFFF',
                          borderColor: isToday ? '#E59B2F' : '#DCD2C4',
                          borderWidth: isToday ? 2 : 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          align="center"
                          sx={{ color: isToday ? '#E59B2F' : '#171717', mb: 2 }}
                        >
                          {wDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Typography>

                        <Stack spacing={1}>
                          {dayEvents.map((ev) => (
                            <Paper
                              key={ev.id}
                              elevation={0}
                              onClick={() => handleEventClick(ev)}
                              sx={{
                                p: 1,
                                cursor: 'pointer',
                                bgcolor: '#FAF7F0',
                                borderLeft: `5px solid ${getContentTypeColor(ev.content_type)}`,
                                borderTop: '1px solid #DCD2C4',
                                borderRight: '1px solid #DCD2C4',
                                borderBottom: '1px solid #DCD2C4',
                                borderRadius: '0 8px 8px 0',
                                '&:hover': { opacity: 0.9 },
                              }}
                            >
                              <Chip
                                label={ev.content_type.replace('_', ' ')}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 18,
                                  mb: 0.5,
                                  backgroundColor: getContentTypeColor(ev.content_type),
                                  color: '#171717',
                                  fontWeight: 800,
                                }}
                              />
                              <Typography variant="subtitle2" fontWeight={700} display="block" sx={{ color: '#171717' }}>
                                {ev.title}
                              </Typography>
                              <Typography variant="caption" display="block" sx={{ color: '#4A4540' }}>
                                Time: {new Date(ev.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                              {ev.campaign_name && (
                                <Typography variant="caption" fontWeight={600} display="block" sx={{ color: '#C96B4B' }}>
                                  Campaign: {ev.campaign_name}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Details & Rescheduling Dialog */}
      <Dialog open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, borderColor: '#DCD2C4', border: '1px solid #DCD2C4' } }}>
        {selectedEvent && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Newsreader, serif', color: '#171717' }}>
                Publication Schedule Details
              </Typography>
              <IconButton size="small" onClick={() => setIsEventModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: '#DCD2C4' }}>
              {rescheduleMessage && (
                <Alert severity={rescheduleMessage.type} sx={{ mb: 2, borderRadius: 2 }}>
                  {rescheduleMessage.text}
                </Alert>
              )}

              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, fontFamily: 'Newsreader, serif', color: '#171717' }}>
                {selectedEvent.title}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={selectedEvent.content_type.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: getContentTypeColor(selectedEvent.content_type),
                    color: '#171717',
                    fontWeight: 800,
                  }}
                />
                <Chip
                  label={selectedEvent.status.toUpperCase()}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: selectedEvent.status === 'published' ? '#E59B2F' : '#FAF7F0', color: '#171717', border: selectedEvent.status === 'published' ? 'none' : '1px solid #DCD2C4' }}
                />
              </Stack>

              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#FAF7F0', borderColor: '#DCD2C4', borderRadius: 2 }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block" sx={{ color: '#3A3530' }}>
                      Author
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#171717' }}>
                      {selectedEvent.author_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" display="block" sx={{ color: '#3A3530' }}>
                      Campaign
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#C96B4B' }}>
                      {selectedEvent.campaign_name || 'Unassigned'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" display="block" sx={{ color: '#3A3530' }}>
                      Current Scheduled Date & Time
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#171717' }}>
                      {new Date(selectedEvent.scheduled_at).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: '#171717' }}>
                Reschedule Publication Date & Time
              </Typography>
              <TextField
                type="datetime-local"
                fullWidth
                size="small"
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#171717',
                    '& fieldset': { borderColor: '#DCD2C4' },
                    '&:hover fieldset': { borderColor: '#171717' },
                    '&.Mui-focused fieldset': { borderColor: '#171717' },
                  },
                }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  setIsEventModalOpen(false);
                  navigate(`/content/edit/${selectedEvent.id}`);
                }}
                sx={{ borderColor: '#DCD2C4', color: '#171717' }}
              >
                Edit Content
              </Button>
              <Box>
                <Button onClick={() => setIsEventModalOpen(false)} sx={{ mr: 1, color: '#4A4540' }}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRescheduleSubmit}
                  disabled={rescheduling}
                  sx={{ bgcolor: '#E59B2F', color: '#171717', fontWeight: 700, '&:hover': { bgcolor: '#D48A1F' } }}
                >
                  {rescheduling ? 'Updating...' : 'Update Schedule'}
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
