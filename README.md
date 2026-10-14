# Book Tracker

A small, dependency-free book tracker built with plain HTML, CSS, and JavaScript. Add books to a personal reading list, keep their reading status up to date, and find them with search.

## Features

- Add a book with a required title and author, and choose **To read**, **Reading**, or **Finished**.
- See the newest books first.
- Search by title or author; matching ignores capitalization and extra whitespace.
- Change a book's status or delete it after confirming.
- See counts for each status. Counts include the full saved list, even while search is filtering the visible books.
- Keep books and status changes in browser `localStorage` across refreshes and browser restarts.

## Run locally

No build step, package installation, or external library is required. From this folder, start Python's built-in static server:

```sh
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. Using the same browser profile and address keeps the app on the same storage origin. Stop the server with **Ctrl+C** in the terminal.
