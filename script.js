document.addEventListener("DOMContentLoaded", () => {
    
    /* =========================================
       1. GESTION DU MODE SOMBRE / CLAIR
    ========================================= */
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeBtn.textContent = '🌙'; 
    }

    if (themeBtn) {
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
    }

    /* =========================================
       2. GESTION DES MODALES (Pop-ups)
    ========================================= */
    // Récupération des éléments
    const modalMDP = document.getElementById("python-modal");       // Modale Générateur MDP
    const modalBreakout = document.getElementById("breakout-modal"); // Modale Casse-Briques
    const btnBreakout = document.getElementById("breakout-btn");     // Bouton flottant
    const closeBtns = document.querySelectorAll('.close-modal');     // Les croix de fermeture

    // Fonction pour fermer toutes les modales
    const closeAllModals = () => {
        if(modalMDP) modalMDP.style.display = "none";
        if(modalBreakout) modalBreakout.style.display = "none";
    };

    // Gestion du clic sur les croix (x)
    closeBtns.forEach(btn => {
        btn.onclick = closeAllModals;
    });

    // Fermer en cliquant en dehors de la fenêtre
    window.onclick = function(event) {
        if (event.target == modalMDP || event.target == modalBreakout) {
            closeAllModals();
        }
    };

    // Ouvrir le Casse-Briques (Bouton flottant)
    if(btnBreakout && modalBreakout) {
        btnBreakout.onclick = function() {
            modalBreakout.style.display = "block";
        }
    }

    /* =========================================
       3. CHARGEMENT ET FILTRAGE DES PROJETS
    ========================================= */
    const container = document.getElementById('projects-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allProjects = []; 

    const renderProjects = (projects) => {
        if (!container) return;
        container.innerHTML = ''; 
        
        if(projects.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">Aucun projet dans cette catégorie.</p>';
            return;
        }

        projects.forEach(project => {
            const tagsHtml = project.tags.map(tag => 
                `<span class="tech-tag">${tag}</span>`
            ).join('');

            const linksHtml = project.links.map((link, index) => {
                let html;
                
                // DÉTECTION DU LIEN SPÉCIAL POUR LE PROJET PYTHON
                if (link.url === '#python-demo') {
                    // On ajoute une classe spécifique pour l'intercepter plus tard
                    html = `<a href="#" class="open-python-modal" style="color: #4ade80; font-weight:bold;">${link.text}</a>`;
                } 
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

    // ÉCOUTEUR D'ÉVÉNEMENT POUR LE PROJET GÉNÉRATEUR MDP
    if (container) {
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('open-python-modal')) {
                e.preventDefault(); 
                if(modalMDP) modalMDP.style.display = "block"; // Ouvre la modale MDP
            }
        });
    }

    // Chargement du JSON
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

    // Filtres
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                renderProjects(allProjects);
            } else {
                const filtered = allProjects.filter(p => p.category === filterValue);
                renderProjects(filtered);
            }
        });
    });

    /* =========================================
       4. FORMULAIRE DE CONTACT
    ========================================= */
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) { 
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

    /* =========================================
       5. ANIMATIONS SCROLL
    ========================================= */
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));
    
    /* =========================================
       6. NAVIGATION MOBILE
    ========================================= */
    const mobileNavBtn = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');        
    if (mobileNavBtn && mobileNav) {
        mobileNavBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }
});