---
title: "From Lab Code to Production APIs"
slug: from-lab-code-to-production-apis
category: Engineering
pubDate: 2025 6 15
readingDuration: 4
snippet: "What I learned building an end-to-end OCR pipeline at Seneca Applied Research — and why the gap between \"it works on my machine\" and \"it works in production\" is bigger than you think."
---

# From Lab Code to Production APIs

> What I learned building an end-to-end OCR pipeline at Seneca Applied Research — and why the gap between "it works on my machine" and "it works in production" is bigger than you think.

## The Project

At Seneca Applied Research, I worked on an insurance tech project that needed to process hundreds of documents daily. The goal was simple: build an OCR pipeline that could extract structured data from scanned documents and make it available through a fast API.

The stack was modern: **PyTorch**, **Transformers**, **FastAPI**, and **Docker**. It sounded straightforward on paper.

## What "Working" Actually Means

In a lab setting, "working" means the model outputs the correct text. In production, "working" means:

- The pipeline handles 200-300 documents daily without crashing
- Inference latency stays under one second
- The service can be deployed and scaled by someone else
- Code is maintainable and follows standards

That last point is the one most people skip. I learned quickly that `it works` and `it works in production` are two completely different standards.

## The Gap Between Experiment and Production

### Containerization

The first wall I hit was deployment. My PyTorch models worked perfectly in my local Jupyter notebook. But when I tried to containerize them with Docker, I spent days debugging CUDA mismatches, dependency hell, and model download issues.

I ended up using **Poetry** for dependency management and **Docker Compose** to orchestrate the services. The lesson: lock your dependencies early. The `requirements.txt` file I started with had 47 top-level packages. By the time I was done, the Poetry lock file had 312 dependencies. Every single one mattered.

### API Design

Building a FastAPI wrapper around the model was the easy part. The hard part was designing the API so that it was actually useful:

- What should the response look like when the model is uncertain?
- How do you handle documents that are 200 pages long?
- What happens when someone uploads a corrupted file?

I spent more time on error handling and edge cases than on the actual model inference. The API itself was maybe 150 lines of FastAPI code. The validation, error handling, and response formatting were closer to 400 lines.

### Coding Standards

I was the only developer on this part of the project, but I still enforced coding standards using **Ruff** and **Pylint**. At first, it felt like unnecessary overhead. But three months in, when I had to refactor the document parsing logic, I was grateful for the consistent formatting, type hints, and docstrings.

Code you write in a hurry is code you will read in agony later.

## The Numbers That Actually Matter

- **200-300** documents processed daily
- **Sub-second** inference latency per page
- **312** locked dependencies in Poetry
- **25+** edge cases handled in the API
- **1** production-ready prototype delivered

The metrics that matter in production are rarely the ones you optimize in the lab.

## What I Would Do Differently

1. **Start with deployment in mind.** If you can't containerize it on day one, you're not done.
2. **Invest in observability.** I added basic logging but wish I had structured logs and metrics from the start.
3. **Write the API spec before the code.** Designing the contract first forces you to think about the consumer, not just the implementation.

## The Real Lesson

The biggest lesson wasn't technical. It was about **collaboration**. I worked with researchers, faculty, and industry partners. Each group had different expectations, different timelines, and different definitions of "done." Learning to communicate technical constraints to non-technical stakeholders was, in some ways, harder than building the pipeline itself.

Building software is easy. Building software that other people can use, maintain, and understand — that's the hard part.

---

*If you're building ML pipelines or working on similar projects, feel free to reach out. I'd love to compare notes.*
