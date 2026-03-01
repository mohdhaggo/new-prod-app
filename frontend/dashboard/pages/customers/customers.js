(function() {
    // ========== STATE ==========
    let customers = [];                     // will be loaded from localStorage
    let currentSearchQuery = '';
    let currentSearchResults = [];
    let currentPage = 1;
    let pageSize = 20;
    let totalPages = 1;
    let currentDetailsCustomer = null;
    let activeDropdown = null;

    // DOM elements
    const inp = document.getElementById('smartSearchInput');
    const tbody = document.getElementById('tableBody');
    const searchStats = document.getElementById('searchStats');
    const emptyState = document.getElementById('emptyState');
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageNumbersDiv = document.getElementById('pageNumbers');
    const paginationContainer = document.getElementById('paginationContainer');
    const statsBarTotal = document.getElementById('totalCustomers');
    const statsBarVehicles = document.getElementById('totalVehiclesStat');
    const statsBarServices = document.getElementById('totalServicesStat');

    // details
    const detailsScreen = document.getElementById('detailsScreen');
    const detailsCustomerIdSpan = document.getElementById('detailsCustomerId');
    const detailsGrid = document.getElementById('detailsGrid');
    const closeDetailsBtn = document.getElementById('closeDetailsScreen');

    // modals
    const addCustomerModal = document.getElementById('addCustomerModal');
    const editCustomerModal = document.getElementById('editCustomerModal');
    const addVehicleModal = document.getElementById('addVehicleModal');
    const alertPopup = document.getElementById('alertPopup');

    // lead dynamic containers
    const leadDynamicDiv = document.getElementById('leadSourceDynamicFields');
    const editLeadDynamicDiv = document.getElementById('editLeadSourceDynamic');

    // ========== LOCALSTORAGE PERSISTENCE ==========
    const STORAGE_KEY = 'customers';

    function loadCustomersFromLocalStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                customers = JSON.parse(stored);
            } catch (e) {
                customers = [];
            }
        } else {
            customers = []; // start empty – no demo data
        }
        // ensure each customer has a 'vehicles' array
        customers.forEach(c => {
            if (!c.vehicles) c.vehicles = [];
            c.registeredVehiclesCount = c.vehicles.length;
            // optional: recalc completedServicesCount from vehicles if needed
        });
        currentSearchResults = [...customers];
    }

    function saveCustomersToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }

    // ========== INITIAL RENDER ==========
    loadCustomersFromLocalStorage();
    paginateAndRender();

    // ========== EVENT LISTENERS ==========
    document.getElementById('newCustomerButton').addEventListener('click', ()=>{ 
        openModal(addCustomerModal); 
        renderLeadDynamic('add', null); 
    });
    document.getElementById('closeModalBtn').addEventListener('click', ()=> closeModal(addCustomerModal));
    document.getElementById('cancelModalBtn').addEventListener('click', ()=> closeModal(addCustomerModal));
    document.getElementById('saveCustomerBtn').addEventListener('click', saveNewCustomer);

    document.getElementById('closeEditModalBtn').addEventListener('click', ()=> closeModal(editCustomerModal));
    document.getElementById('cancelEditModalBtn').addEventListener('click', ()=> closeModal(editCustomerModal));
    document.getElementById('saveEditBtn').addEventListener('click', saveEditCustomer);

    document.getElementById('closeVehicleModalBtn').addEventListener('click', ()=> closeModal(addVehicleModal));
    document.getElementById('cancelVehicleModalBtn').addEventListener('click', ()=> closeModal(addVehicleModal));
    document.getElementById('saveVehicleBtn').addEventListener('click', saveNewVehicle);

    closeDetailsBtn.addEventListener('click', closeDetailsView);
    inp.addEventListener('input', handleSearch);
    pageSizeSelect.addEventListener('change', (e) => { 
        pageSize = +e.target.value; 
        currentPage = 1; 
        paginateAndRender(); 
    });
    prevBtn.addEventListener('click', ()=>{ if(currentPage > 1){ currentPage--; paginateAndRender(); } });
    nextBtn.addEventListener('click', ()=>{ if(currentPage < totalPages){ currentPage++; paginateAndRender(); } });

    // lead source change listeners
    document.getElementById('leadSourceSelect').addEventListener('change', function(){ 
        renderLeadDynamic('add', this.value); 
    });
    document.getElementById('editLeadSourceSelect').addEventListener('change', function(){ 
        renderLeadDynamic('edit', this.value); 
    });

    // Close alert popup when clicking outside
    alertPopup.addEventListener('click', (e) => { 
        if(e.target === alertPopup) alertPopup.style.display = 'none'; 
    });

    // ========== HELPER FUNCTIONS ==========
    function openModal(modal) { 
        modal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
    }
    function closeModal(modal) { 
        modal.style.display = 'none'; 
        document.body.style.overflow = 'auto'; 
    }

    function renderLeadDynamic(context, source) {
        const container = context === 'add' ? leadDynamicDiv : editLeadDynamicDiv;
        if(!container) return;
        if(source === null) source = context === 'add' 
            ? document.getElementById('leadSourceSelect').value 
            : document.getElementById('editLeadSourceSelect').value;
        
        if(source === 'refer') {
            container.innerHTML = `
                <div class="form-group"><label>Referrer name</label><input type="text" id="${context}_refName" class="form-control" placeholder="Name"></div>
                <div class="form-group"><label>Referrer mobile</label><input type="tel" id="${context}_refMobile" class="form-control" placeholder="Mobile"></div>
            `;
        } else if(source === 'social') {
            container.innerHTML = `
                <div class="form-group"><label>Platform</label>
                <select id="${context}_socialPlatform" class="form-control">
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="TikTok">TikTok</option>
                </select></div>
            `;
        } else if(source === 'other') {
            container.innerHTML = `<div class="form-group"><label>Please specify</label><input type="text" id="${context}_otherText" class="form-control" placeholder="How did they hear?"></div>`;
        } else { // walk-in
            container.innerHTML = '';
        }
    }

    // ========== SEARCH ==========
    function handleSearch(e) {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        if (!currentSearchQuery) {
            currentSearchResults = [...customers];
        } else {
            currentSearchResults = customers.filter(c => 
                c.id.toLowerCase().includes(currentSearchQuery) ||
                c.name.toLowerCase().includes(currentSearchQuery) ||
                c.mobile.includes(currentSearchQuery) ||
                (c.email && c.email.toLowerCase().includes(currentSearchQuery)) ||
                (c.leadSource && c.leadSource.includes(currentSearchQuery))
            );
        }
        currentPage = 1;
        paginateAndRender();
    }

    // ========== PAGINATION & RENDERING ==========
    function paginateAndRender() {
        calculateTotals();
        totalPages = Math.ceil(currentSearchResults.length / pageSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        renderTable();
        renderPagination();
        updateStats();
    }

    function calculateTotals() {
        let totalVeh = 0, totalServ = 0;
        currentSearchResults.forEach(c => { 
            totalVeh += c.registeredVehiclesCount || 0; 
            totalServ += c.completedServicesCount || 0; 
        });
        statsBarTotal.innerText = currentSearchResults.length;
        statsBarVehicles.innerText = totalVeh;
        statsBarServices.innerText = totalServ;
    }

    function renderTable() {
        const start = (currentPage - 1) * pageSize;
        const pageData = currentSearchResults.slice(start, start + pageSize);
        if (!pageData.length) { 
            emptyState.style.display = 'block'; 
            document.querySelector('.table-wrapper').style.display = 'none'; 
            searchStats.innerText = 'No customers'; 
            return; 
        }
        emptyState.style.display = 'none'; 
        document.querySelector('.table-wrapper').style.display = 'block';
        
        let html = '';
        pageData.forEach((c, idx) => {
            const dropdownId = `drop_${c.id}_${idx}`;
            html += `<tr>
                <td>${highlight(c.id)}</td><td>${highlight(c.name)}</td><td>${highlight(c.mobile)}</td>
                <td><span class="count-badge">${c.registeredVehiclesCount} vehicles</span></td>
                <td><span class="service-count-badge">${c.completedServicesCount} services</span></td>
                <td>
                    <div class="action-dropdown-container">
                        <button class="btn-action-dropdown" onclick="window.toggleDropdown('${dropdownId}')"><i class="fas fa-cogs"></i> Actions <i class="fas fa-chevron-down"></i></button>
                        <div class="action-dropdown-menu" id="${dropdownId}">
                            <button class="dropdown-item view" onclick="window.openDetailsView('${c.id}'); window.closeAllDropdowns()"><i class="fas fa-eye"></i> View Details</button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item edit" onclick="window.openEditCustomerModal('${c.id}'); window.closeAllDropdowns()"><i class="fas fa-edit"></i> Edit</button>
                            <button class="dropdown-item delete" onclick="window.deleteCustomer('${c.id}'); window.closeAllDropdowns()"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
        searchStats.innerText = `Showing ${start + 1}–${Math.min(start + pageSize, currentSearchResults.length)} of ${currentSearchResults.length} customers`;
    }

    function highlight(txt) { 
        if(!currentSearchQuery) return txt; 
        const re = new RegExp(`(${currentSearchQuery})`, 'gi'); 
        return txt.replace(re, '<span class="search-highlight">$1</span>'); 
    }

    function renderPagination() {
        pageNumbersDiv.innerHTML = '';
        if(totalPages <= 1) { 
            paginationContainer.style.display = 'none'; 
            return; 
        }
        paginationContainer.style.display = 'flex';
        for(let i = 1; i <= totalPages; i++) {
            let btn = document.createElement('button'); 
            btn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
            btn.innerText = i; 
            btn.onclick = () => { currentPage = i; paginateAndRender(); };
            pageNumbersDiv.appendChild(btn);
        }
    }

    function updateStats() { calculateTotals(); }

    // ========== DETAILS VIEW ==========
    window.openDetailsView = function(id) {
        const cust = customers.find(c => c.id === id); 
        if(!cust) return;
        currentDetailsCustomer = cust;
        detailsCustomerIdSpan.innerText = cust.id;

        let leadInfo = '';
        if(cust.leadSource === 'refer' && cust.leadDetails) leadInfo = `Refer by: ${cust.leadDetails.referrerName || ''} (${cust.leadDetails.referrerMobile || ''})`;
        else if(cust.leadSource === 'social' && cust.leadDetails) leadInfo = `Social: ${cust.leadDetails.platform || ''}`;
        else if(cust.leadSource === 'other' && cust.leadDetails) leadInfo = `Other: ${cust.leadDetails.otherText || ''}`;
        else if(cust.leadSource === 'walk-in') leadInfo = 'Walk-in';
        else leadInfo = '—';

        let vehiclesHtml = '';
        if (cust.vehicles && cust.vehicles.length) {
            cust.vehicles.forEach((v, idx) => {
                let vdropdown = `vehDrop_${v.vehicleId}`;
                vehiclesHtml += `<tr>
                    <td>${v.vehicleId}</td><td>${v.make}</td><td>${v.model}</td><td>${v.year}</td><td>${v.vehicleType||''}</td><td>${v.color}</td><td>${v.plateNumber}</td><td>${v.vin||'N/A'}</td>
                    <td><span class="service-count-badge">${v.completedServices} serv.</span></td>
                    <td><div class="action-dropdown-container"><button class="btn-action-dropdown btn-small" onclick="window.toggleDropdown('${vdropdown}')"><i class="fas fa-cogs"></i></button>
                    <div class="action-dropdown-menu" id="${vdropdown}">
                        <button class="dropdown-item view" onclick="window.viewVehicle('${v.vehicleId}')"><i class="fas fa-eye"></i> View</button>
                        <button class="dropdown-item delete" onclick="window.deleteVehicle('${v.vehicleId}')"><i class="fas fa-trash"></i> Delete</button>
                    </div></div></td>
                </tr>`;
            });
        } else vehiclesHtml = '<tr><td colspan="10" style="padding:30px;text-align:center;">No vehicles</td></tr>';

        detailsGrid.innerHTML = `
            <div class="detail-card"><div class="detail-card-header"><h3><i class="fas fa-user"></i> Customer Info</h3><div class="card-header-actions"><button class="btn-edit-header" onclick="window.openEditCustomerModal('${cust.id}')"><i class="fas fa-edit"></i> Edit</button></div></div>
            <div class="card-content">
                <div class="info-item"><span class="info-label">ID</span><span class="info-value">${cust.id}</span></div>
                <div class="info-item"><span class="info-label">Name</span><span class="info-value">${cust.name}</span></div>
                <div class="info-item"><span class="info-label">Mobile</span><span class="info-value">${cust.mobile}</span></div>
                <div class="info-item"><span class="info-label">Email</span><span class="info-value">${cust.email || '—'}</span></div>
                <div class="info-item"><span class="info-label">Address</span><span class="info-value">${cust.address || '—'}</span></div>
                <div class="info-item"><span class="info-label">Since</span><span class="info-value">${cust.customerSince}</span></div>
                <div class="info-item"><span class="info-label">Lead source</span><span class="info-value">${leadInfo}</span></div>
                <div class="info-item"><span class="info-label">Vehicles</span><span class="info-value"><span class="count-badge">${cust.registeredVehiclesCount} vehicles</span> </span></div>
                <div class="info-item"><span class="info-label">Services</span><span class="info-value"><span class="service-count-badge">${cust.completedServicesCount} services</span></span></div>                    
            </div></div>
            <div class="detail-card"><div class="detail-card-header"><h3><i class="fas fa-car"></i> Vehicles</h3><div class="card-header-actions"><button class="btn-edit-header" onclick="window.openAddVehicleModal('${cust.id}')"><i class="fas fa-plus"></i> Add Vehicle</button></div></div>
            <div style="padding:20px;"><table class="vehicles-table"><thead><tr><th>ID</th><th>Make</th><th>Model</th><th>Year</th><th>Type</th><th>Color</th><th>Plate</th><th>VIN</th><th>Services</th><th>Actions</th></tr></thead><tbody>${vehiclesHtml}</tbody></table></div></div>
        `;
        document.querySelector('.container').style.display = 'none';
        detailsScreen.style.display = 'flex';
    }

    function closeDetailsView() { 
        document.querySelector('.container').style.display = 'block'; 
        detailsScreen.style.display = 'none'; 
    }

    // ========== DROPDOWN ==========
    window.toggleDropdown = function(id) {
        const dd = document.getElementById(id); 
        if(!dd) return;
        const all = document.querySelectorAll('.action-dropdown-menu.show'); 
        all.forEach(m => { 
            if(m.id !== id) m.classList.remove('show'); 
            m.closest('.action-dropdown-container')?.classList.remove('dropdown-open'); 
        });
        dd.classList.toggle('show');
        if(dd.classList.contains('show')) { 
            activeDropdown = id; 
            dd.closest('.action-dropdown-container')?.classList.add('dropdown-open'); 
        } else { 
            activeDropdown = null; 
            dd.closest('.action-dropdown-container')?.classList.remove('dropdown-open'); 
        }
    };

    window.closeAllDropdowns = function() {
        document.querySelectorAll('.action-dropdown-menu.show').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.action-dropdown-container.dropdown-open').forEach(c => c.classList.remove('dropdown-open'));
        activeDropdown = null;
    };

    document.addEventListener('click', (e) => { 
        if(!e.target.closest('.action-dropdown-container')) window.closeAllDropdowns(); 
    });

    // ========== CUSTOMER CRUD with lead source ==========
    window.openEditCustomerModal = (id) => {
        const cust = customers.find(c => c.id === id); 
        if(!cust) return;
        document.getElementById('editCustomerId').value = cust.id;
        document.getElementById('editCustomerIdDisplay').value = cust.id;
        document.getElementById('editCustomerName').value = cust.name;
        document.getElementById('editCustomerMobile').value = cust.mobile;
        document.getElementById('editCustomerEmail').value = cust.email || '';
        document.getElementById('editCustomerAddress').value = cust.address || '';
        document.getElementById('editLeadSourceSelect').value = cust.leadSource || 'walk-in';

        // render dynamic fields with prefill
        setTimeout(() => {
            let src = cust.leadSource;
            if(src === 'refer' && cust.leadDetails) {
                renderLeadDynamic('edit', src);
                let f1 = document.getElementById('edit_refName'); if(f1) f1.value = cust.leadDetails.referrerName || '';
                let f2 = document.getElementById('edit_refMobile'); if(f2) f2.value = cust.leadDetails.referrerMobile || '';
            } else if(src === 'social' && cust.leadDetails) {
                renderLeadDynamic('edit', src);
                let sel = document.getElementById('edit_socialPlatform'); if(sel) sel.value = cust.leadDetails.platform || 'Instagram';
            } else if(src === 'other' && cust.leadDetails) {
                renderLeadDynamic('edit', src);
                let inp = document.getElementById('edit_otherText'); if(inp) inp.value = cust.leadDetails.otherText || '';
            } else renderLeadDynamic('edit', src);
        }, 50);
        openModal(editCustomerModal);
    };

    function saveEditCustomer() {
        const id = document.getElementById('editCustomerId').value;
        const cust = customers.find(c => c.id === id);
        if(!cust) return;
        cust.name = document.getElementById('editCustomerName').value.trim();
        cust.mobile = document.getElementById('editCustomerMobile').value.trim();
        cust.email = document.getElementById('editCustomerEmail').value.trim();
        cust.address = document.getElementById('editCustomerAddress').value.trim();
        cust.leadSource = document.getElementById('editLeadSourceSelect').value;
        let src = cust.leadSource;
        if(src === 'refer') {
            cust.leadDetails = {
                referrerName: document.getElementById('edit_refName')?.value.trim() || '',
                referrerMobile: document.getElementById('edit_refMobile')?.value.trim() || ''
            };
        } else if(src === 'social') {
            cust.leadDetails = { platform: document.getElementById('edit_socialPlatform')?.value || 'Instagram' };
        } else if(src === 'other') {
            cust.leadDetails = { otherText: document.getElementById('edit_otherText')?.value.trim() || '' };
        } else cust.leadDetails = null;

        saveCustomersToLocalStorage();
        closeModal(editCustomerModal);
        currentSearchResults = [...customers];
        paginateAndRender();
        if(currentDetailsCustomer && currentDetailsCustomer.id === id) { 
            currentDetailsCustomer = { ...cust }; 
            openDetailsView(id); 
        }
        showAlert('Success', 'Customer updated', 'success');
    }

    function saveNewCustomer() {
        let name = document.getElementById('newCustomerName').value.trim();
        let mobile = document.getElementById('newCustomerMobile').value.trim();
        if(!name || !mobile) { 
            showAlert('Error', 'Name and Mobile required', 'error'); 
            return; 
        }
        let email = document.getElementById('newCustomerEmail').value.trim();
        let address = document.getElementById('newCustomerAddress').value.trim();
        let leadSource = document.getElementById('leadSourceSelect').value;
        let leadDetails = null;
        if(leadSource === 'refer') {
            leadDetails = {
                referrerName: document.getElementById('add_refName')?.value.trim() || '',
                referrerMobile: document.getElementById('add_refMobile')?.value.trim() || ''
            };
        } else if(leadSource === 'social') {
            leadDetails = { platform: document.getElementById('add_socialPlatform')?.value || 'Instagram' };
        } else if(leadSource === 'other') {
            leadDetails = { otherText: document.getElementById('add_otherText')?.value.trim() || '' };
        }

        // Generate a unique ID (simple random for demo – replace with backend logic later)
        let newId = 'CUST-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
        let newCust = { 
            id: newId, 
            name, 
            mobile, 
            email, 
            address, 
            leadSource, 
            leadDetails,
            registeredVehiclesCount: 0, 
            completedServicesCount: 0, 
            customerSince: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            vehicles: [] 
        };
        customers.unshift(newCust);
        saveCustomersToLocalStorage();
        currentSearchResults = [...customers];
        closeModal(addCustomerModal);
        paginateAndRender();
        showAlert('Success', `Customer ${name} added`, 'success');
    }

    window.deleteCustomer = async (id) => {
        if(await showConfirm('Delete?', 'Permanently delete this customer?', 'warning')) {
            let idx = customers.findIndex(c => c.id === id);
            if(idx > -1) customers.splice(idx, 1);
            saveCustomersToLocalStorage();
            currentSearchResults = [...customers];
            if(currentDetailsCustomer && currentDetailsCustomer.id === id) closeDetailsView();
            paginateAndRender();
            showAlert('Deleted', 'Customer removed', 'success');
        }
    };

    // ========== VEHICLE FUNCTIONS ==========
    window.openAddVehicleModal = (custId) => {
        document.getElementById('vehicleCustomerId').value = custId;
        openModal(addVehicleModal);
    };

    function saveNewVehicle() {
        let custId = document.getElementById('vehicleCustomerId').value;
        let cust = customers.find(c => c.id === custId);
        if(!cust) return;
        if(!cust.vehicles) cust.vehicles = [];
        let newVeh = {
            vehicleId: `VEH-${custId.split('-')[1] || '0000'}-${cust.vehicles.length + 1}`,
            make: document.getElementById('vehicleMake').value,
            model: document.getElementById('vehicleModel').value,
            year: document.getElementById('vehicleYear').value,
            vehicleType: document.getElementById('vehicleType').value,
            color: document.getElementById('vehicleColor').value,
            plateNumber: document.getElementById('vehiclePlate').value,
            vin: document.getElementById('vehicleVin').value || '',
            completedServices: 0
        };
        cust.vehicles.push(newVeh);
        cust.registeredVehiclesCount = cust.vehicles.length;
        saveCustomersToLocalStorage();
        closeModal(addVehicleModal);
        if(currentDetailsCustomer && currentDetailsCustomer.id === custId) openDetailsView(custId);
        paginateAndRender();
        showAlert('Success', 'Vehicle added', 'success');
    }

    window.deleteVehicle = (vehId) => {
        let cust = customers.find(c => c.vehicles?.some(v => v.vehicleId === vehId));
        if(!cust) return;
        let idx = cust.vehicles.findIndex(v => v.vehicleId === vehId);
        if(idx > -1) cust.vehicles.splice(idx, 1);
        cust.registeredVehiclesCount = cust.vehicles.length;
        saveCustomersToLocalStorage();
        if(currentDetailsCustomer && currentDetailsCustomer.id === cust.id) openDetailsView(cust.id);
        paginateAndRender();
        showAlert('Vehicle deleted', '', 'info');
    };

    window.viewVehicle = (vid) => showAlert('Vehicle', `Details for ${vid}`, 'info');

    // ========== ALERT HELPERS ==========
    function showAlert(title, msg, type = 'info') {
        document.getElementById('alertTitle').innerText = title; 
        document.getElementById('alertMessage').innerText = msg;
        let hdr = document.getElementById('alertHeader'); 
        hdr.className = `alert-header ${type}`;
        let icon = document.getElementById('alertIcon'); 
        icon.innerHTML = type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
                        type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
                        '<i class="fas fa-info-circle"></i>';
        document.getElementById('alertActions').innerHTML = '<button class="alert-btn alert-btn-primary" onclick="document.getElementById(\'alertPopup\').style.display=\'none\'">OK</button>';
        alertPopup.style.display = 'flex';
    }

    function showConfirm(title, msg, type) { 
        return new Promise(res => {
            document.getElementById('alertTitle').innerText = title; 
            document.getElementById('alertMessage').innerText = msg;
            let hdr = document.getElementById('alertHeader'); 
            hdr.className = `alert-header ${type}`;
            document.getElementById('alertIcon').innerHTML = '<i class="fas fa-question-circle"></i>';
            document.getElementById('alertActions').innerHTML = '<button class="alert-btn alert-btn-secondary" id="confirmNo">Cancel</button><button class="alert-btn alert-btn-primary" id="confirmYes">Confirm</button>';
            alertPopup.style.display = 'flex';
            document.getElementById('confirmNo').onclick = () => { alertPopup.style.display = 'none'; res(false); };
            document.getElementById('confirmYes').onclick = () => { alertPopup.style.display = 'none'; res(true); };
        });
    }

    // Expose globally needed functions
    window.showAlert = showAlert; 
    window.showConfirm = showConfirm;
    window.openEditCustomerModal = window.openEditCustomerModal;
    window.deleteCustomer = deleteCustomer;
    window.openAddVehicleModal = window.openAddVehicleModal;
    window.closeAllDropdowns = window.closeAllDropdowns;
    window.viewVehicle = window.viewVehicle;
    window.deleteVehicle = deleteVehicle;
    window.toggleDropdown = window.toggleDropdown;
    window.openDetailsView = window.openDetailsView;
})();