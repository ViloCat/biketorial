document.addEventListener('DOMContentLoaded', async () => {
    const partsList = document.getElementById('parts-list');
    const partForm = document.getElementById('part-form');
    const partOptionForm = document.getElementById('part-option-form');
    const combinationRuleForm = document.getElementById('combination-rule-form');
    const combinationRulesList = document.getElementById('combination-rules-list');
    const priceRuleForm = document.getElementById('price-rule-form');
    const priceRulesList = document.getElementById('price-rules-list');
    const productForm = document.getElementById('product-form');
    const navbar = document.getElementById('navbar');
    const productDropdown = document.getElementById('productDropdown');
    const managePartsSection = document.getElementById('manage-parts-section');
    const manageCombinationRulesSection = document.getElementById('manage-combination-rules-section');
    const managePriceRulesSection = document.getElementById('manage-price-rules-section');
    const editProductBtn = document.getElementById('editProductBtn');
    const productModalLabel = document.getElementById('productModalLabel');
    const deleteProductBtn = document.getElementById('deleteProductBtn');
    const partModalLabel = document.getElementById('partModalLabel');
    const partOptionModalLabel = document.getElementById('partOptionModalLabel');
    const deletePartOptionBtn = document.getElementById('deletePartOptionBtn');
    const combinationRuleModalLabel = document.getElementById('combinationRuleModalLabel');
    const deleteCombinationRuleBtn = document.getElementById('deleteCombinationRuleBtn');
    const priceRuleModalLabel = document.getElementById('priceRuleModalLabel');
    const deletePriceRuleBtn = document.getElementById('deletePriceRuleBtn');
    const selectedProductName = document.getElementById('selected-product-name');
    const selectedProductDescription = document.getElementById('selected-product-description');
    const selectedProductAvailability = document.getElementById('selected-product-availability');
    const partIdInput = document.getElementById('part-id');
    const partNameInput = document.getElementById('part-name');
    const partDescriptionInput = document.getElementById('part-description');
    const partOptionIdInput = document.getElementById('part-option-id');
    const partOptionPartInput = document.getElementById('part-option-part');
    const partOptionNameInput = document.getElementById('part-option-name');
    const partOptionDescriptionInput = document.getElementById('part-option-description');
    const partOptionCostInput = document.getElementById('part-option-cost');
    const combinationRuleIdInput = document.getElementById('combination-rule-id');
    const combinationRulePartOptionsSelect = document.querySelector('#combination-rule-form #partOptions');
    const combinationRuleConditionSelect = document.getElementById('condition');
    const priceRuleIdInput = document.getElementById('price-rule-id');
    const priceRulePartOptionsSelect = document.querySelector('#price-rule-form #partOptions');
    const priceRuleModifiedPriceInput = document.getElementById('modifiedPrice');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productAvailableCheckbox = document.getElementById('product-available');
    const productAvailableLabel = document.getElementById('product-available-label');

    let parts = [];
    let products = [];
    let selectedProductId = null;

    const fetchProducts = async () => {
        const response = await fetch('/admin/products');
        products = await response.json();
        populateNavbar();
    };

    const populateNavbar = () => {
        navbar.innerHTML = '';
        products.forEach(product => {
            const productLink = document.createElement('a');
            productLink.href = '#';
            productLink.classList.add('dropdown-item');
            productLink.textContent = product.name;
            productLink.addEventListener('click', () => {
                selectedProductId = product._id;
                fetchParts();
                fetchCombinationRules();
                fetchPriceRules();
                updateNavbarSelection(product._id);
                editProductBtn.style.display = 'block';
                editProductBtn.disabled = false;
                managePartsSection.classList.remove('d-none');
                manageCombinationRulesSection.classList.remove('d-none');
                managePriceRulesSection.classList.remove('d-none');
            });
            navbar.appendChild(productLink);
        });

        const addProductOption = document.createElement('a');
        addProductOption.href = '#';
        addProductOption.classList.add('dropdown-item');
        addProductOption.textContent = '+ Add Product';
        addProductOption.addEventListener('click', () => {
            productModalLabel.textContent = 'Add Product';
            deleteProductBtn.style.display = 'none';
            productForm.reset();
            new bootstrap.Modal(document.getElementById('productModal')).show();
        });
        navbar.appendChild(addProductOption);
    };

    const updateNavbarSelection = (productId) => {
        const selectedProduct = products.find(p => p._id === productId);
        if (selectedProduct) {
            productDropdown.textContent = selectedProduct.name;
            selectedProductName.textContent = selectedProduct.name;
            selectedProductDescription.textContent = selectedProduct.description;
            selectedProductAvailability.textContent = selectedProduct.available ? 'Available' : 'Unavailable';
        } else {
            productDropdown.textContent = 'Products';
            selectedProductName.textContent = '';
            selectedProductDescription.textContent = '';
            selectedProductAvailability.textContent = '';
        }
        const links = navbar.querySelectorAll('a');
        links.forEach(link => {
            if (link.textContent === selectedProduct.name) {
                link.classList.add('selected');
            } else {
                link.classList.remove('selected');
            }
        });
        selectedProductId = productId;
    };

    const fetchParts = async () => {
        if (!selectedProductId) return;
        const response = await fetch(`/admin/parts?productId=${selectedProductId}`);
        parts = await response.json();
        displayParts();
        populatePartOptions();
    };

    const displayParts = () => {
        partsList.innerHTML = '';
        parts.forEach(part => {
            const partDiv = document.createElement('div');
            partDiv.classList.add('mb-3');
            partDiv.innerHTML = `
                <h4>${part.name} <small class="text-muted">${part.description}</small> 
                    <i class="bi bi-pencil-square edit-part" data-id="${part._id}"></i>
                </h4>
                <div class="list-group mt-2">
                    ${part.options.map(option => `
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                                ${option.name} - ${option.description} (${option.cost} EUR)
                                <i class="bi bi-pencil-square edit-option" data-id="${option._id}"></i>
                            </span>
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="form-check-label me-2" id="availability-label-${option._id}" for="availability-${option._id}">
                                    ${option.available ? 'Available' : 'Unavailable'}
                                </label>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="availability-${option._id}" ${option.available ? 'checked' : ''} onchange="toggleAvailability(this, '${option._id}', this.checked)">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <br>
                <button class="btn btn-custom-outline add-option" data-id="${part._id}">+ Add Option</button>
            `;
            partsList.appendChild(partDiv);
        });
    };

    const populatePartOptions = () => {
        combinationRulePartOptionsSelect.innerHTML = '';
        priceRulePartOptionsSelect.innerHTML = '';

        parts.forEach(part => {
            part.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option._id;
                optionElement.textContent = `${part.name}: ${option.name}`;
                combinationRulePartOptionsSelect.appendChild(optionElement);
                priceRulePartOptionsSelect.appendChild(optionElement.cloneNode(true));
            });
        });
    };

    window.toggleProductAvailability = async (checkbox, id, available) => {
        const previousState = checkbox.checked;
        checkbox.checked = available;

        try {
            const response = await fetch(`/admin/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ available })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            checkbox.checked = previousState;
            alert('Failed to update availability. Please try again.');
        }
    };

    window.toggleAvailability = async (checkbox, id, available) => {
        const previousState = checkbox.checked;
        checkbox.checked = available;

        try {
            const response = await fetch(`/admin/part-options/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ available })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const label = document.getElementById(`availability-label-${id}`);
            label.textContent = available ? 'Available' : 'Unavailable';
        } catch (error) {
            checkbox.checked = previousState;
            alert('Failed to update availability. Please try again.');
        }
    };

    const fetchCombinationRules = async () => {
        if (!selectedProductId) return;
        const response = await fetch(`/api/combination-rules?productId=${selectedProductId}`);
        const rules = await response.json();
        combinationRulesList.innerHTML = '';

        rules.forEach(rule => {
            const ruleItem = document.createElement('li');
            ruleItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            const options = rule.partOptions.map(option => option.name).join(', ');
            ruleItem.innerHTML = `
                <div>
                    <h5>Condition: ${rule.condition}</h5>
                    <p>Part Options: ${options}</p>
                </div>
                <div>
                    <i class="bi bi-pencil-square edit-combination-rule" data-id="${rule._id}" data-part-options="${rule.partOptions.map(option => option._id).join(',')}" data-condition="${rule.condition}"></i>
                </div>
            `;
            combinationRulesList.appendChild(ruleItem);
        });
    };

    const fetchPriceRules = async () => {
        if (!selectedProductId) return;
        const response = await fetch(`/api/price-rules?productId=${selectedProductId}`);
        const rules = await response.json();
        priceRulesList.innerHTML = '';

        rules.forEach(rule => {
            const ruleItem = document.createElement('li');
            ruleItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            const options = rule.partOptions.map(option => option.name).join(', ');
            ruleItem.innerHTML = `
                <div>
                    <h5>Modified Price: ${rule.modifiedPrice} EUR</h5>
                    <p>Part Options: ${options}</p>
                </div>
                <div>
                    <i class="bi bi-pencil-square edit-price-rule" data-id="${rule._id}" data-part-options="${rule.partOptions.map(option => option._id).join(',')}" data-modified-price="${rule.modifiedPrice}"></i>
                </div>
            `;
            priceRulesList.appendChild(ruleItem);
        });
    };

    partForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = partIdInput.value;
        const name = partNameInput.value;
        const description = partDescriptionInput.value;

        if (id) {
            await fetch(`/admin/parts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, productIds: [selectedProductId] })
            });
        } else {
            await fetch('/admin/parts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, productIds: [selectedProductId] })
            });
        }

        partForm.reset();
        await fetchParts();
        bootstrap.Modal.getInstance(document.getElementById('partModal')).hide();
    });

    partOptionForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = partOptionIdInput.value;
        const part = partOptionPartInput.value;
        const name = partOptionNameInput.value;
        const description = partOptionDescriptionInput.value;
        const cost = partOptionCostInput.value;

        if (id) {
            await fetch(`/admin/part-options/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ part, name, description, cost, available: false })
            });
        } else {
            await fetch('/admin/part-options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ part, name, description, cost, available: false })
            });
        }

        partOptionForm.reset();
        fetchParts();
        bootstrap.Modal.getInstance(document.getElementById('partOptionModal')).hide();
    });

    deletePartOptionBtn.addEventListener('click', async () => {
        const id = partOptionIdInput.value;
        if (id) {
            await fetch(`/admin/part-options/${id}`, { method: 'DELETE' });
            partOptionForm.reset();
            fetchParts();
            bootstrap.Modal.getInstance(document.getElementById('partOptionModal')).hide();
        }
    });

    combinationRuleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = combinationRuleIdInput.value;
        const partOptions = Array.from(combinationRulePartOptionsSelect.selectedOptions).map(option => option.value);
        const condition = combinationRuleConditionSelect.value;
        const productId = selectedProductId;

        if (id) {
            await fetch(`/admin/combination-rules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ partOptions, condition })
            });
        } else {
            await fetch('/admin/combination-rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ partOptions, condition, productId })
            });
        }

        combinationRuleForm.reset();
        await fetchCombinationRules();
        bootstrap.Modal.getInstance(document.getElementById('combinationRuleModal')).hide();
    });

    priceRuleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = priceRuleIdInput.value;
        const partOptions = Array.from(priceRulePartOptionsSelect.selectedOptions).map(option => option.value);
        const modifiedPrice = priceRuleModifiedPriceInput.value;
        const productId = selectedProductId;

        if (id) {
            await fetch(`/admin/price-rules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ partOptions, modifiedPrice })
            });
        } else {
            await fetch('/admin/price-rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ partOptions, modifiedPrice, productId })
            });
        }

        priceRuleForm.reset();
        await fetchPriceRules();
        bootstrap.Modal.getInstance(document.getElementById('priceRuleModal')).hide();
    });

    window.editProduct = (id, name, description, available) => {
        productIdInput.value = id;
        productNameInput.value = name;
        productDescriptionInput.value = description;
        productAvailableCheckbox.checked = available;
        productAvailableLabel.textContent = available ? 'Available' : 'Unavailable';
        productAvailableCheckbox.addEventListener('change', () => {
            productAvailableLabel.textContent = productAvailableCheckbox.checked ? 'Available' : 'Unavailable';
        });
        editProductBtn.disabled = false;
        productModalLabel.textContent = 'Edit Product';
        deleteProductBtn.style.display = 'block';
        new bootstrap.Modal(document.getElementById('productModal')).show();
    };

    window.deleteProduct = async (id) => {
        await fetch(`/admin/products/${id}`, { method: 'DELETE' });
        await fetchProducts();
    };

    window.editPart = (id, name, description) => {
        partIdInput.value = id;
        partNameInput.value = name;
        partDescriptionInput.value = description;
    };

    window.deletePart = async (id) => {
        await fetch(`/admin/parts/${id}`, { method: 'DELETE' });
        await fetchParts();
    };

    window.editPartOption = (id, part, name, description, cost) => {
        partOptionIdInput.value = id;
        partOptionPartInput.value = part;
        partOptionNameInput.value = name;
        partOptionDescriptionInput.value = description;
        partOptionCostInput.value = cost;
    };

    window.deletePartOption = async (id) => {
        await fetch(`/admin/part-options/${id}`, { method: 'DELETE' });
        fetchParts();
    };

    window.editCombinationRule = (id, partOptions, condition) => {
        combinationRuleIdInput.value = id;
        Array.from(combinationRulePartOptionsSelect.querySelectorAll('option')).forEach(option => {
            option.selected = partOptions.split(',').includes(option.value);
        });
        combinationRuleConditionSelect.value = condition;
        combinationRuleModalLabel.textContent = 'Edit Combination Rule';
        deleteCombinationRuleBtn.style.display = 'block';
        new bootstrap.Modal(document.getElementById('combinationRuleModal')).show();
    };

    deleteCombinationRuleBtn.addEventListener('click', async () => {
        const id = combinationRuleIdInput.value;
        await fetch(`/admin/combination-rules/${id}`, { method: 'DELETE' });
        await fetchCombinationRules();
        bootstrap.Modal.getInstance(document.getElementById('combinationRuleModal')).hide();
    });

    window.editPriceRule = (id, partOptions, modifiedPrice) => {
        priceRuleIdInput.value = id;
        Array.from(priceRulePartOptionsSelect.querySelectorAll('option')).forEach(option => {
            option.selected = partOptions.split(',').includes(option.value);
        });
        priceRuleModifiedPriceInput.value = modifiedPrice;
        priceRuleModalLabel.textContent = 'Edit Price Rule';
        deletePriceRuleBtn.style.display = 'block';
        new bootstrap.Modal(document.getElementById('priceRuleModal')).show();
    };

    deletePriceRuleBtn.addEventListener('click', async () => {
        const id = priceRuleIdInput.value;
        await fetch(`/admin/price-rules/${id}`, { method: 'DELETE' });
        await fetchPriceRules();
        bootstrap.Modal.getInstance(document.getElementById('priceRuleModal')).hide();
    });

    editProductBtn.addEventListener('click', () => {
        const selectedProduct = products.find(p => p._id === selectedProductId);
        if (selectedProduct) {
            editProduct(selectedProduct._id, selectedProduct.name, selectedProduct.description, selectedProduct.available);
        }
    });

    document.getElementById('addPartBtn').addEventListener('click', () => {
        partIdInput.value = '';
        partModalLabel.textContent = 'Add Part';
        partForm.reset();
        new bootstrap.Modal(document.getElementById('partModal')).show();
    });

    document.getElementById('parts-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-part')) {
            const partId = event.target.dataset.id;
            const part = parts.find(p => p._id === partId);
            if (part) {
                partIdInput.value = part._id;
                partNameInput.value = part.name;
                partDescriptionInput.value = part.description;
                partModalLabel.textContent = 'Edit Part';
                new bootstrap.Modal(document.getElementById('partModal')).show();
            }
        } else if (event.target.classList.contains('add-option')) {
            const partId = event.target.dataset.id;
            partOptionIdInput.value = '';
            partOptionPartInput.value = partId;
            partOptionForm.reset();
            partOptionModalLabel.textContent = 'Add Part Option';
            deletePartOptionBtn.style.display = 'none';
            new bootstrap.Modal(document.getElementById('partOptionModal')).show();
        } else if (event.target.classList.contains('edit-option')) {
            const optionId = event.target.dataset.id;
            const part = parts.find(p => p.options.some(o => o._id === optionId));
            const option = part.options.find(o => o._id === optionId);
            if (option) {
                partOptionIdInput.value = option._id;
                partOptionPartInput.value = part._id;
                partOptionNameInput.value = option.name;
                partOptionDescriptionInput.value = option.description;
                partOptionCostInput.value = option.cost;
                partOptionModalLabel.textContent = 'Edit Part Option';
                deletePartOptionBtn.style.display = 'block';
                new bootstrap.Modal(document.getElementById('partOptionModal')).show();
            }
        }
    });

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = productIdInput.value;
        const name = productNameInput.value;
        const description = productDescriptionInput.value;
        const available = productAvailableCheckbox.checked;

        let response;
        if (id) {
            response = await fetch(`/admin/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, available })
            });
        } else {
            response = await fetch('/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, available })
            });
        }

        const newProduct = await response.json();
        selectedProductId = newProduct._id;

        productForm.reset();
        await fetchProducts();
        updateNavbarSelection(selectedProductId);
        selectedProductAvailability.textContent = available ? 'Available' : 'Unavailable';
        
        await fetchParts();
        await fetchCombinationRules();
        await fetchPriceRules();

        editProductBtn.style.display = 'block';
        editProductBtn.disabled = false;
        managePartsSection.classList.remove('d-none');
        manageCombinationRulesSection.classList.remove('d-none');
        managePriceRulesSection.classList.remove('d-none');

        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    });

    document.getElementById('addCombinationRuleBtn').addEventListener('click', () => {
        combinationRuleIdInput.value = '';
        combinationRuleModalLabel.textContent = 'Add Combination Rule';
        combinationRuleForm.reset();
        deleteCombinationRuleBtn.style.display = 'none';
        new bootstrap.Modal(document.getElementById('combinationRuleModal')).show();
    });

    document.getElementById('addPriceRuleBtn').addEventListener('click', () => {
        priceRuleIdInput.value = '';
        priceRuleModalLabel.textContent = 'Add Price Rule';
        priceRuleForm.reset();
        deletePriceRuleBtn.style.display = 'none';
        new bootstrap.Modal(document.getElementById('priceRuleModal')).show();
    });

    combinationRulesList.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-combination-rule')) {
            const id = event.target.dataset.id;
            const partOptions = event.target.dataset.partOptions;
            const condition = event.target.dataset.condition;
            editCombinationRule(id, partOptions, condition);
        }
    });

    priceRulesList.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-price-rule')) {
            const id = event.target.dataset.id;
            const partOptions = event.target.dataset.partOptions;
            const modifiedPrice = event.target.dataset.modifiedPrice;
            editPriceRule(id, partOptions, modifiedPrice);
        }
    });

    deleteProductBtn.addEventListener('click', async () => {
        const id = productIdInput.value;
        await deleteProduct(id);
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        location.reload();
    });

    await fetchProducts();
});
