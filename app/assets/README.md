# Arte fuente de la marca

`logo.png` es el **origen del icono de la aplicación**: la insignia circular de Peaker, 2816×1536
con el círculo centrado sobre fondo transparente. El mismo fichero vive en
`peaker-web/portal/src/app/assets/logo.png`, que es de donde lo lee el generador.

## Los iconos se generan, no se editan a mano

```bash
cd ../../peaker-web/portal && npm run icons
```

`scripts/generate-icons.mjs` localiza el círculo por su caja de píxeles opacos —así el recorte
sigue saliendo bien si el logotipo cambia de márgenes—, lo recorta en cuadrado y escribe en los dos
repositorios. Usa el `sharp` que Next ya arrastra como dependencia, de modo que no añade nada al
árbol de móvil. Lo que escribe aquí:

| Fichero | Para qué |
|---|---|
| `res/mipmap-*/ic_launcher.png` · `ic_launcher_round.png` | Lanzadores de API 24 y 25, anteriores al icono adaptativo |
| `res/mipmap-*/ic_launcher_foreground.png` | Capa delantera del icono adaptativo (API 26+) |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png` | Icono de iOS, 1024×1024 |

**La capa delantera ocupa dos tercios del lienzo**, que es la zona segura de los 108 dp del icono
adaptativo: la máscara circular del sistema cae justo sobre el borde del círculo azul. El fondo es
`@color/ic_launcher_background`, hoy `#FFFFFF`, porque el logotipo trae su propio anillo blanco.

**Los ficheros de iOS van sin canal alfa.** Se aplanan sobre blanco a propósito: la App Store
rechaza un icono con transparencia (ITMS-90717).

## Lo que sigue siendo vectorial

| Fichero | Para qué |
|---|---|
| `res/drawable/ic_launcher_monochrome.xml` | Capa monocroma de los iconos temáticos (API 33+) |
| `res/drawable/splash.xml` · `splash_icon.xml` | Splash de arranque y el del sistema de Android 12+ |

Son los dos trazos de `MountainSnowIcon` de [lucide](https://lucide.dev) (licencia ISC,
redistribuible), el mismo icono que `Header.tsx` usa como marca en el portal, sobre `#005C41` —la
conversión a sRGB de `oklch(0.42 0.09 165)`, el token `--primary` del modo claro de
`src/styles/globals.css`, que queda fuera de gama y se recorta—. `icon.svg` es su origen.

**Deuda declarada:** el splash y la capa monocroma siguen mostrando la montaña verde, no la
insignia azul. La monocroma tiene que ser una silueta de un solo tono y el splash, un vector nítido
a cualquier densidad; ninguna de las dos se saca de un PNG con degradado sin redibujarla. Se deja
como está antes que rasterizar mal.

`@capacitor/assets` se evaluó y se descartó en B7a: arrastra 7 avisos de seguridad sin corrección
disponible —`sharp` 0.32 con libvips vulnerable, un `@capacitor/cli` antiguo con `tar` crítico y
`minimatch`—. El generador del portal no cambia ese razonamiento: usa el `sharp` 0.34 que Next ya
trae, sin dependencia nueva en ninguno de los dos repositorios.
