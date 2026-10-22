# `@ginpei/http`

[![npm](https://img.shields.io/npm/v/@ginpei/http)](https://www.npmjs.com/package/@ginpei/http)

A quick HTTP server.

Move to the path, and invoke this.

```console
$ cd path/to/files
$ npx @ginpei/http
```

## Port

You can specify port by `PORT`:

```console
$ PORT=8000 npx @ginpei/http
```

## Teapot

Use `--teapot` to respond to every HTTP request with `418 I'm a Teapot`, instead of serving files:

```console
$ npx @ginpei/http --teapot
```

## Markdown

If the path ends `.md`, it renders as a markdown file. It supports syntax-highlighted code blocks and Mermaid diagrams.
