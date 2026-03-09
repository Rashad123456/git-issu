// ১. প্রয়োজনীয় এলিমেন্টগুলো সিলেক্ট করা
const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const issuesGrid = document.getElementById('issues-grid');
const loader = document.getElementById('loader');
const totalIssuesText = document.getElementById('total-issues');
const tabBtns = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// মোডাল এলিমেন্টসমূহ
const modal = document.getElementById('issue-modal');
const modalContent = document.getElementById('modal-content');
const modalLoader = document.getElementById('modal-loader');
const closeModalBtn = document.getElementById('close-modal-btn');

let allData = [];
let currentFilter = 'All';

// ২. লগইন ফাংশনালিটি
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value.trim();

    if (userVal === 'admin' && passVal === 'admin123') {
        loginPage.classList.add('hide');
        dashboardPage.classList.remove('hide');
        loadData(); // লগইন সফল হলে ডাটা লোড হবে
    } else {
        const errorMsg = document.getElementById('login-error');
        errorMsg.classList.remove('hide');
        setTimeout(() => errorMsg.classList.add('hide'), 3000);
    }
});

// ৩. API থেকে ডাটা ফেচ করা
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

// ৪. কার্ড রেন্ডার করা
function filterAndRender() {
    let filtered = currentFilter === 'All' 
        ? allData 
        : allData.filter(i => i.status?.toLowerCase() === currentFilter.toLowerCase());
    
    totalIssuesText.innerText = filtered.length;
    
    issuesGrid.innerHTML = filtered.map(item => {
        const isOpen = item.status?.toLowerCase() === 'open';
        const priority = (item.priority || 'Low').toLowerCase();
        
        // প্রায়োরিটি অনুযায়ী কালার
        const pColors = {
            high: 'bg-red-50 text-red-500',
            medium: 'bg-yellow-50 text-yellow-600',
            low: 'bg-gray-50 text-gray-500'
        };
        const pClass = pColors[priority] || pColors.low;

        const statusImg = isOpen ? 'assets/Open-Status.png' : 'assets/Closed- Status .png';
        const topBorder = isOpen ? 'border-green-400' : 'border-purple-400';

        return `
        <div onclick="openSingle('${item._id || item.id}')" class="bg-white rounded-2xl border-t-4 ${topBorder} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer flex flex-col h-full border-x border-b border-gray-100 relative group">
            <div class="flex justify-between items-start mb-3">
                <img src="${statusImg}" class="w-5 h-5" alt="icon">
                <span class="text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${pClass}">${priority}</span>
            </div>
            <h3 class="font-bold text-gray-800 text-[13px] leading-tight mb-2 group-hover:text-indigo-600 line-clamp-2">${item.title}</h3>
            <p class="text-[11px] text-gray-400 mb-4 line-clamp-3 flex-grow">${item.description || 'No description available.'}</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
                ${(item.labels || []).map(l => `<span class="text-[9px] font-bold bg-pink-50 text-pink-500 px-2 py-0.5 rounded uppercase">${l}</span>`).join('')}
            </div>
            <div class="pt-3 border-t border-gray-50 mt-auto">
                <div class="text-[10px] text-gray-400 font-bold italic mb-1">#${(item._id || '000').slice(-4)} by ${item.author}</div>
                <div class="text-[9px] text-gray-300">${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '1/15/2024'}</div>
            </div>
        </div>`;
    }).join('');
}

// ৫. ট্যাব ফিল্টারিং
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => {
            b.classList.remove('active', 'bg-[#4F46E5]', 'text-white', 'shadow-sm');
            b.classList.add('text-gray-500');
        });
        btn.classList.add('active', 'bg-[#4F46E5]', 'text-white', 'shadow-sm');
        btn.classList.remove('text-gray-500');
        currentFilter = btn.dataset.status;
        filterAndRender();
    });
});

// ৬. সার্চ ফাংশনালিটি
searchBtn.onclick = () => loadData(searchInput.value);
searchInput.onkeypress = (e) => { if(e.key === 'Enter') loadData(searchInput.value); };

// ৭. সিঙ্গেল ইস্যু মোডাল ওপেন করা
async function openSingle(id) {
    modal.classList.remove('hide');
    modalContent.classList.add('hide');
    modalLoader.classList.remove('hide');
    try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await res.json();
        const data = result.data || result;

        // পপ-আপে ডাটা বসানো
        document.getElementById('modal-title').innerText = data.title;
        document.getElementById('modal-desc').innerText = data.description || "No description.";
        document.getElementById('modal-author').innerText = data.author;
        document.getElementById('modal-assignee').innerText = data.author;
        
        const priorityEl = document.getElementById('modal-priority');
        priorityEl.innerText = data.priority || 'Low';
        const p = (data.priority || 'low').toLowerCase();
        priorityEl.className = `px-4 py-1.5 rounded-full text-xs font-black uppercase ${p === 'high' ? 'bg-[#F56565] text-white' : 'bg-gray-400 text-white'}`;

        document.getElementById('modal-labels').innerHTML = (data.labels || []).map(l => `
            <span class="bg-red-50 text-[#F56565] border border-red-100 px-3 py-1 rounded-full text-[11px] font-bold uppercase">
                ${l}
            </span>
        `).join('');
        
        modalLoader.classList.add('hide');
        modalContent.classList.remove('hide');
    } catch (err) { 
        modal.classList.add('hide'); 
    }
}

// ৮. মোডাল ক্লোজ বাটন ফাংশনালিটি
closeModalBtn.onclick = () => {
    modal.classList.add('hide');
};

// মোডালের বাইরের অংশে ক্লিক করলে বন্ধ হবে
window.onclick = (e) => {
    if (e.target === modal) {
        modal.classList.add('hide');
    }
};