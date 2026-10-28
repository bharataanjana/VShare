import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs';
import Video from '../models/Video.js';

// Configure ffmpeg binary path
try {
  if (ffmpegInstaller && ffmpegInstaller.path) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    console.log('[Transcoder] FFmpeg path configured:', ffmpegInstaller.path);
  }
} catch (err) {
  console.warn('[Transcoder] Could not automatically bind ffmpegInstaller:', err.message);
}

export const transcodeToHLS = async (rawVideoPath, videoId) => {
  return new Promise((resolve, reject) => {
    const hlsDir = path.join('uploads', 'hls', videoId.toString());
    if (!fs.existsSync(hlsDir)) {
      fs.mkdirSync(hlsDir, { recursive: true });
    }

    const playlistName = 'master.m3u8';
    const outputPath = path.join(hlsDir, playlistName);
    const segmentPattern = path.join(hlsDir, 'segment_%03d.ts');

    console.log(`[Transcoder] Starting HLS conversion for video ${videoId}...`);

    // Get video metadata/duration first if possible
    ffmpeg.ffprobe(rawVideoPath, (err, metadata) => {
      const duration = metadata?.format?.duration ? Math.round(metadata.format.duration) : 0;

      // Execute HLS segmentation
      ffmpeg(rawVideoPath)
        .outputOptions([
          '-preset veryfast',
          '-g 48',
          '-sc_threshold 0',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${segmentPattern.replace(/\\/g, '/')}`
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          console.log('[Transcoder] FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`[Transcoder ${videoId}] Progress: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', async () => {
          console.log(`[Transcoder] Finished HLS conversion for ${videoId}`);
          try {
            const masterM3U8Url = `/uploads/hls/${videoId}/${playlistName}`;
            await Video.findByIdAndUpdate(videoId, {
              status: 'ready',
              masterM3U8: masterM3U8Url,
              duration: duration || 0
            });
            resolve({
              masterM3U8: masterM3U8Url,
              duration
            });
          } catch (updateErr) {
            console.error('[Transcoder] Error updating video status:', updateErr);
            resolve({ masterM3U8: `/uploads/hls/${videoId}/${playlistName}`, duration });
          }
        })
        .on('error', async (err) => {
          console.warn(`[Transcoder Warning] HLS transcode failed for ${videoId}: ${err.message}`);
          console.warn('[Transcoder] Setting video to ready with raw playback fallback.');
          try {
            await Video.findByIdAndUpdate(videoId, {
              status: 'ready' // Fallback to raw video URL so user can still watch directly
            });
          } catch (e) {}
          resolve({ fallback: true });
        })
        .run();
    });
  });
};

export const generateThumbnail = (rawVideoPath, outputDir, filename) => {
  return new Promise((resolve) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    ffmpeg(rawVideoPath)
      .screenshots({
        timestamps: ['00:00:01.000'],
        filename: filename,
        folder: outputDir,
        size: '640x360'
      })
      .on('end', () => {
        resolve(`/${outputDir.replace(/\\/g, '/')}/${filename}`);
      })
      .on('error', (err) => {
        console.warn('[Transcoder] Auto-thumbnail generation failed:', err.message);
        resolve('/placeholder-thumbnail.jpg');
      });
  });
};
