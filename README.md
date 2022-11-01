# Lume

[![PR workflow](https://github.com/Adyen/lume/actions/workflows/pr.yml/badge.svg)](https://github.com/Adyen/lume/actions/workflows/pr.yml)
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/Adyen/lume/blob/main/LICENSE)

Lume is a library for graphical representations of information and data. By using visual elements like charts, graphs, and maps, this repository provide an accessible way to see and understand trends, outliers, and patterns in data. We use Vue to all graphic elements and rely on d3.js for the calculations.

**[Design guidelines (Figma)](https://www.figma.com/file/r9fPqTXA4dlP6SIyfmGlDC/Data-Visualization-Library?node-id=15%3A2)**

## Stack

We're currently aiming to use:

- [D3.js](https://d3js.org/) for calculations
- [Vue _(v2.7)_](https://v2.vuejs.org/) for rendering
- [Popper.js](https://popper.js.org/) for tooltip functionality

### Dev stack

- [Webpack](https://webpack.js.org/) for bundling/local dev server
- [Sass](https://sass-lang.com/) for complex/reusable styling
- [TypeScript](https://www.typescriptlang.org/) for type checking
- [TypeScript ESLint](https://typescript-eslint.io/) for linting _(with the help of [eslint-plugin-vue](https://eslint.vuejs.org/))_
- [Storybook](https://storybook.js.org/) for developing/showcasing components
- [Jest](https://jestjs.io/) for unit testing

## Getting started

### Installation

To install Lume, run the following command:

```shell
$ npm install @adyen/lume
```

### Plugin

The default export of Lume is a Vue plugin that you can install in your global Vue setup:

```ts
import Vue from 'vue';
import Lume from '@adyen/lume';

import App from './my-app.vue';

Vue.use(Lume);

const app = new Vue(App).$mount('#root');
```

### Components

If, instead of using the Vue plugin, you rather import single components as you go, you can do that as well:

```ts
// SFC <script type="ts">

import { defineComponent } from 'vue';
import { LumeBarChart } from '@adyen/lume';

export default defineComponent({
  components: { LumeBarChart },
  ...
});
```

## Development

### Quick start

Follow these steps to quickly start developing amazing data-viz components locally:

1. Clone the repo
   ```shell
    $ git clone git@github.com:Adyen/lume.git
   ```
2. Install npm packages
   ```shell
   $ npm i
   ```
3. Run the local server
   ```shell
   $ npm start
   ```

#### Storybook

Storybook is available by running the following command:

```shell
$ npm run storybook
```

Every chart component should have its own `.stories` file, and it will be automatically loaded onto the Storybook manager.

##### Available addons

- [`addon-essentials`](https://www.npmjs.com/package/@storybook/addon-essentials)
- [`addon-storysource`](https://www.npmjs.com/package/@storybook/addon-storysource)
- [`addon-a11y`](https://www.npmjs.com/package/@storybook/addon-a11y)

### Roadmap

The charts we wish to include:

#### V1

- [x] Alluvial diagram
- [x] Bar chart
  - [x] Single
  - [x] Stacked
  - [x] Grouped
  - [x] Horizontal orientation for all
- [x] Line chart
- [x] Sparkline chart

#### Next

The following are planned for future releases:

- Violin plot
- Box plot
- Mini bar chart (Bar sparkline)

**Note:** Components from this list can change, so being here doesn't mean it will land on the library for sure.

## Contacts

This project is currently being developed & maintained by team Lume. This includes:

- Govind Srinidhi | [@govind-srinidhi](https://github.com/govind-srinidhi)
- Joao Santos | [@joao-m-santos](https://github.com/joao-m-santos)
- Lucas van Heerikhuizen | [@Lucas1981](https://github.com/Lucas1981)
- Vivian Joseph | [@vivy27](https://github.com/vivy27)
