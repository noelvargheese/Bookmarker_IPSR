# Conversation Prompts and Results

These are five feature prompts from the build process, followed by a summary of the work reported after each.

## 1. Build the first working version

> Build the first working version of my Book Tracker in index.html, style.css, and app.js.
>
> Add a form with labeled Title and Author inputs, a Status dropdown with To read, Reading, and Finished, and an Add Book button. Title and author are required. If either is empty, show a clear message beside that field and do not add the book. When the form is valid, add the book to the top of the list and clear the form.
>
> For now, keep books in memory only. Do not add localStorage, search, status editing, or optional features yet. Use semantic HTML, accessible labels, and safe DOM methods such as textContent when displaying user-entered text. Tell me how to open the app and what files you changed.

**Result:** Created `index.html`, `style.css`, and `app.js` with the labeled form, required-field messages, and an in-memory list. The assistant explained that the page could be opened in a browser from `index.html`.

## 2. Add browser persistence

> Now add browser localStorage to the existing app. Load saved books when the page opens, and save the book list whenever it changes. Store each book’s id, title, author, status, and creation time so the newest books stay first.
>
> Handle missing or invalid saved data gracefully so the page still opens. Keep the existing form and styling behavior. Explain how I can verify that adding a book, refreshing the page, and reopening the page preserves its title, author, and status.

**Result:** Updated `app.js` to load validated records, sort them by creation time, and save newly added books in `localStorage`. Per-book status editing was added in a later prompt. The assistant recommended checking persistence through the same `localhost` URL and browser profile.

## 3. Add live search

> Add a search box above the book list. As I type, show only books whose title or author contains the search text. Search must ignore capitalization and trim extra spaces. An empty search should show the full list.
>
> Keep the saved book list unchanged while searching. Show a helpful message when there are no matches. Do not change the form, storage format, or unrelated styling. Tell me how to test searching for “ben” when a book’s author is “Benyamin,” and for a query with no matches.

**Result:** Updated `index.html`, `style.css`, and `app.js` with a labeled search field, normalized case-insensitive matching, and a no-results message. Searching filters the rendered list without changing the saved array.

## 4. Add per-book status controls

> Add a status control to each book in the list so I can change it to To read, Reading, or Finished. When a status changes, update that book, save the change to localStorage, and show the new status in the list.
>
> Changing one book must not change another book’s status. Keep search working, and make sure a status change survives a page refresh. Tell me how to test all three status choices.

**Result:** Updated `app.js` and `style.css` to render an accessible dropdown per book. A change updates the matching book by ID and saves the updated list. Manual steps were provided to cycle through all three statuses and refresh.

## 5. Add deletion and status counts

> Add two optional features to the existing app: a Delete button for each book, and a small count of books in each status. Deleting a book must update localStorage. The counts should reflect the full saved list, even when search filters what is visible.
>
> Make the delete buttons accessible, and ask for confirmation before deleting. Keep all existing features working. Tell me how to test deletion, the counts, and refresh persistence.

**Result:** Updated `index.html`, `style.css`, and `app.js` with accessible, confirmed deletion and counts derived from the full list. Deletion and status changes save to `localStorage`; the assistant provided manual checks for search-independent counts and refresh persistence.

## Documented AI mistake

- **Mistake:** An early implementation briefly added a Google Fonts `@import`, despite the requirement to use no external dependencies.
- **How it was noticed and fixed:** During review, the assistant caught the external font import, removed it, and changed the stylesheet to use system fonts and Georgia.
