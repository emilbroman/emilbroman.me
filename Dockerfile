FROM node:18-slim AS builder

RUN --mount=type=cache,target=/var/cache/apt \
  apt-get update && \
  apt-get install -y \
  pandoc \
  texlive-latex-base \
  texlive-latex-recommended

RUN mkdir /app

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=node_modules \
  yarn --pure-lockfile

RUN --mount=type=cache,target=node_modules \
  yarn build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
