# Web personal — José Luis Martínez Pérez

Sitio web personal estático (HTML + CSS + JavaScript, sin dependencias ni build) con soporte
bilingüe **ES / EN**, tema oscuro/claro y despliegue en **GitHub Pages**.

## Estructura

```
.
├── index.html                 # Página única con todo el contenido (claves data-i18n)
├── assets/
│   ├── css/styles.css         # Tokens de diseño, tema oscuro/claro, layout y responsive
│   ├── js/i18n.js             # Diccionario de textos ES / EN
│   ├── js/main.js             # Tema, idioma, navegación, animaciones y formulario
│   └── img/favicon.svg        # Favicon
├── .github/workflows/deploy.yml   # Despliegue automático en GitHub Pages
├── .nojekyll                  # Evita el procesado Jekyll de GitHub Pages
├── robots.txt
├── sitemap.xml
└── README.md
```

## Publicar en GitHub Pages

1. Crea un repositorio. Para publicar en `https://TU-USUARIO.github.io` el repositorio debe
   llamarse exactamente **`TU-USUARIO.github.io`**. Cualquier otro nombre publica en
   `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

2. Sube el contenido de esta carpeta:

   ```bash
   git init
   git add .
   git commit -m "feat: web personal"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-USUARIO.github.io.git
   git push -u origin main
   ```

3. En el repositorio, **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   El workflow incluido se encarga del resto en cada `push` a `main`.

   > Alternativa sin Actions: en *Source* elige **Deploy from a branch → main / (root)**.
   > En ese caso puedes borrar `.github/workflows/deploy.yml`.

## Antes de publicar: 3 cosas que debes personalizar

| Qué | Dónde | Acción |
|---|---|---|
| **Formulario de contacto** | `index.html` → `<form action="https://formspree.io/f/TU_ENDPOINT">` | Crea una cuenta gratuita en [formspree.io](https://formspree.io), copia el ID del formulario y sustituye `TU_ENDPOINT`. Mientras no lo hagas, el formulario avisa de que no está configurado en lugar de fallar. |
| **URL del sitio** | `index.html` (`og:url`, `canonical`, JSON-LD), `robots.txt`, `sitemap.xml` | Sustituye `USUARIO.github.io` por tu dominio real. |
| **Dominio propio** (opcional) | Archivo `CNAME` en la raíz | Crea el archivo con una sola línea: `www.tudominio.com`, y configura el DNS según la documentación de GitHub Pages. |

## Editar el contenido

- **Textos en español**: están directamente en `index.html`, de modo que la página es legible
  incluso sin JavaScript (bueno para SEO).
- **Textos en inglés**: en `assets/js/i18n.js`, dentro del objeto `en`.
- Cada elemento traducible lleva un atributo `data-i18n="clave"`. Si añades un elemento nuevo,
  añade la misma clave en **los dos** diccionarios (`es` y `en`) de `i18n.js`.

Ejemplo:

```html
<p data-i18n="about.p4">Texto en español.</p>
```

```js
// i18n.js
es: { "about.p4": "Texto en español." },
en: { "about.p4": "Text in English." }
```

- El idioma se detecta del navegador la primera visita y luego se recuerda en `localStorage`.
- El tema respeta `prefers-color-scheme` y también se recuerda.

## Desarrollo local

No hay build. Basta con abrir `index.html`, aunque para que el `fetch` del formulario y las
rutas relativas se comporten igual que en producción es mejor servirlo:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Características

- Diseño responsive con tema oscuro por defecto y conmutador a claro.
- Bilingüe ES/EN sin recargar la página.
- Animaciones de entrada y contadores con `IntersectionObserver`, respetando
  `prefers-reduced-motion`.
- Accesibilidad: enlace de salto al contenido, `aria-*`, foco visible, contraste alto y
  navegación por teclado.
- SEO: metadatos Open Graph, `canonical`, datos estructurados `schema.org/Person` y sitemap.
- Hoja de estilos de impresión: `Ctrl/Cmd + P` genera un CV en PDF razonable.

## Licencia

Código bajo licencia MIT (ver `LICENSE`). El contenido del CV y los datos personales
son propiedad de José Luis Martínez Pérez.
