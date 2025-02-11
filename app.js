/************************************
 * Variables y Estructuras
 ************************************/
let usuarios = [
  { nombre: "Arturo",    bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Carlos",    bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Edgar",     bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Francisco", bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Irvin",     bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Isac",      bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Isrrael",   bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Karen",     bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Laura",     bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Marcos",    bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Rafael",    bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Vicente",   bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
  { nombre: "Externo",   bloqueado: false, adeudo: 0, ganancia: 0, saldoFavor: 0 },
];

let historialCompras = {};
usuarios.forEach(u => {
  historialCompras[u.nombre] = [];
});

let numInversionistas   = usuarios.filter(u => u.nombre !== "Externo").length;
let totalInversion      = numInversionistas * 500;

// Variables monetarias globales
let gastoEnProductos    = 0;
let inversionRecuperada = 0;
let gananciasTotales    = 0;

// Lista de productos e historial de entradas
let productos         = [];
let historialEntradas = [];

// Carrito actual
let carrito = [];

/************************************
 * LOCAL STORAGE: Cargar / Guardar
 ************************************/
function loadFromLocalStorage() {
  try {
    let data = JSON.parse(localStorage.getItem("miAppVentasPWA"));
    if (!data) return;
    usuarios            = data.usuarios || usuarios;
    historialCompras    = data.historialCompras || historialCompras;
    numInversionistas   = data.numInversionistas || numInversionistas;
    totalInversion      = data.totalInversion || totalInversion;
    gastoEnProductos    = data.gastoEnProductos || 0;
    inversionRecuperada = data.inversionRecuperada || 0;
    gananciasTotales    = data.gananciasTotales || 0;
    productos           = data.productos || [];
    historialEntradas   = data.historialEntradas || [];
  } catch (e) {
    console.warn("Error al cargar desde localStorage:", e);
  }
}

function saveToLocalStorage() {
  const data = {
    usuarios,
    historialCompras,
    numInversionistas,
    totalInversion,
    gastoEnProductos,
    inversionRecuperada,
    gananciasTotales,
    productos,
    historialEntradas
  };
  localStorage.setItem("miAppVentasPWA", JSON.stringify(data));
}

function cargarDatosDeArchivos() {
  loadFromLocalStorage();
  console.log("Datos cargados desde localStorage.");
}
function guardarDatosEnArchivos() {
  saveToLocalStorage();
  console.log("Datos guardados en localStorage.");
}

/************************************
 * window.onload
 ************************************/
window.onload = () => {
  cargarDatosDeArchivos();

  // Llenar selects
  llenarSelectUsuarios("select-usuario");
  llenarSelectUsuarios("select-usuario-saldo");
  llenarSelectUsuarios("select-usuario-consulta");
  llenarSelectProductos("select-producto");
  llenarSelectProductos("select-entrada-producto");

  mostrarInventario();
  mostrarHistorialEntradas(historialEntradas);

  document.getElementById("select-usuario-saldo")
    .addEventListener("change", actualizarSaldoEnPantalla);

  // Detectar Enter en "codigo-producto"
  const inputCodigo = document.getElementById("codigo-producto");
  inputCodigo.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      agregarProductoPorCodigo();
    }
  });

  // Registrar SW
  registrarServiceWorker();

  // Notificar posibilidad de instalación
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("beforeinstallprompt disparado. La app puede instalarse.");
  });
};

/************************************
 * Registrar Service Worker
 ************************************/
function registrarServiceWorker() {
  if ("serviceWorker" in navigator) {
    const swCode = `
      self.addEventListener('install', (event) => {
        console.log('[Service Worker] Instalando...');
        event.waitUntil( self.skipWaiting() );
      });
      self.addEventListener('activate', (event) => {
        console.log('[Service Worker] Activado');
        event.waitUntil( self.clients.claim() );
      });
      self.addEventListener('fetch', (event) => {});
    `;
    const blob = new Blob([swCode], { type: "text/javascript" });
    const swURL = URL.createObjectURL(blob);

    navigator.serviceWorker
      .register(swURL)
      .then(() => console.log("Service Worker registrado dinámicamente."))
      .catch(err => console.error("Error al registrar SW:", err));
  } else {
    console.log("Service Worker no soportado en este navegador.");
  }
}

/************************************
 * Mostrar/Ocultar Secciones
 ************************************/
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(sec => sec.classList.remove("active"));
  document.getElementById(sectionId).classList.add("active");

  // Limpiar carrito si volvemos al menú principal
  if (sectionId === "main-menu") {
    carrito = [];
    const ventaBody = document.getElementById("tabla-venta").querySelector("tbody");
    if (ventaBody) ventaBody.innerHTML = "";
    const totalVenta = document.getElementById("total-venta");
    if (totalVenta) totalVenta.innerText = formatMoney(0);
  }
}

/************************************
 * Formato de Moneda
 ************************************/
function formatMoney(amount) {
  return "$" + amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/************************************
 * Llenar Selects
 ************************************/
function llenarSelectUsuarios(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  usuarios.forEach(u => {
    const option = document.createElement("option");
    option.value = u.nombre;
    option.text = u.nombre;
    select.appendChild(option);
  });
}

function llenarSelectProductos(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = "";
  productos.forEach(p => {
    const option = document.createElement("option");
    option.value = p.codigo;
    option.text = p.descripcion;
    select.appendChild(option);
  });
}

/************************************
 * Mostrar Inventario
 ************************************/
function mostrarInventario() {
  const tbody = document.getElementById("tabla-inventario").querySelector("tbody");
  tbody.innerHTML = "";

  productos.forEach((prod, index) => {
    const row = document.createElement("tr");
    if (prod.piezas === 0) {
      row.style.backgroundColor = "#ffd4d4"; // sin stock
    }
    row.innerHTML = `
      <td contenteditable="false">${prod.codigo}</td>
      <td contenteditable="false">${prod.descripcion}</td>
      <td contenteditable="false">${prod.precioCompra}</td>
      <td contenteditable="false">${prod.precioVenta}</td>
      <td contenteditable="false">${prod.piezas}</td>
      <td>
        <button class="btn" onclick="habilitarEdicion(${index}, this)">Editar</button>
        <button class="btn-cancel" onclick="eliminarProducto(${index})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function habilitarEdicion(index, btn) {
  let pin = prompt("Ingresa PIN para editar el producto:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }
  const row = btn.parentNode.parentNode;
  const cells = row.querySelectorAll("td[contenteditable='false']");
  cells.forEach(cell => cell.setAttribute("contenteditable", "true"));
  btn.textContent = "Guardar";
  btn.onclick = () => guardarEdicion(index, btn);
}

function guardarEdicion(index, btn) {
  const row = btn.parentNode.parentNode;
  const cells = row.querySelectorAll("td");
  const codigo       = cells[0].textContent.trim();
  const descripcion  = cells[1].textContent.trim();
  const precioCompra = parseFloat(cells[2].textContent.trim());
  const precioVenta  = parseFloat(cells[3].textContent.trim());
  const piezas       = parseInt(cells[4].textContent.trim());

  if (!codigo || !descripcion || isNaN(precioCompra) || isNaN(precioVenta) || isNaN(piezas)) {
    alert("Datos inválidos. Revisa los campos.");
    return;
  }

  let pin = prompt("Ingresa PIN para confirmar cambios:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }

  productos[index].codigo       = codigo;
  productos[index].descripcion  = descripcion;
  productos[index].precioCompra = precioCompra;
  productos[index].precioVenta  = precioVenta;
  productos[index].piezas       = piezas;

  cells.forEach(cell => cell.setAttribute("contenteditable", "false"));
  btn.textContent = "Editar";
  btn.onclick = () => habilitarEdicion(index, btn);

  guardarDatosEnArchivos();
  mostrarInventario();
  actualizarConsultaInversion();
  alert("Cambios guardados con éxito.");
}

function eliminarProducto(index) {
  let pin = prompt("Ingresa PIN para eliminar el producto:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }
  const prodEliminado = productos[index].descripcion;
  productos.splice(index, 1);

  guardarDatosEnArchivos();
  mostrarInventario();
  actualizarConsultaInversion();

  alert(`Producto "${prodEliminado}" eliminado.`);
}

/************************************
 * VENTAS
 ************************************/
function verificarUsuarioExterno() {
  const usuario    = document.getElementById("select-usuario").value;
  const selectPago = document.getElementById("select-pago");
  if (!selectPago) return;

  if (usuario === "Externo") {
    selectPago.value = "contado";
    for (let i = 0; i < selectPago.options.length; i++) {
      if (selectPago.options[i].value === "credito") {
        selectPago.options[i].disabled = true;
      }
    }
  } else {
    for (let i = 0; i < selectPago.options.length; i++) {
      if (selectPago.options[i].value === "credito") {
        selectPago.options[i].disabled = false;
      }
    }
  }
}

function agregarProductoVenta() {
  const usuario = document.getElementById("select-usuario").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (userObj.bloqueado) {
    alert(`El usuario ${usuario} está bloqueado.`);
    return;
  }

  const selectProducto = document.getElementById("select-producto");
  const codigoProd     = selectProducto.value;
  const productoObj    = productos.find(p => p.codigo === codigoProd);
  const cantidad       = parseInt(document.getElementById("cantidad-venta").value);

  if (!productoObj || cantidad <= 0) {
    alert("Verifique el producto y la cantidad.");
    return;
  }
  if (cantidad > productoObj.piezas) {
    alert(`No hay suficiente stock de "${productoObj.descripcion}". Disponible: ${productoObj.piezas}`);
    return;
  }

  let subtotal = productoObj.precioVenta * cantidad;
  const itemExistente = carrito.find(item => item.codigo === productoObj.codigo);

  if (itemExistente) {
    if (itemExistente.cantidad + cantidad > productoObj.piezas) {
      alert(`No hay suficiente stock de "${productoObj.descripcion}". 
Ya tienes ${itemExistente.cantidad} en el carrito y solo hay ${productoObj.piezas} en total.`);
      return;
    }
    itemExistente.cantidad  += cantidad;
    itemExistente.subtotal   = itemExistente.cantidad * itemExistente.precioUnitario;
  } else {
    carrito.push({
      codigo:         productoObj.codigo,
      descripcion:    productoObj.descripcion,
      cantidad,
      precioUnitario: productoObj.precioVenta,
      subtotal
    });
  }
  renderTablaVenta();
}

function agregarProductoPorCodigo() {
  const usuario = document.getElementById("select-usuario").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (userObj.bloqueado) {
    alert(`El usuario ${usuario} está bloqueado.`);
    return;
  }

  const codigoInput = document.getElementById("codigo-producto").value.trim();
  if (!codigoInput) return;

  const productoObj = productos.find(p => p.codigo === codigoInput);
  if (!productoObj) {
    alert(`No existe producto con código "${codigoInput}".`);
    return;
  }
  if (productoObj.piezas < 1) {
    alert(`No hay stock de "${productoObj.descripcion}".`);
    return;
  }

  const itemExistente = carrito.find(item => item.codigo === productoObj.codigo);
  if (itemExistente) {
    if (itemExistente.cantidad + 1 > productoObj.piezas) {
      alert(`No hay suficiente stock de "${productoObj.descripcion}". 
Ya tienes ${itemExistente.cantidad} y solo hay ${productoObj.piezas} en total.`);
      return;
    }
    itemExistente.cantidad  += 1;
    itemExistente.subtotal   = itemExistente.cantidad * itemExistente.precioUnitario;
  } else {
    carrito.push({
      codigo:         productoObj.codigo,
      descripcion:    productoObj.descripcion,
      cantidad:       1,
      precioUnitario: productoObj.precioVenta,
      subtotal:       productoObj.precioVenta
    });
  }
  document.getElementById("codigo-producto").value = "";
  renderTablaVenta();
}

function renderTablaVenta() {
  const tbody = document.getElementById("tabla-venta").querySelector("tbody");
  tbody.innerHTML = "";
  let total = 0;
  carrito.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.descripcion}</td>
      <td>${item.cantidad}</td>
      <td>${formatMoney(item.precioUnitario)}</td>
      <td>${formatMoney(item.subtotal)}</td>
      <td>
        <button class="btn-remove" onclick="eliminarDelCarrito(${index})">X</button>
      </td>
    `;
    total += item.subtotal;
    tbody.appendChild(row);
  });
  document.getElementById("total-venta").innerText = formatMoney(total);
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  renderTablaVenta();
}

function cancelarVenta() {
  carrito = [];
  const ventaBody = document.getElementById("tabla-venta").querySelector("tbody");
  if (ventaBody) ventaBody.innerHTML = "";
  document.getElementById("total-venta").innerText = formatMoney(0);
  showSection("main-menu");
}

function finalizarVenta() {
  if (carrito.length === 0) {
    alert("No hay productos en la venta.");
    return;
  }
  const total = document.getElementById("total-venta").innerText;
  document.getElementById("total-pago").innerText = total;
  showSection("tipo-pago");
}

/************************************
 * REGISTRAR COMPRA (DESCUENTA saldoFavor AUTOMÁTICAMENTE)
 ************************************/
function registrarCompra() {
  const totalStr  = document.getElementById("total-venta").innerText.replace(/[^\d.]/g, "");
  let totalCompra = parseFloat(totalStr) || 0; // variable modificable
  const formaPago = document.getElementById("select-pago").value;
  const usuario   = document.getElementById("select-usuario").value;
  const userObj   = usuarios.find(u => u.nombre === usuario);

  // Procesar cada item del carrito (descontar stock, calcular ganancia, etc.)
  carrito.forEach(item => {
    let prod = productos.find(p => p.codigo === item.codigo);
    if (!prod || prod.piezas < item.cantidad) return;
    prod.piezas -= item.cantidad;

    const { costoRecuperado, ganancia } = descontarStockParcial(prod, item.cantidad);
    inversionRecuperada += costoRecuperado;
    gananciasTotales    += ganancia;

    let fecha = new Date().toLocaleString();
    historialCompras[usuario].push({
      producto:   item.descripcion,
      piezas:     item.cantidad,
      costoTotal: item.subtotal,
      fecha,
      ganancia
    });

    // Suma de ganancia al usuario (a menos que sea Externo)
    if (usuario !== "Externo") {
      userObj.ganancia += ganancia;
    } else {
      // Repartir ganancia entre todos los internos
      let internos = usuarios.filter(u => u.nombre !== "Externo");
      let parte = ganancia / internos.length;
      internos.forEach(u => {
        u.ganancia += parte;
      });
    }
  });

  // NUEVO: Intentar cubrir la compra con saldo a favor
  if (userObj.saldoFavor > 0 && totalCompra > 0) {
    if (userObj.saldoFavor >= totalCompra) {
      // Cubre toda la compra con saldoFavor
      userObj.saldoFavor -= totalCompra;
      totalCompra = 0;
      alert(`Compra cubierta con saldo a favor. Saldo restante: ${formatMoney(userObj.saldoFavor)}`);
    } else {
      // Saldo a favor es parcial
      totalCompra -= userObj.saldoFavor;
      userObj.saldoFavor = 0;
      alert(`Parte de la compra se cubrió con saldo a favor. Resta por pagar: ${formatMoney(totalCompra)}`);
    }
  }

  // Si es crédito y no es Externo, lo que reste se va a adeudo
  if (usuario !== "Externo" && formaPago === "credito" && totalCompra > 0) {
    userObj.adeudo += totalCompra;
  }

  alert(`Compra registrada. Total: $${totalStr}. Pago: ${formaPago}`);

  // Reset carrito
  carrito = [];
  renderTablaVenta();
  mostrarInventario();
  guardarDatosEnArchivos();
  actualizarConsultaInversion();
  showSection("main-menu");
}

/************************************
 * Descontar stock parcial (FIFO)
 ************************************/
function descontarStockParcial(prod, cant) {
  let restante         = cant;
  let costoRecuperado = 0;
  let ganancia         = 0;
  
  if (!prod.stockParciales) {
    prod.stockParciales = [
      { cantidad: prod.piezas + cant, costoUnitario: prod.precioCompra }
    ];
  }

  while (restante > 0 && prod.stockParciales.length > 0) {
    let bloque = prod.stockParciales[0];
    if (bloque.cantidad <= 0) {
      prod.stockParciales.shift();
      continue;
    }
    let usar = Math.min(bloque.cantidad, restante);
    let cUnit = bloque.costoUnitario;
    costoRecuperado += usar * cUnit;
    ganancia        += usar * (prod.precioVenta - cUnit);
    bloque.cantidad -= usar;
    restante        -= usar;
    if (bloque.cantidad <= 0) {
      prod.stockParciales.shift();
    }
  }
  return { costoRecuperado, ganancia };
}

/************************************
 * ENTRADAS
 ************************************/
function agregarEntrada() {
  const codigoProd       = document.getElementById("select-entrada-producto").value;
  const cantidad         = parseInt(document.getElementById("cantidad-entrada").value);
  const costoTotalCompra = parseFloat(document.getElementById("costo-entrada").value);

  if (!codigoProd || cantidad <= 0 || costoTotalCompra < 0) {
    alert("Datos inválidos. Revisa producto, cantidad y costo.");
    return;
  }
  let prod = productos.find(p => p.codigo === codigoProd);
  if (!prod) {
    alert("Producto no encontrado.");
    return;
  }

  prod.piezas += cantidad;
  let costoUnit        = costoTotalCompra / cantidad;
  let nuevoPrecioVenta = costoUnit * 1.5;

  if (!prod.stockParciales) {
    prod.stockParciales = [];
  }
  prod.stockParciales.push({
    cantidad,
    costoUnitario: costoUnit
  });

  prod.precioCompra = parseFloat(costoUnit.toFixed(2));
  prod.precioVenta  = parseFloat(nuevoPrecioVenta.toFixed(2));

  gastoEnProductos += costoTotalCompra;

  let fecha = new Date().toLocaleString();
  historialEntradas.push({
    producto: prod.descripcion,
    cantidad,
    costoTotal: costoTotalCompra,
    fecha
  });

  alert(`Entrada registrada: +${cantidad} de ${prod.descripcion}. 
Costo unit: ${formatMoney(costoUnit)}, P. Venta: ${formatMoney(nuevoPrecioVenta)}`);

  mostrarInventario();
  mostrarHistorialEntradas(historialEntradas);
  guardarDatosEnArchivos();
  actualizarConsultaInversion();
}

/************************************
 * Verificar PIN para Nuevo Producto
 ************************************/
function verificarPin() {
  const pin = document.getElementById("pin-nuevo-producto").value;
  const seccionNuevoProd = document.getElementById("nueva-seccion-producto");
  if (pin === "2405") {
    seccionNuevoProd.classList.remove("hidden");
    alert("PIN correcto");
  } else {
    alert("PIN incorrecto");
  }
}

function agregarNuevoProducto() {
  const codigo       = document.getElementById("nuevo-codigo").value.trim();
  const descripcion  = document.getElementById("nuevo-descripcion").value.trim();
  const costo        = parseFloat(document.getElementById("nuevo-costo").value);
  const piezas       = parseInt(document.getElementById("nuevo-piezas").value);

  if (!codigo || !descripcion || costo < 0 || piezas <= 0) {
    alert("Datos inválidos para producto nuevo.");
    return;
  }
  const productoDuplicado = productos.find(
    p => p.codigo === codigo || p.descripcion === descripcion
  );
  if (productoDuplicado) {
    alert(`Ya existe un producto con este código o descripción: ${productoDuplicado.descripcion}.`);
    return;
  }

  let costoUnit   = costo / piezas;
  let precioVenta = costoUnit * 1.5;
  const nuevoProducto = {
    codigo,
    descripcion,
    precioCompra: parseFloat(costoUnit.toFixed(2)),
    precioVenta:  parseFloat(precioVenta.toFixed(2)),
    piezas,
    stockParciales: [
      { cantidad: piezas, costoUnitario: costoUnit }
    ]
  };
  productos.push(nuevoProducto);
  gastoEnProductos += costo;

  let fecha = new Date().toLocaleString();
  historialEntradas.push({
    producto: nuevoProducto.descripcion,
    cantidad: piezas,
    costoTotal: costo,
    fecha
  });

  llenarSelectProductos("select-producto");
  llenarSelectProductos("select-entrada-producto");
  mostrarInventario();
  guardarDatosEnArchivos();
  mostrarHistorialEntradas(historialEntradas);
  actualizarConsultaInversion();

  alert(`Producto "${descripcion}" agregado correctamente.`);
}

/************************************
 * Historial de Entradas
 ************************************/
function mostrarHistorialEntradas(lista) {
  const tbody = document.getElementById("tabla-historial-entradas").querySelector("tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  lista.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.producto}</td>
      <td>${item.cantidad}</td>
      <td>${formatMoney(item.costoTotal)}</td>
      <td>${item.fecha}</td>
    `;
    tbody.appendChild(row);
  });
}

/************************************
 * PAGAR SALDO
 ************************************/
function mostrarInputParcial() {
  const tipoPago = document.getElementById("select-tipo-pago-saldo").value;
  const parcialContainer = document.getElementById("pago-parcial-container");
  if (tipoPago === "parcial") {
    parcialContainer.classList.remove("hidden");
  } else {
    parcialContainer.classList.add("hidden");
  }
}

function pagarSaldo() {
  const usuario      = document.getElementById("select-usuario-saldo").value;
  const userObj      = usuarios.find(u => u.nombre === usuario);
  const tipoPago     = document.getElementById("select-tipo-pago-saldo").value;
  const inputParcial = document.getElementById("pago-parcial");
  let pin            = prompt("Ingresa PIN para confirmar el pago:");

  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }

  if (tipoPago === "total") {
    if (userObj.adeudo > 0) {
      userObj.adeudo = 0;
      alert(`El saldo de ${usuario} se pagó completamente.`);
    } else {
      alert(`El usuario ${usuario} no tiene adeudos.`);
    }
  } else {
    // Pago parcial
    const cantidadParcial = parseFloat(inputParcial.value);
    if (isNaN(cantidadParcial) || cantidadParcial <= 0) {
      alert("Cantidad no válida para pago parcial.");
      return;
    }
    if (cantidadParcial >= userObj.adeudo) {
      let diferencia = cantidadParcial - userObj.adeudo;
      userObj.adeudo = 0;
      userObj.saldoFavor += diferencia;
      alert(`Se pagó el adeudo y sobraron ${formatMoney(diferencia)} como saldo a favor.`);
    } else {
      userObj.adeudo -= cantidadParcial;
      alert(`Se pagaron ${formatMoney(cantidadParcial)}. Nuevo adeudo: ${formatMoney(userObj.adeudo)}.`);
    }
  }

  guardarDatosEnArchivos();
  actualizarSaldoEnPantalla();
  actualizarConsultaInversion();
}

function agregarSaldoFavor() {
  const usuario = document.getElementById("select-usuario-saldo").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  let pin = prompt("Ingresa PIN para agregar saldo a favor:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }
  let monto = parseFloat(prompt("Ingresa la cantidad de saldo a favor:"));
  if (isNaN(monto) || monto <= 0) {
    alert("Cantidad inválida.");
    return;
  }
  userObj.saldoFavor += monto;
  guardarDatosEnArchivos();
  alert(`Se agregaron ${formatMoney(monto)} de saldo a favor a ${usuario}.`);
  actualizarSaldoEnPantalla();
  actualizarConsultaInversion();
}

function bloquearUsuario() {
  const usuario = document.getElementById("select-usuario-saldo").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  let pin = prompt("Ingresa PIN para bloquear:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }
  userObj.bloqueado = true;
  alert(`El usuario ${usuario} fue bloqueado.`);
  guardarDatosEnArchivos();
}

function desbloquearUsuario() {
  const usuario = document.getElementById("select-usuario-saldo").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  let pin = prompt("Ingresa PIN para desbloquear:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }
  userObj.bloqueado = false;
  alert(`El usuario ${usuario} fue desbloqueado.`);
  guardarDatosEnArchivos();
}

function actualizarSaldoEnPantalla() {
  const usuario = document.getElementById("select-usuario-saldo").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (userObj) {
    document.getElementById("saldo-adeudo").innerText = formatMoney(userObj.adeudo);
  }
}

/************************************
 * CONSULTAS - INDIVIDUAL
 ************************************/
function filtrarInformacionUsuario() {
  const usuario           = document.getElementById("select-usuario-consulta").value;
  const consultaUsuarioDiv= document.getElementById("consulta-usuario");
  const fotoUsuario       = document.getElementById("foto-usuario");
  const nombreUsuario     = document.getElementById("nombre-usuario");
  const inversionUsuario  = document.getElementById("inversion-usuario");
  const gananciaUsuario   = document.getElementById("ganancia-usuario");
  const adeudoUsuario     = document.getElementById("adeudo-usuario-estado");
  const saldoFavorEl      = document.getElementById("saldo-favor-usuario");
  const tablaHistorial    = document.getElementById("tabla-historial").querySelector("tbody");

  consultaUsuarioDiv.classList.remove("hidden");
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (!userObj) return;

  fotoUsuario.src = `fotos/${userObj.nombre}.jpg`;
  fotoUsuario.alt = userObj.nombre;
  fotoUsuario.onerror = function() {
    this.onerror = null;
    this.src = "fotos/default.png";
  };

  nombreUsuario.innerText = userObj.nombre;
  if (userObj.nombre === "Externo") {
    inversionUsuario.innerText = formatMoney(0);
    gananciaUsuario.innerText  = "No aplica (Externo)";
  } else {
    inversionUsuario.innerText = formatMoney(500);
    gananciaUsuario.innerText  = formatMoney(userObj.ganancia);
  }

  if (userObj.adeudo > 0) {
    adeudoUsuario.innerText     = `Adeudo: ${formatMoney(userObj.adeudo)}`;
    adeudoUsuario.classList.add("red");
    adeudoUsuario.classList.remove("green");
  } else {
    adeudoUsuario.innerText     = "Sin adeudos";
    adeudoUsuario.classList.add("green");
    adeudoUsuario.classList.remove("red");
  }

  // Mostrar saldo a favor
  saldoFavorEl.innerText = formatMoney(userObj.saldoFavor);

  tablaHistorial.innerHTML = "";
  const historial = historialCompras[userObj.nombre];
  if (!historial || historial.length === 0) {
    let row = document.createElement("tr");
    row.innerHTML = `<td colspan="5">Sin compras registradas</td>`;
    tablaHistorial.appendChild(row);
  } else {
    historial.forEach(compra => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${compra.producto}</td>
        <td>${compra.piezas}</td>
        <td>${formatMoney(compra.costoTotal)}</td>
        <td>${compra.fecha}</td>
        <td>${formatMoney(compra.ganancia)}</td>
      `;
      tablaHistorial.appendChild(row);
    });
  }
}

/************************************
 * IMPRIMIR REPORTE DE USUARIO
 ************************************/
function imprimirReporteUsuario() {
  const usuario = document.getElementById("select-usuario-consulta").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (!userObj) {
    alert("Usuario no encontrado.");
    return;
  }
  
  let contenidoHTML = `<p><strong>Usuario:</strong> ${userObj.nombre}</p>`;
  if (userObj.nombre !== "Externo") {
    contenidoHTML += `<p><strong>Inversión:</strong> ${formatMoney(500)}</p>`;
    contenidoHTML += `<p><strong>Ganancia Total:</strong> ${formatMoney(userObj.ganancia)}</p>`;
  } else {
    contenidoHTML += `<p><strong>Inversión:</strong> 0 (Externo)</p>`;
    contenidoHTML += `<p><strong>Ganancia Total:</strong> N/A (Externo)</p>`;
  }
  contenidoHTML += `<p><strong>Adeudo:</strong> ${formatMoney(userObj.adeudo)}</p>`;
  contenidoHTML += `<p><strong>Saldo a favor:</strong> ${formatMoney(userObj.saldoFavor)}</p>`;

  const historial = historialCompras[userObj.nombre];
  if (!historial || historial.length === 0) {
    contenidoHTML += `<p>Sin compras registradas</p>`;
  } else {
    contenidoHTML += `
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Piezas</th>
          <th>CostoTotal</th>
          <th>Fecha</th>
          <th>Ganancia</th>
        </tr>
      </thead>
      <tbody>
    `;
    historial.forEach(compra => {
      contenidoHTML += `
        <tr>
          <td>${compra.producto}</td>
          <td>${compra.piezas}</td>
          <td>${formatMoney(compra.costoTotal)}</td>
          <td>${compra.fecha}</td>
          <td>${formatMoney(compra.ganancia)}</td>
        </tr>
      `;
    });
    contenidoHTML += `</tbody></table>`;
  }

  mostrarVentanaImpresion(contenidoHTML, "Reporte de Usuario");
}

/************************************
 * IMPRIMIR EN VENTANA EMERGENTE
 ************************************/
function mostrarVentanaImpresion(htmlContenido, titulo) {
  let ventana = window.open("", "Reporte", "width=900,height=600");
  ventana.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
          table {
            margin: 0 auto;
            border-collapse: collapse; 
            width: 80%;
          }
          th, td {
            border: 1px solid #ccc; 
            padding: 8px; 
            text-align: center;
          }
          button {
            background-color: #009ee3; 
            color: #fff; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 6px; 
            cursor: pointer;
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <h2>${titulo}</h2>
        ${htmlContenido}
        <button onclick="window.print()">Imprimir</button>
      </body>
    </html>
  `);
  ventana.document.close();
}

/************************************
 * IMPRIMIR INVENTARIO
 ************************************/
function imprimirInventario() {
  let contenidoHTML = `<table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Descripción</th>
        <th>Precio Compra</th>
        <th>Precio Venta</th>
        <th>Piezas</th>
      </tr>
    </thead>
    <tbody>`;
  productos.forEach(p => {
    contenidoHTML += `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.descripcion}</td>
        <td>${formatMoney(p.precioCompra)}</td>
        <td>${formatMoney(p.precioVenta)}</td>
        <td>${p.piezas}</td>
      </tr>
    `;
  });
  contenidoHTML += `</tbody></table>`;

  mostrarVentanaImpresion(contenidoHTML, "Reporte de Inventario");
}

/************************************
 * CONSULTA DE INVERSIÓN (Global)
 ************************************/
function actualizarConsultaInversion() {
  const invTotalEl     = document.getElementById("inv-total");
  const invGananciasEl = document.getElementById("inv-ganancias");
  const invSaldoEl     = document.getElementById("inv-saldo");
  const invAdeudosEl   = document.getElementById("inv-adeudos");

  let saldoActual  = totalInversion - (gastoEnProductos - inversionRecuperada);
  let totalAdeudos = usuarios.reduce((acum, u) => acum + u.adeudo, 0);

  invTotalEl.innerText     = formatMoney(totalInversion);
  invGananciasEl.innerText = formatMoney(gananciasTotales);
  invSaldoEl.innerText     = formatMoney(saldoActual);
  invAdeudosEl.innerText   = formatMoney(totalAdeudos);

  const tbody = document.getElementById("tabla-usuarios-ganancias").querySelector("tbody");
  tbody.innerHTML = "";

  let usuariosConGanancia = [...usuarios].filter(u => u.nombre !== "Externo");
  usuariosConGanancia.sort((a, b) => b.ganancia - a.ganancia);

  usuariosConGanancia.forEach(u => {
    let totalCompras = 0;
    (historialCompras[u.nombre] || []).forEach(c => {
      totalCompras += c.costoTotal;
    });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="fotos/${u.nombre}.jpg" alt="${u.nombre}" class="foto-usuario-tabla"
          onerror="this.onerror=null; this.src='fotos/default.png';"/>
      </td>
      <td>${u.nombre}</td>
      <td>${formatMoney(totalCompras)}</td>
      <td>${formatMoney(u.ganancia)}</td>
      <td>${formatMoney(u.adeudo)}</td>
      <td>${formatMoney(u.saldoFavor)}</td>
    `;
    if (u.adeudo > 0) {
      row.classList.add("con-adeudo");
    }
    tbody.appendChild(row);
  });
}

/************************************
 * DESCARGAR BASE DE DATOS EN JSON
 ************************************/
function descargarBaseDeDatosJSON() {
  const data = {
    usuarios,
    historialCompras,
    productos,
    historialEntradas,
    numInversionistas,
    totalInversion,
    gastoEnProductos,
    inversionRecuperada,
    gananciasTotales
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "base_de_datos.json";
  link.click();

  URL.revokeObjectURL(url);
}

/************************************
 * FUNCIÓN: PANTALLA COMPLETA DE TABLA
 ************************************/
function toggleFullscreen(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      alert(`Error al intentar entrar en pantalla completa: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

/************************************
 * FUNCIÓN NUEVA: Cargar JSON Externo
 ************************************/
function cargarJSONExterno() {
  let input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const dataExterna = JSON.parse(text);

      if (confirm("¿Deseas sobreescribir la base de datos actual con el archivo seleccionado?")) {
        // Ajuste para si no existía saldoFavor en la data
        if (dataExterna.usuarios) {
          dataExterna.usuarios.forEach(u => {
            if (typeof u.saldoFavor === "undefined") {
              u.saldoFavor = 0;
            }
          });
          usuarios = dataExterna.usuarios;
        }
        if (dataExterna.historialCompras)    historialCompras    = dataExterna.historialCompras;
        if (dataExterna.productos)           productos           = dataExterna.productos;
        if (dataExterna.historialEntradas)   historialEntradas   = dataExterna.historialEntradas;
        if (dataExterna.numInversionistas)   numInversionistas   = dataExterna.numInversionistas;
        if (dataExterna.totalInversion)      totalInversion      = dataExterna.totalInversion;
        if (dataExterna.gastoEnProductos)    gastoEnProductos    = dataExterna.gastoEnProductos;
        if (dataExterna.inversionRecuperada) inversionRecuperada = dataExterna.inversionRecuperada;
        if (dataExterna.gananciasTotales)    gananciasTotales    = dataExterna.gananciasTotales;

        guardarDatosEnArchivos();
        llenarSelectUsuarios("select-usuario");
        llenarSelectUsuarios("select-usuario-saldo");
        llenarSelectUsuarios("select-usuario-consulta");
        llenarSelectProductos("select-producto");
        llenarSelectProductos("select-entrada-producto");
        mostrarInventario();
        mostrarHistorialEntradas(historialEntradas);
        actualizarConsultaInversion();
        alert("Datos cargados exitosamente desde archivo externo.");
      }
    } catch (error) {
      alert("No se pudo leer o parsear el archivo JSON.");
      console.error(error);
    }
  };
  input.click();
}
