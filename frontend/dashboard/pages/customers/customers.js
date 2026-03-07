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
    let activeDropdownTrigger = null;

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

    // vehicle details
    const vehicleDetailsScreen = document.getElementById('vehicleDetailsScreen');
    const detailsVehicleIdSpan = document.getElementById('detailsVehicleId');
    const vehicleDetailsGrid = document.getElementById('vehicleDetailsGrid');
    const closeVehicleDetailsBtn = document.getElementById('closeVehicleDetailsScreen');

    // modals
    const addCustomerModal = document.getElementById('addCustomerModal');
    const editCustomerModal = document.getElementById('editCustomerModal');
    const addVehicleModal = document.getElementById('addVehicleModal');
    const editVehicleModal = document.getElementById('editVehicleModal');
    const addServiceModal = document.getElementById('addServiceModal');
    const serviceDetailsModal = document.getElementById('serviceDetailsModal');
    const alertPopup = document.getElementById('alertPopup');

    // lead dynamic containers
    const leadDynamicDiv = document.getElementById('leadSourceDynamicFields');
    const editLeadDynamicDiv = document.getElementById('editLeadSourceDynamic');

    // vehicle selects
    const vehicleMake = document.getElementById('vehicleMake');
    const vehicleModel = document.getElementById('vehicleModel');
    const vehicleYear = document.getElementById('vehicleYear');
    const vehicleColor = document.getElementById('vehicleColor');

    // Edit Vehicle elements
    const editVehicleId = document.getElementById('editVehicleId');
    const editVehicleColor = document.getElementById('editVehicleColor');
    const editVehiclePlate = document.getElementById('editVehiclePlate');

    // Service elements
    const serviceVehicleId = document.getElementById('serviceVehicleId');
    const serviceOrderType = document.getElementById('serviceOrderType');
    const serviceWorkStatus = document.getElementById('serviceWorkStatus');
    const servicePaymentStatus = document.getElementById('servicePaymentStatus');
    const serviceCost = document.getElementById('serviceCost');
    const serviceDetailsContent = document.getElementById('serviceDetailsContent');

    // ========== LOCALSTORAGE PERSISTENCE ==========
    const STORAGE_KEY = 'customers';
    const VEHICLES_STORAGE_KEY = 'vehicles';
    const VEHICLE_MAKE_MODEL_STORAGE_KEY = 'vehicle_make_model_options';
    const VEHICLE_COLORS = [
        'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Brown', 'Green',
        'Beige', 'Orange', 'Gold', 'Yellow', 'Purple', 'Navy'
    ];
    const DEFAULT_VEHICLE_MAKE_MODEL_OPTIONS = {
        'Audi': ['A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7', 'Q8'],
        'BMW': ['1 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7'],
        'Chevrolet': ['Camaro', 'Captiva', 'Cruze', 'Malibu', 'Silverado', 'Tahoe'],
        'Ford': ['EcoSport', 'Escape', 'Explorer', 'F-150', 'Focus', 'Mustang', 'Ranger'],
        'Honda': ['Accord', 'City', 'Civic', 'CR-V', 'HR-V', 'Pilot'],
        'Hyundai': ['Accent', 'Creta', 'Elantra', 'Santa Fe', 'Sonata', 'Tucson'],
        'Kia': ['Cerato', 'K5', 'Rio', 'Seltos', 'Sorento', 'Sportage'],
        'Lexus': ['ES', 'GX', 'IS', 'LX', 'NX', 'RX'],
        'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC', 'GLE', 'S-Class'],
        'Mitsubishi': ['ASX', 'L200', 'Montero Sport', 'Outlander', 'Pajero'],
        'Nissan': ['Altima', 'Maxima', 'Patrol', 'Sentra', 'Sunny', 'X-Trail'],
        'Toyota': ['Camry', 'Corolla', 'Fortuner', 'Hilux', 'Land Cruiser', 'Prado', 'RAV4', 'Yaris'],
        'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Touareg']
    };
    let vehicleMakeModelOptions = {};

    // Helper function to load vehicles from shared storage
    function loadVehiclesFromLocalStorage() {
        const stored = localStorage.getItem(VEHICLES_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    // Helper function to save vehicles to shared storage
    function saveVehiclesToLocalStorage(vehicles) {
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    }

    // Helper function to get customer's vehicles from shared storage
    function getCustomerVehicles(customerId) {
        const allVehicles = loadVehiclesFromLocalStorage();
        return allVehicles.filter(v => v.customerId === customerId);
    }

    function loadCustomersFromLocalStorage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                customers = JSON.parse(stored);
            } catch (e) {
                customers = [];
            }
        } else {
            customers = [];
        }
        
        // Calculate vehicle and service counts from shared vehicles storage
        const allVehicles = loadVehiclesFromLocalStorage();
        customers.forEach(c => {
            const customerVehicles = allVehicles.filter(v => v.customerId === c.id);
            c.registeredVehiclesCount = customerVehicles.length;
            
            // Calculate completed services from all customer vehicles
            c.completedServicesCount = customerVehicles.reduce((total, vehicle) => {
                return total + (vehicle.completedServices || 0);
            }, 0);
        });
        currentSearchResults = [...customers];
    }

    function saveCustomersToLocalStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }

    function cloneDefaultVehicleMakeModelOptions() {
        const cloned = {};
        Object.keys(DEFAULT_VEHICLE_MAKE_MODEL_OPTIONS).forEach(makeName => {
            cloned[makeName] = [...DEFAULT_VEHICLE_MAKE_MODEL_OPTIONS[makeName]];
        });
        return cloned;
    }

    function sanitizeVehicleMakeModelOptions(rawOptions) {
        if (!rawOptions || typeof rawOptions !== 'object' || Array.isArray(rawOptions)) {
            return {};
        }

        const sanitized = {};

        Object.entries(rawOptions).forEach(([makeName, models]) => {
            const normalizedMakeName = String(makeName || '').trim().replace(/\s+/g, ' ');
            if (!normalizedMakeName || !Array.isArray(models)) {
                return;
            }

            const uniqueModels = [...new Set(
                models
                    .map(modelName => String(modelName || '').trim().replace(/\s+/g, ' '))
                    .filter(Boolean)
            )].sort((a, b) => a.localeCompare(b));

            sanitized[normalizedMakeName] = uniqueModels;
        });

        return sanitized;
    }

    function loadVehicleMakeModelOptions() {
        let loadedOptions = null;
        const storedOptions = localStorage.getItem(VEHICLE_MAKE_MODEL_STORAGE_KEY);

        if (storedOptions) {
            try {
                loadedOptions = sanitizeVehicleMakeModelOptions(JSON.parse(storedOptions));
            } catch (error) {
                loadedOptions = null;
            }
        }

        if (!loadedOptions || !Object.keys(loadedOptions).length) {
            loadedOptions = cloneDefaultVehicleMakeModelOptions();
            localStorage.setItem(VEHICLE_MAKE_MODEL_STORAGE_KEY, JSON.stringify(loadedOptions));
        }

        vehicleMakeModelOptions = loadedOptions;
    }

    function renderVehicleMakeOptions() {
        const makes = Object.keys(vehicleMakeModelOptions).sort((a, b) => a.localeCompare(b));

        if (!makes.length) {
            vehicleMake.innerHTML = '<option value="">No makes available</option>';
            vehicleMake.disabled = true;
            return;
        }

        const options = ['<option value="">Select make</option>'];
        makes.forEach(makeName => {
            options.push(`<option value="${makeName}">${makeName}</option>`);
        });

        vehicleMake.innerHTML = options.join('');
        vehicleMake.disabled = false;
    }

    function resetVehicleModelSelect(placeholderText = 'Select make first') {
        vehicleModel.innerHTML = `<option value="">${placeholderText}</option>`;
        vehicleModel.disabled = true;
    }

    function renderVehicleModelOptions(models) {
        if (!models.length) {
            resetVehicleModelSelect('No models found for selected make');
            return;
        }

        const uniqueModels = [...new Set(models.filter(Boolean))];
        uniqueModels.sort((a, b) => a.localeCompare(b));

        const options = ['<option value="">Select model</option>'];
        uniqueModels.forEach(modelName => {
            options.push(`<option value="${modelName}">${modelName}</option>`);
        });

        vehicleModel.innerHTML = options.join('');
        vehicleModel.disabled = false;
    }

    function initializeVehicleSelectionOptions() {
        renderVehicleMakeOptions();
        resetVehicleModelSelect();
        renderVehicleYearOptions();
        renderVehicleColorOptions();
    }

    function handleVehicleMakeChange() {
        const selectedMake = vehicleMake.value;

        if (!selectedMake) {
            resetVehicleModelSelect();
            return;
        }

        const models = vehicleMakeModelOptions[selectedMake] || [];
        renderVehicleModelOptions(models);
    }

    function renderVehicleYearOptions() {
        const currentYear = new Date().getFullYear();
        const startYear = 1990;
        const years = [];

        for (let year = currentYear; year >= startYear; year--) {
            years.push(year);
        }

        const options = ['<option value="">Select year</option>'];
        years.forEach(year => {
            options.push(`<option value="${year}">${year}</option>`);
        });

        vehicleYear.innerHTML = options.join('');
    }

    function renderVehicleColorOptions() {
        const options = ['<option value="">Select color</option>'];
        VEHICLE_COLORS.forEach(color => {
            options.push(`<option value="${color}">${color}</option>`);
        });

        vehicleColor.innerHTML = options.join('');
    }

    // ========== INITIAL RENDER ==========
    loadVehicleMakeModelOptions();
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

    document.getElementById('closeEditVehicleModalBtn').addEventListener('click', ()=> closeModal(editVehicleModal));
    document.getElementById('cancelEditVehicleModalBtn').addEventListener('click', ()=> closeModal(editVehicleModal));
    document.getElementById('saveEditVehicleBtn').addEventListener('click', saveEditVehicle);

    document.getElementById('closeServiceModalBtn').addEventListener('click', ()=> closeModal(addServiceModal));
    document.getElementById('cancelServiceModalBtn').addEventListener('click', ()=> closeModal(addServiceModal));
    document.getElementById('saveServiceBtn').addEventListener('click', saveNewService);

    document.getElementById('closeServiceDetailsBtn').addEventListener('click', ()=> closeModal(serviceDetailsModal));

    closeDetailsBtn.addEventListener('click', closeDetailsView);
    closeVehicleDetailsBtn.addEventListener('click', closeVehicleDetailsView);
    inp.addEventListener('input', handleSearch);
    pageSizeSelect.addEventListener('change', (e) => { 
        pageSize = +e.target.value; 
        currentPage = 1; 
        paginateAndRender(); 
    });
    prevBtn.addEventListener('click', ()=>{ if(currentPage > 1){ currentPage--; paginateAndRender(); } });
    nextBtn.addEventListener('click', ()=>{ if(currentPage < totalPages){ currentPage++; paginateAndRender(); } });

    vehicleMake.addEventListener('change', handleVehicleMakeChange);

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
    // Get customer's vehicles from shared storage
    const customerVehicles = getCustomerVehicles(cust.id);
        

        let vehiclesHtml = '';
        if (customerVehicles && customerVehicles.length) {
            customerVehicles.forEach((v, idx) => {
                let vdropdown = `vehDrop_${v.vehicleId}`;
                vehiclesHtml += `<tr>
                    <td>${v.vehicleId}</td><td>${v.make}</td><td>${v.model}</td><td>${v.year}</td><td>${v.type||''}</td><td>${v.color}</td><td>${v.plateNumber}</td><td>${v.vin||'N/A'}</td>
                    <td><span class="service-count-badge">${v.completedServices || 0} serv.</span></td>
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

    function closeVehicleDetailsView() { 
        document.querySelector('.container').style.display = 'block'; 
        vehicleDetailsScreen.style.display = 'none'; 
    }

    function positionDropdownMenu(menuEl, triggerBtn) {
        if (!menuEl || !triggerBtn) return;

        const triggerRect = triggerBtn.getBoundingClientRect();
        menuEl.classList.add('dropdown-floating');
        menuEl.style.position = 'fixed';
        menuEl.style.visibility = 'hidden';
        menuEl.style.display = 'block';

        const menuWidth = menuEl.offsetWidth || 200;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const horizontalPadding = 8;

        let left = triggerRect.right - menuWidth;
        if (left < horizontalPadding) left = horizontalPadding;
        if (left + menuWidth > viewportWidth - horizontalPadding) {
            left = Math.max(horizontalPadding, viewportWidth - menuWidth - horizontalPadding);
        }

        menuEl.style.left = `${left}px`;
        menuEl.style.top = `${triggerRect.bottom + 6}px`;
        menuEl.style.right = 'auto';
        menuEl.style.zIndex = '2147483647';
        menuEl.style.visibility = 'visible';
    }

    // ========== DROPDOWN ==========
    window.toggleDropdown = function(id) {
        const dd = document.getElementById(id); 
        if(!dd) return;
        const isAlreadyOpen = dd.classList.contains('show');

        window.closeAllDropdowns();
        if (isAlreadyOpen) return;

        const container = dd.closest('.action-dropdown-container');
        const triggerBtn = container?.querySelector('.btn-action-dropdown') || null;

        dd.classList.add('show');
        container?.classList.add('dropdown-open');

        activeDropdown = id;
        activeDropdownTrigger = triggerBtn;

        positionDropdownMenu(dd, triggerBtn);
    };

    window.closeAllDropdowns = function() {
        document.querySelectorAll('.action-dropdown-menu.show').forEach(d => {
            d.classList.remove('show');
            d.classList.remove('dropdown-floating');
            d.style.position = '';
            d.style.top = '';
            d.style.left = '';
            d.style.right = '';
            d.style.zIndex = '';
            d.style.visibility = '';
            d.style.display = '';
        });
        document.querySelectorAll('.action-dropdown-container.dropdown-open').forEach(c => c.classList.remove('dropdown-open'));
        activeDropdown = null;
        activeDropdownTrigger = null;
    };

    document.addEventListener('click', (e) => { 
        if(!e.target.closest('.action-dropdown-container') && !e.target.closest('.action-dropdown-menu')) window.closeAllDropdowns(); 
    });

    window.addEventListener('scroll', window.closeAllDropdowns, true);
    window.addEventListener('resize', window.closeAllDropdowns);

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
        document.getElementById('addVehicleForm').reset();
        initializeVehicleSelectionOptions();
        openModal(addVehicleModal);
    };

    function saveNewVehicle() {
        let custId = document.getElementById('vehicleCustomerId').value;
        let cust = customers.find(c => c.id === custId);
        if(!cust) return;
        
        // Get current vehicles to generate next ID
        let allVehicles = loadVehiclesFromLocalStorage();
        const customerVehicles = allVehicles.filter(v => v.customerId === custId);
        
        let newVeh = {
            vehicleId: `VEH-${custId.split('-')[1] || '0000'}-${customerVehicles.length + 1}`,
            ownedBy: cust.name,
            customerId: cust.id,
            make: document.getElementById('vehicleMake').value,
            model: document.getElementById('vehicleModel').value,
            year: document.getElementById('vehicleYear').value,
            color: document.getElementById('vehicleColor').value,
            plateNumber: document.getElementById('vehiclePlate').value,
            type: document.getElementById('vehicleType').value || '',
            vin: document.getElementById('vehicleVin').value || '',
            completedServices: 0,
            services: [],
            customerDetails: {
                customerId: cust.id,
                name: cust.name,
                email: cust.email || '',
                mobile: cust.mobile || '',
                address: cust.address || '',
                leadSource: cust.leadSource || '',
                leadDetails: cust.leadDetails || null,
                registeredVehiclesCount: customerVehicles.length + 1,
                registeredVehicles: `${customerVehicles.length + 1} vehicles`,
                completedServicesCount: cust.completedServicesCount || 0,
                customerSince: cust.customerSince || ''
            }
        };
        
        allVehicles.unshift(newVeh);
        saveVehiclesToLocalStorage(allVehicles);
        
        // Reload customer data to update counts
        loadCustomersFromLocalStorage();
        currentSearchResults = [...customers];
        
        closeModal(addVehicleModal);
        if(currentDetailsCustomer && currentDetailsCustomer.id === custId) openDetailsView(custId);
        paginateAndRender();
        showAlert('Success', 'Vehicle added', 'success');
    }

    window.deleteVehicle = (vehId) => {
        let allVehicles = loadVehiclesFromLocalStorage();
        const vehIdx = allVehicles.findIndex(v => v.vehicleId === vehId);
        
        if(vehIdx === -1) {
            showAlert('Not Found', 'Vehicle not found', 'error');
            return;
        
            const vehicle = allVehicles[vehIdx];
            const customerId = vehicle.customerId;
        
            allVehicles.splice(vehIdx, 1);
            saveVehiclesToLocalStorage(allVehicles);
        
            // Reload customer data to update counts
            loadCustomersFromLocalStorage();
            currentSearchResults = [...customers];
        }
        
        if(currentDetailsCustomer && currentDetailsCustomer.id === customerId) openDetailsView(customerId);
        paginateAndRender();
        showAlert('Vehicle deleted', '', 'info');
    };

    // ========== VIEW VEHICLE DETAILS ==========
    function getWorkStatusClass(status) {
        switch(status) {
            case 'Completed': return 'status-completed';
            case 'Inprogress': return 'status-inprogress';
            case 'Quality Check': return 'status-pending';
            case 'Ready': return 'status-completed';
            case 'New Request': return 'status-pending';
            default: return 'status-pending';
        }
    }

    window.viewVehicle = function(vehicleId) {
        // Get vehicle from shared storage
        const allVehicles = loadVehiclesFromLocalStorage();
        const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);
        const ownerCustomer = vehicle ? customers.find(c => c.id === vehicle.customerId) : null;

        if (!vehicle) {
            showAlert('Not Found', `Vehicle ${vehicleId} not found`, 'error');
            return;
        }

        detailsVehicleIdSpan.innerText = vehicleId;

        const normalizeTextValue = (value, fallback = '—') => {
            const text = String(value ?? '').trim();
            if (!text || text.toUpperCase() === 'N/A') return fallback;
            return text;
        };

        const resolvedCustomerId = normalizeTextValue(ownerCustomer?.id);
        const resolvedName = normalizeTextValue(ownerCustomer?.name);
        const resolvedMobile = normalizeTextValue(ownerCustomer?.mobile);
        const resolvedEmail = normalizeTextValue(ownerCustomer?.email);
        const resolvedAddress = normalizeTextValue(ownerCustomer?.address);
        const resolvedSince = normalizeTextValue(ownerCustomer?.customerSince);

        const registeredVehiclesCount = ownerCustomer?.registeredVehiclesCount || 0;
        const completedServicesCount = ownerCustomer?.completedServicesCount || 0;

        const leadSource = ownerCustomer?.leadSource || '';
        const leadDetails = ownerCustomer?.leadDetails || null;

        let leadInfo = '—';
        if(leadSource === 'refer' && leadDetails) leadInfo = `Refer by: ${leadDetails.referrerName || ''} (${leadDetails.referrerMobile || ''})`;
        else if(leadSource === 'social' && leadDetails) leadInfo = `Social: ${leadDetails.platform || ''}`;
        else if(leadSource === 'other' && leadDetails) leadInfo = `Other: ${leadDetails.otherText || ''}`;
        else if(leadSource === 'walk-in') leadInfo = 'Walk-in';

        const vehicleCompletedServicesCount = vehicle.completedServices || 0;

        let servicesHtml = '';
        if (vehicle.services && vehicle.services.length) {
            vehicle.services.forEach((s, idx) => {
                servicesHtml += `<tr>
                    <td class="date-column">${s.createDate || new Date().toLocaleDateString()}</td>
                    <td>${s.jobCardId || 'JO-' + Date.now().toString().slice(-6)}</td>
                    <td><span class="order-type-badge ${s.orderType === 'New Job Order' ? 'order-type-new-job' : 'order-type-service'}">${s.orderType || 'Service Order'}</span></td>
                    <td><span class="status-badge ${getWorkStatusClass(s.workStatus)}">${s.workStatus || 'Completed'}</span></td>
                    <td><span class="status-badge ${s.paymentStatus === 'Fully Paid' ? 'payment-full' : s.paymentStatus === 'Partially Paid' ? 'payment-partial' : 'payment-unpaid'}">${s.paymentStatus || 'Fully Paid'}</span></td>
                    <td>QAR ${s.totalCost || '0.00'}</td>
                    <td>
                        <button class="btn-action-dropdown" style="min-width: 80px;" onclick="window.viewServiceDetails('${s.jobCardId || ''}', '${vehicleId}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>`;
            });
        } else {
            servicesHtml = '<tr><td colspan="7" style="padding:30px;text-align:center;">No service records found</td></tr>';
        }

        vehicleDetailsGrid.innerHTML = `
            <div class="detail-card">
                <div class="detail-card-header">
                    <h3><i class="fas fa-user"></i> Customer Info</h3>
                </div>
                <div class="card-content">
                    <div class="info-item"><span class="info-label">ID</span><span class="info-value">${resolvedCustomerId}</span></div>
                    <div class="info-item"><span class="info-label">Name</span><span class="info-value">${resolvedName}</span></div>
                    <div class="info-item"><span class="info-label">Mobile</span><span class="info-value">${resolvedMobile}</span></div>
                    <div class="info-item"><span class="info-label">Email</span><span class="info-value">${resolvedEmail}</span></div>
                    <div class="info-item"><span class="info-label">Address</span><span class="info-value">${resolvedAddress}</span></div>
                    <div class="info-item"><span class="info-label">Since</span><span class="info-value">${resolvedSince}</span></div>
                    <div class="info-item"><span class="info-label">Lead source</span><span class="info-value">${leadInfo}</span></div>
                    <div class="info-item"><span class="info-label">Vehicles</span><span class="info-value"><span class="count-badge">${registeredVehiclesCount} vehicles</span></span></div>
                    <div class="info-item"><span class="info-label">Services</span><span class="info-value"><span class="service-count-badge">${completedServicesCount} services</span></span></div>
                </div>
            </div>
            <div class="detail-card">
                <div class="detail-card-header">
                    <h3><i class="fas fa-car"></i> Vehicle Information</h3>
                    <div class="card-header-actions">
                        <button class="btn-edit-header" onclick="window.openEditVehicleModal('${vehicleId}')"><i class="fas fa-edit"></i> Edit</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="info-item"><span class="info-label">Vehicle ID</span><span class="info-value">${vehicleId}</span></div>
                    <div class="info-item"><span class="info-label">Make</span><span class="info-value">${vehicle.make}</span></div>
                    <div class="info-item"><span class="info-label">Model</span><span class="info-value">${vehicle.model}</span></div>
                    <div class="info-item"><span class="info-label">Year</span><span class="info-value">${vehicle.year}</span></div>
                    <div class="info-item"><span class="info-label">Color</span><span class="info-value">${vehicle.color}</span></div>
                    <div class="info-item"><span class="info-label">Plate Number</span><span class="info-value">${vehicle.plateNumber}</span></div>
                    <div class="info-item"><span class="info-label">Completed Services</span><span class="info-value"><span class="service-count-badge">${vehicleCompletedServicesCount} services</span></span></div>
                    <div class="info-item"><span class="info-label">Type</span><span class="info-value">${vehicle.vehicleType || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">VIN</span><span class="info-value">${vehicle.vin || 'N/A'}</span></div>
                </div>
            </div>
            <div class="detail-card">
                <div class="detail-card-header">
                    <h3><i class="fas fa-tasks"></i> Service History</h3>
                    <div class="card-header-actions">
                        <button class="btn-add-header" onclick="window.openAddServiceModal('${vehicleId}')"><i class="fas fa-plus"></i> Add Service</button>
                    </div>
                </div>
                <div style="padding:20px;">
                    <table class="services-table">
                        <thead>
                            <tr><th>Date</th><th>Job ID</th><th>Order Type</th><th>Status</th><th>Payment</th><th>Cost</th><th>Actions</th></tr>
                        </thead>
                        <tbody>${servicesHtml}</tbody>
                    </table>
                </div>
            </div>
        `;

        document.querySelector('.container').style.display = 'none';
        vehicleDetailsScreen.style.display = 'flex';
    };

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

    // ========== EDIT VEHICLE FUNCTIONS ==========
    function renderEditVehicleColorOptions(currentColor = '') {
        const options = ['<option value="">Select color</option>'];
        VEHICLE_COLORS.forEach(color => {
            const selected = color === currentColor ? ' selected' : '';
            options.push(`<option value="${color}"${selected}>${color}</option>`);
        });
        editVehicleColor.innerHTML = options.join('');
    }

    window.openEditVehicleModal = function(vehicleId) {
        // Get vehicle from shared storage
        const allVehicles = loadVehiclesFromLocalStorage();
        const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);

        if (!vehicle) {
            showAlert('Not Found', `Vehicle ${vehicleId} not found`, 'error');
            return;
        }

        editVehicleId.value = vehicle.vehicleId;
        renderEditVehicleColorOptions(vehicle.color);
        editVehiclePlate.value = vehicle.plateNumber;
        
        openModal(editVehicleModal);
    };

    function saveEditVehicle() {
        const vehicleId = editVehicleId.value;
        
        // Get vehicle from shared storage
        let allVehicles = loadVehiclesFromLocalStorage();
        const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);

        if (!vehicle) return;

        // Update vehicle details
        vehicle.color = editVehicleColor.value.trim();
        vehicle.plateNumber = editVehiclePlate.value.trim();

        // Save to shared storage
        saveVehiclesToLocalStorage(allVehicles);
        
        closeModal(editVehicleModal);
        
            // Reload customer data to update any counts
            loadCustomersFromLocalStorage();
        currentSearchResults = [...customers];
        
        // Refresh vehicle details view if open
        if (vehicleDetailsScreen.style.display === 'flex') {
            window.viewVehicle(vehicleId);
            paginateAndRender();
        }
        
        showAlert('Success', 'Vehicle updated successfully', 'success');
    }

    // ========== SERVICE FUNCTIONS ==========
    window.openAddServiceModal = function(vehicleId) {
        serviceVehicleId.value = vehicleId;
        // Set default values
        serviceOrderType.value = 'Service Order';
        serviceWorkStatus.value = 'New Request';
        servicePaymentStatus.value = 'Unpaid';
        serviceCost.value = '';
        openModal(addServiceModal);
    };

    function saveNewService() {
        const vehicleId = serviceVehicleId.value;
        
        // Get vehicle from shared storage
        let allVehicles = loadVehiclesFromLocalStorage();
        const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);

        if (!vehicle) return;

        if (!serviceCost.value) {
            showAlert('Error', 'Please enter the service cost', 'error');
            return;
        }

        const newService = {
            createDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + 
                        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            jobCardId: 'JO-' + Date.now().toString().slice(-6),
            orderType: serviceOrderType.value,
            workStatus: serviceWorkStatus.value,
            paymentStatus: servicePaymentStatus.value,
            totalCost: parseFloat(serviceCost.value).toFixed(2)
        };

        if (!vehicle.services) vehicle.services = [];
        vehicle.services.push(newService);
        vehicle.completedServices = vehicle.services.length;

        // Save to shared storage
        saveVehiclesToLocalStorage(allVehicles);
        
        closeModal(addServiceModal);
        
            // Reload customer data to update counts
            loadCustomersFromLocalStorage();
            currentSearchResults = [...customers];
        
        // Refresh vehicle details view if open
        if (vehicleDetailsScreen.style.display === 'flex') {
            window.viewVehicle(vehicleId);
        }
        
        paginateAndRender();
        showAlert('Success', 'Service record added', 'success');
    }

    window.viewServiceDetails = (jobCardId, vehicleId) => {
        // Get vehicle and service from shared storage
        const allVehicles = loadVehiclesFromLocalStorage();
        const vehicle = allVehicles.find(v => v.vehicleId === vehicleId);
        const service = vehicle?.services?.find(s => s.jobCardId === jobCardId);

        if (!vehicle || !service) return;

        serviceDetailsContent.innerHTML = `
            <div class="service-detail-item">
                <span class="service-detail-label">Job Card ID:</span>
                <span class="service-detail-value">${service.jobCardId}</span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Date:</span>
                <span class="service-detail-value">${service.createDate}</span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Order Type:</span>
                <span class="service-detail-value"><span class="order-type-badge ${service.orderType === 'New Job Order' ? 'order-type-new-job' : 'order-type-service'}">${service.orderType}</span></span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Work Status:</span>
                <span class="service-detail-value"><span class="status-badge ${getWorkStatusClass(service.workStatus)}">${service.workStatus}</span></span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Payment Status:</span>
                <span class="service-detail-value"><span class="status-badge ${service.paymentStatus === 'Fully Paid' ? 'payment-full' : service.paymentStatus === 'Partially Paid' ? 'payment-partial' : 'payment-unpaid'}">${service.paymentStatus}</span></span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Total Cost:</span>
                <span class="service-detail-value"><strong>QAR ${service.totalCost}</strong></span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Vehicle:</span>
                <span class="service-detail-value">${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})</span>
            </div>
        `;

        openModal(serviceDetailsModal);
    };

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
    window.openEditVehicleModal = window.openEditVehicleModal;
    window.openAddServiceModal = window.openAddServiceModal;
    window.viewServiceDetails = window.viewServiceDetails;
})();