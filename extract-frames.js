const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs   = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const videoPath = path.join(__dirname, 'Flow_delpmaspu_.mp4');
const framesDir = path.join(__dirname, 'frames');

if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

// Skip first 1.5s, 18fps, native 1080p, optimized JPEG for fast decode
console.log('Extracting frames (1.5s skip, 18fps, 1080p JPEG)...');
ffmpeg(videoPath)
  .seekInput(1.5)
  .outputOptions([
    '-vf fps=18',
    '-q:v 2',
    '-frames:v 150'
  ])
  .output(path.join(framesDir, 'frame_%04d.jpg'))
  .on('start', cmd => console.log('Running:', cmd.slice(0, 80) + '...'))
  .on('progress', p => process.stdout.write(`\r  frames: ~${p.frames || '?'}  `))
  .on('end', () => {
    const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
    console.log(`\nDone! ${files.length} frames saved to ./frames/`);
    console.log('First:', files[0], '| Last:', files[files.length - 1]);
  })
  .on('error', e => console.error('\nError:', e.message))
  .run();
