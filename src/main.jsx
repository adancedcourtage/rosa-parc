import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import RosaParcAtelier from "./RosaParcAtelier.jsx";

/* Site retenu par le client : maquette 3 « Atelier Rose ».
   Les maquettes 1 et 2 sont archivées dans src/archives/ et restent consultables
   via ?archive=1 (Rose Glass) ou ?archive=2 (Nuit d'Orient). Chargées à la demande,
   elles n'alourdissent pas le site principal. */
const ARCHIVES = {
  1: lazy(() => import("./archives/Maquette1RoseGlass.jsx")),
  2: lazy(() => import("./archives/Maquette2NuitDOrient.jsx")),
};
const Archived = ARCHIVES[new URLSearchParams(location.search).get("archive")];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {Archived ? (
      <Suspense fallback={null}>
        <Archived />
      </Suspense>
    ) : (
      <RosaParcAtelier />
    )}
  </React.StrictMode>
);
