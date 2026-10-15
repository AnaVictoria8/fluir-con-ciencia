"use strict";
/* ======== CONFIG ======== */
const PROJECT = {
  nombre: "Fluir con-ciencia, gotas de vida: Experiencias Hídricas en el Maule",
  sub: "Experiencias Hídricas en el Maule · Jardín Botánico & Arboretum · Universidad de Talca",
  urlPublica: "https://anavictoria8.github.io/fluir-con-ciencia/"
};
const ICONS = {
  ciclo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3 3.9 5.5 6.5 5.5 9.4a5.5 5.5 0 1 1-11 0C6.5 10 9 7.4 12 3.5z"/><path d="M9.2 12.9c0 1.5 1.1 2.8 2.6 3"/></svg>',
  reparto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v7a3 3 0 0 0 3 3h10"/><path d="M16 11l3 3-3 3"/><path d="M5 4h3M5 4H2"/><circle cx="19.5" cy="6.5" r="2"/><path d="M14 19h5"/></svg>',
  lupa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/><path d="M10.5 7.6c1.7 2.1 3 3.4 3 4.8a3 3 0 1 1-6 0c0-1.4 1.3-2.7 3-4.8z" stroke-width="1.4"/></svg>',
  campo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V10"/><path d="M12 10c-4.5 0-7-2.6-7.5-6.5C9 3.4 11.4 5.6 12 10z"/><path d="M12 13c4 0 6.4-2.2 7-5.5-4 .4-6.4 2.4-7 5.5z"/><path d="M8 21h8"/></svg>',
  filtro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16l-6.2 7.6V18l-3.6 2v-8.4L4 4z"/><path d="M8.5 8h7"/></svg>',
  ciclo2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9a8 8 0 0 1 13.6-3l2.4 2.4"/><path d="M20.5 4.5v4h-4"/><path d="M19.5 15a8 8 0 0 1-13.6 3L3.5 15.6"/><path d="M3.5 19.5v-4h4"/><path d="M12 9.8c1.4 1.8 2.5 3 2.5 4.3a2.5 2.5 0 1 1-5 0c0-1.3 1.1-2.5 2.5-4.3z" stroke-width="1.4"/></svg>',
  decide:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M12 5h6.5l2 2.2-2 2.2H12"/><path d="M12 12h-6.5l-2 2.2 2 2.2H12"/></svg>'
};

const MODULES = [
 {id:1, color:"#2b9fd8", icon:ICONS.ciclo, lbl:"El viaje del agua",
  nombre:"El viaje del agua", pregunta:"¿De dónde viene el agua que usamos?",
  mensaje:"En el Maule el agua nace en la cordillera y llega hasta nosotros a través de un ciclo natural: precipitaciones, nieve, ríos, embalses, napas subterráneas y ecosistemas.",
  interaccion:"Los visitantes manipulan una maqueta del ciclo del agua del Maule (cordillera–valle–costa) con bomba manual, nubes y compuertas: hacen llover, mueven el agua por el río y observan cómo se infiltra y se almacena.",
  aprende:"Que el agua es un recurso finito y variable: su disponibilidad depende del ciclo hidrológico y de las estaciones.",
  chips:["2,5 × 2,5 m","Maqueta con circuito cerrado","3 – 5 min","3–5 personas a la vez"]},
 {id:2, color:"#2e9e6b", icon:ICONS.reparto, lbl:"El agua en el territorio",
  nombre:"El agua en nuestro territorio", pregunta:"¿Alcanza el agua para todos?",
  mensaje:"El agua de la cuenca se reparte entre consumo humano, agricultura y agroindustria, industria y ecosistemas. En el Maule la agricultura es la gran usuaria: repartir el agua es tomar decisiones.",
  interaccion:"Una mesa de distribución con compuertas permite derivar el agua hacia cuatro destinos (ciudades, campo, agroindustria y ecosistemas). Un estanque indicador muestra cuánta agua queda según las decisiones del grupo.",
  aprende:"Quiénes usan el agua en la región, cómo compiten por ella y qué criterios existen para distribuirla y priorizarla.",
  chips:["2,5 × 2,5 m","Mesa de canales y compuertas","3 – 5 min"]},
 {id:3, color:"#8c5bb8", icon:ICONS.lupa, lbl:"Detectives del agua",
  nombre:"Detectives del agua", pregunta:"¿Cómo sabemos la calidad del agua?",
  mensaje:"El agua transparente no siempre es agua segura. Para conocer su calidad hay que medir: pH, conductividad eléctrica y turbidez son pistas fundamentales.",
  interaccion:"Tres estaciones de análisis comparan muestras (agua de río, de proceso y tratada): tiras reactivas y pH-metro, conductímetro y columna de turbidez. Cada visitante completa su ficha de detective.",
  aprende:"Qué indican pH, conductividad y turbidez, cómo se miden y por qué la evidencia científica es la base para decidir los usos del agua.",
  chips:["2,5 × 2,5 m","Mesón de laboratorio","5 – 8 min","Instrumental simple y seguro"]},
 {id:4, color:"#c8552e", icon:ICONS.campo, lblPos:"top", lbl:"Del campo a la agroindustria",
  nombre:"Del campo a la agroindustria", pregunta:"¿Dónde se usa el agua en la fruticultura?",
  mensaje:"En el Maule frutas y viñas se cultivan y procesan con agua: riego, lavado, enfriado y limpieza. Cada etapa del proceso es una oportunidad de ahorro y reutilización.",
  interaccion:"Los visitantes operan una línea frutícola simplificada (recepción, lavado, selección, embalaje y frío) con el desafío de completar el proceso usando la menor cantidad de agua, comparando estrategias como riego tecnificado, recirculación y limpieza en seco.",
  aprende:"Qué es la huella hídrica de un producto local y cuáles son las oportunidades reales de ahorro en la agroindustria del Maule.",
  chips:["2,5 × 2,5 m","Línea de proceso con controles","5 – 7 min","Contadores de agua visibles"]},
 {id:5, color:"#0e7c86", icon:ICONS.filtro, lbl:"Transformar el agua",
  nombre:"Transformar el agua", pregunta:"¿Cómo se trata el agua?",
  mensaje:"Separar sólidos, sedimentar y filtrar permite retirar partículas del agua. Cada etapa tiene alcances y límites: no todo se puede quitar con lo mismo.",
  interaccion:"Un tren de tratamiento transparente y escalonado (rejilla, sedimentación, filtro de arena y carbón) donde los visitantes vierten agua “de proceso” y observan cómo cambia en cada etapa, comparando entradas y salidas.",
  aprende:"Los principios físicos del tratamiento (separación, sedimentación y filtración) y por qué tratar el agua es clave para cuidarla y reutilizarla.",
  chips:["2,5 × 2,5 m","Columna demostrativa transparente","4 – 6 min","Circuito cerrado"]},
 {id:6, color:"#1887b8", icon:ICONS.ciclo2, lbl:"Una nueva oportunidad",
  nombre:"Una nueva oportunidad", pregunta:"¿Podemos reutilizar el agua?",
  mensaje:"El agua usada en procesos puede tratarse y volver a usarse bajo condiciones de calidad controladas. Recircular reduce la demanda de agua nueva de la cuenca.",
  interaccion:"Dos circuitos gemelos —uno de uso único y otro con tratamiento y recirculación— con bombas y medidores de nivel: los visitantes comparan cuánta agua nueva exige cada sistema y cuánta se ahorra.",
  aprende:"Qué es el reúso del agua, qué condiciones de calidad exige y cómo la economía circular del agua aporta a la cuenca del Maule.",
  chips:["2,5 × 2,5 m","Doble circuito con medidores","4 – 6 min"]},
 {id:7, color:"#f29f05", icon:ICONS.decide, lbl:"El futuro: tú decides",
  nombre:"El futuro del agua: tú decides", pregunta:"¿Qué haremos con el agua del Maule?",
  mensaje:"El futuro hídrico de la región se construye con decisiones concretas: ahorrar, monitorear, tratar y reutilizar. Tu decisión cuenta.",
  interaccion:"Un tablero de desafíos plantea escenarios reales (sequía, heladas, crecimiento productivo): cada visitante elige estrategias y vota con fichas o código QR; una pantalla muestra las consecuencias de las decisiones del grupo y se cierra con un mural de compromisos personales.",
  aprende:"Sintetiza todo el recorrido y ejercita el pensamiento crítico y la corresponsabilidad ciudadana en la gestión del agua.",
  chips:["2,5 × 2,5 m + pantalla","Votación y mural de compromisos","5 – 8 min","Energía solar"]}
];

window.WATER_MAP_DATA={PROJECT,MODULES};
