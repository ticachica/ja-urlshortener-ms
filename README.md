# API Basejump: URL Shortener
[Free Code Camp](https://www.freecodecamp.org) project built on [glitch](https://glitch.com/) using [mongodb](https://www.mongodb.com/) on [mLab](https://mlab.com/).

> User Stories:
> - I can pass a URL as a parameter and I will receive a shortened URL in the JSON response
> - When I visit that shortened URL, it will redirect me to my original link.

## Example creation usage
`https://ja-urlshortener-ms.glitch.me/new/https://www.google.com`

`https://ja-urlshortener-ms.glitch.me/new/http://freecodecamp.com/news`

## Example creation output:
```json
{ "original_url": "http://freecodecamp.com/news", "short_url": "https://ja-urlshortener-ms.glitch.me/4" }
```

## Usage:
`https://ja-urlshortener-ms.glitch.me/4`

## Will redirect to:
`http://freecodecamp.com/news`
