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
                document.getElementById('editProductBtn').style.display = 'block';
                document.getElementById('editProductBtn').disabled = false;
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
            document.getElementById('productModalLabel').textContent = 'Add Product';
            document.getElementById('deleteProductBtn').style.display = 'none';
            productForm.reset();
            new bootstrap.Modal(document.getElementById('productModal')).show();
        });
        navbar.appendChild(addProductOption);
    };

    const updateNavbarSelection = (productId) => {
        const selectedProduct = products.find(p => p._id === productId);
        if (selectedProduct) {
            productDropdown.textContent = selectedProduct.name;
            document.getElementById('selected-product-name').textContent = selectedProduct.name;
            document.getElementById('selected-product-description').textContent = selectedProduct.description;
            const availabilityText = document.getElementById('selected-product-availability');
            availabilityText.textContent = selectedProduct.available ? 'Available' : 'Unavailable';
        } else {
            productDropdown.textContent = 'Products';
            document.getElementById('selected-product-name').textContent = '';
            document.getElementById('selected-product-description').textContent = '';
            document.getElementById('selected-product-availability').textContent = '';
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
        const combinationRulePartOptionsSelect = document.querySelector('#combination-rule-form #partOptions');
        const priceRulePartOptionsSelect = document.querySelector('#price-rule-form #partOptions');

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
        const id = document.getElementById('part-id').value;
        const name = document.getElementById('part-name').value;
        const description = document.getElementById('part-description').value;

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
        const id = document.getElementById('part-option-id').value;
        const part = document.getElementById('part-option-part').value;
        const name = document.getElementById('part-option-name').value;
        const description = document.getElementById('part-option-description').value;
        const cost = document.getElementById('part-option-cost').value;
    
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

    document.getElementById('deletePartOptionBtn').addEventListener('click', async () => {
        const id = document.getElementById('part-option-id').value;
        if (id) {
            await fetch(`/admin/part-options/${id}`, { method: 'DELETE' });
            partOptionForm.reset();
            fetchParts();
            bootstrap.Modal.getInstance(document.getElementById('partOptionModal')).hide();
        }
    });

    combinationRuleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('combination-rule-id').value;
        const partOptions = Array.from(document.querySelector('#combination-rule-form #partOptions').selectedOptions).map(option => option.value);
        const condition = document.getElementById('condition').value;
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
        const id = document.getElementById('price-rule-id').value;
        const partOptions = Array.from(document.querySelector('#price-rule-form #partOptions').selectedOptions).map(option => option.value);
        const modifiedPrice = document.getElementById('modifiedPrice').value;
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
        document.getElementById('product-id').value = id;
        document.getElementById('product-name').value = name;
        document.getElementById('product-description').value = description;
        const productAvailableCheckbox = document.getElementById('product-available');
        productAvailableCheckbox.checked = available;
        document.getElementById('product-available-label').textContent = available ? 'Available' : 'Unavailable';
        productAvailableCheckbox.addEventListener('change', () => {
            document.getElementById('product-available-label').textContent = productAvailableCheckbox.checked ? 'Available' : 'Unavailable';
        });
        document.getElementById('editProductBtn').disabled = false;
        document.getElementById('productModalLabel').textContent = 'Edit Product';
        document.getElementById('deleteProductBtn').style.display = 'block';
        new bootstrap.Modal(document.getElementById('productModal')).show();
    };

    window.deleteProduct = async (id) => {
        await fetch(`/admin/products/${id}`, { method: 'DELETE' });
        await fetchProducts();
    };

    window.editPart = (id, name, description) => {
        document.getElementById('part-id').value = id;
        document.getElementById('part-name').value = name;
        document.getElementById('part-description').value = description;
    };

    window.deletePart = async (id) => {
        await fetch(`/admin/parts/${id}`, { method: 'DELETE' });
        await fetchParts();
    };

    window.editPartOption = (id, part, name, description, cost) => {
        document.getElementById('part-option-id').value = id;
        document.getElementById('part-option-part').value = part;
        document.getElementById('part-option-name').value = name;
        document.getElementById('part-option-description').value = description;
        document.getElementById('part-option-cost').value = cost;
    };

    window.deletePartOption = async (id) => {
        await fetch(`/admin/part-options/${id}`, { method: 'DELETE' });
        fetchParts();
    };

    window.editCombinationRule = (id, partOptions, condition) => {
        document.getElementById('combination-rule-id').value = id;
        Array.from(document.getElementById('combination-rule-form').querySelectorAll('#partOptions option')).forEach(option => {
            option.selected = partOptions.split(',').includes(option.value);
        });
        document.getElementById('condition').value = condition;
        document.getElementById('combinationRuleModalLabel').textContent = 'Edit Combination Rule';
        document.getElementById('deleteCombinationRuleBtn').style.display = 'block';
        new bootstrap.Modal(document.getElementById('combinationRuleModal')).show();
    };

    document.getElementById('deleteCombinationRuleBtn').addEventListener('click', async () => {
        const id = document.getElementById('combination-rule-id').value;
        await fetch(`/admin/combination-rules/${id}`, { method: 'DELETE' });
        await fetchCombinationRules();
        bootstrap.Modal.getInstance(document.getElementById('combinationRuleModal')).hide();
    });

    window.editPriceRule = (id, partOptions, modifiedPrice) => {
        document.getElementById('price-rule-id').value = id;
        Array.from(document.getElementById('price-rule-form').querySelectorAll('#partOptions option')).forEach(option => {
            option.selected = partOptions.split(',').includes(option.value);
        });
        document.getElementById('modifiedPrice').value = modifiedPrice;
        document.getElementById('priceRuleModalLabel').textContent = 'Edit Price Rule';
        document.getElementById('deletePriceRuleBtn').style.display = 'block';
        new bootstrap.Modal(document.getElementById('priceRuleModal')).show();
    };

    document.getElementById('deletePriceRuleBtn').addEventListener('click', async () => {
        const id = document.getElementById('price-rule-id').value;
        await fetch(`/admin/price-rules/${id}`, { method: 'DELETE' });
        await fetchPriceRules();
        bootstrap.Modal.getInstance(document.getElementById('priceRuleModal')).hide();
    });

    document.getElementById('editProductBtn').addEventListener('click', () => {
        const selectedProduct = products.find(p => p._id === selectedProductId);
        if (selectedProduct) {
            editProduct(selectedProduct._id, selectedProduct.name, selectedProduct.description, selectedProduct.available);
        }
    });

    document.getElementById('addPartBtn').addEventListener('click', () => {
        document.getElementById('part-id').value = '';
        document.getElementById('partModalLabel').textContent = 'Add Part';
        document.getElementById('part-form').reset();
        new bootstrap.Modal(document.getElementById('partModal')).show();
    });

    document.getElementById('parts-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-part')) {
            const partId = event.target.dataset.id;
            const part = parts.find(p => p._id === partId);
            if (part) {
                document.getElementById('part-id').value = part._id;
                document.getElementById('part-name').value = part.name;
                document.getElementById('part-description').value = part.description;
                document.getElementById('partModalLabel').textContent = 'Edit Part';
                new bootstrap.Modal(document.getElementById('partModal')).show();
            }
        } else if (event.target.classList.contains('add-option')) {
            const partId = event.target.dataset.id;
            document.getElementById('part-option-id').value = '';
            document.getElementById('part-option-part').value = partId;
            document.getElementById('part-option-form').reset();
            document.getElementById('partOptionModalLabel').textContent = 'Add Part Option';
            document.getElementById('deletePartOptionBtn').style.display = 'none';
            new bootstrap.Modal(document.getElementById('partOptionModal')).show();
        } else if (event.target.classList.contains('edit-option')) {
            const optionId = event.target.dataset.id;
            const part = parts.find(p => p.options.some(o => o._id === optionId));
            const option = part.options.find(o => o._id === optionId);
            if (option) {
                document.getElementById('part-option-id').value = option._id;
                document.getElementById('part-option-part').value = part._id;
                document.getElementById('part-option-name').value = option.name;
                document.getElementById('part-option-description').value = option.description;
                document.getElementById('part-option-cost').value = option.cost;
                document.getElementById('partOptionModalLabel').textContent = 'Edit Part Option';
                document.getElementById('deletePartOptionBtn').style.display = 'block';
                new bootstrap.Modal(document.getElementById('partOptionModal')).show();
            }
        }
    });

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const description = document.getElementById('product-description').value;
        const available = document.getElementById('product-available').checked;

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
        document.getElementById('selected-product-availability').textContent = available ? 'Available' : 'Unavailable';
        
        await fetchParts();
        await fetchCombinationRules();
        await fetchPriceRules();

        document.getElementById('editProductBtn').style.display = 'block';
        document.getElementById('editProductBtn').disabled = false;
        managePartsSection.classList.remove('d-none');
        manageCombinationRulesSection.classList.remove('d-none');
        managePriceRulesSection.classList.remove('d-none');

        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    });

    document.getElementById('addCombinationRuleBtn').addEventListener('click', () => {
        document.getElementById('combination-rule-id').value = '';
        document.getElementById('combinationRuleModalLabel').textContent = 'Add Combination Rule';
        document.getElementById('combination-rule-form').reset();
        document.getElementById('deleteCombinationRuleBtn').style.display = 'none';
        new bootstrap.Modal(document.getElementById('combinationRuleModal')).show();
    });

    document.getElementById('addPriceRuleBtn').addEventListener('click', () => {
        document.getElementById('price-rule-id').value = '';
        document.getElementById('priceRuleModalLabel').textContent = 'Add Price Rule';
        document.getElementById('price-rule-form').reset();
        document.getElementById('deletePriceRuleBtn').style.display = 'none';
        new bootstrap.Modal(document.getElementById('priceRuleModal')).show();
    });

    document.getElementById('combination-rules-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-combination-rule')) {
            const id = event.target.dataset.id;
            const partOptions = event.target.dataset.partOptions;
            const condition = event.target.dataset.condition;
            editCombinationRule(id, partOptions, condition);
        }
    });

    document.getElementById('price-rules-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-price-rule')) {
            const id = event.target.dataset.id;
            const partOptions = event.target.dataset.partOptions;
            const modifiedPrice = event.target.dataset.modifiedPrice;
            editPriceRule(id, partOptions, modifiedPrice);
        }
    });

    document.getElementById('deleteProductBtn').addEventListener('click', async () => {
        const id = document.getElementById('product-id').value;
        await deleteProduct(id);
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        location.reload();
    });

    await fetchProducts();
});
