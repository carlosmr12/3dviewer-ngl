# 3D molecular viewer using [NGL](https://github.com/nglviewer/ngl)

## Install

The dependencies listed below are just to help run a local development server and prevent issues with passing the structure file to NGL.

- python
- SimpleHttpServer

Dependencies can be installed using [conda](https://docs.conda.io/en/latest/miniconda.html) by running the following command in a terminal window:

```bash
conda env create -f requirements.yml
```

## Usage

Activate the conda environment:

```bash
conda activate 3dviewer
```

Run the python simple http server:

```bash
python -m http.server 9000
```

In your browser go to [localhost:9000](http://localhost:9000/).
