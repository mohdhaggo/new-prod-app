(function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        if (window.top !== window.self) {
            window.top.location.href = '../../../login.html';
        } else {
            window.location.href = '../../../login.html';
        }
    }
})();

const VEHICLE_MAKE_MODEL_STORAGE_KEY = 'vehicle_make_model_options';
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

let manufacturers = [];

const addMakeBtn = document.getElementById('addMakeBtn');
const addMakeModal = document.getElementById('addMakeModal');
const addMakeForm = document.getElementById('addMakeForm');
const addModelModal = document.getElementById('addModelModal');
const addModelForm = document.getElementById('addModelForm');
const editMakeModal = document.getElementById('editMakeModal');
const editModelModal = document.getElementById('editModelModal');
const editMakeForm = document.getElementById('editMakeForm');
const editModelForm = document.getElementById('editModelForm');
const manufacturersList = document.getElementById('manufacturersList');
const statsBar = document.getElementById('statsBar');

const alertPopup = document.getElementById('alertPopup');
const alertHeader = document.getElementById('alertHeader');
const alertIcon = document.getElementById('alertIcon');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');
const alertActions = document.getElementById('alertActions');

document.addEventListener('DOMContentLoaded', function() {
    loadManufacturers();
    renderManufacturers();

    addMakeBtn.addEventListener('click', function() {
        openModal(addMakeModal);
        document.getElementById('makeName').focus();
    });

    addMakeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const makeName = normalizeText(document.getElementById('makeName').value);

        if (!makeName) {
            showAlert('Error', 'Manufacturer name is required', 'error');
            return;
        }

        const success = addManufacturer(makeName);
        if (!success) return;

        addMakeForm.reset();
        closeModal(addMakeModal);
        showAlert('Success', 'Manufacturer added successfully!', 'success');
    });

    addModelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const makeId = document.getElementById('modelMakeId').value;
        const modelName = normalizeText(document.getElementById('modelName').value);

        if (!modelName) {
            showAlert('Error', 'Model name is required', 'error');
            return;
        }

        const success = addModel(makeId, modelName);
        if (!success) return;

        addModelForm.reset();
        closeModal(addModelModal);
        showAlert('Success', 'Model added successfully!', 'success');
    });

    editMakeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const makeId = document.getElementById('editMakeId').value;
        const makeName = normalizeText(document.getElementById('editMakeName').value);

        if (!makeName) {
            showAlert('Error', 'Manufacturer name is required', 'error');
            return;
        }

        const success = updateManufacturer(makeId, makeName);
        if (!success) return;

        closeModal(editMakeModal);
        showAlert('Success', 'Manufacturer updated successfully!', 'success');
    });

    editModelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const makeId = document.getElementById('editModelMakeId').value;
        const modelId = document.getElementById('editModelId').value;
        const modelName = normalizeText(document.getElementById('editModelName').value);

        if (!modelName) {
            showAlert('Error', 'Model name is required', 'error');
            return;
        }

        const success = updateModel(makeId, modelId, modelName);
        if (!success) return;

        closeModal(editModelModal);
        showAlert('Success', 'Model updated successfully!', 'success');
    });

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }

        if (e.target.classList.contains('alert-popup')) {
            closeAlert();
        }
    });
});

function normalizeText(value) {
    return (value || '').trim().replace(/\s+/g, ' ');
}

function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function deepCloneDefaultOptions() {
    const cloned = {};
    Object.keys(DEFAULT_VEHICLE_MAKE_MODEL_OPTIONS).forEach(makeName => {
        cloned[makeName] = [...DEFAULT_VEHICLE_MAKE_MODEL_OPTIONS[makeName]];
    });
    return cloned;
}

function sanitizeOptionsMap(rawOptions) {
    if (!rawOptions || typeof rawOptions !== 'object' || Array.isArray(rawOptions)) {
        return {};
    }

    const sanitized = {};

    Object.entries(rawOptions).forEach(([makeName, models]) => {
        const normalizedMakeName = normalizeText(makeName);
        if (!normalizedMakeName || !Array.isArray(models)) {
            return;
        }

        const uniqueModels = [...new Set(
            models
                .map(modelName => normalizeText(modelName))
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        sanitized[normalizedMakeName] = uniqueModels;
    });

    return sanitized;
}

function buildManufacturersFromMap(optionsMap) {
    return Object.keys(optionsMap)
        .sort((a, b) => a.localeCompare(b))
        .map(makeName => ({
            id: createId('make'),
            name: makeName,
            models: optionsMap[makeName].map(modelName => ({
                id: createId('model'),
                name: modelName
            }))
        }));
}

function buildMapFromManufacturers() {
    const optionsMap = {};

    manufacturers.forEach(make => {
        const normalizedMakeName = normalizeText(make.name);
        if (!normalizedMakeName) return;

        const uniqueModels = [...new Set(
            (make.models || [])
                .map(model => normalizeText(model.name))
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        optionsMap[normalizedMakeName] = uniqueModels;
    });

    return optionsMap;
}

function loadManufacturers() {
    let optionsMap = null;
    const stored = localStorage.getItem(VEHICLE_MAKE_MODEL_STORAGE_KEY);

    if (stored) {
        try {
            optionsMap = sanitizeOptionsMap(JSON.parse(stored));
        } catch (error) {
            optionsMap = null;
        }
    }

    if (!optionsMap || Object.keys(optionsMap).length === 0) {
        optionsMap = deepCloneDefaultOptions();
        localStorage.setItem(VEHICLE_MAKE_MODEL_STORAGE_KEY, JSON.stringify(optionsMap));
    }

    manufacturers = buildManufacturersFromMap(optionsMap);
}

function saveManufacturers() {
    const optionsMap = buildMapFromManufacturers();
    localStorage.setItem(VEHICLE_MAKE_MODEL_STORAGE_KEY, JSON.stringify(optionsMap));
    manufacturers = buildManufacturersFromMap(optionsMap);
}

function renderStats() {
    const totalManufacturers = manufacturers.length;
    const totalModels = manufacturers.reduce((count, make) => count + make.models.length, 0);
    const avgModels = totalManufacturers > 0 ? (totalModels / totalManufacturers).toFixed(1) : 0;

    statsBar.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${totalManufacturers}</div>
            <div class="stat-label">Manufacturers</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${totalModels}</div>
            <div class="stat-label">Total Models</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${avgModels}</div>
            <div class="stat-label">Avg Models/Manufacturer</div>
        </div>
    `;
}

function renderManufacturers() {
    renderStats();

    if (manufacturers.length === 0) {
        manufacturersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car"></i>
                <h3>No Manufacturers Yet</h3>
                <p>Click "Add New Manufacturer" to create your first manufacturer</p>
            </div>
        `;
        return;
    }

    let manufacturersHTML = '<div class="departments-container">';

    manufacturers.forEach(make => {
        let modelsHTML = '';

        if (make.models.length === 0) {
            modelsHTML = `
                <div class="no-roles">
                    <i class="fas fa-car-side"></i>
                    <p>No models yet. Click "Add Model" to create one.</p>
                </div>
            `;
        } else {
            make.models.forEach((model, index) => {
                modelsHTML += `
                    <div class="role-item" data-model-id="${model.id}">
                        <div class="role-info">
                            <h4>
                                <span class="role-number">${index + 1}</span>
                                <i class="fas fa-car role-icon"></i>
                                <span class="role-title">${model.name}</span>
                            </h4>
                        </div>
                        <div class="role-actions">
                            <button class="btn btn-secondary btn-xsmall edit-model-btn"
                                    data-make-id="${make.id}"
                                    data-model-id="${model.id}"
                                    title="Edit Model">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-xsmall delete-model-btn"
                                    data-make-id="${make.id}"
                                    data-model-id="${model.id}"
                                    title="Delete Model">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        manufacturersHTML += `
            <div class="department-item" data-make-id="${make.id}">
                <div class="department-header">
                    <div class="department-title">
                        <i class="fas fa-industry"></i>
                        ${make.name}
                        <span class="role-count">${make.models.length} model${make.models.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="department-actions">
                        <button class="btn btn-success btn-small add-model-btn" data-make-id="${make.id}">
                            <i class="fas fa-plus"></i> Add Model
                        </button>
                        <button class="btn btn-secondary btn-small edit-make-btn" data-make-id="${make.id}" title="Edit Manufacturer">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small delete-make-btn" data-make-id="${make.id}" title="Delete Manufacturer">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="department-body">
                    <div class="department-description">
                        Manufacturer is available for the Add Vehicle form.
                    </div>
                    <div class="roles-section">
                        <div class="roles-header">
                            <div class="roles-title">
                                <i class="fas fa-car"></i>
                                Vehicle Models (${make.models.length})
                            </div>
                        </div>
                        <div class="roles-list">
                            ${modelsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    manufacturersHTML += '</div>';
    manufacturersList.innerHTML = manufacturersHTML;

    document.querySelectorAll('.add-model-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const makeId = this.getAttribute('data-make-id');
            openAddModelModal(makeId);
        });
    });

    document.querySelectorAll('.edit-make-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const makeId = this.getAttribute('data-make-id');
            openEditMakeModal(makeId);
        });
    });

    document.querySelectorAll('.delete-make-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const makeId = this.getAttribute('data-make-id');
            deleteManufacturer(makeId);
        });
    });

    document.querySelectorAll('.edit-model-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const makeId = this.getAttribute('data-make-id');
            const modelId = this.getAttribute('data-model-id');
            openEditModelModal(makeId, modelId);
        });
    });

    document.querySelectorAll('.delete-model-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const makeId = this.getAttribute('data-make-id');
            const modelId = this.getAttribute('data-model-id');
            deleteModel(makeId, modelId);
        });
    });
}

function addManufacturer(makeName) {
    const alreadyExists = manufacturers.some(make => make.name.toLowerCase() === makeName.toLowerCase());
    if (alreadyExists) {
        showAlert('Error', 'Manufacturer already exists', 'error');
        return false;
    }

    manufacturers.push({
        id: createId('make'),
        name: makeName,
        models: []
    });

    saveManufacturers();
    renderManufacturers();
    return true;
}

function openAddModelModal(makeId) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) return;

    document.getElementById('modelMakeId').value = make.id;

    const modelInput = document.getElementById('modelName');
    modelInput.placeholder = `Enter model name for ${make.name}`;

    openModal(addModelModal);
    modelInput.focus();
}

function addModel(makeId, modelName) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) {
        showAlert('Error', 'Manufacturer not found', 'error');
        return false;
    }

    const alreadyExists = make.models.some(model => model.name.toLowerCase() === modelName.toLowerCase());
    if (alreadyExists) {
        showAlert('Error', `Model already exists for ${make.name}`, 'error');
        return false;
    }

    make.models.push({
        id: createId('model'),
        name: modelName
    });

    saveManufacturers();
    renderManufacturers();
    return true;
}

function openEditMakeModal(makeId) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) return;

    document.getElementById('editMakeId').value = make.id;
    document.getElementById('editMakeName').value = make.name;

    openModal(editMakeModal);
}

function updateManufacturer(makeId, makeName) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) {
        showAlert('Error', 'Manufacturer not found', 'error');
        return false;
    }

    const alreadyExists = manufacturers.some(item =>
        item.id !== makeId && item.name.toLowerCase() === makeName.toLowerCase()
    );

    if (alreadyExists) {
        showAlert('Error', 'Another manufacturer already has this name', 'error');
        return false;
    }

    make.name = makeName;

    saveManufacturers();
    renderManufacturers();
    return true;
}

function openEditModelModal(makeId, modelId) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) return;

    const model = make.models.find(item => item.id === modelId);
    if (!model) return;

    document.getElementById('editModelMakeId').value = make.id;
    document.getElementById('editModelId').value = model.id;
    document.getElementById('editModelName').value = model.name;

    openModal(editModelModal);
}

function updateModel(makeId, modelId, modelName) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) {
        showAlert('Error', 'Manufacturer not found', 'error');
        return false;
    }

    const model = make.models.find(item => item.id === modelId);
    if (!model) {
        showAlert('Error', 'Model not found', 'error');
        return false;
    }

    const alreadyExists = make.models.some(item =>
        item.id !== modelId && item.name.toLowerCase() === modelName.toLowerCase()
    );

    if (alreadyExists) {
        showAlert('Error', `Another model already has this name for ${make.name}`, 'error');
        return false;
    }

    model.name = modelName;

    saveManufacturers();
    renderManufacturers();
    return true;
}

function deleteManufacturer(makeId) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) return;

    showAlert(
        'Confirm Delete',
        `Are you sure you want to delete the manufacturer "${make.name}" and all its models?`,
        'warning',
        [
            {
                text: 'Cancel',
                class: 'alert-btn-secondary',
                action: closeAlert
            },
            {
                text: 'Delete',
                class: 'alert-btn-danger',
                action: function() {
                    manufacturers = manufacturers.filter(item => item.id !== makeId);
                    saveManufacturers();
                    renderManufacturers();
                    closeAlert();
                    showAlert('Success', `Manufacturer "${make.name}" deleted successfully!`, 'success');
                }
            }
        ]
    );
}

function deleteModel(makeId, modelId) {
    const make = manufacturers.find(item => item.id === makeId);
    if (!make) return;

    const model = make.models.find(item => item.id === modelId);
    if (!model) return;

    showAlert(
        'Confirm Delete',
        `Are you sure you want to delete the model "${model.name}" from ${make.name}?`,
        'warning',
        [
            {
                text: 'Cancel',
                class: 'alert-btn-secondary',
                action: closeAlert
            },
            {
                text: 'Delete',
                class: 'alert-btn-danger',
                action: function() {
                    make.models = make.models.filter(item => item.id !== modelId);
                    saveManufacturers();
                    renderManufacturers();
                    closeAlert();
                    showAlert('Success', `Model "${model.name}" deleted successfully!`, 'success');
                }
            }
        ]
    );
}

function showAlert(title, message, type, buttons = null) {
    alertHeader.className = `alert-header ${type}`;

    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }

    alertIcon.innerHTML = icon;
    alertTitle.textContent = title;
    alertMessage.textContent = message;

    alertActions.innerHTML = '';

    if (buttons && buttons.length > 0) {
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `alert-btn ${btn.class}`;
            button.textContent = btn.text;
            button.addEventListener('click', btn.action);
            alertActions.appendChild(button);
        });
    } else {
        const okButton = document.createElement('button');
        okButton.className = 'alert-btn alert-btn-primary';
        okButton.textContent = 'OK';
        okButton.addEventListener('click', closeAlert);
        alertActions.appendChild(okButton);
    }

    alertPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (type === 'success' && (!buttons || buttons.length === 0)) {
        setTimeout(closeAlert, 2500);
    }
}

function closeAlert() {
    alertPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}
