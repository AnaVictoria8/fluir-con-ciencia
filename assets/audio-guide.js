export const SUMMARIES=[
 'Aquí comienza el viaje del agua. En el Maule, la lluvia y la nieve de la cordillera alimentan ríos, napas y ecosistemas. En este stand puedes hacer llover sobre una maqueta y abrir compuertas para descubrir cómo circula y se almacena el agua. Su disponibilidad cambia con las estaciones: conocer su origen nos ayuda a cuidarla.',
 'El agua del Maule se comparte entre las ciudades, el campo, la industria y los ecosistemas. En esta estación decides cómo repartir una reserva mediante canales y compuertas. Al entregar más a un destino, queda menos para los demás. El desafío es equilibrar las necesidades y comprender que cada decisión tiene consecuencias.',
 'Un agua transparente no necesariamente es segura. Aquí te conviertes en detective: comparas muestras y conoces mediciones de pH, conductividad y turbidez. Estos análisis entregan pistas distintas sobre la calidad del agua. La evidencia científica permite decidir para qué usos es adecuada y cuándo necesita tratamiento.',
 'El agua acompaña a las frutas desde el riego en el campo hasta el lavado, el enfriado y la limpieza en la agroindustria. En este stand recorres una línea frutícola y pruebas decisiones para reducir el consumo. El desafío es producir usando el agua de manera más eficiente y reconocer oportunidades de recirculación.',
 'Aquí puedes observar cómo cambia el agua al pasar por una rejilla, una etapa de sedimentación y un filtro. Cada proceso retira ciertos sólidos o partículas y tiene sus límites. Comparar la entrada y la salida ayuda a entender el tratamiento. Recuerda: filtrar el agua no garantiza que sea potable.',
 '¿Qué pasa si usamos el agua más de una vez? En esta estación comparas un circuito de uso único con otro que trata y recircula el agua. Los medidores muestran cómo cambia la demanda de agua nueva. Reutilizar puede ahorrar recursos, siempre que la calidad sea apropiada para el uso que se le dará.',
 'El futuro del agua se construye entre todos. En el último stand enfrentas desafíos del Maule y eliges estrategias de ahorro, monitoreo, tratamiento y reutilización. Después observas sus consecuencias y compartes un compromiso personal. Esta estación reúne lo aprendido y te invita a decidir cómo aportar al cuidado del agua.'
];
export function createAudioGuide(modules){
 const synth=window.speechSynthesis,supported=!!synth&&typeof window.SpeechSynthesisUtterance==='function';
 const play=document.getElementById('audioPlay'),pause=document.getElementById('audioPause'),stop=document.getElementById('audioStop'),selector=document.getElementById('audioVoice'),status=document.getElementById('audioStatus'),auto=document.getElementById('autoNarrate'),quick=document.getElementById('quickAudio');
 const player=document.createElement('audio');player.id='narrationAudio';player.preload='none';player.hidden=true;document.querySelector('.audio-card').appendChild(player);
 let voices=[],state='idle',currentId=1,readingId=null,utterance=null,generation=0,mode='file',watchdog=0,userChosen=false;
 const rank=v=>{const lang=v.lang.replaceAll('_','-').toLowerCase();return lang==='es-cl'?100:lang==='es-419'?95:lang==='es-mx'?90:lang==='es-ar'?88:lang.startsWith('es-')&&lang!=='es-es'?85:lang==='es'?75:50;};
 function message(text){status.textContent=text;}
 function ui(){
  const busy=state==='playing'||state==='paused'||state==='loading';pause.disabled=state==='idle'||state==='error'||state==='loading';stop.disabled=state==='idle'||state==='error';pause.textContent=state==='paused'?'▶ Continuar':'Ⅱ Pausar';play.textContent=busy?'↺ Repetir resumen':'▶ Escuchar resumen';quick.textContent=busy?'■ Detener audio':'♪ Escuchar stand';quick.setAttribute('aria-pressed',busy);
 }
 function loadVoices(){
  const previous=selector.value;voices=supported?synth.getVoices().filter(v=>/^es(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>rank(b)-rank(a)||a.name.localeCompare(b.name)):[];
  selector.replaceChildren();const included=document.createElement('option');included.value='file';included.textContent='Paulina · español latino (México) · audio incluido';selector.appendChild(included);
  for(const voice of voices){const o=document.createElement('option');o.value=voice.voiceURI;o.textContent=`${voice.name} · ${voice.lang}${rank(voice)===100?' · Chile':''}`;selector.appendChild(o);}
  const chile=voices.find(v=>rank(v)===100);
  selector.value=userChosen&&(previous==='file'||voices.some(v=>v.voiceURI===previous))?previous:chile?.voiceURI||'file';
  if(state==='idle')message(selector.value==='file'?'Audio incluido en español latino de México.':`Voz disponible: ${chile?.name||selector.selectedOptions[0]?.textContent}.`);
 }
 function cancel(){
  generation++;clearTimeout(watchdog);player.onended=player.onerror=player.onplaying=null;player.pause();if(supported)synth.cancel();utterance=null;readingId=null;state='idle';ui();
 }
 function finish(token){if(token!==generation)return;clearTimeout(watchdog);state='idle';readingId=null;utterance=null;ui();message('Resumen terminado. Puedes volver a escucharlo.');}
 function filePlay(token){
  player.play().then(()=>{if(token!==generation)return;if(state==='paused'){player.pause();return;}state='playing';ui();message(`Escuchando el stand ${readingId} · español latino.`);}).catch(error=>{
   if(token!==generation||state==='paused')return;state='error';readingId=null;ui();message(error.name==='NotAllowedError'?'Pulsa «Escuchar resumen» para habilitar el audio.':'No se pudo cargar el audio. Puedes volver a intentarlo o leer el resumen.');
  });
 }
 function read(id=currentId){
  cancel();const token=generation,m=modules[id-1],voice=voices.find(v=>v.voiceURI===selector.value);
  readingId=id;state='loading';ui();message(`Preparando el resumen del stand ${id}…`);
  if(!voice||!supported){
   mode='file';player.src=`assets/audio/stand-${id}.mp3`;
   player.onended=()=>finish(token);player.onerror=()=>{if(token===generation){state='error';readingId=null;ui();message('No se pudo cargar este audio. Puedes leer el resumen o elegir otra voz.');}};filePlay(token);return true;
  }
  mode='speech';utterance=new SpeechSynthesisUtterance(`Stand ${id}. ${m.nombre}. ${SUMMARIES[id-1]}`);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.94;utterance.pitch=1;
  const fallback=()=>{if(token!==generation)return;if(state==='paused'){watchdog=setTimeout(fallback,1000);return;}selector.value='file';read(id);};
  utterance.onstart=()=>{if(token!==generation)return;clearTimeout(watchdog);if(state==='paused'){synth.pause();return;}state='playing';ui();message(`Escuchando el stand ${id} · ${voice.name} (${voice.lang}).`);};
  utterance.onend=()=>finish(token);utterance.onerror=fallback;watchdog=setTimeout(fallback,5000);
  try{synth.resume();synth.speak(utterance);}catch{fallback();}return true;
 }
 function pauseAudio(){if(state!=='playing'&&state!=='loading')return;state='paused';if(mode==='file')player.pause();else synth.pause();ui();message('Narración en pausa.');}
 function resume(){if(state!=='paused')return;if(mode==='file'){state='loading';ui();filePlay(generation);}else{synth.resume();state='playing';ui();message(`Escuchando el stand ${readingId}.`);}}
 play.onclick=()=>read();pause.onclick=()=>state==='paused'?resume():pauseAudio();stop.onclick=()=>{cancel();message('Audio detenido.');};quick.onclick=()=>{if(state==='playing'||state==='paused'||state==='loading'){cancel();message('Audio detenido.');}else read();};
 selector.onchange=()=>{userChosen=true;cancel();loadVoices();};
 auto.onchange=()=>{
  if(auto.checked){
   if(supported)synth.resume();
   if(state==='idle'||state==='error'){
    cancel();const token=generation;player.src='assets/audio/silencio.mp3';player.play().then(()=>{if(token===generation){player.pause();player.currentTime=0;}}).catch(()=>{if(token===generation)message('Pulsa «Escuchar resumen» una vez para habilitar la lectura automática.');});
   }
   message('La narración se iniciará cuando el personaje llegue a cada stand.');
  }else{cancel();message('Narración automática desactivada.');}
 };
 loadVoices();if(supported)synth.addEventListener('voiceschanged',loadVoices);
 function select(id){if(currentId!==id){cancel();currentId=id;message('Resumen listo para escuchar.');}document.getElementById('audioTranscript').textContent=SUMMARIES[id-1];}
 select(1);ui();
 return {select,read,cancel,pause:pauseAudio,resume,element:player,get busy(){return state==='playing'||state==='paused'||state==='loading';},get state(){return state;},get readingId(){return readingId;},get automatic(){return auto.checked;}};
}
