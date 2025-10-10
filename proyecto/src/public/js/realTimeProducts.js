const socket = io();
const productList = document.getElementById('realTimeProductsList');
const addForm = document.getElementById('addProductForm');
const deleteForm = document.getElementById('deleteProductForm');

const renderProducts = (products) => {
    productList.innerHTML = '';
    if (products.length === 0) {
        productList.innerHTML = '<li><strong> No hay productos para mostrar</strong></li>';
        return;
    }

    products.forEach(product => {
        const li = document.createElement('li');
        li.id = `product-${product.id}`;
        li.innerHTML = `
            <strong>ID: ${product.id}  Nombre: ${product.title} </strong>
            Precio: ${product.price} Descripcion: ${product.description}
            Codigo: ${product.code} Stock: ${product.stock}
        `;
        productList.appendChild(li);
    });
};


socket.on('productos', renderProducts); 
socket.on('productsUpdate', (updateProducts) => {
    console.log("Productos actualizados", updateProducts);
    renderProducts(updateProducts);
});


addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);
    const productData = {};
    formData.forEach((value, key) => {
        if (key === 'price' || key === 'stock') {
            productData[key] = Number(value);
        } else {
            productData[key] = value;
        }
    });
    try {
        const response = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const result = await response.json();
        if(!response.ok){
            throw new Error(result.error || 'Error al agregar el producto ');
        }
        addForm.reset();
        
    } catch (error) {
        console.error('Error al agregar el producto error:',error)
        
    }
    
});

deleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(deleteForm);
    const id = Number(formData.get('id'));
    
    if (isNaN(id) || id <= 0) {
        alert("Por favor ingrese un ID válido");
        return;
    }

    try {
        const response  = await fetch(`/api/productos/${id}`,{
            method:'DELETE'
        })

        const result = await response.json();
        if(!response.ok){
            throw new Error(result.error || 'Error al eliminar el producto ');
        }
        deleteForm.reset();
    } catch (error) {

        console.error('Error al eliminar el producto error:',error)
        
    }
});


socket.on('product-error', (data) => {
    alert(data.message); 
});