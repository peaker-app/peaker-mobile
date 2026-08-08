# Arte fuente de la marca

`icon.svg` es el **único origen** del icono de la aplicación. Se construye con los dos trazos de
`MountainSnowIcon` de [lucide](https://lucide.dev) (licencia ISC, redistribuible), el mismo icono
que `Header.tsx` usa como marca en el portal, sobre el `--primary` de Peaker.

El color `#005C41` es la conversión a sRGB de `oklch(0.42 0.09 165)`, el token `--primary` del modo
claro de `src/styles/globals.css`. Queda fuera de la gama sRGB y se recorta: es el valor más
cercano representable, no una elección estética independiente. Si el token cambia, este fichero y
`android/app/src/main/res/values/ic_launcher_background.xml` cambian con él.

## Android no usa este fichero

En Android el icono y el splash son **`VectorDrawable`**, escritos a mano a partir de los mismos
dos trazos:

| Fichero | Para qué |
|---|---|
| `res/drawable/ic_launcher_foreground.xml` | Capa delantera del icono adaptativo (API 26+) |
| `res/drawable/ic_launcher_monochrome.xml` | Capa monocroma de los iconos temáticos (API 33+) |
| `res/drawable/splash.xml` | Splash de arranque |
| `res/drawable/splash_icon.xml` | Icono del splash del sistema de Android 12+ |

Son vectores porque el arte son dos trazos: se ven nítidos en cualquier densidad, no engordan el
APK y no necesitan herramienta de generación. `@capacitor/assets` se evaluó y se descartó en B7a:
arrastra 7 avisos de seguridad sin corrección disponible —`sharp` 0.32 con libvips vulnerable, un
`@capacitor/cli` antiguo con `tar` crítico y `minimatch`— para un trabajo que aquí es un `<path>`.

## De dónde salen los PNG

Solo hacen falta para los lanzadores de API 24 y 25, anteriores al icono adaptativo, y para iOS
(B7). Se rasterizan desde `icon.svg` **fuera del proyecto**, para no meter un rasterizador en el
árbol de dependencias:

```bash
mkdir /tmp/peaker-icons && cd /tmp/peaker-icons
npm init -y && npm install sharp
node -e "
const sharp = require('sharp');
const svg = require('fs').readFileSync('<ruta>/app/assets/icon.svg');
for (const [dir, size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]) {
  sharp(svg, { density: 600 }).resize(size, size)
    .toFile(\`<ruta>/app/android/app/src/main/res/mipmap-\${dir}/ic_launcher.png\`);
}
"
```

El script completo, con la máscara circular de `ic_launcher_round.png`, está en el mensaje del
commit de B7a.
