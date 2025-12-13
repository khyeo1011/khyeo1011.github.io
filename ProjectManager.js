const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const PROJECTS_DIR = path.join(__dirname, 'projects');
const INDEX_FILE = path.join(PROJECTS_DIR, 'index.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

const getIndex = () => {
    if (!fs.existsSync(INDEX_FILE)) return [];
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
};

const saveIndex = (data) => {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 4));
};

const getAllProjectFiles = () => {
    if (!fs.existsSync(PROJECTS_DIR)) return [];
    return fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
};

const slugify = (text) => text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text

async function listProjects() {
    const index = getIndex();
    const allFiles = getAllProjectFiles();
    
    console.log('\n--- Current Projects ---');
    allFiles.forEach((file, i) => {
        const isVisible = index.includes(file);
        const status = isVisible ? '\x1b[32m[VISIBLE]\x1b[0m' : '\x1b[31m[HIDDEN] \x1b[0m'; // Green/Red colors
        console.log(`${i + 1}. ${status} ${file}`);
    });
    return allFiles;
}

async function addProject() {
    console.log('\n--- Add New Project ---');
    const title = await ask('Title: ');
    const description = await ask('Description: ');
    const codeUrl = await ask('Code URL: ');
    const demoUrl = await ask('Demo URL (optional): ');
    const tagsInput = await ask('Tags (comma separated): ');
    
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
    const filename = slugify(title) + '.json';
    
    const newProject = {
        title,
        description,
        codeUrl,
        tags,
        display: true
    };
    if (demoUrl) newProject.demoUrl = demoUrl;

    fs.writeFileSync(path.join(PROJECTS_DIR, filename), JSON.stringify(newProject, null, 4));
    console.log(`Created ${filename}`);

    const index = getIndex();
    if (!index.includes(filename)) {
        index.push(filename);
        saveIndex(index);
        console.log('Added to index.json');
    }
}

async function editProject() {
    const allFiles = await listProjects();
    const selection = await ask('\nEnter number to EDIT: ');
    const index = parseInt(selection) - 1;

    if (index >= 0 && index < allFiles.length) {
        const oldFilename = allFiles[index];
        const filePath = path.join(PROJECTS_DIR, oldFilename);
        const project = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`\n--- Editing ${project.title} ---`);
        console.log('Press Enter to keep current value.');

        const title = await ask(`Title (${project.title}): `);
        if (title.trim()) project.title = title.trim();

        const descPreview = project.description.length > 50 ? project.description.substring(0, 50) + '...' : project.description;
        const description = await ask(`Description (${descPreview}): `);
        if (description.trim()) project.description = description.trim();

        const codeUrl = await ask(`Code URL (${project.codeUrl}): `);
        if (codeUrl.trim()) project.codeUrl = codeUrl.trim();

        const currentDemo = project.demoUrl || '';
        const demoUrl = await ask(`Demo URL (${currentDemo || 'none'}): `);
        if (demoUrl.trim()) project.demoUrl = demoUrl.trim();

        const currentTags = project.tags.join(', ');
        const tagsInput = await ask(`Tags (${currentTags}): `);
        if (tagsInput.trim()) {
            project.tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        }
        const currentDisplay = project.display ? 'Yes' : 'No';
        const display = await ask(`Display (${currentDisplay}): (y/n)`);
        if (display.trim()) project.display = display.trim().toLowerCase() === 'y';


        const newFilename = slugify(project.title) + '.json';
        
        if (newFilename !== oldFilename) {
            const newPath = path.join(PROJECTS_DIR, newFilename);
            fs.writeFileSync(newPath, JSON.stringify(project, null, 4));
            fs.unlinkSync(filePath);
            
            const indexData = getIndex();
            const idx = indexData.indexOf(oldFilename);
            if (idx !== -1) {
                indexData[idx] = newFilename;
                saveIndex(indexData);
            }
            console.log(`Updated and renamed to ${newFilename}`);
        } else {
            fs.writeFileSync(filePath, JSON.stringify(project, null, 4));
            console.log('Project updated.');
        }
    } else {
        console.log('Invalid selection');
    }
}

async function toggleVisibility() {
    const allFiles = await listProjects();
    const selection = await ask('\nEnter number to toggle visibility: ');
    const index = parseInt(selection) - 1;
    
    if (index >= 0 && index < allFiles.length) {
        const filename = allFiles[index];
        const currentIndex = getIndex();
        
        if (currentIndex.includes(filename)) {
            const newIndex = currentIndex.filter(f => f !== filename);
            saveIndex(newIndex);
            console.log(`Hid ${filename} (Removed from index)`);
        } else {
            currentIndex.push(filename);
            saveIndex(currentIndex);
            console.log(`Showed ${filename} (Added to index)`);
        }
    } else {
        console.log('Invalid selection');
    }
}

async function deleteProject() {
    const allFiles = await listProjects();
    const selection = await ask('\nEnter number to DELETE (irreversible): ');
    const index = parseInt(selection) - 1;

    if (index >= 0 && index < allFiles.length) {
        const filename = allFiles[index];
        const confirm = await ask(`Are you sure you want to delete ${filename}? (y/n): `);
        if (confirm.toLowerCase() === 'y') {
            const currentIndex = getIndex();
            const newIndex = currentIndex.filter(f => f !== filename);
            saveIndex(newIndex);
            fs.unlinkSync(path.join(PROJECTS_DIR, filename));
            console.log('Deleted.');
        }
    }
}

async function pushToGithub() {
    console.log('\n--- Pushing to GitHub ---');
    const commitMsg = await ask('Commit message (default: "Update projects"): ');
    const msg = commitMsg || 'Update projects';
    
    const command = `git add . && git commit -m "${msg}" && git push`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) console.error(`Error: ${error.message}`);
        else console.log(`\nSuccess! Output:\n${stdout}`);
    });
}

async function main() {
    if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR);
    while (true) {
        console.log('\n=== PROJECT MANAGER ===');
        console.log('1. List Projects\n2. Add New Project\n3. Edit Project\n4. Toggle Visibility\n5. Delete Project\n6. Push to GitHub\n7. Exit');
        const answer = await ask('\nSelect option: ');
        if (answer === '1') await listProjects();
        else if (answer === '2') await addProject();
        else if (answer === '3') await editProject();
        else if (answer === '4') await toggleVisibility();
        else if (answer === '5') await deleteProject();
        else if (answer === '6') await pushToGithub();
        else if (answer === '7') { rl.close(); process.exit(0); }
    }
}

main();