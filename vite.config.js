import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Chemins relatifs : le site fonctionne aussi bien à la racine d'un domaine
// que dans un sous-dossier GitHub Pages (https://<compte>.github.io/rosa-parc/).
export default defineConfig({ base: "./", plugins: [react(), tailwindcss()] });
