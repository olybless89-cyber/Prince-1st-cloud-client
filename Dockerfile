FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Copy the application root package manifest (inside the src/ folder in the repo)
COPY src/package.json ./

# Install dependencies using npm (matching package-lock.json)
RUN npm install --legacy-peer-deps --include=dev

# Copy the full application source
COPY src/ .

# Remove workspace files that might confuse npm
RUN rm -f pnpm-workspace.yaml pnpm-workspace.yaml.bak

# Build the React application
RUN node_modules/.bin/vite build

# ── Production stage: serve with nginx ────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Write nginx config at build time with a placeholder port
RUN printf 'server {\n  listen __PORT__;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/app.conf.template

# At runtime: substitute __PORT__ with the real $PORT value via sed, then start nginx
CMD ["/bin/sh", "-c", "sed \"s/__PORT__/${PORT}/g\" /etc/nginx/conf.d/app.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
