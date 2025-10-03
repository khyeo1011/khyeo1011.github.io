const projects = [
    {
        title: "Goofy Physics Engine",
        description: "A physics engine developed from scratch using C++ and OpenGL, implementing object-oriented design for a scalable codebase and robust collision detection/response mechanics.",
        imageUrl: "https://placehold.co/600x400/1F2937/34D399?text=C%2B%2B",
        codeUrl: "https://github.com/khyeo1011/goofyphysicsengine"
    },
    {
        title: "Heart Disease Classification Models",
        description: "Evaluated eight machine learning algorithms to forecast heart disease likelihood. Engineered and optimized an SVM classifier that achieved approximately 70% accuracy.",
        imageUrl: "https://placehold.co/600x400/1F2937/A78BFA?text=Python",
        codeUrl: "https://github.com/khyeo1011/heartdiseaseclassification"
    },
    {
        title: "GamecketList",
        description: "An academic project engineering a game tracking application with Java Swing for the GUI, using test-driven design principles and JSON for data persistence.",
        imageUrl: "https://placehold.co/600x400/1F2937/FBBF24?text=Java",
        codeUrl: "https://github.com/khyeo1011/CPSC210-Project"
    },
    {
        title: "Rift Augur",
        description: "Rift Augur is a backend platform tailored for League of Legends, providing intelligent matchmaking, player analytics, and real-time notifications. It is designed to enhance the player experience by leveraging advanced data analysis and scalable infrastructure, specifically for the League of Legends ecosystem.",
        imageUrl: "https://placehold.co/600x400/1F2937/FFFFFF?text=React, Flask",
        codeUrl: "https://github.com/khyeo1011/Rift-Augur"
    }
];

function renderProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    let projectsHTML = '';
    projects.forEach(project => {
        projectsHTML += `
            <div class="project-card bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 flex flex-col min-w-[400px]">
                <img src="${project.imageUrl}" alt="${project.title}" class="w-full h-56 object-cover">
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-2xl font-bold text-white mb-2">${project.title}</h3>
                    <p class="text-gray-400 mb-4 flex-grow">${project.description}</p>
                    <div class="flex space-x-4 mt-auto">
                        <a href="${project.codeUrl}" target="_blank" class="text-teal-400 hover:text-teal-300 font-semibold">View Code</a>
                    </div>
                </div>
            </div>
        `;
    });

    projectsContainer.innerHTML = projectsHTML;
    setupCarousel();
}

function setupCarousel() {
    const projectsContainer = document.getElementById('projects-container');
    const scrollLeftButton = document.getElementById('scroll-left');
    const scrollRightButton = document.getElementById('scroll-right');
    let autoScrollInterval;
    let isTransitioning = false;

    if (!projectsContainer || !scrollLeftButton || !scrollRightButton) return;

    const projects = Array.from(projectsContainer.children);
    const projectWidth = projects[0].offsetWidth + 32; // card width + gap

    // Clone projects for infinite scroll effect
    const clonesStart = projects.slice(-2).map(p => p.cloneNode(true));
    const clonesEnd = projects.slice(0, 2).map(p => p.cloneNode(true));

    clonesStart.reverse().forEach(clone => projectsContainer.insertBefore(clone, projects[0]));
    clonesEnd.forEach(clone => projectsContainer.appendChild(clone));

    projectsContainer.scrollLeft = projectWidth * 2;

    const allProjects = Array.from(projectsContainer.children);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('focused');
            } else {
                entry.target.classList.remove('focused');
            }
        });
    }, {
        root: projectsContainer,
        threshold: 0.8
    });

    allProjects.forEach(project => observer.observe(project));

    function scroll(direction) {
        if (isTransitioning) return;
        isTransitioning = true;

        projectsContainer.scrollLeft += direction * projectWidth;

        if (direction === 1 && projectsContainer.scrollLeft >= projectWidth * (projects.length + 1)) {
            setTimeout(() => {
                projectsContainer.style.transition = 'none';
                projectsContainer.scrollLeft = projectWidth;
                setTimeout(() => {
                    projectsContainer.style.transition = 'scroll-left 0.3s ease-in-out';
                });
            }, 300);
        } else if (direction === -1 && projectsContainer.scrollLeft <= projectWidth) {
            setTimeout(() => {
                projectsContainer.style.transition = 'none';
                projectsContainer.scrollLeft = projectWidth * projects.length;
                setTimeout(() => {
                    projectsContainer.style.transition = 'scroll-left 0.3s ease-in-out';
                });
            }, 300);
        }
        
        setTimeout(() => isTransitioning = false, 300);
    }

    scrollLeftButton.addEventListener('click', () => scroll(-1));
    scrollRightButton.addEventListener('click', () => scroll(1));

    function startAutoScroll() {
        autoScrollInterval = setInterval(() => scroll(1), 3000);
    }

    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }

    projectsContainer.addEventListener('mouseenter', stopAutoScroll);
    projectsContainer.addEventListener('mouseleave', startAutoScroll);
    
    projectsContainer.style.transition = 'scroll-left 0.3s ease-in-out';

    startAutoScroll();
}