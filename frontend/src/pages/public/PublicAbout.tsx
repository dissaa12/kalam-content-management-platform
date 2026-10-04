import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Card,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Speed as SpeedIcon,
  TrendingUp as GrowthIcon,
} from '@mui/icons-material';
import { KalamLogo } from '../../components/KalamLogo';

export const PublicAbout: React.FC = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#141210', color: '#F7F3EA' }}>
      <Container maxWidth="lg">
        {/* HERO SECTION */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <KalamLogo variant="full" height={44} lightBackground={false} showTagline />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Newsreader, Georgia, serif',
              fontWeight: 700,
              fontSize: { xs: '2.25rem', md: '3.25rem' },
              mb: 2,
              color: '#F7F3EA',
            }}
          >
            Revolutionizing Creative Content Operations
          </Typography>
          <Typography variant="h6" sx={{ color: '#B3A89C', maxWidth: 720, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
            KALAM is an enterprise content management platform designed for marketing teams and authors to write, edit, review, and publish content seamlessly with human-in-the-loop AI assistance.
          </Typography>
        </Box>

        {/* CORE PILLARS */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                backgroundColor: '#1A1816',
                border: '1px solid #2D2824',
                borderRadius: 2.5,
              }}
            >
              <AIIcon sx={{ fontSize: 36, color: '#F47A20', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#F7F3EA', mb: 1 }}>
                Human-in-the-Loop AI
              </Typography>
              <Typography variant="body2" sx={{ color: '#B3A89C', lineHeight: 1.7 }}>
                KALAM AI copy assistant provides headline generation, tone modification, SEO meta descriptions, and readability analysis without auto-publishing.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                backgroundColor: '#1A1816',
                border: '1px solid #2D2824',
                borderRadius: 2.5,
              }}
            >
              <SpeedIcon sx={{ fontSize: 36, color: '#F47A20', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#F7F3EA', mb: 1 }}>
                Automated Workflows
              </Typography>
              <Typography variant="body2" sx={{ color: '#B3A89C', lineHeight: 1.7 }}>
                Multi-stage role-based approval pipelines (*Draft ➔ Review ➔ Approve ➔ Schedule ➔ Publish*) ensuring editorial quality.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 4,
                height: '100%',
                backgroundColor: '#1A1816',
                border: '1px solid #2D2824',
                borderRadius: 2.5,
              }}
            >
              <GrowthIcon sx={{ fontSize: 36, color: '#F47A20', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#F7F3EA', mb: 1 }}>
                Telemetry Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: '#B3A89C', lineHeight: 1.7 }}>
                Tracking page views, CTRs, reading times, and lead conversions across cross-channel promotional marketing campaigns.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* LEADERSHIP TEAM */}
        <Typography variant="h3" sx={{ fontFamily: 'Newsreader, Georgia, serif', fontWeight: 700, color: '#F7F3EA', textAlign: 'center', mb: 6 }}>
          Editorial & Engineering Team
        </Typography>

        <Grid container spacing={3}>
          {[
            { name: 'Sarah Jenkins', role: 'Head of Growth & Strategy', avatar: 'SJ' },
            { name: 'Alex Rivera', role: 'Lead Editorial Director', avatar: 'AR' },
            { name: 'Devon Vance', role: 'Principal AI Architect', avatar: 'DV' },
          ].map((member) => (
            <Grid item xs={12} md={4} key={member.name}>
              <Card sx={{ backgroundColor: '#1A1816', border: '1px solid #2D2824', textAlign: 'center', p: 3, borderRadius: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#171717', color: '#FFFDF8', mx: 'auto', mb: 2, fontSize: '1.2rem', fontWeight: 800, border: '2px solid #F47A20' }}>
                  {member.avatar}
                </Avatar>
                <Typography variant="h6" fontWeight={700} color="#F7F3EA">
                  {member.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#F47A20', fontWeight: 700 }}>
                  {member.role}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
