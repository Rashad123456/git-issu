const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const issuesGrid = document.getElementById('issues-grid');
const loader = document.getElementById('loader');
const totalIssuesText = document.getElementById('total-issues');
const tabBtns = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const modal = document.getElementById('issue-modal');
const modalContent = document.getElementById('modal-content');
const modalLoader = document.getElementById('modal-loader');

let allData = [];
let currentFilter = 'All';

// 1. Authentication (Login Logic)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value.trim();

    if (userVal === 'admin' && passVal === 'admin123') {
        loginPage.classList.add('hide');
        dashboardPage.classList.remove('hide');
        loadData(); // Fetch API data
    } else {
        const errorMsg = document.getElementById('login-error');
        errorMsg.classList.remove('hide');
        setTimeout(() => errorMsg.classList.add('hide'), 3000);
    }
});

// 2. Data Fetching from API
async function loadData(query = '') {
    loader.classList.remove('hide');
    issuesGrid.innerHTML = '';
    try {
        const url = query 
            ? `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}` 
            : 'https://phi-lab-server.vercel.app/api/v1/lab/issues';
        
        const res = await fetch(url);
        const data = await res.json();
        allData = Array.isArray(data) ? data : (data.data || []);
        filterAndRender();
    } catch (err) {
        issuesGrid.innerHTML = `<p class="col-span-full text-center text-red-400 py-10 font-bold">API Error! Please check internet.</p>`;
    } finally { 
        loader.classList.add('hide'); 
    }
}

// 3. Render Cards and Apply Filter
function filterAndRender() {
    let filtered = currentFilter === 'All' 
        ? allData 
        : allData.filter(i => i.status?.toLowerCase() === currentFilter.toLowerCase());
    
    totalIssuesText.innerText = filtered.length;
    
    issuesGrid.innerHTML = filtered.map(item => {
        const isOpen = item.status?.toLowerCase() === 'open';
        const statusImg = isOpen ? 'assets/Open-Status.png' : 'assets/Closed- Status .png';
        const topBorder = isOpen ? 'border-green-500' : 'border-purple-500';

        return `
        <div onclick="openSingle('${item._id || item.id}')" class="bg-white rounded-2xl border-t-4 ${topBorder} shadow-sm p-5 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full border-x border-b border-gray-100">
            <div class="flex justify-between items-center mb-4">
                <img src="${statusImg}" class="w-5 h-5" alt="icon">
                <span class="text-[10px] font-black px-2 py-1 rounded-md uppercase ${isOpen ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}">${item.status}</span>
            </div>
            <h3 class="font-bold text-gray-800 text-sm mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">${item.title}</h3>
            <p class="text-xs text-gray-400 mb-4 line-clamp-3 flex-grow">${item.description || 'No description available.'}</p>
            <div class="flex flex-wrap gap-1 mb-4">
                ${(item.labels || []).map(l => `<span class="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">${l}</span>`).join('')}
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                <span class="text-[10px] font-bold text-gray-600 italic">@${item.author}</span>
                <span class="text-[9px] text-gray-300 font-medium">${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>`;
    }).join('');
}

// 4. Tab Filtering
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active', 'bg-white', 'text-indigo-600', 'shadow-sm'));
        tabBtns.forEach(b => b.classList.add('text-gray-500'));
        btn.classList.add('active', 'bg-white', 'text-indigo-600', 'shadow-sm');
        btn.classList.remove('text-gray-500');
        currentFilter = btn.dataset.status;
        filterAndRender();
    });
});

// 5. Search Functionality
searchBtn.onclick = () => loadData(searchInput.value);
searchInput.onkeypress = (e) => { if(e.key === 'Enter') loadData(searchInput.value); };

// 6. Single Issue Modal
async function openSingle(id) {
    modal.classList.remove('hide');
    modalContent.classList.add('hide');
    modalLoader.classList.remove('hide');
    try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await res.json();
        const data = result.data || result;

        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-desc').innerText = data.description;
        document.getElementById('modal-author').innerText = data.author;
        document.getElementById('modal-priority').innerText = data.priority;
        document.getElementById('modal-labels').innerHTML = (data.labels || []).map(l => `<span class="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">${l}</span>`).join('');
        
        modalLoader.classList.add('hide');
        modalContent.classList.remove('hide');
    } catch (err) { 
        modal.classList.add('hide'); 
    }
}

// 7. Modal Closing
document.getElementById('close-modal').onclick = () => modal.classList.add('hide');
document.getElementById('close-modal-btn').onclick = () => modal.classList.add('hide');
modal.onclick = (e) => { if(e.target === modal) modal.classList.add('hide'); };