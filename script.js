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

    /* ---------------------------------------------------------
       2. CHARGEMENT ET FILTRAGE DES PROJETS
    --------------------------------------------------------- */
    const container = document.getElementById('projects-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById("python-modal"); // On récupère la modale ici
    let allProjects = []; 

    // Fonction pour afficher les cartes
    const renderProjects = (projects) => {
        container.innerHTML = ''; 
        
        if(projects.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">Aucun projet dans cette catégorie.</p>';
            return;
        }

        projects.forEach(project => {
            // Badges
            const tagsHtml = project.tags.map(tag => 
                `<span class="tech-tag">${tag}</span>`
            ).join('');

            // Liens (C'est ici qu'on modifie la logique !)
            const linksHtml = project.links.map((link, index) => {
                let html;
                
                // SI c'est le lien spécial vers la démo Python
                if (link.url === '#python-demo') {
                    html = `<a href="#" class="open-python-modal" style="color: #4ade80; font-weight:bold;">${link.text}</a>`;
                } 
                // SINON c'est un lien normal
                else {
                    html = `<a href="${link.url}" target="_blank">${link.text}</a>`;
                }

                if (index < project.links.length - 1) html += `<div class="separator"></div>`;
                return html;
            }).join('');

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

    // --- NOUVEAU : Écouteur d'événement pour les boutons générés dynamiquement ---
    // On utilise la "délégation d'événement" car les boutons n'existent pas au chargement de la page
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('open-python-modal')) {
            e.preventDefault(); // Empêche le lien de remonter en haut de page
            if(modal) modal.style.display = "block"; // Ouvre la popup
        }
    });

    // Chargement initial des données
    fetch('project.json')
        .then(res => {
            if (!res.ok) throw new Error("Impossible de charger le fichier JSON");
            return res.json();
        })
        .then(data => {
            allProjects = data;
            renderProjects(allProjects);
        })
        .catch(err => console.error("Erreur JSON:", err));
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
/* ---------------------------------------------------------
       5. MODAL PYTHON DEMO
    --------------------------------------------------------- */
    const modal = document.getElementById("python-modal");
    const btn = document.getElementById("python-btn");
    const span = document.getElementsByClassName("close-modal")[0];

    // Ouvrir la modal
    if (btn) {
        btn.onclick = function() {
            modal.style.display = "block";
        }
    }

    // Fermer avec la croix
    if (span) {
        span.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Fermer en cliquant en dehors
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
/* ---------------------------------------------------------
       6. NAVIGATION MOBILE
    --------------------------------------------------------- */
    const mobileNavBtn = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');        
    mobileNavBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
    });         
