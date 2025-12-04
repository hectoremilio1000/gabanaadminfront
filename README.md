# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

### aqui me quede Con esto ya tienes:

Pantalla de Usuarios con stats y tabla.

Modal “Nuevo usuario” conectado a tu POST /api/users.

Menú en el layout para cambiar entre Listings y Usuarios.

Backend con GET /api/users protegido y respetando el rol.

Cuando lo levantes, tu superadmin podrá presumirle al cliente que:

Ve todos los usuarios con roles y correos.

Crea nuevos usuarios desde un modal súper limpio.

Cuando quieras seguimos con:

Reset de password,

desactivar usuarios,

y edición de rol/estado en la tabla.

ta,mbien falta

6️⃣ ¿Qué más debería poder hacer un superadmin aquí?

Además de crear/editar/borrar listings y crear usuarios, típicas capacidades de superadmin en este contexto:

Gestión de usuarios

Crear publishers/staff/superadmin (con las reglas que ya pusiste en el backend).

Resetear contraseña.

Desactivar usuarios.

Moderación de listings

Cambiar status (draft/published/archived).

Marcar/desmarcar “Premier”.

Ver quién creó cada listing (campo createdBy).

Media

Panel para ver fotos del listing, cambiar portada, borrar y reordenar (ya tienes endpoints en el backend, solo falta UI).

Auditoría ligera

Logs sencillos: “X usuario creó listing Y”, “editó precio”, etc. (aunque esto ya es un siguiente nivel).

Pero con lo que acabamos de montar (listado + stats + crear/editar/borrar + botón de usuarios) ya tienes una pantalla muy impresionante visualmente y lista para enseñar a cliente.

Si quieres, el siguiente paso puede ser:
👉 armar el módulo de Usuarios (UsersPage + UserModal) usando el mismo estilo de componentes.
# gabanaadminfront
