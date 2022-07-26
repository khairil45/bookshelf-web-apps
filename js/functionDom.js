const books = [];
const year = new Date().getFullYear();
const RENDER_EVENT = 'render-bookshelf';
const LOADED = 'DOMContentLoaded';

function generateID() {
    return +new Date();
}

function validateInput(title, author, year) {
    return books.filter(book =>
        book.title == title
        && book.author == author
        && book.year == year
    );
};

function defaultYear() {
    const yearNow = document.getElementById('inputBookYear');

    if(!yearNow.value) {
        yearNow.value = year
    }
};

function bookDataObject(id, title, author, year, isComplete) {
    return {
        id, title, author, year, isComplete
    }
};

function findBook(id) {
    return books.find(data => data.id == id)
};

function findBookByTitle(title) {
    return books.filter(book=> book.title.toLowerCase().includes(title));
};

function findBookIdx(id) {
    return books.findIndex(data => data.id == id)
};

const SAVE_EVENT = 'save-bookshelf';
const STORAGE_KEY = 'bookshelf';

function storageSupport() {
    if (!typeof (Storage)) {
        alert('Web Storage Not Supported');
        return false
    }
    return true
};

function saveData() {
    if (storageSupport()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);

        document.dispatchEvent(new Event(SAVE_EVENT));
    };
};

function loadDataFromStorage () {
    const serializeData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializeData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        };
    };
    document.dispatchEvent(new Event(RENDER_EVENT));
};

const addNewBookTitle = 'Tambah Buku Baru';

function addBook() {
    let title = document.getElementById('inputBookTitle');
    let author = document.getElementById('inputBookAuthor');
    let bookYear = document.getElementById('inputBookYear');
    const isComplete = document.querySelector('#inputBookIsComplete');

    const id = generateID();
    const titlecontent = validateInput(title.value, author.value, bookYear.value);

    let state = true;
    if (!titlecontent.length) {
        const bookData = bookDataObject(id, title.value, author.value, bookYear.value, isComplete.checked);
        books.push(bookData);
        title.value = '';
        author.value = '';
        bookYear.value = '';
        isComplete.checked = false;

        saveData();
    } else {
        state = false
    };

    createNotifikasi(state, 'Buku berhasil ditambahkan', 'addIcon', `<strong>Buku ${title.value}</strong> sudah ada`);
    document.dispatchEvent(new Event(RENDER_EVENT));
};

function editBooksObject() {
    let idBook = document.getElementById('inputBookID');
    let title = document.getElementById('inputBookTitle');
    let author = document.getElementById('inputBookAuthor');
    let bookYear = document.getElementById('inputBookYear');
    const isComplete = document.querySelector('#inputBookIsComplete');
    const submitForm = document.getElementById('inputBook');
    const submitBtn = document.getElementById('bookSubmit');
    const Title = document.getElementById('inputFormTitle');
    const bookTarget = findBook(idBook.value);

    const state = true;
    if (!bookTarget) {
        state = false;
    } else {
        bookTarget.title = title.value;
        bookTarget.author = author.value;
        bookTarget.year = bookYear.value;
        bookTarget.isComplete = isComplete.checked;

        Title.innerText = addNewBookTitle;
        submitBtn.innerHTML = defaultBtnSubmit;
    };
    submitForm.classList.replace('edit', 'submited');

    title.value = '';
    author.value = '';
    bookYear.value = '';
    isComplete.checked = false

    createNotifikasi(state, 'Buku selesai diperbarui', 'editIcon', 'Gagal perbarui buku');
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

const editBookTitle = 'Edit Buku';

function editBook(id) {
    const submitForm = document.getElementById('inputBook');
    const submitBtn = document.getElementById('bookSubmit');
    submitBtn.innerHTML = defaultBtnEdit;
    submitForm.classList.replace('submited', 'edit');

    const Title = document.getElementById('inputFormTitle');
    Title.innerText = editBookTitle;

    let idBook = document.getElementById('inputBookID');
    let title = document.getElementById('inputBookTitle');
    let author = document.getElementById('inputBookAuthor');
    let bookYear = document.getElementById('inputBookYear');
    const isComplete = document.querySelector('#inputBookIsComplete');

    const bookData = findBook(id);
    console.log(bookData);
    idBook.value = bookData.id;
    title.value = bookData.title;
    author.value = bookData.author;
    bookYear.value = Number(bookData.year);
    isComplete.checked = bookData.isComplete;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function makeBook(bookData) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookData.title;

    const author = document.createElement('a');
    author.className = 'author';
    author.innerText = 'Penulis : ' + bookData.author + ',';

    const year = document.createElement('a');
    year.className = 'year'
    year.innerText = 'Tahun ' + bookData.year;

    const textContainer = document.createElement('article');

    const yearAuthorContainer = document.createElement('p');
    yearAuthorContainer.className = 'authoryear';
    yearAuthorContainer.append(author, year);
    textContainer.classList.add('book_item');
    textContainer.append(textTitle, yearAuthorContainer);

    const container = document.createElement('div');
    container.classList.add('book_item');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookData.id}`);

    const actionContainer = document.createElement('div');
    actionContainer.classList.add('action');

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn-delete');

    deleteBtn.addEventListener('click', function () {
        removeTaskFromCompleted(bookData.id);
    });

    const editBtn = document.createElement('button');
    editBtn.classList.add('btn-update');

    editBtn.addEventListener('click', function () {
        editBook(bookData.id);
    });

    if (bookData.isComplete) {
        const undoBtn = document.createElement('button')
        undoBtn.classList.add('btn-undo');

        undoBtn.addEventListener('click', function() {
            undoTaskFromCompleted(bookData.id);
        })

        actionContainer.append(undoBtn, deleteBtn);
        container.append(actionContainer);
    } else {
        const checkBtn = document.createElement('button');
        checkBtn.classList.add('btn-check');

        checkBtn.addEventListener('click', function() {
            addTaskToCompleted(bookData.id);
        });

        actionContainer.append(checkBtn, editBtn, deleteBtn);
        container.append(actionContainer);
    };
    return container
}

function addTaskToCompleted(id) {
    const bookTarget = findBook(id);

    const state = true;
    if (!bookTarget) {
        state = false;
    } else {
        bookTarget.isComplete = true;
    };

    createNotifikasi(state, 'Buku selesai dibaca', 'checkIcon', 'Buku belum selesai dibaca');
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function removeTaskFromCompleted(id) {
    const isDelete = confirm("Hapus buku ini");
    const bookTarget = findBookIdx(id);
    const state = true;
    if (!isDelete) {
        return isDelete
    }
    if (bookTarget === -1) {
        state = false;
    } else {
        books.splice(bookTarget, 1);
    };

    createNotifikasi(state, 'Berhasil menghapus', 'deleteIcon', 'Gagal menghapus');
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function undoTaskFromCompleted(id) {
    const bookTarget = findBook(id);

    const state = true;
    if (!bookTarget) {
        state = false
    } else {
        bookTarget.isComplete = false
    };

    createNotifikasi(state, 'Berhasil kembali', 'undoIcon', 'Gagal kembali');
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function createNotifikasi(isValid, message, classIcon, failMessage) {
    var notifikasiMessage = message || 'Save Success';

    if (!isValid) {
        var notifikasiMessage = failMessage || 'Save Failed';
    };

    const Message = document.querySelector('.notifikasi-message');
    
    Message.innerHTML = '';
    Message.innerHTML = notifikasiMessage;

    const byClassIcon = classIcon;
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    
    const notifikasiIcon = document.querySelector('.notifikasi-icon');
    notifikasiIcon.classList.add(byClassIcon);
    setTimeout(() => {
        Message.innerHTML = 'notifikasi';
        notifikasiIcon.classList.remove(byClassIcon);
    }, 2000);
}

function search() {
    const queryKey = document.getElementById('searchBookByTitle');
    const title = queryKey.value;

    if (!title) {
        if (storageSupport()) {
            books.splice(0, books.length);
            loadDataFromStorage();
        }
        return
    };

    const bookList = findBookByTitle(title);

    let state = true;
    if (!bookList.length) {
        state = false
        books.splice(0, books.length);
    } else {
        books.splice(0, books.length);
        books.push(...bookList);
    };

    createNotifikasi(state, 'Buku ditemukan ', 'searchIcon', 'Buku tidak ada');
    document.dispatchEvent(new Event(RENDER_EVENT));
};

const defaultBtnSubmit = 'Masukkan buku ke rak <span id = "status">Belum selesai dibaca</span>';
const defaultBtnEdit = 'Edit Buku dari rak <span id = "status">Selesai dibaca</span>';

function checkBtn() {
    const span = document.querySelector("span");
    if (inputBookIsComplete.checked) {
        span.innerText = "Selesai dibaca";
    } else {
        span.innerText = "Belum selesai dibaca";
    };
};

function loadBook() {
    const noDataDialog = '<label>Tidak ada data</label>';
    const incompletedBookList = document.getElementById('incompleteBookshelfList');
    incompletedBookList.innerHTML = noDataDialog;

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = noDataDialog;

    if (books.length) {
        incompletedBookList.innerHTML = ''
        completedBookList.innerHTML = ''
    };
    for (const book of books) {
        const bookElement = makeBook(book)
        if (!book.isComplete) {
            incompletedBookList.append(bookElement)
        } else {
            completedBookList.append(bookElement)
        };
    };
};

