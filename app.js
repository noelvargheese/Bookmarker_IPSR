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
const countTotal = document.querySelector('#count-total');
const bookCountLabel = document.querySelector('#book-count-label');
const completionLabel = document.querySelector('#completion-label');
const completionProgress = document.querySelector('#completion-progress');
const calendar = document.querySelector('#activity-calendar');
const calendarMonthLabel = document.querySelector('#calendar-month');
const calendarDayDetail = document.querySelector('#calendar-day-detail');
const previousMonthButton = document.querySelector('#previous-month');
const nextMonthButton = document.querySelector('#next-month');
const recordSessionButton = document.querySelector('#record-session-btn');
const recordButtonIcon = recordSessionButton.querySelector('span');
const recordButtonText = document.createTextNode('');
const sessionFeedback = document.querySelector('#session-feedback');
const readingInsight = document.querySelector('#reading-insight-text');
const currentStreakLabel = document.querySelector('#current-streak');
const longestStreakLabel = document.querySelector('#longest-streak');
const statusCountElements = {
  'To read': document.querySelector('#count-to-read'),
  Reading: document.querySelector('#count-reading'),
  Finished: document.querySelector('#count-finished'),
};

const BOOKS_STORAGE_KEY = 'book-tracker-books';
const READING_DAYS_STORAGE_KEY = 'book-tracker-reading-days';
const VALID_STATUSES = new Set(['To read', 'Reading', 'Finished']);
const today = new Date();
let currentCalendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = toDateKey(today);

recordSessionButton.replaceChildren(recordButtonIcon, recordButtonText);

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
    const savedBooks = window.localStorage.getItem(BOOKS_STORAGE_KEY);
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
    return [];
  }
}

function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
}

function loadReadingDays() {
  try {
    const savedDays = window.localStorage.getItem(READING_DAYS_STORAGE_KEY);
    if (savedDays === null) return [];
    const parsedDays = JSON.parse(savedDays);
    if (!Array.isArray(parsedDays)) return [];
    return [...new Set(parsedDays.filter(isValidDateKey))].sort();
  } catch {
    return [];
  }
}

function saveBooks() {
  try {
    window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
}

function saveReadingDays() {
  try {
    window.localStorage.setItem(READING_DAYS_STORAGE_KEY, JSON.stringify(readingDays));
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
}

function createBookId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `book-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const books = loadBooks();
const readingDays = loadReadingDays();

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateKey, options = { dateStyle: 'full' }) {
  return dateFromKey(dateKey).toLocaleDateString(undefined, options);
}

function normalizeSearchText(value) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

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

function updateDashboard() {
  const counts = { 'To read': 0, Reading: 0, Finished: 0 };
  for (const book of books) counts[book.status] += 1;

  countTotal.textContent = String(books.length);
  bookCountLabel.textContent = `${books.length} ${books.length === 1 ? 'book' : 'books'}`;

  for (const [status, element] of Object.entries(statusCountElements)) {
    element.textContent = String(counts[status]);
  }

  const completion = books.length === 0 ? 0 : Math.round((counts.Finished / books.length) * 100);
  completionLabel.textContent = `${completion}%`;
  completionProgress.value = completion;
  completionProgress.textContent = `${completion}%`;
  completionProgress.setAttribute('aria-label', `${completion}% of books finished`);
}

function createBookCard(book) {
  const item = document.createElement('li');
  item.className = 'book-card';

  const bookMark = document.createElement('span');
  bookMark.className = 'book-card-mark';
  bookMark.setAttribute('aria-hidden', 'true');
  bookMark.textContent = '▤';

  const details = document.createElement('div');
  details.className = 'book-details';
  const title = document.createElement('h3');
  title.textContent = book.title;
  const author = document.createElement('p');
  author.className = 'book-author';
  author.textContent = `by ${book.author}`;
  details.append(title, author);

  const actions = document.createElement('div');
  actions.className = 'book-actions';

  const status = document.createElement('select');
  status.className = 'book-status-control';
  status.dataset.bookId = book.id;
  status.setAttribute('aria-label', `Reading status for ${book.title}`);
  for (const statusName of VALID_STATUSES) {
    const option = document.createElement('option');
    option.value = statusName;
    option.textContent = statusName;
    option.selected = statusName === book.status;
    status.append(option);
  }

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.dataset.bookId = book.id;
  deleteButton.textContent = 'Delete';
  deleteButton.setAttribute('aria-label', `Delete ${book.title}`);

  actions.append(status, deleteButton);
  item.append(bookMark, details, actions);
  return item;
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
  for (const book of matchingBooks) bookList.append(createBookCard(book));
}

function updateStreaks() {
  const activeDays = new Set(readingDays);
  const current = new Date();
  let cursor = new Date(current.getFullYear(), current.getMonth(), current.getDate());

  if (!activeDays.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let currentStreak = 0;
  while (activeDays.has(toDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  currentStreakLabel.textContent = String(currentStreak);

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDayNumber = null;
  for (const dateKey of readingDays) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    runningStreak = previousDayNumber !== null && dayNumber === previousDayNumber + 1
      ? runningStreak + 1
      : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
    previousDayNumber = dayNumber;
  }
  longestStreakLabel.textContent = String(longestStreak);
}

function renderCalendar() {
  const year = currentCalendarMonth.getFullYear();
  const month = currentCalendarMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentMonth = new Date().getFullYear() * 12 + new Date().getMonth();
  const shownMonth = year * 12 + month;

  calendarMonthLabel.textContent = currentCalendarMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  calendar.setAttribute('aria-label', `Reading activity calendar for ${calendarMonthLabel.textContent}`);
  previousMonthButton.disabled = shownMonth <= 1900 * 12;
  nextMonthButton.disabled = shownMonth >= currentMonth;
  calendar.replaceChildren();

  for (let blank = 0; blank < firstWeekday; blank += 1) {
    const spacer = document.createElement('span');
    spacer.className = 'calendar-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    calendar.append(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = toDateKey(new Date(year, month, day));
    const isActive = readingDays.includes(dateKey);
    const isToday = dateKey === toDateKey(new Date());
    const isSelected = dateKey === selectedDate;
    const dayButton = document.createElement('button');
    dayButton.type = 'button';
    dayButton.className = 'calendar-day';
    dayButton.dataset.date = dateKey;
    dayButton.textContent = String(day);
    dayButton.setAttribute('aria-label', `${formatDate(dateKey)}${isActive ? ', reading session recorded' : ', no reading session recorded'}`);
    dayButton.setAttribute('aria-pressed', String(isSelected));
    if (isActive) dayButton.classList.add('has-reading');
    if (isToday) dayButton.classList.add('is-today');
    if (isSelected) dayButton.classList.add('is-selected');
    calendar.append(dayButton);
  }

  if (isValidDateKey(selectedDate)) {
    const selectedIsActive = readingDays.includes(selectedDate);
    calendarDayDetail.textContent = selectedIsActive
      ? `Reading session recorded on ${formatDate(selectedDate)}.`
      : `No reading session recorded on ${formatDate(selectedDate)}.`;
  }

  const todayKey = toDateKey(new Date());
  const todayWasRecorded = readingDays.includes(todayKey);
  recordSessionButton.disabled = todayWasRecorded;
  recordButtonText.nodeValue = todayWasRecorded ? ' Reading Recorded Today' : ' Record Today’s Reading';
}

function updateReadingInsight() {
  const finishedCount = books.filter((book) => book.status === 'Finished').length;
  const currentStreak = Number(currentStreakLabel.textContent);

  if (books.length === 0 && readingDays.length === 0) {
    readingInsight.textContent = 'Your reading journey starts with one page. Add a book and record your first reading session!';
  } else if (currentStreak > 0) {
    readingInsight.textContent = `You’re on a ${currentStreak}-day reading streak. Keep finding a little time for a good story.`;
  } else if (finishedCount > 0) {
    readingInsight.textContent = `You’ve finished ${finishedCount} ${finishedCount === 1 ? 'book' : 'books'}. Every story adds something to your journey.`;
  } else if (readingDays.length > 0) {
    readingInsight.textContent = `You’ve recorded ${readingDays.length} ${readingDays.length === 1 ? 'reading day' : 'reading days'}. Come back today to start a new streak.`;
  } else {
    readingInsight.textContent = `You have ${books.length} ${books.length === 1 ? 'book' : 'books'} in your library. Record a reading day whenever you sit down with one.`;
  }
}

function updateJourney() {
  updateStreaks();
  renderCalendar();
  updateReadingInsight();
}

function showFieldErrors() {
  const titleMissing = titleInput.value.trim().length === 0;
  const authorMissing = authorInput.value.trim().length === 0;
  setFieldError(titleInput, titleError, titleMissing ? 'Please enter a book title.' : '');
  setFieldError(authorInput, authorError, authorMissing ? 'Please enter the author’s name.' : '');
  return { titleMissing, authorMissing };
}

searchInput.addEventListener('input', renderBooks);
titleInput.addEventListener('input', () => clearResolvedError(titleInput, titleError));
authorInput.addEventListener('input', () => clearResolvedError(authorInput, authorError));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const { titleMissing, authorMissing } = showFieldErrors();
  if (titleMissing || authorMissing) {
    (titleMissing ? titleInput : authorInput).focus();
    return;
  }

  books.unshift({
    id: createBookId(),
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    status: statusInput.value,
    createdAt: new Date().toISOString(),
  });

  saveBooks();
  renderBooks();
  updateDashboard();
  updateReadingInsight();
  form.reset();
  setFieldError(titleInput, titleError, '');
  setFieldError(authorInput, authorError, '');
});

bookList.addEventListener('change', (event) => {
  const statusControl = event.target;
  if (!(statusControl instanceof HTMLSelectElement) || !statusControl.matches('.book-status-control')) return;
  if (!VALID_STATUSES.has(statusControl.value)) return;

  const book = books.find((item) => item.id === statusControl.dataset.bookId);
  if (!book || book.status === statusControl.value) return;

  book.status = statusControl.value;
  saveBooks();
  updateDashboard();
  updateReadingInsight();
});

bookList.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.matches('.delete-button')) return;
  const bookIndex = books.findIndex((book) => book.id === event.target.dataset.bookId);
  if (bookIndex === -1) return;

  const book = books[bookIndex];
  if (!window.confirm(`Delete “${book.title}”? This cannot be undone.`)) return;
  books.splice(bookIndex, 1);
  saveBooks();
  renderBooks();
  updateDashboard();
  updateReadingInsight();
});

recordSessionButton.addEventListener('click', () => {
  const todayKey = toDateKey(new Date());
  if (readingDays.includes(todayKey)) return;

  readingDays.push(todayKey);
  readingDays.sort();
  saveReadingDays();
  selectedDate = todayKey;
  currentCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  sessionFeedback.textContent = `Reading session recorded for ${formatDate(todayKey)}.`;
  sessionFeedback.hidden = false;
  updateJourney();
});

calendar.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.matches('.calendar-day')) return;
  selectedDate = event.target.dataset.date;
  renderCalendar();
  calendar.querySelector(`[data-date="${selectedDate}"]`)?.focus();
});

previousMonthButton.addEventListener('click', () => {
  currentCalendarMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1);
  selectedDate = toDateKey(currentCalendarMonth);
  renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
  const currentMonth = new Date().getFullYear() * 12 + new Date().getMonth();
  const shownMonth = currentCalendarMonth.getFullYear() * 12 + currentCalendarMonth.getMonth();
  if (shownMonth >= currentMonth) return;
  currentCalendarMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1);
  selectedDate = toDateKey(currentCalendarMonth);
  renderCalendar();
});

updateDashboard();
renderBooks();
updateJourney();
