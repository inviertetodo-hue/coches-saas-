# Motor de Detección de Oportunidades - Arquitectura de Producto

**Objetivo:** Identificar coches infravalorados en mercados europeos antes que competidores, con precisión robusta que evite falsos positivos.

---

## 1. MEMORIA HISTÓRICA - LA COLUMNA VERTEBRAL DEL SISTEMA

### 1.1 Base de Datos de Comparables (Historical Market Database)

**Propósito:** Construir una curva de valor real para cada segmento de vehículo.

**Qué almacenar por cada vehículo histórico:**

```
VIN / Registro Único
├── Identificadores Técnicos
│   ├── Marca, Modelo, Generación (años exactos)
│   ├── Motorización (cilindrada, combustible, potencia)
│   ├── Carrocería, Tracción
│   ├── Emisiones (Euro X)
│   └── Año de fabricación exacto
│
├── Histórico de Precios & Transacciones
│   ├── Precio inicial de anuncio
│   ├── Precio final de venta (critical)
│   ├── Días en mercado
│   ├── Número de revisiones/relistas
│   ├── Plataforma de origen
│   ├── Región/País
│   ├── Fecha de transacción
│   └── Fuente de verificación (si es pública)
│
├── Condición Física
│   ├── Kilometraje exacto en venta
│   ├── Estado exterior (choque menor? tapicería dañada?)
│   ├── Estado mecánico declarado
│   ├── Historial de reparaciones (si disponible)
│   ├── Repuestos próximos a cambio (pastillas, aceite, etc.)
│   ├── Accidentes registrados
│   ├── Revisiones técnicas pasadas
│   └── Servicio oficial vs taller independiente
│
├── Atributos de Valor
│   ├── Especificación de lujo (techo, cuero, extras)
│   ├── Historial de propietarios (privado vs empresa)
│   ├── Documentación completa (mantenimiento, facturas)
│   ├── Colección completa de llaves/repuestos
│   └── Estado de los neumáticos/frenos/batería
│
└── Meta-Datos de Transacción
    ├── Tipo de vendedor (concesionario, privado, subasta)
    ├── Velocidad de venta (urgencia)
    ├── Contexto económico regional
    └── Estacionalidad
```

### 1.2 Índices de Volatilidad Temporal

**¿Por qué?** El valor de un coche cambia por factores externos.

**Almacenar:**
- **Tablas de depreciación por modelo/año** (curva esperada)
- **Efectos estacionales** (verano sube SUVs, invierno baja descapotables)
- **Cambios regulatorios** (restricciones Euro, EV incentivos)
- **Eventos de mercado** (nueva generación lanzada = valor anterior cae)
- **Inflación regional** (poder adquisitivo local)

### 1.3 Matriz de Volatilidad por Segmento

**Almacenar volatilidad histórica:**

```
Por (Marca, Modelo, Rango-Años, Motorización):
├── Precio medio últimos 30 días
├── Desviación estándar
├── Percentil 25, 50, 75, 95
├── Tendencia (subiendo/bajando/estable)
├── Seasonality Factor
└── Anomalía Flag (si hay cambios bruscos)
```

---

## 2. SEÑALES DE VALORACIÓN - LAS 7 PILARES

### 2.1 Pilar 1: Valoración Comparativa (Comparables)

**Algoritmo de búsqueda de gemelos:**

Buscar en memoria histórica los 50 vehículos MÁS similares considerando:

1. **Match exacto** (punto 100%):
   - Mismo modelo, año ±1, motorización exacta
   - Kilometraje similar (±10%)
   - Condición similar
   - Región similar (Francia ≠ Romania, precios distintos)

2. **Weights de importancia:**
   ```
   Año/Generación: 25%
   Motorización: 20%
   Kilometraje: 20%
   Condición: 15%
   Extras/Especificación: 10%
   Región: 10%
   ```

3. **Output:** Rango de valores (p25-p75) y precio mediano

### 2.2 Pilar 2: Depreciación Esperada (Age-Based)

**Modelo de depreciación histórica:**

```
Año 1: -15% a -20% del MSRP original
Año 2-3: -8% a -12% anual
Año 4-7: -5% a -8% anual
Año 8-12: -3% a -5% anual
Año 13+: -1% a -3% anual
```

**Ajustes por:**
- Modelo específico (premium deprecia diferente que económico)
- Kilometraje (acelerador o no)
- Combustible (diesel > gasolina en EU, pero cambiando)

**Output:** Precio esperado por edad

### 2.3 Pilar 3: Ajustes por Condición

**Matriz de penalizaciones:**

```
ESTADO EXTERIOR:
├── Impecable: 0%
├── Rasguños superficiales: -2%
├── Abolladura menor: -5%
├── Pintura visible desgastada: -8%
├── Daño estructural menor: -15%
└── Accidente registrado: -20% a -40%

ESTADO INTERIOR:
├── Impecable: 0%
├── Desgaste normal: -2%
├── Grietas/desgarre tapizado: -5%
├── Humo/olor persistente: -10%
└── Daño eléctrico/funcionalidad: -10% a -20%

MECÁNICA:
├── Máximo rendimiento: 0%
├── Desgaste normal esperado: -1%
├── Próxima revisión cercana: -5%
├── Fallos menores conocidos: -8%
├── Problemas graves: -25% a -50%

NEUMÁTICOS/FRENOS:
├── Nuevos: 0%
├── >80% vida: 0%
├── 50-80% vida: -3%
├── <50% vida: -8%
└── Peligro de seguridad: -15%
```

**Output:** Multiplicador de valor (0.6x a 1.0x)

### 2.4 Pilar 4: Volatilidad de Mercado Local

**Análisis de fluctuaciones regionales:**

```
Por región + modelo:
├── Desviación estándar de precios últimos 90 días
├── Velocidad de cambio (trend slope)
├── Estacionalidad actual vs histórico
└── Eventos locales (restricciones, nuevas fábricas, etc.)

Aplicar multiplicador:
├── Mercado estable: 1.0x
├── Mercado bajista: 0.95-0.98x (presión a la baja)
├── Mercado alcista: 1.02-1.05x (presión al alza)
└── Anomalía extrema: Flag para revisión manual
```

### 2.5 Pilar 5: Indicadores de Urgencia del Vendedor

**Señales de motivación:**

```
Urgencia Baja (vendedor paciente):
├── Primer anuncio
├── Fotos profesionales (10+ fotos, video)
├── Descripción detallada
├── Precio competitivo
└── Vendedor tiene múltiples vehículos (concesionario)

Urgencia Media (presión moderada):
├── 2-3 revisiones de anuncio
├── Precio bajó 5-10%
├── 30-45 días en mercado
└── Menciona "vendo rápido"

Urgencia Alta (OPORTUNIDAD POTENCIAL):
├── 4+ revisiones, precios bajando regularmente
├── >50 días en mercado
├── Precio bajó >15%
├── Frases: "cierre de negocio", "liquidación", "divorcio"
├── Múltiples canales (privados vendiendo el mismo coche)
└── Concesionario bajo presión (demasiado stock)
```

**Output:** Urgency Score (0-100)

### 2.6 Pilar 6: Anomalías de Precios (Statistical Outliers)

**Detección de anomalías:**

```
Para cada vehículo nuevo en mercado:

1. Calcular Z-score vs historicales:
   Z = (Precio - Media) / DesviaciónEstándar
   
   |Z| > 2.0: Outlier suave (-10% o +15% = anómalo)
   |Z| > 3.0: Outlier severo (es definitivamente raro)

2. Causas posibles:
   ├── Precio muy bajo → OPORTUNIDAD POTENCIAL
   ├── Precio muy alto → Vendedor sobreestima (no viable)
   ├── Especificación única → Recalcular con subset
   └── Error de entrada de datos → Flag para verificación

3. Context import:
   ├── ¿Es el único disponible en región? (monopolio = sube precio)
   ├── ¿Hay 100 iguales? (commoditizado = cae precio)
   └── ¿Es color raro? (azul= más demanda que marrón)
```

### 2.7 Pilar 7: Señales de Mercado Negro (Red Flags)

**Descartar oportunidades fraudulentas:**

```
RIESGOS CRÍTICOS (Descartar):
├── VIN inconsistente con datos
├── Múltiples propietarios en <1 año
├── Accidente registrado pero no declarado
├── Odómetro bajó entre anuncios (fraude)
├── Precio ilógicamente bajo sin razón clara
├── Vendedor sin verificación, anónimo
├── Licencia/documentos faltantes
├── País origen ≠ país venta (importación ilegal posible)
└── Financiamiento aún activo (vehículo embargable)

SEÑALES DE ALERTA (Revisar manualmente):
├── Primer anuncio sin fotos
├── Descripción vaga ("buen estado")
├── Múltiples cambios rápidos de precio
├── Llamadas telefónicas bloqueadas
├── Pagos solo en cripto/efectivo
└── Presión para cerrar rápido
```

---

## 3. DETECCIÓN DE INFRAVALORACIÓN - EL ALGORITMO CORE

### 3.1 Valor Real Calculado (RealValue)

**Fórmula:**

```
RealValue = (ComparablePrice × 0.40) 
          + (DepreciationPrice × 0.30)
          + (ManualAppraisalEstimate × 0.30)

Donde:

ComparablePrice = Mediana de 50 vehículos similares recientes
DepreciationPrice = Valor base - depreciación acumulada por años/km
ManualAppraisalEstimate = Modelo de regresión con todos los atributos
```

### 3.2 Margen de Infravaloración

```
UndervalueMargin = (RealValue - ListingPrice) / RealValue × 100

Interpretación:
├── < -5%: Sobrevalorado (ignorar)
├── -5% a 0%: Precio justo (neutral)
├── 0% a 5%: Ligeramente infravalorado (débil)
├── 5% a 15%: OPORTUNIDAD MODERADA (atractivo)
├── 15% a 25%: OPORTUNIDAD FUERTE (investigar)
├── > 25%: OPORTUNIDAD EXTRAORDINARIA (riesgo alto, verificar fraude)
```

### 3.3 Ventana de Tiempo Crítica

**¿Cuándo es más probable que sea real la oportunidad?**

```
Factor Tiempo:

Dentro de 3 horas:     Oportunidad FRESCA (competidor no vio)
Dentro de 24 horas:    Buena (early pero conocida)
1-7 días:              Normal (otros ya la vieron)
>7 días sin bajar:     Probablemente hay razón oculta
>14 días muy infravalorado: RED FLAG (¿Qué está mal?)

Lógica:
├── Si Margin > 15% Y Horas < 3 = ALERTA INMEDIATA
├── Si Margin > 15% Y Días > 7 = Probablemente defecto no visible
└── Si Margin > 25% = INVESTIGACIÓN OBLIGATORIA
```

---

## 4. OPPORTUNITY SCORE - MÉTRICA ROBUSTA (0-100)

### 4.1 Componentes del Score

```
OpportunityScore = (W1 × ValueComponent) 
                 + (W2 × RiskComponent) 
                 + (W3 × TimingComponent)
                 + (W4 × ReliabilityComponent)

Donde cada componente es 0-100
```

### 4.2 Value Component (Peso: 40%)

```
= (UndervalueMargin / 30%) × 100, capped 100
- Si margin es 15%: 50/100
- Si margin es 30%: 100/100
- Si margin es 5%: 17/100

Ajustes:
├── Restar 20 puntos si hay Red Flags
├── Restar 15 puntos si vendedor urgente (riesgo fraude)
└── Sumar 10 puntos si hay documentación completa
```

### 4.3 Risk Component (Peso: 25%)

```
Evaluar:
├── Edad del vehículo (-5 por cada 5 años)
├── Kilometraje relativo (-2 por cada 50k km sobre esperado)
├── Historial de accidentes (-30 si hay, -50 si ocultado)
├── Componentes críticos próximos a fallar (-15 a -30)
├── Motorizaciones problemáticas (conocidas como frágiles)
└── País de origen vs destino (importaciones problemáticas)

Score: 100 - puntos deducidos (mín 0)
```

### 4.4 Timing Component (Peso: 20%)

```
BaseTiming = min(24 - HoursOnMarket, 100)
Penalizar si >7 días sin bajar precio (indica problema oculto): -30
Bonus si aparece exactamente cuando baja presión de mercado: +15

= BaseTiming + penalizaciones/bonus
```

### 4.5 Reliability Component (Peso: 15%)

```
Basado en qué tan confiables son nuestras señales:

Factores que AUMENTAN confianza:
├── Múltiples fuentes confirman precio (+15)
├── Documentación completa verificada (+15)
├── Vendedor con historial positivo (+10)
├── Fotos de calidad profesional (+10)
└── Acceso a historial completo de propietarios (+10)

Factores que DISMINUYEN confianza:
├── Datos incompletos (-20)
├── Vendedor nuevo sin historial (-15)
├── Fotos de baja calidad o AI-generated (-25)
├── Inconsistencias en la documentación (-30)
└── Información faltante clave (-25)

Score: 50 + ajustes (0-100)
```

### 4.6 Ejemplo de Cálculo

```
Caso: BMW 320i 2015, 120k km, precio €12,500

1. Value Component (40%):
   - RealValue: €14,200
   - Margin: (14200-12500)/14200 = 12%
   - Score: (12/30) × 100 = 40
   - Red flags: -10
   - Component: 30

2. Risk Component (25%):
   - Edad normal para modelo: -2
   - Km normal para edad: -1
   - Motorizador N47 (problemático): -15
   - Component: 82

3. Timing Component (20%):
   - 8 horas en mercado: 92
   - No hay penalización (< 7 días)
   - Component: 92

4. Reliability Component (15%):
   - Documentación completa: +15
   - Fotos profesionales: +10
   - Vendedor privado sin historial: -15
   - Component: 60

FINAL: (30×0.40) + (82×0.25) + (92×0.20) + (60×0.15)
      = 12 + 20.5 + 18.4 + 9
      = 59.9 → Oportunidad MODERADA
```

---

## 5. DISTINGUIR OPORTUNIDADES REALES DE FALSAS

### 5.1 Matriz de Validación (3 Niveles)

```
NIVEL 1: Screening Automático (Análisis de datos existentes)
├── Verificar Red Flags críticos → Si hay 2+: DESCARTAR
├── Z-score de precio → Si > 3.0 AND antiguo: REVISAR MANUAL
├── Coherencia de datos → Si inconsistencias: REVISAR MANUAL
└── Score > 60: Avanzar a Nivel 2

NIVEL 2: Enriquecimiento Externo (Datos en tiempo real)
├── Búsqueda de historial complete del VIN
│  ├── ¿Registro consistente en múltiples países?
│  ├── ¿Transferencias documentadas?
│  └── ¿Accidentes ocultos en bases de datos?
├── Verificación de documentación
│  ├── ¿Fotos corresponden al VIN?
│  ├── ¿Kilometraje consistente?
│  └── ¿Sellados/evidencia de manipulación?
├── Análisis de fotos (AI/Computer Vision)
│  ├── ¿Fotos editadas o AI-generated?
│  ├── ¿Hay daño oculto?
│  └── ¿Desgaste consistente con km declarados?
└── Score confirmado > 55: Avanzar a Nivel 3

NIVEL 3: Inspección Física (Pre-compra)
├── Mecánica: Revisión motor completa
├── Electrónica: Scanear todos los módulos
├── Documentos: Verificación física de papeles
├── Testigo independiente: Inspector tercero
└── Negociación final: Precio vs defectos encontrados
```

### 5.2 Oportunidad FALSA - Patrones a Detectar

```
PATRÓN 1: "Precio bajo pero hay razón oculta"
├── Síntoma: Margen 20%, pero >15 días sin venderse
├── Causa común: Defecto mecánico no mencionado
├── Detección: Cross-check con foros BMW, problemas modelo/año
├── Válido si: Defecto es reparable económicamente

PATRÓN 2: "Fraude simple" 
├── Síntoma: Precio 40%+ bajo, vendedor presuroso
├── Causa: Documento falsificado, vehículo robado, o financiado
├── Detección: Verificar VIN en registros oficiales
├── Acción: BLOQUEAR

PATRÓN 3: "Trampa de liquidación"
├── Síntoma: Concesionario vende <70% valor, muchos autos
├── Causa: Stock excesivo, cierre de negocio
├── Detección: Buscar noticia sobre concesionario
├── Válido si: Oportunidad es real pero mercado estresado

PATRÓN 4: "Daño estético oculto"
├── Síntoma: Precio bajo solo por pintura/interior
├── Causa: Accidente o desgaste extremo
├── Detección: Análisis de fotos, preguntas sobre origen
├── Válido si: Repintado profesionalmente y ya no da problemas

PATRÓN 5: "Componente a punto de fallar"
├── Síntoma: Precio razonable pero motor/transmisión al límite
├── Causa: Próximo a fallo, vendedor lo sabe
├── Detección: Historial de reparaciones, escaneo eléctrico
├── Válido si: Costo reparación < margen ahorrado
```

### 5.3 Matriz de Confianza Final

```
OPORTUNIDAD SEGURA:
├── Score > 70
├── Documentación completa
├── Sin Red Flags
├── Margen 5-15%
├── Menos de 48 horas en mercado
└── Acción: COMPRAR (bajo riesgo)

OPORTUNIDAD MODERADA:
├── Score 55-70
├── Algunos datos confirmables
├── Red Flags leves (no críticos)
├── Margen 10-20%
├── 2-7 días en mercado
└── Acción: INSPECCIONAR (riesgo medio, potencial alto)

OPORTUNIDAD RIESGOSA:
├── Score 40-55
├── Datos parcialmente confirmables
├── 1-2 Red Flags moderados
├── Margen > 20%
├── > 7 días en mercado
└── Acción: REVISAR MANUAL (riesgo alto, requiere diligencia)

NO OPORTUNIDAD:
├── Score < 40 O
├── 3+ Red Flags O
├── Margen negativo O
├── Fraude detectado
└── Acción: DESCARTAR
```

---

## 6. DATOS A RECOPILAR DIARIAMENTE - MOTOR DE APRENDIZAJE

### 6.1 Pipeline de Ingesta Diaria

```
6 AM UTC - Trigger de recopilación de datos:

FUENTE 1: Plataformas principales
├── Clasificados regionales (Milanuncios ES, Autoscout24, Mobile.de, etc.)
├── Datos capturados: Todos los nuevos anuncios + modificaciones
├── Métodos: Web scraping + APIs oficiales donde disponibles
├── Frecuencia: Cada 4 horas
└── Campos: precio, km, año, fotos, detalles del vendedor, timestamp

FUENTE 2: Subastas y liquidaciones
├── Subastas de vehículos (BVA, Copart Europe)
├── Venta en lote de concesionarios
├── Liquidaciones por insolvencia
└── Datos: Precio de venta final, condición, historial de pujas

FUENTE 3: Datos técnicos públicos
├── Registros VIN públicos (donde disponible)
├── Bases de accidentes
├── Inspecciones técnicas (ITV/MOT)
├── Emisiones y sanciones
└── Cambios legislativos que afecten valores

FUENTE 4: Señales de mercado
├── Precios de combustible y tendencias energéticas
├── Indicadores económicos locales
├── Cambios de restricciones (zonas limpias)
├── Lanzamientos de nuevos modelos
└── Eventos (feriados, festividades)

FUENTE 5: Enriquecimiento externo
├── Weather data (lluvia = menos demanda de descapotables)
├── Datos de tráfico y aseguración por región
├── Crédito y tipos de interés (afecta demanda)
└── Tendencias de search (Google Trends)
```

### 6.2 Tabla de Enriquecimiento Diario

**Para cada vehículo capturado, almacenar:**

```
ID Snapshot Diario:
├── Fecha/Hora captura
├── Estado: "Nuevo" / "Relistado" / "Bajado"
├── Cambios desde última captura (precio, fotos, descripción)
├── Vendedor: Cambios en número de contacto, ubicación, historial
├── Histórico de precios: Gráfico de cómo cambió
├── Histórico de visitas/contactos: Proxy de demanda
├── Cambios en fotos: ¿Agregó/removió fotos?
├── Cambios en descripción: Qué se aclaró/modificó
├── Engagement: Likes, mensajes, compartidos
└── Ubicación y cambios de región/concesionario
```

### 6.3 Modelo de Aprendizaje Continuo

**Feedback Loop:**

```
DÍA 1: Oportunidad detectada (Score 75, Margin 12%)
    └─ Acción recomendada: Inspeccionar

DÍA 2-3: Usuario inspecciona
    └─ Input: Defectos encontrados, precio negociado
    └─ Almacenar: Desviación entre Score predicho y realidad

DÍA 5: Compra realizado / No comprado
    └─ Input: Razón final, precio pagado
    └─ Feedback crítico: ¿Score fue preciso?

DÍA 30+: Análisis de adquisición
    └─ ¿Se vendió rápido? ¿A qué precio?
    └─ Implicación: ¿Margen fue real o falso?

APRENDIZAJE EXTRACCIÓN:
├── Ajustar weights de componentes que fallaron
├── Actualizar Red Flags (si uno fue mal predictor)
├── Refinar volatilidad por modelo/región (si desviaciones grandes)
├── Mejorar Reliability Component (si datos faltaban)
└── Reentrenar modelos de depreciación
```

### 6.4 Métricas de Desempeño Diarias

```
TRACKING PERMANENTE:

Precision (¿Cuántas oportunidades predichas fueron reales?):
├── Oportunidades Score > 60 compradas: X
├── De ésas, márgenes reales > 10%: Y
├── Precision = Y/X

Recall (¿Detectamos todas las oportunidades que había?):
├── Oportunidades reales compradas por usuarios: Z
├── De ésas, nuestro sistema las detectó: W
├── Recall = W/Z

False Positive Rate:
├── Scoring error > 20 puntos
├── Causa: Datos incompletos, fraude no detectado

Speed to Detection:
├── Promedio de horas hasta detectar oportunidad
├── Benchmark: < 3 horas para Score > 70

ROI del Sistema:
├── Margen promedio detectado vs mercado general
├── Debe ser > 8% para justificar análisis
```

### 6.5 Triggers de Reentrenamiento

```
CUANDO: Semanal + Eventos
├── Viernes: Reentrenamiento semanal con últimos 7 días
├── Domingo: Actualización de estacionalidad
├── Cambio regulatorio: Reajuste inmediato
├── Crash de mercado (> 15% en 1 semana): Reajuste urgente

QUÉ: Modelos a recalibrar
├── Matriz de depreciación por modelo/año
├── Volatilidad regional
├── Weights de componentes del Score
├── Red Flags patterns (nuevos fraudes)
├── Seasonality factors
└── Clustering de compradores (preferencias emergentes)
```

---

## 7. ARQUITECTURA DE DATOS - VISTA TÉCNICA (Sin código)

### 7.1 Capas de Datos

```
LAYER 1: Raw Data
├── Web scrape jobs (todos los anuncios)
├── API calls (registros públicos)
├── Manual inputs (inspecciones)
└── Third-party feeds (subastas, etc.)

LAYER 2: Standardized Data
├── Normalización de campos
├── Deduplicación de VINs
├── Resolución de conflictos
└── QA checks

LAYER 3: Enriched Data
├── Historical lookups
├── API enhancements (valuation APIs)
├── AI Analysis (foto analysis, sentiment análisis)
└── Derivadas computed fields

LAYER 4: Intelligence
├── Comparable matrices
├── Risk scoring
├── Opportunity ranking
└── Alerts & recommendations

LAYER 5: Actions
├── User dashboard
├── Alerts (email, push, SMS)
├── Negociación asistida
└── Follow-up tracking
```

### 7.2 Granularidad de Datos

```
NIVEL 1: Snapshot Completo (Una fila por vehículo nuevo)
├── Todos los atributos en t=0
├── Valor inicial de oportunidad
└── Acción recomendada

NIVEL 2: Time Series (Histórico de cambios)
├── Precio histórico (cada cambio)
├── Fotos/descripción (cambios)
├── Contactos de vendedor (cambios)
└── Engagement (vistas/likes diarios)

NIVEL 3: Transacciones (Cuando ocurren)
├── Compra exitosa
├── Inspección realizada
├── Negociación
└── Feedback post-compra

NIVEL 4: Agregaciones (Índices)
├── Precio promedio por modelo/región/mes
├── Distribución de márgenes
├── Tasas de éxito por Score
└── Contribución de cada pilar al score
```

---

## 8. FEEDBACK LOOP CRÍTICO - CÓMO MEJORA EL SISTEMA

```
CICLO SEMANAL:

Monday (Análisis):
├── Revisar: Todas las oportunidades Score > 60 de últimos 7 días
├── Preguntar: ¿Cuáles se compraron? ¿Cuáles no?
├── Extraer: Patrón de por qué se perdieron buenas oportunidades

Wednesday (Diagnóstico):
├── Si Precision baja < 60%:
│  └─ ¿Problema? Margen real fue diferente al predicho
│  └─ Acción: Revisar modelo de depreciación
├── Si Recall baja < 70%:
│  └─ ¿Problema? No detectamos oportunidades que otros sí
│  └─ Acción: Bajar threshold de Score, revisar Red Flags

Friday (Reajuste):
├── Actualizar pesos de componentes
├── Reentrenar volatilidad por región
├── Revisar Red Flags (¿Hay nuevos fraudes?)
└── Test: Ejecutar modelo antiguo vs nuevo en datos históricos

Next Monday: Deployer nuevos modelos a Producción
```

---

## 9. VENTAJAS COMPETITIVAS DEL SISTEMA

```
1. VELOCIDAD:
   ├── Detecta oportunidades en < 3 horas
   ├── Mientras otros humanos aún duermen
   └── Ventaja: First-mover en oportunidades reales

2. PRECISIÓN:
   ├── Score robusto que aprende de falsos positivos
   ├── Distingue fraudes de oportunidades reales
   └── Ventaja: No perder dinero en "ganga" fake

3. ESCALA:
   ├── Analiza 10k+ anuncios diarios sin esfuerzo humano
   ├── Mientras competidor manual hace 50
   └── Ventaja: Mayor cobertura, más opciones

4. APRENDIZAJE:
   ├── Sistema que mejora cada transacción
   ├── Competidor siempre comete mismo error
   └── Ventaja: Compounding advantage con tiempo

5. CONTEXTO LOCAL:
   ├── Entiende volatilidad de cada región/mercado
   ├── BMW 320i en Barcelona ≠ Bucarest
   └── Ventaja: Precios más justos, menos sorpresas
```

---

## 10. CASOS DE USO - EJEMPLOS

### Caso 1: Oportunidad Legítima

```
Viernes 9 AM:
- Audi A4 2018, 98k km, €18,500
- Comparable median: €20,100
- Margin: 8%
- Score components:
  ├── Value: 35 (pequeño pero presente)
  ├── Risk: 85 (baja edad, km normal)
  ├── Timing: 98 (recién listado, 2 horas)
  ├── Reliability: 70 (documentación ok)
  └── FINAL SCORE: 65 (MODERADA)

- Red Flags: Ninguno
- Recomendación: "Inspecciona hoy, otros lo harán mañana"
- Resultado: Comprado a €18,200 (1% más bajo)
- Post-venta: Vendido a €20,800 en 3 meses (profit = €2,600)
- Feedback: ✓ Éxito - Score fue preciso
```

### Caso 2: Falsa Oportunidad

```
Miércoles 11 AM:
- Mercedes C-Class 2011, 250k km, €7,200
- Comparable median: €9,800
- Margin: 26.5%
- Score components:
  ├── Value: 88 (margen grande!)
  ├── Risk: 45 (muy viejo, muy km)
  ├── Timing: 55 (18 días en mercado)
  ├── Reliability: 35 (fotos borrosas, vendedor anónimo)
  └── FINAL SCORE: 58

- Red Flags:
  ├── ✗ Margen > 25% sin razón clara
  ├── ✗ Vendedor sin historial
  ├── ✗ >15 días sin bajar precio más
- Recomendación: "REVISAR MANUAL - Riesgo fraude"
- Inspector descubre: Motor con fisuras, scam setup
- Feedback: ✓ Sistema evitó pérdida de €7,200
```

### Caso 3: Oportunidad Estacionalizada

```
Octubre (Otoño, baja demanda de descapotables):
- Porsche 911 Cabrio 2014, 165k km, €35,000
- Normal price (summer): €42,000
- Seasonal adjustment: -20% en otoño
- Adjusted comparable: €33,600
- Margin: 4% (bajo, pero normal para estación)
- Score: 45 (oportunidad débil)

Pero:
- Buyer inteligente espera a Noviembre
- Marzo siguiente: Mismo cabrio por €40,500
- Profit si mantiene: €5,500 en 5 meses
- Feedback: Sistema enseña timing estacional
```

---

## RESUMEN EJECUTIVO

Este motor de detección de oportunidades es un **sistema de aprendizaje multi-capa** que:

1. **Aprende**: De cada transacción real
2. **Contextualiza**: Entiende mercados locales y globales
3. **Anticipa**: Detecta oportunidades antes que otros
4. **Verifica**: Distingue fraudes de ganancias reales
5. **Escala**: Procesa miles de anuncios diarios
6. **Mejora**: Precisión compounding con el tiempo

**Métrica de Éxito**: 
- Margen promedio detectado: > 12% del valor real
- Precision Score > 65 predicho al score real
- False positive rate < 10%
- Speed to detection < 3 horas para Score > 70
