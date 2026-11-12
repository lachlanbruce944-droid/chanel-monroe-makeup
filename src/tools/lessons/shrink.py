import os, subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); L = r'M:\CMM-Site\final-draft\images\lessons'
for f in sorted(os.listdir(L)):
    if not f.endswith('.mp4'): continue
    p, t = os.path.join(L, f), os.path.join(L, f + '.tmp.mp4')
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', p, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p',
                    '-vf', "scale='min(720,iw)':-2", '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', t], check=True)
    os.replace(t, p); print('ok', f, flush=True)
print('done')
