FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Copy package manifest only first (layer-cache friendly)
COPY package.json ./

# Install ALL deps including devDependencies (vite, esbuild, etc. are devDeps)
# --include=dev   : force devDeps even when NODE_ENV=production
# --legacy-peer-deps : tolerate peer dep version conflicts
# No --ignore-scripts: esbuild & vite need post-install scripts to create bin links
RUN npm install --legacy-peer-deps --include=dev

# Copy source after install to maximise layer caching
COPY . .

# Remove pnpm-workspace.yaml so it cannot confuse npm at build time
RUN rm -f pnpm-workspace.yaml pnpm-workspace.yaml.bak

# Build the React app
RUN node_modules/.bin/vite build

# ── Production stage: serve with nginx ────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA config: every path falls back to index.html; PORT is injected at runtime
RUN printf 'server {\n  listen ${PORT};\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf.template

CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
