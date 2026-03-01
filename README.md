# jegeronimo.com

Personal portfolio website for James Geronimo, hosted at [jegeronimo.com](https://jegeronimo.com).

The entire UI is styled to look and feel like a [Jupyter Notebook](https://jupyter.org/) — complete with a title bar, menu bar, toolbar, tabbed navigation, cell prompts (`In [n]:`/`Out[n]:`), and a status bar. Content is organized across notebook-style tabs: About, Experience, Organizations, Courses, Contact, and Resume.

## History

This repo was originally forked from the [Freelancer](https://github.com/StartBootstrap/startbootstrap-freelancer) Bootstrap theme by Start Bootstrap. Over time, the site was completely redesigned with a custom layout and stylesheet, fully deviating from the original template. The Freelancer theme and Bootstrap are no longer used anywhere in the codebase. Commit history prior to [b07ab6c](https://github.com/jegeronimo/jegeronimo.github.io/commit/b07ab6cc8e96ad1e754d22e2d4eb1737f25cd2ae) reflects the original fork.

## Tech Stack

- [Jekyll](https://jekyllrb.com/) — static site generator
- Custom Jupyter-themed layout (`_layouts/jupyter.html`) and stylesheet (`css/jupyter.css`)
- Interactive topography canvas (`js/topography.js`)
- [Font Awesome](https://fontawesome.com/) for icons
- Deployed via [GitHub Pages](https://pages.github.com/)

## Structure

```
_config.yml          Site metadata and Jekyll configuration
_layouts/            Jupyter notebook layout
_experiences/        Work experience entries (Jekyll collection)
_organizations/      Organization entries (Jekyll collection)
css/jupyter.css      All styles for the Jupyter theme
js/main.js           Tab switching, experience card toggles, toolbar interactions
js/topography.js     Interactive topography canvas animation
chat/                Embedded chat page
resume.pdf           Downloadable resume
```

## License

MIT — see [LICENSE](LICENSE).