// URL de l'API
const apiUrl = 'http://localhost:5678/api';

// Variables globales
let works = [];
let categories = [];

// Fonction pour récupérer les travaux depuis l'API
async function getWorks() {
    try {
        const response = await fetch(`${apiUrl}/works`);
        works = await response.json();
        displayWorks(works);
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux:', error);
    }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
    try {
        const response = await fetch(`${apiUrl}/categories`);
        categories = await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
    }
}

// Fonction pour afficher les travaux dans la galerie
function displayWorks(worksToDisplay) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';
    
    worksToDisplay.forEach(work => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    });
}

// Fonction pour filtrer les travaux par catégorie
function filterWorks(categoryId) {
    if (categoryId === 0) {
        displayWorks(works);
    } else {
        const filteredWorks = works.filter(work => work.categoryId === categoryId);
        displayWorks(filteredWorks);
    }
}

// Fonction pour gérer les boutons de filtre
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');
            
            // Filtrer les travaux
            const categoryId = parseInt(button.dataset.category);
            filterWorks(categoryId);
        });
    });
}

// Initialisation au chargement de la page
async function init() {
    await getWorks();
    await getCategories();
    setupFilters();
}

// Lancer l'initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init);


// Vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Afficher le mode édition
function showEditMode() {
    // Afficher la barre mode édition
    document.getElementById('edit-mode-banner').style.display = 'flex';
    
    // Afficher le bouton modifier
    document.getElementById('modify-btn').style.display = 'flex';
    
    // Cacher les filtres
    document.querySelector('.filters').classList.add('hidden');
    
    // Changer "login" en "logout" dans la navigation
    const loginLink = document.querySelector('nav a[href="login.html"]');
    if (loginLink) {
        loginLink.textContent = 'logout';
        loginLink.href = '#';
        loginLink.addEventListener('click', logout);
    }
}

// Fonction de déconnexion
function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

// Modifier la fonction init
async function init() {
    await getWorks();
    await getCategories();
    
    // Vérifier si l'utilisateur est connecté
    if (isUserLoggedIn()) {
        showEditMode();
    } else {
        setupFilters();
    }
}

// Variables globales pour la modale
const modal = document.getElementById('modal');
const galleryView = document.getElementById('gallery-view');
const addPhotoView = document.getElementById('add-photo-view');
const modalGallery = document.querySelector('.modal-gallery');
const addWorkForm = document.getElementById('add-work-form');
const photoUpload = document.getElementById('photo-upload');
const previewImage = document.getElementById('preview-image');

// Ouvrir la modale
function openModal() {
    modal.style.display = 'flex';
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    loadModalGallery();
}

// Fermer la modale
function closeModal() {
    modal.style.display = 'none';
    addWorkForm.reset();
    previewImage.style.display = 'none';
    document.querySelector('.upload-zone').classList.remove('has-image');
}

// Charger les projets dans la modale
function loadModalGallery() {
    modalGallery.innerHTML = '';
    works.forEach(work => {
        const item = document.createElement('div');
        item.className = 'modal-gallery-item';
        item.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <button class="delete-icon" data-id="${work.id}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        modalGallery.appendChild(item);
    });
    
    // Ajouter les event listeners pour la suppression
    document.querySelectorAll('.delete-icon').forEach(btn => {
        btn.addEventListener('click', deleteWork);
    });
}

// Supprimer un projet
async function deleteWork(e) {
    const workId = e.currentTarget.dataset.id;
    const token = localStorage.getItem('token');
    
    if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
        try {
            const response = await fetch(`${apiUrl}/works/${workId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                await getWorks();
                loadModalGallery();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    }
}

// Charger les catégories dans le select
async function loadCategoriesInSelect() {
    const select = document.getElementById('category');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// Prévisualiser l'image
photoUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            document.querySelector('.upload-zone').classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
});

// Soumettre le formulaire d'ajout
addWorkForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('image', photoUpload.files[0]);
    formData.append('title', document.getElementById('title').value);
    formData.append('category', document.getElementById('category').value);
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${apiUrl}/works`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            await getWorks();
            closeModal();
            alert('Projet ajouté avec succès !');
        } else {
            alert('Erreur lors de l\'ajout du projet');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout du projet');
    }
});

// Event listeners
document.getElementById('modify-btn').addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

document.querySelector('.close-modal').addEventListener('click', closeModal);
document.querySelector('.modal-overlay').addEventListener('click', closeModal);

document.getElementById('add-photo-btn').addEventListener('click', () => {
    galleryView.style.display = 'none';
    addPhotoView.style.display = 'block';
});

document.querySelector('.back-btn').addEventListener('click', () => {
    addPhotoView.style.display = 'none';
    galleryView.style.display = 'block';
});

// Charger les catégories au démarrage
async function init() {
    await getWorks();
    await getCategories();
    loadCategoriesInSelect();
    
    if (isUserLoggedIn()) {
        showEditMode();
    } else {
        setupFilters();
    }
}

// message de succes formulaire de contact
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Merci ! Votre message a été envoyé avec succès.');
        contactForm.reset();
    });
}
