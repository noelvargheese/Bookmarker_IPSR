const form = document.querySelector('#book-form');
const titleInput = document.querySelector('#book-title');
const authorInput = document.querySelector('#book-author');
const statusInput = document.querySelector('#book-status');
const titleError = document.querySelector('#title-error');
const authorError = document.querySelector('#author-error');
const bookList = document.querySelector('#book-list');
const emptyState = document.querySelector('#empty-state');
const searchInput = document.querySelector('#book-search');
const noResults = document.querySelector('#no-results');
const statusCountElements = {
  'To read': document.querySelector('#count-to-read'),
  Reading: document.querySelector('#count-reading'),
  Finished: document.querySelector('#count-finished'),
};

const STORAGE_KEY = 'book-tracker-books';
const VALID_STATUSES = new Set(['To read', 'Reading', 'Finished']);

function isValidBook(book) {
  return Boolean(
    book &&
    typeof book.id === 'string' && book.id.trim() &&
    typeof book.title === 'string' && book.title.trim() &&
    typeof book.author === 'string' && book.author.trim() &&
    VALID_STATUSES.has(book.status) &&
    typeof book.createdAt === 'string' &&
    Number.isFinite(Date.parse(book.createdAt))
  );
}

function loadBooks() {
  try {
    const savedBooks = window.localStorage.getItem(STORAGE_KEY);
    if (savedBooks === null) return [];

    const parsedBooks = JSON.parse(savedBooks);
    if (!Array.isArray(parsedBooks)) return [];

    return parsedBooks
      .filter(isValidBook)
      .map((book) => ({
        id: book.id,
        title: book.title.trim(),
        author: book.author.trim(),
        status: book.status,
        createdAt: book.createdAt,
      }))
      .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
  } catch {
    // Storage can be unavailable or contain malformed JSON; start with an empty list.
    return [];
  }
}

function saveBooks() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    // Keep the app usable in memory if browser storage is unavailable.
  }
}

function createBookId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `book-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const books = loadBooks();

function setFieldError(input, errorElement, message) {
  const hasError = Boolean(message);
  input.setAttribute('aria-invalid', String(hasError));
  errorElement.textContent = message;
  errorElement.hidden = !hasError;
}

function clearResolvedError(input, errorElement) {
  if (input.getAttribute('aria-invalid') === 'true' && input.value.trim()) {
    setFieldError(input, errorElement, '');
  }
}

function renderBooks() {
  bookList.replaceChildren();
  const query = normalizeSearchText(searchInput.value);
  const matchingBooks = books.filter((book) => {
    return !query ||
      normalizeSearchText(book.title).includes(query) ||
      normalizeSearchText(book.author).includes(query);
  });

  emptyState.hidden = books.length > 0;
  noResults.hidden = books.length === 0 || matchingBooks.length > 0 || !query;
  updateStatusCounts();

  for (const book of matchingBooks) {
    const item = document.createElement('li');
    item.className = 'book-card';

    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = book.title;
    const author = document.createElement('p');
    author.className = 'book-author';
    author.textContent = `by ${book.author}`;
    details.append(title, author);

    const status = document.createElement('select');
    status.className = 'book-status-control';
    status.dataset.bookId = book.id;
    status.setAttribute('aria-label', `Status for ${book.title}`);

    for (const statusName of VALID_STATUSES) {
      const option = document.createElement('option');
      option.value = statusName;
      option.textContent = statusName;
      option.selected = statusName === book.status;
      status.append(option);
    }

    const actions = document.createElement('div');
    actions.className = 'book-actions';
    actions.append(status);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.dataset.bookId = book.id;
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${book.title}`);
    actions.append(deleteButton);

    item.append(details, actions);
    bookList.append(item);
  }
}

function updateStatusCounts() {
  const counts = { 'To read': 0, Reading: 0, Finished: 0 };
  for (const book of books) {
    counts[book.status] += 1;
  }

  for (const [status, element] of Object.entries(statusCountElements)) {
    element.textContent = String(counts[status]);
  }
}

function normalizeSearchText(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

renderBooks();

searchInput.addEventListener('input', renderBooks);
bookList.addEventListener('change', (event) => {
  const statusControl = event.target;
  if (!(statusControl instanceof HTMLSelectElement) || !statusControl.matches('.book-status-control')) {
    return;
  }

  if (!VALID_STATUSES.has(statusControl.value)) return;

  const book = books.find((item) => item.id === statusControl.dataset.bookId);
  if (!book || book.status === statusControl.value) return;

  book.status = statusControl.value;
  saveBooks();
  updateStatusCounts();
});
bookList.addEventListener('click', (event) => {
  const deleteButton = event.target;
  if (!(deleteButton instanceof HTMLButtonElement) || !deleteButton.matches('.delete-button')) {
    return;
  }

  const bookIndex = books.findIndex((book) => book.id === deleteButton.dataset.bookId);
  if (bookIndex === -1) return;

  const book = books[bookIndex];
  if (!window.confirm(`Delete “${book.title}”? This cannot be undone.`)) return;

  books.splice(bookIndex, 1);
  saveBooks();
  renderBooks();
});
titleInput.addEventListener('input', () => clearResolvedError(titleInput, titleError));
authorInput.addEventListener('input', () => clearResolvedError(authorInput, authorError));

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const titleMissing = title.length === 0;
  const authorMissing = author.length === 0;

  setFieldError(titleInput, titleError, titleMissing ? 'Please enter a book title.' : '');
  setFieldError(authorInput, authorError, authorMissing ? 'Please enter the author’s name.' : '');

  if (titleMissing || authorMissing) {
    (titleMissing ? titleInput : authorInput).focus();
    return;
  }

  books.unshift({
    id: createBookId(),
    title,
    author,
    status: statusInput.value,
    createdAt: new Date().toISOString(),
  });

  saveBooks();
  renderBooks();
  form.reset();
  setFieldError(titleInput, titleError, '');
  setFieldError(authorInput, authorError, '');
});
