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
    const editVehicleType = document.getElementById('editVehicleType');
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

    function loadDataFromLocalStorage() {
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

        // Ensure each vehicle has required arrays
        vehicles.forEach(v => {
            if (!v.services) v.services = [];
            if (!v.customerDetails) {
                // Try to find customer from customers list
                const customer = customers.find(c => c.id === v.customerId);
                if (customer) {
                    v.customerDetails = {
                        customerId: customer.id,
                        name: customer.name,
                        email: customer.email || '',
                        mobile: customer.mobile || '',
                        registeredVehicles: `${customer.registeredVehiclesCount || 0} vehicles`,
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

    // Save handlers
    saveVehicleBtn.addEventListener('click', saveNewVehicle);
    saveEditBtn.addEventListener('click', saveEditVehicle);
    saveServiceBtn.addEventListener('click', saveNewService);

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
        if (modal === addVehicleModal) resetAddVehicleForm();
        if (modal === editVehicleModal) resetEditVehicleForm();
    }

    function resetAddVehicleForm() {
        document.getElementById('addVehicleForm').reset();
        customerVerifiedInfo.classList.remove('visible');
        verifiedCustomer = null;
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

        let customerInfo = vehicle.customerDetails || { 
            name: vehicle.ownedBy,
            customerId: vehicle.customerId || 'N/A',
            mobile: 'N/A',
            email: 'N/A',
            registeredVehicles: 'N/A',
            customerSince: 'N/A'
        };

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
                    <h3><i class="fas fa-user"></i> Customer Information</h3>
                </div>
                <div class="card-content">
                    <div class="info-item"><span class="info-label">Customer ID</span><span class="info-value">${customerInfo.customerId}</span></div>
                    <div class="info-item"><span class="info-label">Name</span><span class="info-value">${customerInfo.name}</span></div>
                    <div class="info-item"><span class="info-label">Mobile</span><span class="info-value">${customerInfo.mobile}</span></div>
                    <div class="info-item"><span class="info-label">Email</span><span class="info-value">${customerInfo.email}</span></div>
                    <div class="info-item"><span class="info-label">Registered Vehicles</span><span class="info-value">${customerInfo.registeredVehicles}</span></div>
                    <div class="info-item"><span class="info-label">Customer Since</span><span class="info-value">${customerInfo.customerSince}</span></div>
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

    // ========== VEHICLE CRUD ==========
    window.openEditVehicleModal = (id) => {
        const vehicle = vehicles.find(v => v.vehicleId === id); 
        if(!vehicle) return;
        
        editVehicleId.value = vehicle.vehicleId;
        editCustomerId.value = vehicle.customerId || '';
        editVehicleColor.value = vehicle.color;
        editVehiclePlate.value = vehicle.plateNumber;
        editVehicleType.value = vehicle.type || 'Sedan';
        
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
            vehicle.customerId = editVerifiedCustomer.id;
            vehicle.ownedBy = editVerifiedCustomer.name;
            vehicle.customerDetails = {
                customerId: editVerifiedCustomer.id,
                name: editVerifiedCustomer.name,
                email: editVerifiedCustomer.email || '',
                mobile: editVerifiedCustomer.mobile || '',
                registeredVehicles: `${editVerifiedCustomer.registeredVehiclesCount || 0} vehicles`,
                customerSince: editVerifiedCustomer.customerSince || ''
            };
        }

        // Update basic info
        vehicle.color = editVehicleColor.value.trim();
        vehicle.plateNumber = editVehiclePlate.value.trim();
        vehicle.type = editVehicleType.value;

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
                registeredVehicles: `${(verifiedCustomer.registeredVehiclesCount || 0) + 1} vehicles`,
                customerSince: verifiedCustomer.customerSince || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            }
        };

        vehicles.unshift(newVehicle);
        
        // Update customer's vehicle count in customers array
        const customer = customers.find(c => c.id === verifiedCustomer.id);
        if (customer) {
            customer.registeredVehiclesCount = (customer.registeredVehiclesCount || 0) + 1;
            localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
        }

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
                const vehicle = vehicles[index];
                
                // Update customer's vehicle count
                if (vehicle.customerId) {
                    const customer = customers.find(c => c.id === vehicle.customerId);
                    if (customer) {
                        customer.registeredVehiclesCount = Math.max(0, (customer.registeredVehiclesCount || 0) - 1);
                        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
                    }
                }
                
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