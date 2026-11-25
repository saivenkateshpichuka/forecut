# Generated images for the forecast library

`images-to-generate-all.csv` holds one photorealistic prompt per report page and per category tile, for every season and audience.

1. Generate the image in ChatGPT with the prompt in `chatgpt_prompt`.
2. Save it as WebP under the name in `save_as` (for example `img/ss27-men-themes-short-story.webp`) and upload it to the `img/` folder on the dev branch.
3. Rebuild. A report with no image picks up its file automatically, and a category tile picks up `img/{season}-{audience}-{category}-tile.webp`.

The caption says the image was generated and is not a photograph of a real collection. Kids audiences use product-only images: no children are shown.
