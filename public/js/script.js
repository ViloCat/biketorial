document.addEventListener('DOMContentLoaded', async () => {
    const partsContainer = document.getElementById('parts-container');
    const partOptionsContainer = document.getElementById('part-options-container');
    const totalPriceElement = document.getElementById('total-price');
    const alertMessageElement = document.getElementById('alert-message');
    const submitButton = document.getElementById('submit-button');
    let combinationRules = [];
    let priceRules = [];
    let partOptions = [];

    // Fetch parts and their options
    const fetchParts = async () => {
        const response = await fetch('/api/parts');
        const parts = await response.json();

        parts.forEach(part => {
            const partDiv = document.createElement('div');
            partDiv.innerHTML = `<h3>${part.name}</h3><p>${part.description}</p>`;
            
            part.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.innerHTML = `
                    <label>
                        <input type="checkbox" name="partOptions" value="${option._id}" data-cost="${option.cost}">
                        ${option.name} - ${option.cost} USD
                    </label>
                `;
                partOptionsContainer.appendChild(optionDiv);
                partOptions.push(option);
            });

            partsContainer.appendChild(partDiv);
        });
    };

    // Fetch combination rules
    const fetchCombinationRules = async () => {
        const response = await fetch('/api/combination-rules');
        combinationRules = await response.json();
    };

    // Fetch price rules
    const fetchPriceRules = async () => {
        const response = await fetch('/api/price-rules');
        priceRules = await response.json();
    };

    const calculateTotalPrice = () => {
        let totalPrice = 0;
        const selectedOptions = Array.from(document.querySelectorAll('input[name="partOptions"]:checked')).map(checkbox => checkbox.value);
        alertMessageElement.textContent = '';

        selectedOptions.forEach(optionId => {
            const option = partOptions.find(opt => opt._id === optionId);
            if (option) {
                totalPrice += option.cost;
            }
        });

        // Apply price rules
        priceRules.forEach(rule => {
            const ruleApplies = rule.partOptions.every(option => selectedOptions.includes(option._id));
            if (ruleApplies) {
                totalPrice += rule.modifiedPrice;
                alertMessageElement.textContent += `Price rule applied: ${rule.modifiedPrice >= 0 ? '+' : ''}${rule.modifiedPrice} USD\n`;
            }
        });

        totalPriceElement.textContent = totalPrice;
        const isValidOrder = validateOrder(selectedOptions);
        submitButton.disabled = selectedOptions.length === 0 || !isValidOrder;
    };

    const validateOrder = (selectedOptions) => {
        let isValid = true;
        const checkboxes = document.querySelectorAll('input[name="partOptions"]');

        checkboxes.forEach(checkbox => {
            checkbox.disabled = false;
            checkbox.parentNode.style.color = '';
        });

        combinationRules.forEach(rule => {
            if (rule.condition === 'forbidden') {
                const conflictingSelectedOptions = rule.partOptions.filter(option => selectedOptions.includes(option._id));
                if (conflictingSelectedOptions.length > 0) {
                    rule.partOptions.forEach(opt => {
                        if (!selectedOptions.includes(opt._id)) {
                            const checkbox = document.querySelector(`input[name="partOptions"][value="${opt._id}"]`);
                            if (checkbox) {
                                checkbox.disabled = true;
                                checkbox.parentNode.style.color = 'red';
                                alertMessageElement.textContent += `Option "${opt.name}" has been disabled because it cannot be combined with the selected item(s): ${conflictingSelectedOptions.map(opt => opt.name).join(', ')}.\n`;
                            }
                        }
                    });
                }
            }
        });

        combinationRules.forEach(rule => {
            if (rule.condition === 'forbidden') {
                const forbidden = rule.partOptions.every(option => selectedOptions.includes(option._id));
                if (forbidden) {
                    isValid = false;
                }
            }
        });

        return isValid;
    };

    // Handle order form submission
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const selectedOptions = Array.from(orderForm.elements['partOptions']).filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

        if (!validateOrder(selectedOptions)) {
            alert('Order contains forbidden combination of part options');
            return;
        }

        const orderResponse = await fetch('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ partOptions: selectedOptions })
        });

        if (orderResponse.ok) {
            alert('Order placed successfully!');
        } else {
            const error = await orderResponse.text();
            alert(`Failed to place order: ${error}`);
        }
    });

    // Fetch all data
    await fetchParts();
    await fetchCombinationRules();
    await fetchPriceRules();

    // Add event listeners to checkboxes for calculating total price and validating order
    document.querySelectorAll('input[name="partOptions"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            calculateTotalPrice();
        });
    });

    // Initial validation
    calculateTotalPrice();
});
