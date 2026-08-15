# AGENTS.md

## Cursor Cloud specific instructions

This repo is a (currently near-empty) Cookiecutter Data Science template. Python 3.12. The
files under `src/` are empty placeholders and there is no web/server application; the
"app" is the Jupyter/data-science dev workflow. There are no tests or linter configs
committed yet.

### Environment
- Dependencies live in the `.venv` virtualenv at the repo root. The startup update script
  creates it and installs `requirements.txt` (`ipykernel`, `python-dotenv`) plus `jupyter`.
  Activate with `source .venv/bin/activate`.
- `python3 -m venv` requires the system package `python3.12-venv` (installed in the VM
  snapshot, not by the update script).
- `python-dotenv` reads a `.env` file that is gitignored. Create it from the template with
  `cp .env.example .env` (the template only has commented placeholders, so add any vars you
  need). Notebooks typically load it via `load_dotenv()`.

### Running notebooks (the core workflow)
- Start the dev server: `source .venv/bin/activate && jupyter lab --no-browser --ip=127.0.0.1 --port=8888`.
- A kernelspec named `edgepilot` (display "Python (edgepilot)") pointing at `.venv` is
  registered in the snapshot. If it is ever missing, re-register with
  `python -m ipykernel install --user --name edgepilot --display-name "Python (edgepilot)"`.
- Execute a notebook headless with:
  `jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.kernel_name=edgepilot <path.ipynb>`.

### Lint / test / build
- No lint, test, or build tooling is configured in this template. Add and document commands
  here if/when they are introduced.
