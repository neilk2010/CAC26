import type { TranslationKey } from "@/data/i18n/en";

// Spanish chrome strings — natural, neutral Latin American Spanish at a plain
// reading level, using the terminology U.S. agencies use in their own Spanish
// materials (SNAP, WIC, and Medicaid keep their names; "food stamps" =
// "cupones de alimentos"). Meaning over word-by-word.

export const es: Record<TranslationKey, string> = {
  // Nav
  "nav.checkEligibility": "Ver si califico",
  "nav.myResults": "Mis resultados",
  "nav.cliffSimulator": "Simulador de beneficios",
  "nav.search": "Buscar",
  "nav.searchAria": "Buscar programas y páginas",
  "nav.localPrivate": "local y privado",
  "nav.signIn": "Iniciar sesión",
  "nav.myAccount": "Resultados guardados",
  "nav.startOver": "Empezar de nuevo",
  "nav.startOverAria": "Borra las respuestas de este dispositivo y empieza de nuevo — para computadoras compartidas o públicas",

  // Hero
  "hero.headline1": "Abre cada puerta",
  "hero.headline2": "que ya te",
  "hero.headlineAccent": "corresponde.",
  "hero.sub":
    "Ayuda con comida, salud, energía y dinero en efectivo — explicada en lenguaje sencillo, con el enlace oficial para solicitar cada resultado. Sin cuenta obligatoria. Sin adivinar.",
  "hero.cta": "Ver si califico",
  "hero.how": "Cómo funciona →",
  "hero.pill0": "Sin cuenta obligatoria",
  "hero.pill1": "No es un sitio del gobierno",
  "hero.pill2": "Gratis para siempre",
  "hero.pill3": "Solo datos abiertos",
  "hero.mockLabel": "tus resultados",
  "hero.mockValue": "valor estimado que podrías estar perdiendo",
  "hero.mockLikely": "Probablemente elegible",
  "hero.mockPossible": "Posiblemente elegible",

  // Home — the orbit section
  "home.momentsTitle": "Hecho para los momentos que trae la vida",
  "home.momentsSub": "Seas quien seas, hay una puerta con tu nombre.",
  "home.momentsHint": "Pasa el cursor para pausar; haz clic para entrar.",

  // Intake wizard chrome
  "intake.step": "paso {n} de {total}",
  "intake.stepLabel.state": "tu estado",
  "intake.stepLabel.size": "tu hogar",
  "intake.stepLabel.income": "ingresos",
  "intake.stepLabel.flags": "situaciones",
  "intake.stepLabel.assets": "ahorros",
  "intake.stepLabel.review": "revisión",
  "intake.stateTitle": "¿En qué estado vives?",
  "intake.stateSub":
    "Todos los estados funcionan: los programas federales y los datos locales por dirección son nacionales. Los estados marcados",
  "intake.stateSubEnd": "también incluyen un paquete verificado de sus propios programas estatales.",
  "intake.fullCoverage": "cobertura completa",
  "intake.sizeTitle": "¿Cuántas personas viven en tu hogar?",
  "intake.incomeTitle": "¿Más o menos cuánto recibe tu hogar al mes, antes de impuestos?",
  "intake.incomeSub": "Un rango está bien — no se necesitan cifras exactas.",
  "intake.flagsTitle": "Unas preguntas más",
  "intake.flagsSub":
    "Solo preguntamos lo que todavía importa según tus respuestas. Salta las que no tengas claras.",
  "intake.flagsNone": "No necesitamos nada más — listo.",
  "intake.optional": "opcional",
  "intake.whyWeAsk": "Por qué preguntamos:",
  "intake.yes": "Sí",
  "intake.no": "No",
  "intake.skip": "Saltar",
  "intake.continue": "Continuar",
  "intake.back": "← Atrás",
  "intake.assetsTitle": "¿Más o menos cuánto tiene tu hogar en ahorros y otros recursos?",
  "intake.assetsSub":
    "Piensa en cuentas de banco y efectivo — la casa y normalmente un carro no cuentan.",
  "intake.reviewTitle": "Listo para ver tus resultados",
  "intake.reviewSub": "{possible} de {total} programas todavía se ven posibles según tus respuestas.",
  "intake.seeResults": "Ver mis resultados",
  "intake.esNote":
    "Las preguntas y los detalles de los programas se muestran en inglés por ahora — los botones y pasos están en español.",

  // Results
  "results.eyebrow": "tus resultados",
  "results.title": "Esto es lo que encontramos",
  "results.intro":
    "Según lo que nos contaste para un hogar de {size} en {state}. Esta es información general, no una decisión oficial — cada programa enlaza a la agencia real para confirmar.",
  "results.esNote":
    "Los detalles de los programas y las razones vienen de fuentes oficiales y se muestran en inglés por ahora.",
  "results.editAnswers": "← Cambiar mis respuestas",
  "results.tryCliff": "Probar el simulador de beneficios →",
  "results.deadlines": "Mi calendario de fechas límite →",
  "results.packet": "Mi paquete de beneficios para imprimir →",
  "results.clear": "Borrar mis respuestas",

  // Dashboard
  "dash.eyebrow": "dinero estimado que podrías estar dejando sin reclamar",
  "dash.perYear": "/año",
  "dash.midpoint":
    "Punto medio de {range} entre {count} programa{plural} para los que podrías calificar — un estimado, no una garantía. Cada tarjeta enlaza a la agencia que decide.",
  "dash.noMoneyEyebrow": "tu revisión hasta ahora",
  "dash.noMoneyBody":
    "Nada aquí tiene un estimado en dólares todavía — los números a la derecha muestran lo que sigue abierto, y responder más preguntas puede abrir más.",
  "dash.of": "de",
  "dash.likely": "probable",
  "dash.stillOpen": "abiertos",
  "dash.screened": "revisados",
  "dash.ringAria": "{open} de {total} programas revisados siguen abiertos para ti",
  "dash.panelAria": "Tus resultados de un vistazo",

  // Results controls
  "controls.expandAll": "Abrir todo",
  "controls.collapseAll": "Cerrar todo",
  "controls.comfortable": "Cómodo",
  "controls.compact": "Compacto",
  "controls.densityAria": "Densidad de la pantalla",

  // Search palette
  "search.placeholder": "Escribe una frase — “embarazada”, “estampillas de comida”, “no puedo pagar la renta”…",
  "search.aria": "Buscar programas, salas y páginas",
  "search.tryThese": "prueba una de estas",
  "search.noMatch": "Nada coincidió — pero el cuestionario completo revisa todo lo que cubrimos.",
  "search.startThere": "Empieza ahí →",
  "search.footer": "↑↓ elegir · enter para abrir · la búsqueda no sale de este dispositivo",
  "search.kind.program": "programa",
  "search.kind.scope": "sala",
  "search.kind.page": "página",

  // Exclusivo de tu estado (derivado en lib/uniqueness.ts, nunca fijo)
  "unique.badge": "Solo en {code}",
  "unique.badgeRare": "{count} estados",
  "unique.srExclusive": "Solo {state} ofrece esto entre los {covered} estados que OpenDoor cubre a fondo.",
  "unique.srRare": "Se ofrece en solo {count} de los {covered} estados que OpenDoor cubre a fondo.",
  "unique.panelLabel": "exclusivo de {state}",
  "unique.panelTitle": "Exclusivo de {state}: programas que la mayoría de los estados no tienen",
  "unique.panelIntro": "Ningún otro estado que OpenDoor cubre a fondo ofrece estos programas. Son fáciles de pasar por alto justamente porque las guías nacionales no los mencionan.",
  "unique.panelFootnote": "Basado en los {covered} estados con paquetes de programas verificados a mano. A medida que se agreguen estados, esta lista se actualiza sola.",

  // Accessibility panel
  "a11y.openAria": "Opciones de accesibilidad",
  "a11y.title": "Accesibilidad",
  "a11y.closeAria": "Cerrar opciones de accesibilidad",
  "a11y.textSize": "Tamaño del texto",
  "a11y.textSizeAria": "Tamaño del texto",
  "a11y.highContrast": "Alto contraste",
  "a11y.dyslexiaFont": "Fuente para dislexia",
  "a11y.reduceMotion": "Reducir movimiento",
  "a11y.reset": "Restablecer",

  // Footer
  "footer.about": "Acerca de",
  "footer.how": "Cómo funciona",
  "footer.check": "Ver si califico",
  "footer.disclaimer":
    "OpenDoor es solo informativo — no está afiliado a ninguna agencia del gobierno. Creado para el Congressional App Challenge 2026.",
  "footer.credit": "Creado por Neil Kumar y Rishanth Yavasani",
};
