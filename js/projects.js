const projects = [
    {
        title: "Goofy Physics Engine",
        description: "A physics engine developed from scratch using C++ and OpenGL, implementing object-oriented design for a scalable codebase and robust collision detection/response mechanics.",
        codeUrl: "https://github.com/khyeo1011/goofyphysicsengine",
        tags: ["C++", "OpenGL"],
        display: true
    },
    {
        title: "Heart Disease Classification Models",
        description: "Evaluated eight machine learning algorithms to forecast heart disease likelihood. Engineered and optimized an SVM classifier that achieved approximately 70% accuracy.",
        codeUrl: "https://github.com/khyeo1011/heartdiseaseclassification",
        tags: ["Python", "Scikit-learn", "Pandas"],
        display: true
    },
    {
        title: "GamecketList",
        description: "An academic project engineering a game tracking application with Java Swing for the GUI, using test-driven design principles and JSON for data persistence.",
        codeUrl: "https://github.com/khyeo1011/CPSC210-Project",
        tags: ["Java", "Swing", "JUnit"],
        display: false
    },
    {
        title: "Rift Augur",
        description: "Rift Augur is a backend platform tailored for League of Legends, providing intelligent matchmaking, player analytics, and real-time notifications. It is designed to enhance the player experience by leveraging advanced data analysis and scalable infrastructure, specifically for the League of Legends ecosystem.",
        codeUrl: "https://github.com/khyeo1011/Rift-Augur",
        tags: ["React", "Flask", "Python", "TypeScript", "Redis", "DynamoDB"],
        demoUrl: "https://home.sebastianyeo.me/notyet.md",
        display: true
    }
];

function renderProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    const projectsToShow = projects.filter(p => p.display);
    const projectsToHide = projects.filter(p => !p.display);

    let projectsHTML = '';
    projectsToShow.forEach(project => {
        projectsHTML += createProjectHTML(project);
    });

    projectsContainer.innerHTML = projectsHTML;

    if (projectsToHide.length > 0) {
        const showMoreContainer = document.getElementById('show-more-container');
        const showMoreButton = document.createElement('button');
        showMoreButton.id = 'show-more';
        showMoreButton.className = 'bg-teal-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-600 transition-all duration-300 shadow-md';
        showMoreButton.textContent = 'Show More';
        showMoreContainer.appendChild(showMoreButton);

        showMoreButton.addEventListener('click', () => {
            let hiddenProjectsHTML = '';
            projectsToHide.forEach(project => {
                hiddenProjectsHTML += createProjectHTML(project);
            });
            projectsContainer.innerHTML += hiddenProjectsHTML;
            showMoreButton.style.display = 'none';

            const showLessButton = document.createElement('button');
            showLessButton.id = 'show-less';
            showLessButton.className = 'bg-gray-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 shadow-md';
            showLessButton.textContent = 'Show Less';
            showMoreContainer.appendChild(showLessButton);

            showLessButton.addEventListener('click', () => {
                projectsContainer.innerHTML = projectsHTML;
                showLessButton.remove();
                showMoreButton.style.display = 'inline-block';
            });
        });
    }
}
function createProjectHTML(project) {
    const tagsHTML = project.tags.map(tag => `
        <span class="project-tag">${tag}</span>
    `).join('');

    const demoButtonHTML = project.demoUrl ? `
        <a href="${project.demoUrl}" target="_blank" class="text-teal-400 hover:text-teal-300 font-semibold">View Demo</a>
    ` : '';

    return `
        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col">
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-3xl font-bold text-white mb-2">${project.title}</h3>
                <div class="project-tags mb-4">${tagsHTML}</div>
                <p class="text-gray-400 mb-4 flex-grow">${project.description}</p>
                <div class="flex space-x-4 mt-auto">
                    <a href="${project.codeUrl}" target="_blank" class="text-teal-400 hover:text-teal-300 font-semibold">View Code</a>
                    ${demoButtonHTML}
                </div>
            </div>
        </div>
    `;
}