# Hyperkit Monorepo

A collection of unstyled, headless custom elements designed to make building rich, interactive UIs a breeze. Hyperkit lets you create dynamic, scalable interfaces with pure HTML & CSS - without writing JavaScript. The repository includes both the elements themselves (written in TypeScript) and the documentation (built with Astro).

## Overview

**Hyperkit**  
Version: 0.0.4  
[Github](https://github.com/hyperlaunch/hyperkit)

**Headless Elements, Supercharged UIs**  
A suite of unstyled custom elements designed for building rich, interactive UIs rapidly — without writing JavaScript. From sortable lists to calendars, modals, and repeating forms, Hyperkit lets you create dynamic, scalable interfaces with pure HTML & CSS.

## Elements

The monorepo includes the following elements:

- **Modal**: A versatile modal element for displaying content in an overlay with optional transitions, backdrops, and dismissible actions.
- **Popover**: A simple popover element for showing contextual information or interactive content in an overlay.
- **Detail & Accordion**: Expandable content elements, with optional accordion functionality and smooth transitions.
- **Select**: A flexible select element that integrates with inputs and fires change events on selection.
- **Fieldset Repeater**: A dynamic form component allowing users to add and remove repeated sets of input fields.
- **Masked Input**: An input element for applying custom masks to user input.
- **Sortable List**: A drag-and-drop sortable list with optional position tracking.
- **Calendar**: A calendar element for navigating and selecting dates, with optional input field integration.
- **Transition**: An element for animating content visibility with customizable enter and exit classes.
- **Arrow Nav**: Navigate between focusable elements using up and down arrow keys.

## Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed as your package manager and runtime.

### Installation

To install the Hyperkit elements, run:

```bash
bun add @hyperkitxyz/elements
```

### Development

This monorepo includes both the Hyperkit elements and the documentation site. The documentation is built using [Astro](https://astro.build/) and can be run locally for development.

#### To start the documentation site for local development:

1. Clone the repository:
   ```bash
   git clone https://github.com/hyperlaunch/hyperkit
   cd hyperkit
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

The documentation site will be served at [http://localhost:4321](http://localhost:4321), and the elements package will be available as a workspace package for use in examples.

### Workspace Structure

- **/packages/elements**: The core Hyperkit elements, written in TypeScript.
- **/docs**: The documentation site, built with Astro. It includes examples using the elements from the workspace.

### Contributing

Feel free to open issues or submit pull requests. Contributions are welcome!

---

Enjoy building with Hyperkit!
