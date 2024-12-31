/************************************
 * Variables y Estructuras
 ************************************/
let usuarios = [
  { nombre: "Arturo", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Carlos", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Edgar", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Francisco", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Irvin", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Isac", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Isrrael", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Karen", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Laura", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Marcos", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Rafael", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Vicente", bloqueado: false, adeudo: 0, ganancia: 0 },
  { nombre: "Externo", bloqueado: false, adeudo: 0, ganancia: 0 },
];

let historialCompras = {};
usuarios.forEach(u => {
  historialCompras[u.nombre] = [];
});

let numInversionistas = usuarios.filter(u => u.nombre !== "Externo").length;
let totalInversion = numInversionistas * 500;

// Variables de control
let gastoEnProductos = 0;
let inversionRecuperada = 0;
let gananciasTotales = 0;

// Lista de productos: inicialmente vacío
let productos = [];

// Carrito actual
let carrito = [];

/************************************
 * Formato de Moneda
 ************************************/
function formatMoney(amount) {
  // separador de miles "," y decimales "."
  return "$" + amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/************************************
 * LocalStorage: Cargar / Guardar
 ************************************/
function cargarDatosDeLocalStorage() {
  const usuariosLS = localStorage.getItem("usuarios");
  if (usuariosLS) {
    usuarios = JSON.parse(usuariosLS);
  }

  const historialLS = localStorage.getItem("historialCompras");
  if (historialLS) {
    historialCompras = JSON.parse(historialLS);
  }

  const productosLS = localStorage.getItem("productos");
  if (productosLS) {
    productos = JSON.parse(productosLS);
  }

  const gastoLS = localStorage.getItem("gastoEnProductos");
  if (gastoLS) {
    gastoEnProductos = parseFloat(gastoLS);
  }

  const invRecLS = localStorage.getItem("inversionRecuperada");
  if (invRecLS) {
    inversionRecuperada = parseFloat(invRecLS);
  }

  const gananciasLS = localStorage.getItem("gananciasTotales");
  if (gananciasLS) {
    gananciasTotales = parseFloat(gananciasLS);
  }
}

function guardarDatosEnLocalStorage() {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("historialCompras", JSON.stringify(historialCompras));
  localStorage.setItem("productos", JSON.stringify(productos));
  localStorage.setItem("gastoEnProductos", gastoEnProductos.toString());
  localStorage.setItem("inversionRecuperada", inversionRecuperada.toString());
  localStorage.setItem("gananciasTotales", gananciasTotales.toString());
}

/************************************
 * window.onload
 ************************************/
window.onload = () => {
  // 1) Cargar datos persistidos
  cargarDatosDeLocalStorage();

  // 2) Llenar combos y vistas
  llenarSelectUsuarios("select-usuario");
  llenarSelectUsuarios("select-usuario-saldo");
  llenarSelectUsuarios("select-usuario-consulta");

  llenarSelectProductos("select-producto");
  llenarSelectProductos("select-entrada-producto");

  mostrarInventario();

  document.getElementById("select-usuario-saldo").addEventListener("change", actualizarSaldoEnPantalla);

  // Detectar Enter en "codigo-producto"
  const inputCodigo = document.getElementById("codigo-producto");
  inputCodigo.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      agregarProductoPorCodigo();
    }
  });
};

/************************************
 * Mostrar/Ocultar Secciones
 ************************************/
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(sec => sec.classList.remove("active"));

  document.getElementById(sectionId).classList.add("active");

  // Si regresamos al menú principal, limpiar el carrito
  if (sectionId === "main-menu") {
    carrito = [];
    document.getElementById("tabla-venta").querySelector("tbody").innerHTML = "";
    document.getElementById("total-venta").innerText = formatMoney(0);
  }
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

  productos.forEach(prod => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${prod.codigo}</td>
      <td>${prod.descripcion}</td>
      <td>${formatMoney(prod.precioCompra)}</td>
      <td>${formatMoney(prod.precioVenta)}</td>
      <td>${prod.piezas}</td>
    `;
    tbody.appendChild(row);
  });
}

/************************************
 * VENTAS
 ************************************/
function verificarUsuarioExterno() {
  const usuario = document.getElementById("select-usuario").value;
  const selectPago = document.getElementById("select-pago");
  
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

// Agregar producto por "Cantidad" y "Select"
function agregarProductoVenta() {
  const usuario = document.getElementById("select-usuario").value;
  const userObj = usuarios.find(u => u.nombre === usuario);

  if (userObj.bloqueado) {
    alert(`El usuario ${usuario} está bloqueado.`);
    return;
  }

  const selectProducto = document.getElementById("select-producto");
  const codigoProd = selectProducto.value;
  const productoObj = productos.find(p => p.codigo === codigoProd);

  const cantidad = parseInt(document.getElementById("cantidad-venta").value);
  if (!productoObj || cantidad <= 0) {
    alert("Verifique el producto y la cantidad ingresada.");
    return;
  }

  // Verificar stock disponible
  if (cantidad > productoObj.piezas) {
    alert(`No hay suficiente stock de "${productoObj.descripcion}". Disponible: ${productoObj.piezas}`);
    return;
  }

  let subtotal = productoObj.precioVenta * cantidad;

  const itemExistente = carrito.find(item => item.codigo === productoObj.codigo);
  if (itemExistente) {
    // Verificar stock adicional
    if (itemExistente.cantidad + cantidad > productoObj.piezas) {
      alert(`No hay suficiente stock de "${productoObj.descripcion}". 
Ya tienes ${itemExistente.cantidad} en el carrito y solo hay ${productoObj.piezas} en total.`);
      return;
    }
    itemExistente.cantidad += cantidad;
    itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
  } else {
    carrito.push({
      codigo: productoObj.codigo,
      descripcion: productoObj.descripcion,
      cantidad,
      precioUnitario: productoObj.precioVenta,
      subtotal
    });
  }

  renderTablaVenta();
}

// Agregar producto por "Código de Barras" (Enter)
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
    alert(`No existe un producto con código "${codigoInput}".`);
    return;
  }

  // Verificar stock (se agrega de 1 en 1)
  if (productoObj.piezas < 1) {
    alert(`No hay stock de "${productoObj.descripcion}".`);
    return;
  }

  const itemExistente = carrito.find(item => item.codigo === productoObj.codigo);
  if (itemExistente) {
    if (itemExistente.cantidad + 1 > productoObj.piezas) {
      alert(`No hay suficiente stock de "${productoObj.descripcion}". 
Ya tienes ${itemExistente.cantidad} en el carrito y solo hay ${productoObj.piezas} en total.`);
      return;
    }
    itemExistente.cantidad += 1;
    itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
  } else {
    carrito.push({
      codigo: productoObj.codigo,
      descripcion: productoObj.descripcion,
      cantidad: 1,
      precioUnitario: productoObj.precioVenta,
      subtotal: productoObj.precioVenta
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
  document.getElementById("tabla-venta").querySelector("tbody").innerHTML = "";
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

function registrarCompra() {
  const totalStr = document.getElementById("total-venta").innerText.replace(/[^\d.]/g, "");
  const total = parseFloat(totalStr) || 0;
  const formaPago = document.getElementById("select-pago").value;
  const usuario = document.getElementById("select-usuario").value;
  const userObj = usuarios.find(u => u.nombre === usuario);

  carrito.forEach(item => {
    let prod = productos.find(p => p.codigo === item.codigo);
    if (prod.piezas < item.cantidad) {
      alert(`No hay suficiente stock de ${prod.descripcion}. Se ignora este producto.`);
      return;
    }

    prod.piezas -= item.cantidad;

    const { costoRecuperado, ganancia } = descontarStockParcial(prod, item.cantidad);
    inversionRecuperada += costoRecuperado;
    gananciasTotales += ganancia;

    let fecha = new Date().toLocaleString();
    historialCompras[usuario].push({
      producto: item.descripcion,
      piezas: item.cantidad,
      costoTotal: item.subtotal,
      fecha,
      ganancia
    });

    if (usuario !== "Externo") {
      userObj.ganancia += ganancia;
    } else {
      // Repartir ganancia a los inversionistas
      let usuariosRepartibles = usuarios.filter(u => u.nombre !== "Externo");
      let parte = ganancia / usuariosRepartibles.length;
      usuariosRepartibles.forEach(u => {
        u.ganancia += parte;
      });
    }
  });

  if (usuario !== "Externo" && formaPago === "credito") {
    userObj.adeudo += total;
  }

  alert(`Compra registrada. Total: ${formatMoney(total)}. Pago: ${formaPago}`);

  carrito = [];
  renderTablaVenta();
  mostrarInventario();

  // Guardar cambios en LocalStorage
  guardarDatosEnLocalStorage();

  showSection("main-menu");
}

/************************************
 * Descontar stock parcial (FIFO)
 ************************************/
function descontarStockParcial(prod, cant) {
  let restante = cant;
  let costoRecuperado = 0;
  let ganancia = 0;

  while (restante > 0 && prod.stockParciales && prod.stockParciales.length > 0) {
    let bloque = prod.stockParciales[0];
    if (bloque.cantidad <= 0) {
      prod.stockParciales.shift();
      continue;
    }

    let usar = Math.min(bloque.cantidad, restante);
    let cUnit = bloque.costoUnitario;

    // Se asume la ganancia es 50% sobre el costo de compra (puedes ajustar la fórmula)
    costoRecuperado += (usar * cUnit);
    ganancia += (usar * (prod.precioVenta - cUnit));

    bloque.cantidad -= usar;
    restante -= usar;

    if (bloque.cantidad <= 0) {
      prod.stockParciales.shift();
    }
  }

  return { costoRecuperado, ganancia };
}

/************************************
 * ENTRADAS (Resurtir)
 ************************************/
function agregarEntrada() {
  const codigoProd = document.getElementById("select-entrada-producto").value;
  const cantidad = parseInt(document.getElementById("cantidad-entrada").value);
  const costoTotalCompra = parseFloat(document.getElementById("costo-entrada").value);

  if (!codigoProd || cantidad <= 0 || costoTotalCompra < 0) {
    alert("Datos inválidos. Verifique producto, cantidad y costo.");
    return;
  }

  let prod = productos.find(p => p.codigo === codigoProd);
  if (!prod) {
    alert("Producto no encontrado.");
    return;
  }

  prod.piezas += cantidad;

  let costoUnit = costoTotalCompra / cantidad;
  let nuevoPrecioVenta = costoUnit * 1.5;

  // Si no existe stockParciales, crearlo
  if (!prod.stockParciales) {
    prod.stockParciales = [];
  }

  prod.stockParciales.push({
    cantidad,
    costoUnitario: costoUnit
  });

  prod.precioCompra = parseFloat(costoUnit.toFixed(2));
  prod.precioVenta = parseFloat(nuevoPrecioVenta.toFixed(2));

  gastoEnProductos += costoTotalCompra;

  alert(`Entrada registrada: +${cantidad} de ${prod.descripcion}. 
Costo unit: ${formatMoney(costoUnit)}, P. Venta: ${formatMoney(nuevoPrecioVenta)}`);

  mostrarInventario();

  // Guardar en LocalStorage
  guardarDatosEnLocalStorage();
}

function verificarPin() {
  const pin = document.getElementById("pin-nuevo-producto").value;
  const seccionNuevoProd = document.getElementById("nueva-seccion-producto");

  if (pin === "2405") {
    seccionNuevoProd.classList.remove("hidden");
    alert("PIN correcto: ya puedes agregar un nuevo producto.");
  } else {
    alert("PIN incorrecto.");
  }
}

function agregarNuevoProducto() {
  const codigo = document.getElementById("nuevo-codigo").value.trim();
  const descripcion = document.getElementById("nuevo-descripcion").value.trim();
  const costo = parseFloat(document.getElementById("nuevo-costo").value);
  const piezas = parseInt(document.getElementById("nuevo-piezas").value);

  if (!codigo || !descripcion || costo < 0 || piezas <= 0) {
    alert("Datos inválidos para producto nuevo.");
    return;
  }

  // Verificar duplicados (código o descripción)
  const productoDuplicado = productos.find(p => p.codigo === codigo || p.descripcion === descripcion);
  if (productoDuplicado) {
    alert(`Ya existe un producto con este código o descripción. 
Código: ${productoDuplicado.codigo}, Descripción: ${productoDuplicado.descripcion}.`);
    return;  
  }

  let costoUnit = costo / piezas;
  let precioVenta = costoUnit * 1.5;

  const nuevoProducto = {
    codigo,
    descripcion,
    precioCompra: parseFloat(costoUnit.toFixed(2)),
    precioVenta: parseFloat(precioVenta.toFixed(2)),
    piezas,
    stockParciales: [
      { cantidad: piezas, costoUnitario: costoUnit }
    ]
  };

  productos.push(nuevoProducto);
  gastoEnProductos += costo;

  // Refrescar selects e inventario
  llenarSelectProductos("select-producto");
  llenarSelectProductos("select-entrada-producto");
  mostrarInventario();

  alert(`Producto "${descripcion}" agregado correctamente.`);

  // Limpiar campos
  document.getElementById("nuevo-codigo").value = "";
  document.getElementById("nuevo-descripcion").value = "";
  document.getElementById("nuevo-costo").value = 0;
  document.getElementById("nuevo-piezas").value = 1;

  guardarDatosEnLocalStorage();
}

/************************************
 * PAGAR SALDO
 ************************************/
function pagarSaldo() {
  const usuario = document.getElementById("select-usuario-saldo").value;
  const userObj = usuarios.find(u => u.nombre === usuario);

  let pin = prompt("Ingresa PIN para confirmar el pago:");
  if (pin !== "2405") {
    alert("PIN incorrecto.");
    return;
  }

  if (userObj.adeudo > 0) {
    userObj.adeudo = 0;
    alert(`El saldo de ${usuario} se pagó completamente.`);
  } else {
    alert(`El usuario ${usuario} no tiene adeudos.`);
  }

  guardarDatosEnLocalStorage();
  actualizarSaldoEnPantalla();
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

  guardarDatosEnLocalStorage();
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

  guardarDatosEnLocalStorage();
}

function actualizarSaldoEnPantalla() {
  const usuario = document.getElementById("select-usuario-saldo").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (userObj) {
    document.getElementById("saldo-adeudo").innerText = formatMoney(userObj.adeudo);
  }
}

/************************************
 * CONSULTAS - POR USUARIO
 ************************************/
function filtrarInformacionUsuario() {
  const usuario = document.getElementById("select-usuario-consulta").value;
  const consultaUsuarioDiv = document.getElementById("consulta-usuario");
  const fotoUsuario = document.getElementById("foto-usuario");
  const nombreUsuario = document.getElementById("nombre-usuario");
  const inversionUsuario = document.getElementById("inversion-usuario");
  const gananciaUsuario = document.getElementById("ganancia-usuario");
  const adeudoUsuario = document.getElementById("adeudo-usuario-estado");
  const tablaHistorial = document.getElementById("tabla-historial").querySelector("tbody");

  consultaUsuarioDiv.classList.remove("hidden");

  const userObj = usuarios.find(u => u.nombre === usuario);
  if (!userObj) return;

  // Foto
  fotoUsuario.src = `fotos/${userObj.nombre}.jpg`;
  fotoUsuario.alt = userObj.nombre;
  nombreUsuario.innerText = userObj.nombre;

  if (userObj.nombre === "Externo") {
    inversionUsuario.innerText = formatMoney(0);
    gananciaUsuario.innerText = "No aplica (Externo)";
  } else {
    inversionUsuario.innerText = formatMoney(500);
    gananciaUsuario.innerText = formatMoney(userObj.ganancia);
  }

  if (userObj.adeudo > 0) {
    adeudoUsuario.innerText = `Adeudo: ${formatMoney(userObj.adeudo)}`;
    adeudoUsuario.classList.add("red");
    adeudoUsuario.classList.remove("green");
  } else {
    adeudoUsuario.innerText = "Sin adeudos";
    adeudoUsuario.classList.add("green");
    adeudoUsuario.classList.remove("red");
  }

  // Historial
  tablaHistorial.innerHTML = "";
  const historial = historialCompras[userObj.nombre];
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

/************************************
 * Descargar Reporte de Usuario (TXT)
 ************************************/
function descargarReporteUsuario() {
  const usuario = document.getElementById("select-usuario-consulta").value;
  const userObj = usuarios.find(u => u.nombre === usuario);
  if (!userObj) {
    alert("Usuario no encontrado.");
    return;
  }

  let contenido = `Reporte de Usuario: ${userObj.nombre}\n\n`;

  if (userObj.nombre !== "Externo") {
    contenido += `Inversión: ${formatMoney(500)}\n`;
    contenido += `Ganancia Total: ${formatMoney(userObj.ganancia)}\n`;
  } else {
    contenido += `Inversión: 0 (Externo)\n`;
    contenido += `Ganancia Total: N/A (Externo)\n`;
  }

  contenido += `Adeudo: ${formatMoney(userObj.adeudo)}\n\n`;
  contenido += "Historial de Compras:\n";

  const historial = historialCompras[userObj.nombre];
  if (historial.length === 0) {
    contenido += "  - Sin compras registradas\n";
  } else {
    historial.forEach((compra, idx) => {
      contenido += `${idx + 1}) Producto: ${compra.producto}, Piezas: ${compra.piezas}, `
        + `CostoTotal: ${formatMoney(compra.costoTotal)}, Fecha: ${compra.fecha}, `
        + `Ganancia: ${formatMoney(compra.ganancia)}\n`;
    });
  }

  const blob = new Blob([contenido], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `reporte_${usuario}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/************************************
 * CONSULTA DE INVERSIÓN
 ************************************/
function actualizarConsultaInversion() {
  const invTotalEl   = document.getElementById("inv-total");
  const invGananciasEl = document.getElementById("inv-ganancias");
  const invSaldoEl   = document.getElementById("inv-saldo");
  const invAdeudosEl = document.getElementById("inv-adeudos");

  let saldoActual = totalInversion - (gastoEnProductos - inversionRecuperada);
  let totalAdeudos = usuarios.reduce((acum, u) => acum + u.adeudo, 0);

  invTotalEl.innerText      = formatMoney(totalInversion);
  invGananciasEl.innerText  = formatMoney(gananciasTotales);
  invSaldoEl.innerText      = formatMoney(saldoActual);
  invAdeudosEl.innerText    = formatMoney(totalAdeudos);

  // Tabla de adeudos
  const tbodyAdeudos = document.getElementById("tabla-adeudos").querySelector("tbody");
  tbodyAdeudos.innerHTML = "";

  let usuariosConAdeudo = usuarios.filter(u => u.adeudo > 0);
  usuariosConAdeudo.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.nombre}</td>
      <td>${formatMoney(u.adeudo)}</td>
    `;
    tbodyAdeudos.appendChild(row);
  });
}

/************************************
 * Descargar Base de Datos (TXT)
 ************************************/
function descargarBaseDeDatos() {
  let contenido = "=== USUARIOS ===\n";
  usuarios.forEach((u, idx) => {
    contenido += `${idx + 1}) Nombre: ${u.nombre}, Bloqueado: ${u.bloqueado}, `
      + `Adeudo: ${formatMoney(u.adeudo)}, Ganancia: ${formatMoney(u.ganancia)}\n`;
  });

  contenido += "\n=== PRODUCTOS ===\n";
  productos.forEach((p, idx) => {
    contenido += `${idx + 1}) Código: ${p.codigo}, Descripción: ${p.descripcion}, `
      + `Compra: ${formatMoney(p.precioCompra)}, Venta: ${formatMoney(p.precioVenta)}, `
      + `Piezas: ${p.piezas}\n`;
  });

  contenido += "\n=== HISTORIAL DE COMPRAS ===\n";
  for (const nombreUsuario in historialCompras) {
    contenido += `\n* Usuario: ${nombreUsuario}\n`;
    const h = historialCompras[nombreUsuario];
    if (h.length === 0) {
      contenido += "  - Sin compras registradas\n";
    } else {
      h.forEach((compra, idx) => {
        contenido += `  ${idx + 1}) Producto: ${compra.producto}, Piezas: ${compra.piezas}, `
          + `CostoTotal: ${formatMoney(compra.costoTotal)}, Fecha: ${compra.fecha}, `
          + `Ganancia: ${formatMoney(compra.ganancia)}\n`;
      });
    }
  }

  const blob = new Blob([contenido], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "base_de_datos.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

/************************************
 * Descargar Reporte de Inventario (TXT)
 ************************************/
function descargarReporteInventario() {
  let contenido = "=== REPORTE DE INVENTARIO ===\n\n";
  productos.forEach((p, idx) => {
    contenido += `${idx + 1}) Código: ${p.codigo}, Descripción: ${p.descripcion}, `
      + `Precio Compra: ${formatMoney(p.precioCompra)}, Precio Venta: ${formatMoney(p.precioVenta)}, `
      + `Piezas: ${p.piezas}\n`;
  });

  const blob = new Blob([contenido], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reporte_inventario.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}
