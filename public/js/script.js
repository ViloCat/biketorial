document.addEventListener('DOMContentLoaded', async () => {
    const partsContainer = document.getElementById('parts-container');
    const partOptionsContainer = document.getElementById('part-options-container');
    const totalPriceElement = document.getElementById('total-price');
    const alertMessageElement = document.getElementById('alert-message');
    const submitButton = document.getElementById('submit-button');
    const navbar = document.getElementById('navbar');
    const productDropdown = document.getElementById('productDropdown');
    const addToCartButton = document.getElementById('submit-button');
    const placeOrderButton = document.getElementById('place-order-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountElement = document.getElementById('cart-count');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const emptyCartButton = document.getElementById('empty-cart-btn');
    const orderForm = document.getElementById('order-form');

    let combinationRules = [];
    let priceRules = [];
    let partOptions = [];
    let selectedProductId = null;
    let products = [];

    const fetchProducts = async () => {
        const response = await fetch('/api/products');
        products = await response.json();
        products.forEach(product => {
            const productLink = document.createElement('a');
            productLink.href = '#';
            productLink.classList.add('dropdown-item');
            productLink.textContent = product.name;
            productLink.dataset.id = product._id;
            productLink.addEventListener('click', () => {
                selectedProductId = product._id;
                fetchParts();
                fetchCombinationRules();
                fetchPriceRules();
                updateNavbarSelection(product._id);
            });
            navbar.appendChild(productLink);
        });
    };

    const updateNavbarSelection = (productId) => {
        const selectedProduct = products.find(p => p._id === productId);
        if (selectedProduct) {
            productDropdown.textContent = selectedProduct.name;
            document.querySelector('input[name="productId"]').value = selectedProduct._id;
        } else {
            productDropdown.textContent = 'Products';
            document.querySelector('input[name="productId"]').value = '';
        }
        const links = navbar.querySelectorAll('a');
        links.forEach(link => {
            if (link.textContent === selectedProduct.name) {
                link.classList.add('selected');
            } else {
                link.classList.remove('selected');
            }
        });
    };

    const fetchParts = async () => {
        if (!selectedProductId) return;
        const response = await fetch(`/api/parts?productId=${selectedProductId}`);
        const parts = await response.json();
        partsContainer.innerHTML = '';
        partOptionsContainer.innerHTML = '';
        partOptions = [];

        if (parts.length === 0) {
            orderForm.style.display = 'none';
        } else {
            orderForm.style.display = 'block';
        }

        parts.forEach(part => {
            const partGroupDiv = document.createElement('div');
            partGroupDiv.classList.add('mb-3');

            const partTitle = document.createElement('h4');
            partTitle.innerHTML = `${part.name} <small class="text-muted">${part.description}</small>`;
            partGroupDiv.appendChild(partTitle);

            const listGroup = document.createElement('div');
            listGroup.classList.add('list-group');

            part.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('list-group-item');

                optionDiv.innerHTML = `
                    <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" name="partOptions" value="${option._id}" data-cost="${option.cost}">
                        ${option.name} - ${option.description} (${option.cost} EUR)
                    </label>
                `;
                listGroup.appendChild(optionDiv);
                partOptions.push(option);
            });

            partGroupDiv.appendChild(listGroup);
            partOptionsContainer.appendChild(partGroupDiv);
        });

        document.querySelectorAll('input[name="partOptions"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                calculateTotalPrice();
            });
        });

        submitButton.disabled = true;
    };

    const fetchCombinationRules = async () => {
        if (!selectedProductId) return;
        const response = await fetch(`/api/combination-rules?productId=${selectedProductId}`);
        combinationRules = await response.json();
    };

    const fetchPriceRules = async () => {
        if (!selectedProductId) return;
        const response = await fetch(`/api/price-rules?productId=${selectedProductId}`);
        priceRules = await response.json();
    };

    const calculateTotalPrice = () => {
        let totalPrice = 0;
        const selectedOptions = Array.from(document.querySelectorAll('input[name="partOptions"]:checked')).map(checkbox => checkbox.value);
        alertMessageElement.innerHTML = '';
        selectedOptions.forEach(optionId => {
            const option = partOptions.find(opt => opt._id === optionId);
            if (option) {
                totalPrice += option.cost;
            }
        });

        priceRules.forEach(rule => {
            const ruleApplies = rule.partOptions.every(option => selectedOptions.includes(option._id));
            if (ruleApplies) {
                totalPrice += rule.modifiedPrice;
                alertMessageElement.innerHTML += `- Price rule applied: ${rule.modifiedPrice >= 0 ? '+' : ''}${rule.modifiedPrice} EUR<br>`;
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
            if (rule.condition === 'incompatible') {
                const conflictingSelectedOptions = rule.partOptions.filter(option => selectedOptions.includes(option._id));
                if (conflictingSelectedOptions.length === rule.partOptions.length - 1) {
                    rule.partOptions.forEach(opt => {
                        if (!selectedOptions.includes(opt._id)) {
                            const checkbox = document.querySelector(`input[name="partOptions"][value="${opt._id}"]`);
                            if (checkbox) {
                                checkbox.disabled = true;
                                checkbox.parentNode.style.color = 'lightgray';
                                alertMessageElement.innerHTML += `- Option "${opt.name}" has been disabled because it cannot be combined with the selected item(s): ${conflictingSelectedOptions.map(opt => opt.name).join(', ')}.<br>`;
                            }
                        }
                    });
                }
            } else if (rule.condition === 'exclusive') {
                const selectedExclusiveOptions = rule.partOptions.filter(option => selectedOptions.includes(option._id));
                if (selectedExclusiveOptions.length > 0) {
                    rule.partOptions.forEach(opt => {
                        if (!selectedOptions.includes(opt._id)) {
                            const checkbox = document.querySelector(`input[name="partOptions"][value="${opt._id}"]`);
                            if (checkbox) {
                                checkbox.disabled = true;
                                checkbox.parentNode.style.color = 'lightgray';
                                alertMessageElement.innerHTML += `- Option "${opt.name}" cannot be selected with other exclusive options.<br>`;
                            }
                        }
                    });
                }
            }
        });

        return isValid;
    };

    const fetchCart = async () => {
        const response = await fetch('/customer/order/in_cart');
        if (response.ok) {
            const order = await response.json();
            if (order.status != 'not_found') {
                updateCartUI(order);
            } else {
                emptyCartButton.style.display = 'none';
                placeOrderButton.disabled = true;
            }
        }
    };

    const updateCartUI = (order) => {
        cartItemsContainer.innerHTML = '';
        order.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <h5>${item.product ? item.product.name : 'Unknown'}</h5>
                <ul>
                    ${item.partOptions.map(option => `<li>${option.part.name}: ${option.name} (${option.cost} EUR)</li>`).join('')}
                </ul>
                <p>Subtotal: ${item.subtotalPrice.toFixed(2)} EUR</p>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
        cartCountElement.textContent = order.items.length;
        cartTotalPriceElement.textContent = order.totalPrice.toFixed(2);

        if (order.items.length > 0) {
            emptyCartButton.style.display = 'block';
            placeOrderButton.disabled = false;
        } else {
            emptyCartButton.style.display = 'none';
            placeOrderButton.disabled = true;
        }
    };

    addToCartButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const selectedOptions = Array.from(document.querySelectorAll('input[name="partOptions"]:checked')).map(checkbox => checkbox.value);
        const productId = document.querySelector('input[name="productId"]').value;

        const response = await fetch('/customer/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ partOptions: selectedOptions, productId })
        });

        if (response.ok) {
            const order = await response.json();
            updateCartUI(order);

            document.querySelectorAll('input[name="partOptions"]:checked').forEach(checkbox => {
                checkbox.checked = false;
            });

            calculateTotalPrice();
        } else {
            const error = await response.text();
            alert(`Failed to add to cart: ${error}`);
        }
    });

    placeOrderButton.addEventListener('click', async () => {
        const response = await fetch('/customer/order/complete', {
            method: 'POST'
        });

        if (response.ok) {
            const emptyOrder = { items: [], totalPrice: 0 };
            updateCartUI(emptyOrder);
        } else {
            const error = await response.text();
            alert(`Failed to place order: ${error}`);
        }
    });

    emptyCartButton.addEventListener('click', async () => {
        const response = await fetch('/customer/order/empty', {
            method: 'DELETE'
        });

        if (response.ok) {
            const emptyOrder = { items: [], totalPrice: 0 };
            updateCartUI(emptyOrder);
        } else {
            const error = await response.text();
            alert(`Failed to empty cart: ${error}`);
        }
    });

    await fetchProducts();
    await fetchParts();
    await fetchCart();
});
