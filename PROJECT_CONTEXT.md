# Coches SaaS - Contexto actual

Stack:
- React + Vite
- React Router
- Supabase
- GitHub

Repositorio:
https://github.com/inviertetodo-hue/coches-saas-

Estado:
- App funcionando en localhost
- Login Supabase funcionando
- Registro funcionando
- Sesión persistente funcionando
- Logout funcionando
- Tabla cars creada en Supabase
- Dashboard lee coches desde Supabase
- Dashboard añade coches
- Dashboard elimina coches
- RLS configurado para SELECT, INSERT y DELETE
- Importador IA creado en /importer

Rutas:
- /
- /dashboard
- /deals
- /importer
- /login

Objetivo del SaaS:
Herramienta IA para analizar coches de webs europeas y detectar oportunidades rentables de importación Europa → España.

Próximo paso:
- Mejorar Importador IA
- Añadir etiqueta automática: CHOLLO IA / ANALIZAR / DESCARTAR
- Guardar análisis del importador en Supabase
- Crear scoring más profesional
