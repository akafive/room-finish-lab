# Room Finish Lab

A small browser-based 3D renovation prototype. Compare the original natural-oak living room with limestone or smoked walnut and a matching wall color. Both views use one Three.js scene and camera, so the geometry, lighting, and viewpoint stay fixed while you compare finishes.

## Run locally

Requires Node.js 22.12 or later and a browser with WebGL 2.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Use the finish controls to update the right-hand view, or **Reset preview** to restore limestone. Run `npm run build` to type-check and generate the static site in `dist/`.

The sample room uses procedural geometry and textures. The prototype needs no accounts, uploads, or external model files.
