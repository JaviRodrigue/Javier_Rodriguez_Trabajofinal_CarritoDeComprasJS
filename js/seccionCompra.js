// variables de mi programa
const items = document.getElementById("items");
const templateCards = document.getElementById("template-card").content;
const fragment = document.createDocumentFragment();
const itemCarrito = document.getElementById("itemCarrito");
const itemCarritoFooter = document.getElementById("pieDeTabla");
const templateFoo = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;

let carrito = {};

//Cargo primero el html para que se vean los productos
document.addEventListener("DOMContentLoaded",()=>{
    fetchData();
    if(localStorage.getItem("carrito")){
        carrito = JSON.parse(localStorage.getItem("carrito"));
        mostrarProductoCarrito();
    }
})

// a traves de este evento se llamara a la funcion agregarCarrito que agregara un producto al carrito
items.addEventListener("click", evento =>{
    agregarCarrito(evento);
})

// A traves de este evento llamo a la funcion btnAccion, efectuara la accion de agregar o eliminar un producto del carrito
itemCarrito.addEventListener("click",evento =>{
    btnAccion(evento);
})

const fetchData = async () =>{
    try{
        const respuesta = await fetch("../js/api.json");
        const dato = await respuesta.json();
        mostrarProducto(dato);
    }catch(error){
        console.log("error en catch")
    }
}


// esta function arrow mostrara los productos en la pagina web
const mostrarProducto = dato =>{
    dato.forEach(producto =>{
        templateCards.querySelector(`h4`).textContent = producto.nombre;
        templateCards.querySelector(`p`).textContent = producto.precio;
        templateCards.querySelector(`img`).setAttribute("src",producto.url);
        // Con la siguiente propiedad puedo darle el atributo de data-id al button en el html para trabajarlo
        templateCards.querySelector(`.btn-dark`).dataset.id = producto.id;
        // creo un clon de mi template para mas tarde agregarlo a mi fragment
        const clone = templateCards.cloneNode(true);
        fragment.appendChild(clone);
        

    })
    // agrego el fragment al items, que sera donde se visualizara los productos
    items.appendChild(fragment);

}


// a traves de la funcion agregarCarrito agrego el producto de data-id del boton
const agregarCarrito = e =>{
    if(e.target.classList.contains(`btn-dark`)){
        colocarCarrito(e.target.parentElement);
    }
    e.stopPropagation();
}


const colocarCarrito = obj =>{
    const producto = {
        id: obj.querySelector(`.btn-dark`).dataset.id,
        nombre: obj.querySelector(`h4`).textContent,
        precio: obj.querySelector(`p`).textContent,
        cantidad: 1
    }
    
    // en este algoritmo pregunto si el producto del id seleccionado ya existe en mi carrito, si existe, se agrega uno al producto
    if(carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    // a continuacion realizo una copia de producto
    carrito[producto.id] = {...producto};

    // utilizo la libreria Toastify para aparezca un mensaje cada vez que se compre un producto
    const burgerSeleccionada = obj.querySelector("h4").textContent;
    Toastify({
        text: `${burgerSeleccionada}\nAgregado Correctamente`,
        duration: 1000,
        gravity: "bottom", 
        position: "right", 
        style: {
            background: "linear-gradient(90deg, rgba(128,17,17,1) 0%, rgba(255,110,0,1) 0%, rgba(148,21,21,1) 87%)",
        },
    }).showToast();

    mostrarProductoCarrito();
}


// coloco los productos de mi carrito en el html recorriendolos con un forEach
const mostrarProductoCarrito = () =>{
    itemCarrito.innerHTML="";
    Object.values(carrito).forEach(producto =>{
        templateCarrito.querySelector("th").textContent = producto.id;
        templateCarrito.querySelectorAll("td")[0].textContent = producto.nombre;
        templateCarrito.querySelectorAll("td")[1].textContent = producto.cantidad;
        templateCarrito.querySelector(".btn-info").dataset.id = producto.id;
        templateCarrito.querySelector(".btn-danger").dataset.id = producto.id;
        templateCarrito.querySelector("span").textContent = producto.cantidad * producto.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);

    })

    itemCarrito.appendChild(fragment);

    pintarFooter();

    // Guardo los productos en el localStorage

    localStorage.setItem("carrito",JSON.stringify(carrito));

}


// Esta funcion pintara la parte inferior de mi tabla de carrito
const pintarFooter = () =>{
    // Si el carrito esta vacion, entonces mostrara ek mensaje de carrito vacio y con el return se termina la funcion, haciendo que todo lo que este abajo no se ejecute de la funcion
    itemCarritoFooter.innerHTML="";
    if(Object.keys(carrito).length === 0){
        itemCarritoFooter.innerHTML=`<th scope="row" colspan="5">Carrito Vacio</th>`
        return
    }

    // sumo la cantidad de productos que hay en mi carrito
    const sumandoCantidad = Object.values(carrito).reduce((acc,{cantidad})=> acc + cantidad,0);
    // Sumo el total del precio del carrito
    const sumaPrecio = Object.values(carrito).reduce((acc,{cantidad,precio})=> acc + cantidad * precio,0);

    // Los agrego en el html
    templateFoo.querySelectorAll("td")[0].textContent = sumandoCantidad;
    templateFoo.querySelector("span").textContent = sumaPrecio;

    const clone = templateFoo.cloneNode(true);

    fragment.appendChild(clone);
    itemCarritoFooter.appendChild(fragment);

    // Agrego el funcionamiento del boton vaciar carrito, le agrego un evento
    const botonVaciarCarrito = document.getElementById("vaciar-carrito");
    const botonComprar = document.getElementById("finalizar-compra");
    botonVaciarCarrito.addEventListener("click",() =>{
        carrito = {};
        mostrarProductoCarrito();
    })
    botonComprar.addEventListener("click",()=>{
        Swal.fire({
            title:"Cuenta Final",
            text:`$${sumaPrecio}`,
            imageWidth:600,
            confirmButtonText:"Close",
        })
        carrito = {};
        mostrarProductoCarrito();
    })
}

// funcion para agregar un producto o disminuir/eliminar un producto
const btnAccion = e =>{
    if(e.target.classList.contains("btn-info")){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad ++
        carrito[e.target.dataset.id] = {...producto};
        mostrarProductoCarrito();
    }

    if(e.target.classList.contains("btn-danger")){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad --
        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id];
        }
        mostrarProductoCarrito();
    }
    e.stopPropagation();
}