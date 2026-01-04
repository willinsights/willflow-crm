export default function BuildSnapshotLog() {
  const log = `2026-01-04T22:52:35.139281149Z [inf]  [snapshot] received sha256:50f3e466a70d37b5cda327871a81b40ff1cc046f0f2b28d8ff3729b761c01cd1 md5:0f56e05cc4677a531cf5489fda9e71f3
2026-01-04T22:52:35.139376893Z [inf]  receiving snapshot
2026-01-04T22:52:35.166471836Z [dbg]  found 'railway.toml' at 'railway.toml'
2026-01-04T22:52:35.166566768Z [inf]  analyzing snapshot
2026-01-04T22:52:35.167698266Z [inf]  uploading snapshot
2026-01-04T22:52:41.465119215Z [inf]  fetched snapshot sha256:50f3e466a70d37b5cda327871a81b40ff1cc046f0f2b28d8ff3729b761c01cd1 (632 kB bytes)
2026-01-04T22:52:41.465275830Z [inf]  fetching snapshot
2026-01-04T22:52:42.224001397Z [inf]  unpacking archive
2026-01-04T22:52:42.867779637Z [inf]  using build driver nixpacks-v1.41.0
2026-01-04T22:52:43.599793767Z [inf]  
2026-01-04T22:52:43.599816621Z [inf]  ╔════════════════════════════ Nixpacks v1.41.0 ═══════════════════════════╗
2026-01-04T22:52:43.599819605Z [inf]  ║ setup      │ nodejs_20, bun, openssl                                    ║
2026-01-04T22:52:43.599821879Z [inf]  ║─────────────────────────────────────────────────────────────────────────║
2026-01-04T22:52:43.599822460Z [inf]  ║ install    │ bun i --no-save                                            ║
2026-01-04T22:52:43.599822901Z [inf]  ║─────────────────────────────────────────────────────────────────────────║
2026-01-04T22:52:43.599823421Z [inf]  ║ build      │ npx prisma generate && npx prisma db push && npm run build ║
2026-01-04T22:52:43.599823922Z [inf]  ║─────────────────────────────────────────────────────────────────────────║
2026-01-04T22:52:43.599824332Z [inf]  ║ start      │ bun run start                                              ║
2026-01-04T22:52:43.599824913Z [inf]  ╚═════════════════════════════════════════════════════════════════════════╝
2026-01-04T22:52:43.599825404Z [inf]  
2026-01-04T22:52:43.600462721Z [inf]  
2026-01-04T22:52:43.600472205Z [inf]  Saved output to:
2026-01-04T22:52:43.600473076Z [inf]    snapshot-target-unpack
2026-01-04T22:52:44.250444519Z [inf]  [internal] load build definition from Dockerfile
2026-01-04T22:52:44.250471399Z [inf]  [internal] load build definition from Dockerfile
2026-01-04T22:52:44.250482426Z [inf]  [internal] load build definition from Dockerfile
2026-01-04T22:52:44.312619436Z [inf]  [internal] load build definition from Dockerfile
2026-01-04T22:52:44.324577267Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2026-01-04T22:52:44.472406760Z [inf]  [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
2026-01-04T22:52:44.472956524Z [inf]  [internal] load .dockerignore
2026-01-04T22:52:44.473014461Z [inf]  [internal] load .dockerignore
2026-01-04T22:52:44.474074031Z [inf]  [internal] load .dockerignore
2026-01-04T22:52:44.524456184Z [inf]  [internal] load .dockerignore
2026-01-04T22:52:44.539600777Z [wrn]  SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "SMTP_PASSWORD") (line 11)(https://docs.docker.com/go/dockerfile/rule/secrets-used-in-arg-or-env/)
 details: Sensitive data should not be used in the ARG or ENV commands

2026-01-04T22:52:44.539651904Z [wrn]  SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "SMTP_PASSWORD") (line 12)(https://docs.docker.com/go/dockerfile/rule/secrets-used-in-arg-or-env/)
 details: Sensitive data should not be used in the ARG or ENV commands

2026-01-04T22:52:44.539652945Z [wrn]  UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)(https://docs.docker.com/go/dockerfile/rule/undefined-var/)
 details: Variables should be defined before their use

2026-01-04T22:52:44.542724053Z [inf]  [stage-0 10/10] COPY . /app
2026-01-04T22:52:44.542725796Z [inf]  [stage-0  9/10] RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile
2026-01-04T22:52:44.542726327Z [inf]  [stage-0  8/10] RUN --mount=type=cache,id=s/b9468fd0-320a-4e5d-9ab3-b42d9a8ef708-next/cache,target=/app/.next/cache --mount=type=cache,id=s/b9468fd0-320a-4e5d-9ab3-b42d9a8ef708-node_modules/cache,target=/app/node_modules/.cache npx prisma generate && npx prisma db push && npm run build
2026-01-04T22:52:44.542726517Z [inf]  [stage-0  7/10] COPY . /app/.
2026-01-04T22:52:44.542726757Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/b9468fd0-320a-4e5d-9ab3-b42d9a8ef708-/root/bun,target=/root/.bun bun i --no-save
2026-01-04T22:22:44.542726897Z [inf]  [stage-0  5/10] COPY . /app/.
2026-01-04T22:52:44.542727158Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-31fb21469e34b6b5c7be77b9a35bae43d0c598e9.nix && nix-collect-garbage -d
2026-01-04T22:52:44.542727288Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-31fb21469e34b6b5c7be77b9a35bae43d0c598e9.nix .nixpacks/nixpkgs-31fb21469e34b6b5c7be77b9a35bae43d0c598e9.nix
2026-01-04T22:52:44.542727428Z [inf]  [internal] load build context
2026-01-04T22:52:44.542727569Z [inf]  [stage-0  2/16] WORKDIR /app/
2026-01-04T22:52:44.542727719Z [inf]  [stage-0  1/16] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-01-04T22:52:44.542727979Z [inf]  [stage-0  1/16] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
2026-01-04T22:52:44.543275921Z [inf]  [internal] load build context
2026-01-04T22:52:44.543506407Z [inf]  [internal] load build context
2026-01-04T22:52:44.654275534Z [inf]  [internal] load build context
2026-01-04T22:52:44.678947422Z [inf]  [stage-0  2/16] WORKDIR /app/
2026-01-04T22:52:44.678952509Z [inf]  [stage-0  3/10] COPY .nixpacks/nixpkgs-31fb21469e34b6b5c7be77b9a35bae43d0c598e9.nix .nixpacks/nixpkgs-31fb21469e34b6b5c7be77b9a35bae43d0c598e9.nix
2026-01-04T22:52:44.678953371Z [inf]  [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-31fb21469e34b6b5c7be77b9a35bae43d0c598e9.nix && nix-collect-garbage -d
2026-01-04T22:52:44.678957577Z [inf]  [stage-0  5/10] COPY . /app/.
2026-01-04T22:52:45.576577791Z [inf]  [stage-0  5/10] COPY . /app/.
2026-01-04T22:52:45.591547471Z [inf]  [stage-0  6/10] RUN --mount=type=cache,id=s/b9468fd0-320a-4e5d-9ab3-b42d9a8ef708-/root/bun,target=/root/.bun bun i --no-save
2026-01-04T22:52:45.877347263Z [inf]  bun install v1.3.0 (b0a6feca)

2026-01-04T22:52:48.596579992Z [inf]  warn: Slow filesystem detected. If /root/.bun/install/cache is a network drive, consider setting $BUN_INSTALL_CACHE_DIR to a local folder.

2026-01-04T22:52:51.507237844Z [inf]  
$ prisma generate

2026-01-04T22:52:52.206402997Z [inf]  warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

2026-01-04T22:52:52.334991981Z [inf]  Prisma schema loaded from prisma/schema.prisma

2026-01-04T22:52:52.768131721Z [inf]  ┌─────────────────────────────────────────────────────────┐
│  Update available 6.18.0 -> 7.2.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└──────────────────────────────────────────