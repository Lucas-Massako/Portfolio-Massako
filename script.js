document.addEventListener("DOMContentLoaded", () => {
    
    /* 
       1. Dark Mode */
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Vérifier si l'utilisateur a déjà choisi un thème
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeBtn.textContent = '🌙'; 
    }

    // Basculer le thème au clic
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        
        if (body.classList.contains('light-mode')) {
            themeBtn.textContent = '🌙';
            localStorage.setItem('theme', 'light'); 
        } else {
            themeBtn.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });

    /*  2. CHARGEMENT ET FILTRAGE DES PROJETS */

    const container = document.getElementById('projects-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allProjects = []; // Variable pour stocker les projets

    // Fonction pour afficher les cartes
    const renderProjects = (projects) => {
        container.innerHTML = ''; // On vide la grille avant de remplir
        
        if(projects.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">Aucun projet dans cette catégorie.</p>';
            return;
        }

        projects.forEach(project => {
            // Génération des badges (tags)
            const tagsHtml = project.tags.map(tag => 
                `<span class="tech-tag">${tag}</span>`
            ).join('');

            // Génération des liens
            const linksHtml = project.links.map((link, index) => {
                let html = `<a href="${link.url}" target="_blank">${link.text}</a>`;
                if (index < project.links.length - 1) html += `<div class="separator"></div>`;
                return html;
            }).join('');

            // Création de la carte HTML
            const card = `
                <div class="project-card reveal visible">
                    <div class="project-header">
                        <span class="project-type">${project.type}</span>
                    </div>
                    <div class="project-body">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="tech-stack">${tagsHtml}</div>
                    </div>
                    <div class="project-links">${linksHtml}</div>
                </div>
            `;
            container.innerHTML += card;
        });
    };

    // Chargement initial des données (Correction: project.json au singulier)
    fetch('project.json')
        .then(res => {
            if (!res.ok) throw new Error("Impossible de charger le fichier JSON");
            return res.json();
        })
        .then(data => {
            allProjects = data; // Sauvegarde globale
            renderProjects(allProjects); // Affichage initial (Tous)
        })
        .catch(err => console.error("Erreur JSON:", err));

    // Gestion des clics sur les filtres
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Gestion visuelle du bouton actif
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');

            // Filtrage logique
            const filterValue = btn.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                renderProjects(allProjects);
            } else {
                const filtered = allProjects.filter(p => p.category === filterValue);
                renderProjects(filtered);
            }
        });
    });

    /* ---------------------------------------------------------
       3. FORMULAIRE DE CONTACT (Envoi Discord)
    --------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) { // Vérification de sécurité si le formulaire existe
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const formData = new FormData(this);
            const statusText = document.getElementById('formStatus');
            const btn = this.querySelector('button');

            btn.textContent = "Envoi en cours...";
            btn.disabled = true;

            fetch('contact.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.status === 'success') {
                    statusText.textContent = "✅ Message reçu sur mon Discord ! Merci.";
                    statusText.style.color = "#4ade80";
                    this.reset(); 
                } else {
                    statusText.textContent = "❌ Erreur lors de l'envoi.";
                    statusText.style.color = "#f87171";
                }
                btn.textContent = "Envoyer le message";
                btn.disabled = false;
            })
            .catch(error => {
                console.error('Erreur:', error);
                statusText.textContent = "❌ Erreur technique.";
                btn.textContent = "Envoyer le message";
                btn.disabled = false;
            });
     
        });
        
    }
/* ---------------------------------------------------------
       4. ANIMATIONS AU SCROLL (Intersection Observer)
    --------------------------------------------------------- */
    const observerOptions = {
        threshold: 0.1 // L'animation se lance quand 10% de l'élément est visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionnel : on arrête d'observer une fois apparu (pour ne pas rejouer l'animation)
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // On cible tous les éléments qui ont la classe "reveal"
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
    
});