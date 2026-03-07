(function() {
    // ========== STATE ==========
    let vehicles = [];                     // will be loaded from localStorage
    let customers = [];                     // will be loaded from customers localStorage
    let currentSearchQuery = '';
    let currentSearchResults = [];
    let currentPage = 1;
    let pageSize = 20;
    let totalPages = 1;
    let currentDetailsVehicle = null;
    let activeDropdown = null;
    let verifiedCustomer = null;            // for add vehicle verification
    let editVerifiedCustomer = null;         // for edit vehicle verification

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
    const statsBarTotal = document.getElementById('totalVehicles');
    const statsBarServices = document.getElementById('totalServicesStat');
    const statsBarOwners = document.getElementById('uniqueOwners');

    // details
    const detailsScreen = document.getElementById('detailsScreen');
    const detailsVehicleIdSpan = document.getElementById('detailsVehicleId');
    const detailsGrid = document.getElementById('detailsGrid');
    const closeDetailsBtn = document.getElementById('closeDetailsScreen');

    // modals
    const addVehicleModal = document.getElementById('addVehicleModal');
    const editVehicleModal = document.getElementById('editVehicleModal');
    const addServiceModal = document.getElementById('addServiceModal');
    const serviceDetailsModal = document.getElementById('serviceDetailsModal');
    const alertPopup = document.getElementById('alertPopup');

    // Add Vehicle elements
    const newCustomerId = document.getElementById('newCustomerId');
    const verifyCustomerBtn = document.getElementById('verifyCustomerBtn');
    const customerVerifiedInfo = document.getElementById('customerVerifiedInfo');
    const verifiedCustomerName = document.getElementById('verifiedCustomerName');
    const vehicleMake = document.getElementById('vehicleMake');
    const vehicleModel = document.getElementById('vehicleModel');
    const vehicleYear = document.getElementById('vehicleYear');
    const vehicleColor = document.getElementById('vehicleColor');
    const vehiclePlate = document.getElementById('vehiclePlate');
    const vehicleType = document.getElementById('vehicleType');
    const vehicleVin = document.getElementById('vehicleVin');
    const saveVehicleBtn = document.getElementById('saveVehicleBtn');

    // Edit Vehicle elements
    const editVehicleId = document.getElementById('editVehicleId');
    const editCustomerId = document.getElementById('editCustomerId');
    const editVerifyCustomerBtn = document.getElementById('editVerifyCustomerBtn');
    const editCustomerVerifiedInfo = document.getElementById('editCustomerVerifiedInfo');
    const editVerifiedCustomerName = document.getElementById('editVerifiedCustomerName');
    const editVehicleColor = document.getElementById('editVehicleColor');
    const editVehiclePlate = document.getElementById('editVehiclePlate');
    const saveEditBtn = document.getElementById('saveEditBtn');

    // Service elements
    const serviceVehicleId = document.getElementById('serviceVehicleId');
    const serviceOrderType = document.getElementById('serviceOrderType');
    const serviceWorkStatus = document.getElementById('serviceWorkStatus');
    const servicePaymentStatus = document.getElementById('servicePaymentStatus');
    const serviceCost = document.getElementById('serviceCost');
    const saveServiceBtn = document.getElementById('saveServiceBtn');
    const serviceDetailsContent = document.getElementById('serviceDetailsContent');

    // ========== LOCALSTORAGE PERSISTENCE ==========
    const VEHICLES_STORAGE_KEY = 'vehicles';
    const CUSTOMERS_STORAGE_KEY = 'customers';
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

    function normalizeCustomerVehicleToGlobal(customer, customerVehicle) {
        const fallbackVehicleId = `VEH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const vehicleId = String(customerVehicle?.vehicleId || '').trim() || fallbackVehicleId;
        const registeredVehiclesCount = Number(
            customer?.registeredVehiclesCount || (Array.isArray(customer?.vehicles) ? customer.vehicles.length : 0)
        );
        const completedServicesCount = Number(customer?.completedServicesCount || 0);

        return {
            vehicleId,
            ownedBy: customer?.name || 'Unknown',
            customerId: customer?.id || '',
            make: customerVehicle?.make || '',
            model: customerVehicle?.model || '',
            year: customerVehicle?.year || '',
            color: customerVehicle?.color || '',
            plateNumber: customerVehicle?.plateNumber || '',
            type: customerVehicle?.type || customerVehicle?.vehicleType || '',
            vin: customerVehicle?.vin || '',
            completedServices: Number(customerVehicle?.completedServices || 0),
            services: Array.isArray(customerVehicle?.services) ? customerVehicle.services : [],
            customerDetails: {
                customerId: customer?.id || '',
                name: customer?.name || '',
                email: customer?.email || '',
                mobile: customer?.mobile || '',
                address: customer?.address || '',
                leadSource: customer?.leadSource || '',
                leadDetails: customer?.leadDetails || null,
                registeredVehiclesCount,
                registeredVehicles: `${registeredVehiclesCount} vehicles`,
                completedServicesCount,
                customerSince: customer?.customerSince || ''
            }
        };
    }

    function loadDataFromLocalStorage() {
        loadVehicleMakeModelOptions();

        // Load vehicles
        const storedVehicles = localStorage.getItem(VEHICLES_STORAGE_KEY);
        if (storedVehicles) {
            try {
                vehicles = JSON.parse(storedVehicles);
            } catch (e) {
                vehicles = [];
            }
        } else {
            vehicles = []; // start empty – no demo data
        }

        if (!Array.isArray(vehicles)) {
            vehicles = [];
        }

        // Load customers for verification
        const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
        if (storedCustomers) {
            try {
                customers = JSON.parse(storedCustomers);
            } catch (e) {
                customers = [];
            }
        } else {
            customers = [];
        }

        if (!Array.isArray(customers)) {
            customers = [];
        }

        // Ensure each vehicle has required arrays
        vehicles.forEach(v => {
            if (!v || typeof v !== 'object') return;
            if (!v.services) v.services = [];
            if (!v.customerDetails) {
                // Try to find customer from customers list
                const customer = customers.find(c => c.id === v.customerId) || customers.find(c => c.vehicles?.some(cv => cv.vehicleId === v.vehicleId));
                if (customer) {
                    if (!v.customerId) v.customerId = customer.id;
                    if (!v.ownedBy) v.ownedBy = customer.name;
                    const registeredVehiclesCount = Number(
                        customer.registeredVehiclesCount || (Array.isArray(customer.vehicles) ? customer.vehicles.length : 0)
                    );
                    v.customerDetails = {
                        customerId: customer.id,
                        name: customer.name,
                        email: customer.email || '',
                        mobile: customer.mobile || '',
                        address: customer.address || '',
                        leadSource: customer.leadSource || '',
                        leadDetails: customer.leadDetails || null,
                        registeredVehiclesCount,
                        registeredVehicles: `${registeredVehiclesCount} vehicles`,
                        completedServicesCount: Number(customer.completedServicesCount || 0),
                        customerSince: customer.customerSince || ''
                    };
                }
            }
        });

        currentSearchResults = [...vehicles];
    }

    function saveVehiclesToLocalStorage() {
        localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    }

    // ========== INITIAL RENDER ==========
    loadDataFromLocalStorage();
    paginateAndRender();

    // ========== EVENT LISTENERS ==========
    document.getElementById('newVehicleButton').addEventListener('click', () => { 
        openModal(addVehicleModal); 
        resetAddVehicleForm();
    });
    
    document.getElementById('closeModalBtn').addEventListener('click', () => closeModal(addVehicleModal));
    document.getElementById('cancelModalBtn').addEventListener('click', () => closeModal(addVehicleModal));
    
    document.getElementById('closeEditModalBtn').addEventListener('click', () => closeModal(editVehicleModal));
    document.getElementById('cancelEditModalBtn').addEventListener('click', () => closeModal(editVehicleModal));
    
    document.getElementById('closeServiceModalBtn').addEventListener('click', () => closeModal(addServiceModal));
    document.getElementById('cancelServiceModalBtn').addEventListener('click', () => closeModal(addServiceModal));
    
    document.getElementById('closeServiceDetailsBtn').addEventListener('click', () => closeModal(serviceDetailsModal));

    closeDetailsBtn.addEventListener('click', closeDetailsView);
    inp.addEventListener('input', handleSearch);
    pageSizeSelect.addEventListener('change', (e) => { 
        pageSize = +e.target.value; 
        currentPage = 1; 
        paginateAndRender(); 
    });
    prevBtn.addEventListener('click', ()=>{ if(currentPage > 1){ currentPage--; paginateAndRender(); } });
    nextBtn.addEventListener('click', ()=>{ if(currentPage < totalPages){ currentPage++; paginateAndRender(); } });

    // Customer verification
    verifyCustomerBtn.addEventListener('click', verifyCustomer);
    editVerifyCustomerBtn.addEventListener('click', verifyEditCustomer);
    vehicleMake.addEventListener('change', handleVehicleMakeChange);

    // Save handlers
    saveVehicleBtn.addEventListener('click', saveNewVehicle);
    saveEditBtn.addEventListener('click', saveEditVehicle);
    saveServiceBtn.addEventListener('click', saveNewService);

    // Close alert popup when clicking outside
    alertPopup.addEventListener('click', (e) => { 
        if(e.target === alertPopup) alertPopup.style.display = 'none'; 
    });

    initializeVehicleSelectionOptions();

    // ========== HELPER FUNCTIONS ==========
    function openModal(modal) { 
        modal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; 
    }
    
    function closeModal(modal) { 
        modal.style.display = 'none'; 
        document.body.style.overflow = 'auto';
        if (modal === addVehicleModal) resetAddVehicleForm();
        if (modal === editVehicleModal) resetEditVehicleForm();
    }

    function resetAddVehicleForm() {
        document.getElementById('addVehicleForm').reset();
        customerVerifiedInfo.classList.remove('visible');
        verifiedCustomer = null;
        initializeVehicleSelectionOptions();
    }

    function resetEditVehicleForm() {
        document.getElementById('editVehicleForm').reset();
        editCustomerVerifiedInfo.classList.remove('visible');
        editVerifiedCustomer = null;
    }

    function verifyCustomer() {
        const customerId = newCustomerId.value.trim();
        if (!customerId) {
            showAlert('Error', 'Please enter a Customer ID', 'error');
            return;
        }

        // Find customer in customers array
        const customer = customers.find(c => c.id === customerId);
        
        if (customer) {
            verifiedCustomer = customer;
            verifiedCustomerName.textContent = customer.name;
            customerVerifiedInfo.classList.add('visible');
            showAlert('Success', `Customer verified: ${customer.name}`, 'success');
        } else {
            verifiedCustomer = null;
            customerVerifiedInfo.classList.remove('visible');
            showAlert('Error', 'Customer not found. Customer must be pre-registered in the system.', 'error');
        }
    }

    function verifyEditCustomer() {
        const customerId = editCustomerId.value.trim();
        if (!customerId) {
            showAlert('Error', 'Please enter a Customer ID', 'error');
            return;
        }

        // Find customer in customers array
        const customer = customers.find(c => c.id === customerId);
        
        if (customer) {
            editVerifiedCustomer = customer;
            editVerifiedCustomerName.textContent = customer.name;
            editCustomerVerifiedInfo.classList.add('visible');
            showAlert('Success', `Customer verified: ${customer.name}`, 'success');
        } else {
            editVerifiedCustomer = null;
            editCustomerVerifiedInfo.classList.remove('visible');
            showAlert('Error', 'Customer not found. Customer must be pre-registered in the system.', 'error');
        }
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

    function renderEditVehicleColorOptions(currentColor = '') {
        const options = ['<option value="">Select color</option>'];
        VEHICLE_COLORS.forEach(color => {
            const selected = color === currentColor ? ' selected' : '';
            options.push(`<option value="${color}"${selected}>${color}</option>`);
        });

        editVehicleColor.innerHTML = options.join('');
    }

    // ========== SEARCH ==========
    function handleSearch(e) {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        if (!currentSearchQuery) {
            currentSearchResults = [...vehicles];
        } else {
            currentSearchResults = vehicles.filter(v => 
                v.vehicleId.toLowerCase().includes(currentSearchQuery) ||
                v.ownedBy.toLowerCase().includes(currentSearchQuery) ||
                v.make.toLowerCase().includes(currentSearchQuery) ||
                v.model.toLowerCase().includes(currentSearchQuery) ||
                v.year.toString().includes(currentSearchQuery) ||
                v.color.toLowerCase().includes(currentSearchQuery) ||
                v.plateNumber.toLowerCase().includes(currentSearchQuery) ||
                (v.customerId && v.customerId.toLowerCase().includes(currentSearchQuery))
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
    }

    function calculateTotals() {
        let totalServices = 0;
        const ownerSet = new Set();
        
        currentSearchResults.forEach(v => { 
            totalServices += v.completedServices || 0;
            if (v.ownedBy) ownerSet.add(v.ownedBy);
        });
        
        statsBarTotal.innerText = currentSearchResults.length;
        statsBarServices.innerText = totalServices;
        statsBarOwners.innerText = ownerSet.size;
    }

    function renderTable() {
        const start = (currentPage - 1) * pageSize;
        const pageData = currentSearchResults.slice(start, start + pageSize);
        
        if (!pageData.length) { 
            emptyState.style.display = 'block'; 
            document.querySelector('.table-wrapper').style.display = 'none'; 
            searchStats.innerText = 'No vehicles found'; 
            return; 
        }
        
        emptyState.style.display = 'none'; 
        document.querySelector('.table-wrapper').style.display = 'block';
        
        let html = '';
        pageData.forEach((v, idx) => {
            const dropdownId = `drop_${v.vehicleId}_${idx}`;
            html += `<tr>
                <td>${highlight(v.vehicleId)}</td>
                <td>${highlight(v.ownedBy)}</td>
                <td>${highlight(v.make)}</td>
                <td>${highlight(v.model)}</td>
                <td>${highlight(v.year)}</td>
                <td>${highlight(v.color)}</td>
                <td>${highlight(v.plateNumber)}</td>
                <td><span class="service-count-badge">${v.completedServices || 0} services</span></td>
                <td>
                    <div class="action-dropdown-container">
                        <button class="btn-action-dropdown" onclick="window.toggleDropdown('${dropdownId}')"><i class="fas fa-cogs"></i> Actions <i class="fas fa-chevron-down"></i></button>
                        <div class="action-dropdown-menu" id="${dropdownId}">
                            <button class="dropdown-item view" onclick="window.openDetailsView('${v.vehicleId}'); window.closeAllDropdowns()"><i class="fas fa-eye"></i> View Details</button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item edit" onclick="window.openEditVehicleModal('${v.vehicleId}'); window.closeAllDropdowns()"><i class="fas fa-edit"></i> Edit</button>
                            <button class="dropdown-item delete" onclick="window.deleteVehicle('${v.vehicleId}'); window.closeAllDropdowns()"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
        searchStats.innerText = `Showing ${start + 1}–${Math.min(start + pageSize, currentSearchResults.length)} of ${currentSearchResults.length} vehicles`;
    }

    function highlight(txt) { 
        if(!currentSearchQuery) return txt; 
        const re = new RegExp(`(${currentSearchQuery})`, 'gi'); 
        return txt.toString().replace(re, '<span class="search-highlight">$1</span>'); 
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

    // ========== DETAILS VIEW ==========
    window.openDetailsView = function(id) {
        const vehicle = vehicles.find(v => v.vehicleId === id); 
        if(!vehicle) return;
        currentDetailsVehicle = vehicle;
        detailsVehicleIdSpan.innerText = vehicle.vehicleId;

        const linkedCustomer = customers.find(c => c.id === vehicle.customerId) ||
            customers.find(c => c.vehicles?.some(cv => cv.vehicleId === vehicle.vehicleId));
        const snapshotCustomer = vehicle.customerDetails || {};

        const normalizeTextValue = (value, fallback = '—') => {
            const text = String(value ?? '').trim();
            if (!text || text.toUpperCase() === 'N/A') return fallback;
            return text;
        };

        const resolvedCustomerId = normalizeTextValue(
            linkedCustomer?.id || snapshotCustomer.customerId || vehicle.customerId
        );
        const resolvedName = normalizeTextValue(
            linkedCustomer?.name || snapshotCustomer.name || vehicle.ownedBy
        );
        const resolvedMobile = normalizeTextValue(
            linkedCustomer?.mobile || snapshotCustomer.mobile
        );
        const resolvedEmail = normalizeTextValue(
            linkedCustomer?.email || snapshotCustomer.email
        );
        const resolvedAddress = normalizeTextValue(
            linkedCustomer?.address || snapshotCustomer.address
        );
        const resolvedSince = normalizeTextValue(
            linkedCustomer?.customerSince || snapshotCustomer.customerSince
        );

        const parsedSnapshotVehicleCount = Number.parseInt(
            String(snapshotCustomer.registeredVehicles || '').replace(/[^\d]/g, ''),
            10
        );

        const customerVehicles = resolvedCustomerId && resolvedCustomerId !== '—'
            ? vehicles.filter(v =>
                (v.customerId && v.customerId === resolvedCustomerId) ||
                (v.customerDetails?.customerId && v.customerDetails.customerId === resolvedCustomerId)
            )
            : [];

        const linkedRegisteredVehiclesCount = Number(
            linkedCustomer?.registeredVehiclesCount || (Array.isArray(linkedCustomer?.vehicles) ? linkedCustomer.vehicles.length : 0)
        );
        const snapshotRegisteredVehiclesCount = Number(snapshotCustomer.registeredVehiclesCount || 0);
        const registeredVehiclesCount = Math.max(
            Number.isFinite(linkedRegisteredVehiclesCount) ? linkedRegisteredVehiclesCount : 0,
            customerVehicles.length,
            Number.isFinite(snapshotRegisteredVehiclesCount) ? snapshotRegisteredVehiclesCount : 0,
            Number.isFinite(parsedSnapshotVehicleCount) ? parsedSnapshotVehicleCount : 0
        );

        const derivedCompletedServicesCount = customerVehicles.reduce((total, customerVehicle) => {
            if (Array.isArray(customerVehicle.services)) {
                return total + customerVehicle.services.length;
            }
            return total + Number(customerVehicle.completedServices || 0);
        }, 0);

        const completedServicesCount = Math.max(
            Number(linkedCustomer?.completedServicesCount || 0),
            Number(snapshotCustomer.completedServicesCount || 0),
            derivedCompletedServicesCount
        );

        const leadSource = linkedCustomer?.leadSource || snapshotCustomer.leadSource || '';
        const leadDetails = linkedCustomer?.leadDetails || snapshotCustomer.leadDetails || null;

        let leadInfo = '—';
        if(leadSource === 'refer' && leadDetails) leadInfo = `Refer by: ${leadDetails.referrerName || ''} (${leadDetails.referrerMobile || ''})`;
        else if(leadSource === 'social' && leadDetails) leadInfo = `Social: ${leadDetails.platform || ''}`;
        else if(leadSource === 'other' && leadDetails) leadInfo = `Other: ${leadDetails.otherText || ''}`;
        else if(leadSource === 'walk-in') leadInfo = 'Walk-in';

        const vehicleCompletedServicesCount = Math.max(
            Number(vehicle.completedServices || 0),
            Array.isArray(vehicle.services) ? vehicle.services.length : 0
        );

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
                        <button class="btn-action-dropdown" style="min-width: 80px;" onclick="window.viewServiceDetails('${s.jobCardId || ''}', '${vehicle.vehicleId}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>`;
            });
        } else servicesHtml = '<tr><td colspan="7" style="padding:30px;text-align:center;">No service records found</td></tr>';

        detailsGrid.innerHTML = `
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
                        <button class="btn-edit-header" onclick="window.openEditVehicleModal('${vehicle.vehicleId}')"><i class="fas fa-edit"></i> Edit</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="info-item"><span class="info-label">Vehicle ID</span><span class="info-value">${vehicle.vehicleId}</span></div>
                    <div class="info-item"><span class="info-label">Make</span><span class="info-value">${vehicle.make}</span></div>
                    <div class="info-item"><span class="info-label">Model</span><span class="info-value">${vehicle.model}</span></div>
                    <div class="info-item"><span class="info-label">Year</span><span class="info-value">${vehicle.year}</span></div>
                    <div class="info-item"><span class="info-label">Color</span><span class="info-value">${vehicle.color}</span></div>
                    <div class="info-item"><span class="info-label">Plate Number</span><span class="info-value">${vehicle.plateNumber}</span></div>
                    <div class="info-item"><span class="info-label">Completed Services</span><span class="info-value"><span class="service-count-badge">${vehicleCompletedServicesCount} services</span></span></div>
                    <div class="info-item"><span class="info-label">Type</span><span class="info-value">${vehicle.type || 'N/A'}</span></div>
                    <div class="info-item"><span class="info-label">VIN</span><span class="info-value">${vehicle.vin || 'N/A'}</span></div>
                </div>
            </div>
            <div class="detail-card">
                <div class="detail-card-header">
                    <h3><i class="fas fa-tasks"></i> Service History</h3>
                    <div class="card-header-actions">
                        <button class="btn-add-header" onclick="window.openAddServiceModal('${vehicle.vehicleId}')"><i class="fas fa-plus"></i> Add Service</button>
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
        detailsScreen.style.display = 'flex';
    }

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

    function closeDetailsView() { 
        document.querySelector('.container').style.display = 'block'; 
        detailsScreen.style.display = 'none'; 
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
    };

    document.addEventListener('click', (e) => { 
        if(!e.target.closest('.action-dropdown-container') && !e.target.closest('.action-dropdown-menu')) window.closeAllDropdowns(); 
    });

    window.addEventListener('scroll', window.closeAllDropdowns, true);
    window.addEventListener('resize', window.closeAllDropdowns);

    // ========== VEHICLE CRUD ==========
    window.openEditVehicleModal = (id) => {
        const vehicle = vehicles.find(v => v.vehicleId === id); 
        if(!vehicle) return;
        
        editVehicleId.value = vehicle.vehicleId;
        editCustomerId.value = vehicle.customerId || '';
        renderEditVehicleColorOptions(vehicle.color);
        editVehiclePlate.value = vehicle.plateNumber;
        
        // Clear verification
        editCustomerVerifiedInfo.classList.remove('visible');
        editVerifiedCustomer = null;
        
        openModal(editVehicleModal);
    };

    function saveEditVehicle() {
        const id = editVehicleId.value;
        const vehicle = vehicles.find(v => v.vehicleId === id);
        if(!vehicle) return;

        // Handle ownership change if verified
        if (editVerifiedCustomer) {
            const registeredVehiclesCount = Number(
                editVerifiedCustomer.registeredVehiclesCount || (Array.isArray(editVerifiedCustomer.vehicles) ? editVerifiedCustomer.vehicles.length : 0)
            );
            vehicle.customerId = editVerifiedCustomer.id;
            vehicle.ownedBy = editVerifiedCustomer.name;
            vehicle.customerDetails = {
                customerId: editVerifiedCustomer.id,
                name: editVerifiedCustomer.name,
                email: editVerifiedCustomer.email || '',
                mobile: editVerifiedCustomer.mobile || '',
                address: editVerifiedCustomer.address || '',
                leadSource: editVerifiedCustomer.leadSource || '',
                leadDetails: editVerifiedCustomer.leadDetails || null,
                registeredVehiclesCount,
                registeredVehicles: `${registeredVehiclesCount} vehicles`,
                completedServicesCount: Number(editVerifiedCustomer.completedServicesCount || 0),
                customerSince: editVerifiedCustomer.customerSince || ''
            };
        }

        // Update basic info
        vehicle.color = editVehicleColor.value.trim();
        vehicle.plateNumber = editVehiclePlate.value.trim();

        saveVehiclesToLocalStorage();
        
        closeModal(editVehicleModal);
        currentSearchResults = [...vehicles];
        paginateAndRender();
        
        if(currentDetailsVehicle && currentDetailsVehicle.vehicleId === id) { 
            openDetailsView(id); 
        }
        
        showAlert('Success', 'Vehicle updated successfully', 'success');
    }

    function saveNewVehicle() {
        // Validate required fields
        if (!verifiedCustomer) {
            showAlert('Error', 'Please verify a customer first', 'error');
            return;
        }

        const make = vehicleMake.value.trim();
        const model = vehicleModel.value.trim();
        const year = vehicleYear.value.trim();
        const color = vehicleColor.value.trim();
        const plate = vehiclePlate.value.trim();

        if (!make || !model || !year || !color || !plate) {
            showAlert('Error', 'Please fill in all required fields', 'error');
            return;
        }

        // Generate unique vehicle ID
        const newId = 'VEH-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 1000);
        const existingRegisteredVehicles = Number(
            verifiedCustomer.registeredVehiclesCount || (Array.isArray(verifiedCustomer.vehicles) ? verifiedCustomer.vehicles.length : 0)
        );
        const registeredVehiclesCount = existingRegisteredVehicles + 1;
        
        const newVehicle = {
            vehicleId: newId,
            ownedBy: verifiedCustomer.name,
            customerId: verifiedCustomer.id,
            make: make,
            model: model,
            year: year,
            color: color,
            plateNumber: plate,
            type: vehicleType.value,
            vin: vehicleVin.value.trim() || '',
            completedServices: 0,
            services: [],
            customerDetails: {
                customerId: verifiedCustomer.id,
                name: verifiedCustomer.name,
                email: verifiedCustomer.email || '',
                mobile: verifiedCustomer.mobile || '',
                address: verifiedCustomer.address || '',
                leadSource: verifiedCustomer.leadSource || '',
                leadDetails: verifiedCustomer.leadDetails || null,
                registeredVehiclesCount,
                registeredVehicles: `${registeredVehiclesCount} vehicles`,
                completedServicesCount: Number(verifiedCustomer.completedServicesCount || 0),
                customerSince: verifiedCustomer.customerSince || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            }
        };

        vehicles.unshift(newVehicle);

        saveVehiclesToLocalStorage();
        closeModal(addVehicleModal);
        currentSearchResults = [...vehicles];
        paginateAndRender();
        showAlert('Success', `Vehicle added for ${verifiedCustomer.name}`, 'success');
    }

    window.deleteVehicle = async (id) => {
        if(await showConfirm('Delete Vehicle?', 'This will permanently delete this vehicle and all its service history.', 'warning')) {
            const index = vehicles.findIndex(v => v.vehicleId === id);
            if(index > -1) {
                vehicles.splice(index, 1);
                saveVehiclesToLocalStorage();
            }
            
            currentSearchResults = [...vehicles];
            if(currentDetailsVehicle && currentDetailsVehicle.vehicleId === id) closeDetailsView();
            paginateAndRender();
            showAlert('Deleted', 'Vehicle removed successfully', 'success');
        }
    };

    // ========== SERVICE FUNCTIONS ==========
    window.openAddServiceModal = (vehicleId) => {
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
        const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
        if(!vehicle) return;

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
            totalCost: 'QAR ' + parseFloat(serviceCost.value).toFixed(2)
        };

        if (!vehicle.services) vehicle.services = [];
        vehicle.services.push(newService);
        vehicle.completedServices = vehicle.services.length;

        saveVehiclesToLocalStorage();
        
        closeModal(addServiceModal);
        
        if(currentDetailsVehicle && currentDetailsVehicle.vehicleId === vehicleId) {
            openDetailsView(vehicleId);
        }
        
        paginateAndRender();
        showAlert('Success', 'Service record added', 'success');
    }

    window.viewServiceDetails = (jobCardId, vehicleId) => {
        const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
        if (!vehicle) return;

        const service = vehicle.services.find(s => s.jobCardId === jobCardId);
        if (!service) return;

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
                <span class="service-detail-value"><strong>${service.totalCost}</strong></span>
            </div>
            <div class="service-detail-item">
                <span class="service-detail-label">Vehicle:</span>
                <span class="service-detail-value">${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})</span>
            </div>
        `;

        openModal(serviceDetailsModal);
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

    // Expose globally needed functions
    window.showAlert = showAlert; 
    window.showConfirm = showConfirm;
    window.openEditVehicleModal = window.openEditVehicleModal;
    window.deleteVehicle = deleteVehicle;
    window.openAddServiceModal = window.openAddServiceModal;
    window.viewServiceDetails = viewServiceDetails;
    window.closeAllDropdowns = window.closeAllDropdowns;
    window.toggleDropdown = toggleDropdown;
    window.openDetailsView = openDetailsView;
})();