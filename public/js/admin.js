document.addEventListener('DOMContentLoaded', async () => {
    const partsList = document.getElementById('parts-list');
    const partForm = document.getElementById('part-form');
    const partOptionForm = document.getElementById('part-option-form');
    const partOptionsList = document.getElementById('part-options-list');
    const partOptionPartSelect = document.getElementById('part-option-part');
    
    const combinationRuleForm = document.getElementById('combination-rule-form');
    const combinationRulesList = document.getElementById('combination-rules-list');
    const combinationRulePartOptionsSelect = document.getElementById('combination-rule-part-options');

    const priceRuleForm = document.getElementById('price-rule-form');
    const priceRulesList = document.getElementById('price-rules-list');
    const priceRulePartOptionsSelect = document.getElementById('price-rule-part-options');

    let parts = [];

    // Fetch and store parts data
    const fetchParts = async () => {
        const response = await fetch('/api/parts');
        parts = await response.json();
        displayParts();
        populatePartOptions();
    };

    // Display parts and their options
    const displayParts = () => {
        partsList.innerHTML = '';
        parts.forEach(part => {
            const partDiv = document.createElement('div');
            partDiv.innerHTML = `
                <h3>${part.name}</h3>
                <p>${part.description}</p>
                <button onclick="editPart('${part._id}', '${part.name}', '${part.description}')">Edit</button>
                <button onclick="deletePart('${part._id}')">Delete</button>
            `;
            partsList.appendChild(partDiv);
        });
    };

    // Populate part options in the forms
    const populatePartOptions = () => {
        partOptionPartSelect.innerHTML = '';
        combinationRulePartOptionsSelect.innerHTML = '';
        priceRulePartOptionsSelect.innerHTML = '';

        parts.forEach(part => {
            const option = document.createElement('option');
            option.value = part._id;
            option.textContent = part.name;
            partOptionPartSelect.appendChild(option);

            part.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option._id;
                optionElement.textContent = `${part.name}: ${option.name}`;
                combinationRulePartOptionsSelect.appendChild(optionElement);
                priceRulePartOptionsSelect.appendChild(optionElement.cloneNode(true));
            });
        });

        fetchPartOptions();
    };

    // Fetch and display part options
    const fetchPartOptions = () => {
        partOptionsList.innerHTML = '';
        parts.forEach(part => {
            part.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.innerHTML = `
                    <h4>${part.name}: ${option.name}</h4>
                    <p>${option.description} - ${option.cost} USD</p>
                    <button onclick="editPartOption('${option._id}', '${part._id}', '${option.name}', '${option.description}', ${option.cost})">Edit</button>
                    <button onclick="deletePartOption('${option._id}')">Delete</button>
                `;
                partOptionsList.appendChild(optionDiv);
            });
        });
    };

    // Fetch and display combination rules
    const fetchCombinationRules = async () => {
        const response = await fetch('/api/combination-rules');
        const rules = await response.json();
        combinationRulesList.innerHTML = '';

        rules.forEach(rule => {
            const ruleDiv = document.createElement('div');
            const options = rule.partOptions.map(option => option.name).join(', ');
            ruleDiv.innerHTML = `
                <h4>Condition: ${rule.condition}</h4>
                <p>Part Options: ${options}</p>
                <button onclick="editCombinationRule('${rule._id}', '${rule.partOptions.map(option => option._id).join(',')}', '${rule.condition}')">Edit</button>
                <button onclick="deleteCombinationRule('${rule._id}')">Delete</button>
            `;
            combinationRulesList.appendChild(ruleDiv);
        });
    };

    // Fetch and display price rules
    const fetchPriceRules = async () => {
        const response = await fetch('/api/price-rules');
        const rules = await response.json();
        priceRulesList.innerHTML = '';

        rules.forEach(rule => {
            const ruleDiv = document.createElement('div');
            const options = rule.partOptions.map(option => option.name).join(', ');
            ruleDiv.innerHTML = `
                <h4>Modified Price: ${rule.modifiedPrice} USD</h4>
                <p>Part Options: ${options}</p>
                <button onclick="editPriceRule('${rule._id}', '${rule.partOptions.map(option => option._id).join(',')}', ${rule.modifiedPrice})">Edit</button>
                <button onclick="deletePriceRule('${rule._id}')">Delete</button>
            `;
            priceRulesList.appendChild(ruleDiv);
        });
    };

    // Handle part form submission
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
                body: JSON.stringify({ name, description })
            });
        } else {
            await fetch('/admin/parts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });
        }

        partForm.reset();
        await fetchParts();
    });

    // Handle part option form submission
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
                body: JSON.stringify({ part, name, description, cost })
            });
        } else {
            await fetch('/admin/part-options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ part, name, description, cost })
            });
        }

        partOptionForm.reset();
        fetchPartOptions();
    });

    // Handle combination rule form submission
    combinationRuleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('combination-rule-id').value;
        const partOptions = Array.from(document.getElementById('combination-rule-part-options').selectedOptions).map(option => option.value);
        const condition = document.getElementById('combination-rule-condition').value;

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
                body: JSON.stringify({ partOptions, condition })
            });
        }

        combinationRuleForm.reset();
        await fetchCombinationRules();
    });

    // Handle price rule form submission
    priceRuleForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('price-rule-id').value;
        const partOptions = Array.from(document.getElementById('price-rule-part-options').selectedOptions).map(option => option.value);
        const modifiedPrice = document.getElementById('price-rule-modified-price').value;

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
                body: JSON.stringify({ partOptions, modifiedPrice })
            });
        }

        priceRuleForm.reset();
        await fetchPriceRules();
    });

    // Edit part
    window.editPart = (id, name, description) => {
        document.getElementById('part-id').value = id;
        document.getElementById('part-name').value = name;
        document.getElementById('part-description').value = description;
    };

    // Delete part
    window.deletePart = async (id) => {
        await fetch(`/admin/parts/${id}`, { method: 'DELETE' });
        await fetchParts();
    };

    // Edit part option
    window.editPartOption = (id, part, name, description, cost) => {
        document.getElementById('part-option-id').value = id;
        document.getElementById('part-option-part').value = part;
        document.getElementById('part-option-name').value = name;
        document.getElementById('part-option-description').value = description;
        document.getElementById('part-option-cost').value = cost;
    };

    // Delete part option
    window.deletePartOption = async (id) => {
        await fetch(`/admin/part-options/${id}`, { method: 'DELETE' });
        fetchPartOptions();
    };

    // Edit combination rule
    window.editCombinationRule = (id, partOptions, condition) => {
        document.getElementById('combination-rule-id').value = id;
        Array.from(document.getElementById('combination-rule-part-options').options).forEach(option => {
            option.selected = partOptions.split(',').includes(option.value);
        });
        document.getElementById('combination-rule-condition').value = condition;
    };

    // Delete combination rule
    window.deleteCombinationRule = async (id) => {
        await fetch(`/admin/combination-rules/${id}`, { method: 'DELETE' });
        await fetchCombinationRules();
    };

    // Edit price rule
    window.editPriceRule = (id, partOptions, modifiedPrice) => {
        document.getElementById('price-rule-id').value = id;
        Array.from(document.getElementById('price-rule-part-options').options).forEach(option => {
            option.selected = partOptions.split(',').includes(option.value);
        });
        document.getElementById('price-rule-modified-price').value = modifiedPrice;
    };

    // Delete price rule
    window.deletePriceRule = async (id) => {
        await fetch(`/admin/price-rules/${id}`, { method: 'DELETE' });
        await fetchPriceRules();
    };

    await fetchParts();
    await fetchCombinationRules();
    await fetchPriceRules();
});
