// Regenera los archivos incluidos en macOS con las herramientas say y ffmpeg.
import {SUMMARIES} from '../assets/audio-guide.js';
import {readFileSync,mkdirSync,writeFileSync,mkdtempSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const root=dirname(dirname(fileURLToPath(import.meta.url))),ctx={window:{}};
vm.createContext(ctx);vm.runInContext(readFileSync(join(root,'assets/map-data.js'),'utf8'),ctx);
const folder=join(root,'assets/audio'),temporary=mkdtempSync(join(tmpdir(),'agua-audio-'));
mkdirSync(folder,{recursive:true});
try{
 for(let i=0;i<7;i++){
  const text=`Stand ${i+1}. ${ctx.window.WATER_MAP_DATA.MODULES[i].nombre}. ${SUMMARIES[i]}`;
  const source=join(temporary,`stand-${i+1}.txt`),aiff=join(temporary,`stand-${i+1}.aiff`);writeFileSync(source,text);
  execFileSync('say',['-v','Paulina','-r','155','-f',source,'-o',aiff]);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',aiff,'-codec:a','libmp3lame','-b:a','96k',join(temporary,`stand-${i+1}.mp3`)]);
 }
 for(let i=1;i<=7;i++){
  const file=join(temporary,`stand-${i}.mp3`),duration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file],{encoding:'utf8'}));
  if(!Number.isFinite(duration)||duration<5)throw Error(`La voz no generó audio válido para el stand ${i}. No se sustituyen los MP3 existentes.`);
 }
 for(let i=1;i<=7;i++)copyFileSync(join(temporary,`stand-${i}.mp3`),join(folder,`stand-${i}.mp3`));
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','anullsrc=r=22050:cl=mono','-t','0.15','-codec:a','libmp3lame',join(folder,'silencio.mp3')]);
 console.log('Siete narraciones actualizadas: Paulina, es-MX, 155 palabras/minuto.');
}finally{rmSync(temporary,{recursive:true,force:true});}
