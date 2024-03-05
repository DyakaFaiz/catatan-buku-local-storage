const books = [];
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKS_APPS';
find
function generateId() {
  return +new Date();
}

function generateBooksObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year:(Number(year)), 
    isComplete
  };
}

function findBooks(booksId) {
  for (const booksItem of books) {
    if (booksItem.id === booksId) {
      return booksItem;
    }
  }
  return null;
}

function findBooksIndex(booksId) {
  for (const index in books) {
    if (books[index].id === booksId) {
      return index;
    }
  }
  return -1;
}


/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see books}
 */
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const s of data) {
      books.push(s);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBooks(booksObject) {

  const {id, title, author, year, isComplete} = booksObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = "Penulis : "+ author;
 
  const textYear = document.createElement('p');
  textYear.innerText = "Tahun : "+year;

  const container = document.createElement('article');
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute('class', `book_item`);

  if (isComplete) {

    const undoButton = document.createElement('button');
    undoButton.innerText = ('Belum Selesai Dibaca')
    undoButton.classList.add('green');
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });
    
    const trashButton = document.createElement('button');
    trashButton.innerText = "Hapus Buku";
    trashButton.classList.add('red');
    trashButton.addEventListener('click', function () {
      const confirmed = window.confirm('Apakah anda yakin ingin menghapus tugas ' + title + ' ? ');
      confirmed ? removeTask(id) : alert('Gagal menghapus');
    }
    
    );

    const action = document.createElement('div');
    action.classList.add('action')
    action.append(undoButton,trashButton)
    
    container.append(action);
  } else {
  
    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = "Hapus Buku";
    trashButton.addEventListener('click', function () {
      const confirmed = window.confirm('Apakah anda yakin ingin menghapus tugas ' + title + ' ? ');
      confirmed ? removeTask(id) : alert('Gagal menghapus');
    });
    
    const checkButton = document.createElement('button');
    checkButton.innerText = ('Selesai Dibaca')
    checkButton.classList.add('green');
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });

    const action = document.createElement('div');
    action.classList.add('action')
    action.append(checkButton,trashButton)
    
    container.append(action);
  }
  
  return container;
} 

function addBooks() {
  const textBooks= document.getElementById('inputBookTitle').value;
  const booksAuthor = document.getElementById('inputBookAuthor').value;
  const inputBookYear = document.getElementById('inputBookYear').value;
  let inputBookIsComplete = document.getElementById('inputBookIsComplete');

  inputBookIsComplete.checked ? isComplete = true : isComplete = false;

  const generatedID = generateId();
  const booksObject = generateBooksObject(generatedID, textBooks, booksAuthor, inputBookYear, isComplete);
  books.push(booksObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(booksId /* HTMLELement */) {
  const booksTarget = findBooks(booksId);

  if (booksTarget == null) return;

  booksTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTask(booksId /* HTMLELement */) {
  const booksTarget = findBooksIndex(booksId);

  if (booksTarget === -1) return;

  books.splice(booksTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(booksId /* HTMLELement */) {

  const booksTarget = findBooks(booksId);
  if (booksTarget == null) return;

  booksTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm /* HTMLFormElement */ = document.getElementById('inputBook');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBooks();
    submitForm.reset();
  });
  

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
});


function searchBooks() {
  const keyword = document.getElementById('searchBookTitle').value.toLowerCase();

  const filteredBooks = books.filter(function(book) {
      return book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword);
  });

  const uncompletedBookShelftList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');
  
  uncompletedBookShelftList.innerHTML = '';
  completeBookshelfList.innerHTML = '';
  
  for (const booksItem of filteredBooks) {
    const booksElement = makeBooks(booksItem);
    if (booksItem.isComplete) {
      completeBookshelfList.append(booksElement);
    } else {
          uncompletedBookShelftList.append(booksElement);
        }
      }
}

// Menambahkan event listener untuk form pencarian
const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function(event) {
  event.preventDefault();
  searchBooks();
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookShelftList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  // clearing list item
  uncompletedBookShelftList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const booksItem of books) {
    const booksElement = makeBooks(booksItem);
    if (booksItem.isComplete) {
      completeBookshelfList.append(booksElement);
    } else {
      uncompletedBookShelftList.append(booksElement);
    }
  }
});