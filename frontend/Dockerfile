# Frontend Dockerfile — JDOM UNIVERSAL CONCEPT LTD (multi-stage)
FROM node:20-alpine AS build
WORKDIR /app

# Yarn (project policy — never use npm)
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY . .

# Build-time variables (must be passed via --build-arg)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

# --- Serve stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
