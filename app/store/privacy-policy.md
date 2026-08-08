# Política de privacidad de Peaker

> **Borrador.** Describe con fidelidad lo que la aplicación hace hoy, deducido del código, no lo que
> se querría que hiciera. Antes de publicarla faltan tres cosas que no son técnicas: **revisión
> legal**, una **dirección de contacto real** y un **dominio** donde servirla en HTTPS, que las dos
> tiendas exigen. Si el comportamiento de la aplicación cambia, este documento cambia con él: B8
> traerá almacenamiento sin conexión y habrá que revisarlo.

Última actualización: pendiente de publicación.

## 1. Qué datos se recogen

| Dato | Cuándo | Dónde acaba |
|---|---|---|
| Correo electrónico y nombre de usuario | Al crear la cuenta | Servicio de autenticación |
| Nombre visible, biografía, país y dirección pública | Si los rellenas en tu perfil | Servicio de cuentas |
| Foto de perfil | Si subes una | Cloudinary, y su enlace en el servicio de cuentas |
| Ascensiones: montaña, fecha, acompañantes, notas de vía y condiciones | Al registrar una cumbre | Servicio de ascensiones |
| Fotos de una ascensión | Si las adjuntas | Cloudinary, y sus enlaces en el servicio de ascensiones |
| Coordenadas de tu posición | Solo al pulsar «Usar mi ubicación» | **No se guardan**: viajan en la consulta de picos cercanos y se descartan |

No hay analítica, ni publicidad, ni rastreadores de terceros. La aplicación no lleva ningún SDK de
medición, y eso se puede comprobar en el `package.json` del repositorio.

## 2. Respuestas para los formularios de las tiendas

Play pide el cuestionario de *Seguridad de los datos* y Apple el de *App Privacy*. Estas son las
respuestas que corresponden a la tabla anterior:

- **Se recogen y se vinculan a tu identidad**: correo, nombre de usuario, contenido del perfil y
  ascensiones con sus fotos.
- **Se recoge pero no se vincula**: nada.
- **Se usa para seguimiento entre aplicaciones**: nada.
- **Ubicación**: se usa, **no se recoge** —no se almacena en ningún servidor ni se asocia a tu
  cuenta—, y solo cuando la pides expresamente.
- **Cifrado en tránsito**: sí, en producción todo el tráfico va por HTTPS.
- **Borrado de la cuenta**: sí, desde la propia aplicación, en Cuenta → Zona de peligro.

## 3. Permisos del dispositivo, y por qué

- **Cámara**: solo para fotografiar una cumbre al registrarla, o tu foto de perfil. Se pide al
  pulsar el botón, nunca al abrir la aplicación.
- **Fotos**: para adjuntar imágenes que ya tienes. Se pide igual, al pulsar.
- **Ubicación**: para listar las cumbres cercanas. Se pide al pulsar «Usar mi ubicación», y si la
  deniegas puedes escribir las coordenadas a mano: la pantalla sigue siendo utilizable.

Ninguno de los tres se pide al arrancar, y los tres se pueden revocar desde los ajustes del sistema
sin que la aplicación deje de funcionar en lo demás.

## 4. Qué se guarda en el teléfono

La sesión se guarda en el **almacenamiento seguro del sistema**: Android KeyStore y Keychain de
iOS. El testigo de acceso vive solo en memoria y desaparece al cerrar la aplicación; el de
renovación es el único que se persiste, y se borra al cerrar sesión o al fallar una renovación.

El idioma elegido y la vista preferida del listado se guardan como preferencias corrientes, sin
cifrar, porque no son secretos.

## 5. Terceros

- **Cloudinary** aloja las imágenes que subes.
- **El proveedor de teselas del mapa** recibe, al abrir un mapa, las peticiones de las teselas
  visibles. Eso revela la zona que estás mirando, no tu identidad.

No se comparte ningún dato con nadie más, ni se vende a nadie.

## 6. Tus derechos

Puedes editar tu perfil y cada una de tus ascensiones cuando quieras, y decidir una a una cuáles
son públicas. Puedes **cerrar la cuenta** desde la aplicación; la baja es irreversible y elimina tus
datos. Para cualquier otra petición, la dirección de contacto irá aquí cuando exista.

## 7. Menores

Peaker no está dirigida a menores de 13 años y no recoge datos de forma consciente sobre ellos.
