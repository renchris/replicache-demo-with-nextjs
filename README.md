<p align="center">
  <a href="https://github.com/renchris/panda-boilerplate">
    <img alt="Panda Emoji" src="public/panda-emoji.png" width="60" />
  </a>
</p>
<h1 align="center">
  Panda Boilerplate
</h1>

A starter template that uses the NextJS App Router, TypeScript, and PandaCSS.

## 👍 NextJS App Router

The Next.js App Router is the current standard for building applications using React's latest features.

The significant feature of Next.js App Router are [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components).

- Previously, with the Pages Router, each of your pages are rendered on the client or the server.

- Currently, with the App Router, your components within each page can be rendered on the client or the server.

This allows more of your application to receive the [benefits of server rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#benefits-of-server-rendering).

## 📚 UI Libraries

The challenge is that the majority UI Libraries are not compaitable to be used in Server Components.

Per [Segun's (Founder of Chakra UI) Future of Chakra Blog](https://www.adebayosegun.com/blog/the-future-of-chakra-ui):

"The major technical disadvantage Chakra UI has is its runtime CSS-in-JS due to the `@emotion/styled` dependency. This isn't unique to Chakra, but the same is true of other popular libraries like Material UI, Mantine, and Theme UI.

Getting rid of the runtime CSS-in-JS is one of the most common requests we get from our users, as it unlocks better performance, reduces the initial JS payload, and, enables the usage of Chakra in React Server Components (RSC)."

Although [TailwindCSS](https://tailwindcss.com/) is considered to be the most used UI library and is Server Component compatible, [Chakra UI](https://chakra-ui.com/) was still considered to be the UI Library with the best developer experience.

## 🤝 PandaCSS

[PandaCSS](https://panda-css.com/) has now been launched by the Chakra UI team with the same great developer experience and semantics as Chakra UI with zero runtime CSS-in-JS for Server Components compatibility.

## 🏗️ Component Library

Chakra UI was a monolithic all-in-one UI solution handling the styling system, design tokens, headless UI components (the pre-built UI components), and state machines (the model logic the UI components use).

Now, PandaCSS is responsible for the [Styling System](https://panda-css.com/docs/concepts/writing-styles) (style functions, style props, and recipes) and [Design Tokens](https://panda-css.com/docs/theming/tokens). A separate library will be responsible for pre-built accessible UI components library and logic.

If you are coming from Chakra UI or another UI Library that provides a Component Library to import pre-built components and wish to continue to use a component library, you may supplement PandaCSS with a headless UI library such as [Ark UI](https://ark-ui.com/) or [Park UI](https://park-ui.com/).


## 🚀 Usage

First, install the dependencies:

```bash
pnpm install
```

Then, run the application:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🎨 Code Style

We use ESLint for our code style. You may modify the ESLint rule set in the `.eslintrc.js` file. Include ESLint On Save in your code editor Preferences settings.

```JSON
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

See
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Airbnb ESLint Style Guide](https://github.com/airbnb/javascript)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)


## 🧐 What's inside?

A quick look at the top-level files and directories where we made our feature changes in the project.

    src
    └── app
         ├── layout.tsx
         └── page.tsx
    styled-system
    ├── ...
    └── ...
    eslintrc.js
    panda.config.ts

1. **`/src/app`**: This directory will contain all of the code related to what you will see on the front-end of the site. `src` is a convention for “source code” and `app` is the convention for “app router”.

1. **`src/app/layout.tsx`**: This file contains the Root Layout. The JSX elements in this file applies onto all routes with routes being `{children}`. See [NextJS Documentation: Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts)

1. **`src/app/page.tsx`**: This file contains the code for the front-end page. See [NextJS Documentation: Pages](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages)

1. **`/styled-system`**: This folder contains the core functioning files for Panda CSS. You would not modify any files in this folder.

1. **`eslintrc.js`**: This file contains the ESLint rule configuration.

1. **`panda.config.ts`**: This file configures how Panda works, including adding in [global styles](https://panda-css.com/docs/references/config#globalcss). See [Panda Config Reference](https://panda-css.com/docs/references/config#globalcss)

## 📣 Recognition

Thank you to [Segun Abedbayo](https://github.com/segunadebayo), the Chakra UI team, and all contributors for the creation of PandaCSS.
