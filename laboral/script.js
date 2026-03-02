// Estado
let empleados = [];
let tercerizados = [];
let mainChart = null;

// Elementos
const ingresoTotalEl = document.getElementById('ingresoTotal');
const tasaIvaEl = document.getElementById('tasaIva');
const tipoRentaEl = document.getElementById('tipoRenta');
const tasaRentaEl = document.getElementById('tasaRenta');
const limiteRenta30El = document.getElementById('limiteRenta30');
const porcHorasExtraEl = document.getElementById('porcHorasExtra');
const feriadosMesEl = document.getElementById('feriadosMes');
const rentaFijaGroup = document.getElementById('rentaFijaGroup');
const pymeThresholdGroup = document.getElementById('pymeThresholdGroup');
const infoRentaEl = document.getElementById('infoRenta');
const porcRespCivilEl = document.getElementById('porcRespCivil');
const btnAgregarEmpleado = document.getElementById('btnAgregarEmpleado');
const btnAgregarTercerizado = document.getElementById('btnAgregarTercerizado');

const empPuestoEl = document.getElementById('empPuesto');
const empCategoriaEl = document.getElementById('empCategoria');
const empSalarioEl = document.getElementById('empSalario');
const empCantidadEl = document.getElementById('empCantidad');
const empJornadaEl = document.getElementById('empJornada');

const tervServicioEl = document.getElementById('tervServicio');
const tervCostoEl = document.getElementById('tervCosto');
const tervTasaIvaEl = document.getElementById('tervTasaIva');

const listaEmpleadosEl = document.getElementById('listaEmpleados');
const listaTercerizadosEl = document.getElementById('listaTercerizados');

// Tasas Planilla Patronal
const TASA_CCSS = 0.2683;
const TASA_AGUINALDO = 0.083333;
const TASA_VACACIONES = 0.041666;
const TASA_CESANTIA = 0.0533;
const TASA_INS = 0.025; // 2.5% estimado

function init() {
    // Si cambia el select de categoría, actualiza el salario
    empCategoriaEl.addEventListener('change', () => {
        if (empCategoriaEl.value !== 'custom') {
            empSalarioEl.value = empCategoriaEl.value;
        }
    });

    // Botones de acción
    btnAgregarEmpleado.addEventListener('click', agregarEmpleado);
    btnAgregarTercerizado.addEventListener('click', agregarTercerizado);

    // Recalcular al cambiar
    ingresoTotalEl.addEventListener('input', () => { render(); saveState(); });
    tasaIvaEl.addEventListener('change', () => { render(); saveState(); });
    tipoRentaEl.addEventListener('change', () => {
        rentaFijaGroup.style.display = tipoRentaEl.value === 'fija' ? 'block' : 'none';
        pymeThresholdGroup.style.display = tipoRentaEl.value === 'juridica' ? 'block' : 'none';
        render();
        saveState();
    });
    tasaRentaEl.addEventListener('input', () => { render(); saveState(); });
    limiteRenta30El.addEventListener('input', () => { render(); saveState(); });
    porcHorasExtraEl.addEventListener('input', () => { render(); saveState(); });
    feriadosMesEl.addEventListener('input', () => { render(); saveState(); });
    porcRespCivilEl.addEventListener('input', () => { render(); saveState(); });

    // Establecer fecha de reporte
    const fechaEl = document.getElementById('print-date');
    if (fechaEl) {
        fechaEl.innerText = 'Fecha de generación: ' + new Date().toLocaleDateString('es-CR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    loadState();
    render();
}

function saveState() {
    const state = {
        ingresoTotal: ingresoTotalEl.value,
        tasaIva: tasaIvaEl.value,
        tipoRenta: tipoRentaEl.value,
        tasaRenta: tasaRentaEl.value,
        limiteRenta30: limiteRenta30El.value,
        porcHorasExtra: porcHorasExtraEl.value,
        feriadosMes: feriadosMesEl.value,
        porcRespCivil: porcRespCivilEl.value,
        empleados: empleados,
        tercerizados: tercerizados
    };
    localStorage.setItem('laboral_calc_v2', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('laboral_calc_v2');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            ingresoTotalEl.value = state.ingresoTotal || 5000000;
            tasaIvaEl.value = state.tasaIva || '0.13';
            tipoRentaEl.value = state.tipoRenta || 'juridica';
            tasaRentaEl.value = state.tasaRenta || 30;
            limiteRenta30El.value = state.limiteRenta30 || 119174000;
            porcHorasExtraEl.value = state.porcHorasExtra || 1.5;
            feriadosMesEl.value = state.feriadosMes || 1;
            porcRespCivilEl.value = state.porcRespCivil || 0.2;
            empleados = state.empleados || [];
            tercerizados = state.tercerizados || [];

            rentaFijaGroup.style.display = tipoRentaEl.value === 'fija' ? 'block' : 'none';
            pymeThresholdGroup.style.display = tipoRentaEl.value === 'juridica' ? 'block' : 'none';
        } catch (e) {
            console.error('Error loading state', e);
        }
    }
}

function format(val) {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(val);
}

function agregarEmpleado() {
    const puesto = empPuestoEl.value.trim() || 'Colaborador';
    const salario = parseFloat(empSalarioEl.value) || 0;
    const cantidad = parseInt(empCantidadEl.value) || 1;
    const jornada = parseFloat(empJornadaEl.value) || 1;

    if (salario <= 0 || cantidad <= 0) return;

    empleados.push({ id: Date.now(), puesto, salario, cantidad, jornada });

    // Resetear form de empleados
    empPuestoEl.value = '';
    empCantidadEl.value = 1;
    empJornadaEl.value = 1;
    empCategoriaEl.value = '373092.30'; // Volver a "No calificado"
    empSalarioEl.value = '373092.30';

    render();
}

function eliminarEmpleado(id) {
    empleados = empleados.filter(e => e.id !== id);
    render();
    saveState();
}

function ajustarSalario(id, factor) {
    const emp = empleados.find(e => e.id === id);
    if (emp) {
        emp.salario = emp.salario * (1 + factor);
        render();
        saveState();
    }
}

function agregarTercerizado() {
    const servicio = tervServicioEl.value.trim() || 'Servicio Profesional';
    const costo = parseFloat(tervCostoEl.value) || 0;

    if (costo <= 0) return;

    const tasaIva = parseFloat(tervTasaIvaEl.value) || 0;

    tercerizados.push({ id: Date.now(), servicio, costo, tasaIva });

    // Resetear form tercerizados
    tervServicioEl.value = '';
    tervCostoEl.value = 0;

    render();
    saveState();
}

function actualizarEmpleado(id, campo, valor) {
    const emp = empleados.find(e => e.id === id);
    if (emp) {
        if (campo === 'salario') emp.salario = parseFloat(valor) || 0;
        if (campo === 'cantidad') emp.cantidad = parseInt(valor) || 1;
        render();
        saveState();
    }
}

function actualizarTercerizado(id, valor) {
    const terc = tercerizados.find(t => t.id === id);
    if (terc) {
        terc.costo = parseFloat(valor) || 0;
        render();
        saveState();
    }
}

function eliminarTercerizado(id) {
    tercerizados = tercerizados.filter(t => t.id !== id);
    render();
}

function render() {
    // 1. Mostrar lista de empleados y calcular base salarial
    listaEmpleadosEl.innerHTML = '';
    let totalSalariosBase = 0;

    if (empleados.length === 0) {
        listaEmpleadosEl.innerHTML = '<div style="color:#888; font-size:0.9rem; text-align:center; padding:10px;">No hay personal agregado.</div>';
    } else {
        empleados.forEach(emp => {
            const subtotal = emp.salario * emp.cantidad * emp.jornada;
            totalSalariosBase += subtotal;

            const jornadaTxt = emp.jornada === 1 ? 'Completo' : emp.jornada === 0.5 ? '1/2' : '1/4';

            const div = document.createElement('div');
            div.className = 'item-row';
            div.innerHTML = `
                <div class="item-info">
                    <strong>${emp.puesto}</strong>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                        <input type="number" value="${emp.salario}" step="1000" 
                            style="width: 100px; font-size: 0.8rem; padding: 2px;"
                            oninput="actualizarEmpleado(${emp.id}, 'salario', this.value)" title="Salario Base">
                        <span style="font-size: 0.8rem;">x</span>
                        <input type="number" value="${emp.cantidad}" min="1" 
                            style="width: 45px; font-size: 0.8rem; padding: 2px;"
                            oninput="actualizarEmpleado(${emp.id}, 'cantidad', this.value)" title="Cantidad">
                        <span style="font-size: 0.75rem; color: #666;">(${jornadaTxt})</span>
                    </div>
                    <div style="margin-top:5px; display: flex; gap: 5px;">
                        <button onclick="ajustarSalario(${emp.id}, 0.05)" style="font-size:0.65rem; padding:1px 4px; cursor:pointer; background: #2ecc71; color: white; border: none; border-radius: 2px;">+5%</button>
                        <button onclick="ajustarSalario(${emp.id}, -0.05)" style="font-size:0.65rem; padding:1px 4px; cursor:pointer; background: #e74c3c; color: white; border: none; border-radius: 2px;">-5%</button>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="item-cost" style="font-weight: 600;">${format(subtotal)}</div>
                    <button class="btn-delete" onclick="eliminarEmpleado(${emp.id})" title="Eliminar">✖</button>
                </div>
            `;
            listaEmpleadosEl.appendChild(div);
        });
    }

    // 2. Mostrar lista de tercerizados
    listaTercerizadosEl.innerHTML = '';
    let totalCostoTercerizados = 0;

    if (tercerizados.length === 0) {
        listaTercerizadosEl.innerHTML = '<div style="color:#888; font-size:0.9rem; text-align:center; padding:10px;">No hay servicios tercerizados.</div>';
    } else {
        tercerizados.forEach(terc => {
            totalCostoTercerizados += terc.costo;

            const div = document.createElement('div');
            div.className = 'item-row';
            div.innerHTML = `
                <div class="item-info">
                    <strong>${terc.servicio}</strong>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                        <input type="number" value="${terc.costo}" step="1000" 
                            style="width: 110px; font-size: 0.8rem; padding: 2px;"
                            oninput="actualizarTercerizado(${terc.id}, this.value)">
                        <span style="font-size: 0.75rem; color: #3498db;">IVA ${terc.tasaIva * 100}%</span>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="item-cost" style="font-weight: 600;">${format(terc.costo)}</div>
                    <button class="btn-delete" onclick="eliminarTercerizado(${terc.id})" title="Eliminar">✖</button>
                </div>
            `;
            listaTercerizadosEl.appendChild(div);
        });
    }

    // 3. Calcular cargas de la planilla (RRHH)
    const porcHE = (parseFloat(porcHorasExtraEl.value) || 0) / 100;
    const provisionHE = totalSalariosBase * porcHE;

    // Pago Feriados (Doble pago: ya incluido sencillo en mensual mensual, sumar +100% por dia)
    const numFeriados = parseFloat(feriadosMesEl.value) || 0;
    const costoExtraFeriados = (totalSalariosBase / 30) * numFeriados;

    // Las cargas sociales aplican sobre: Base + HE + Feriados
    const baseParaCargas = totalSalariosBase + provisionHE + costoExtraFeriados;

    const ccss = baseParaCargas * TASA_CCSS;
    const agui = baseParaCargas * TASA_AGUINALDO;
    const vaca = baseParaCargas * TASA_VACACIONES;
    const cesa = baseParaCargas * TASA_CESANTIA;
    const ins = baseParaCargas * TASA_INS;

    const costoTotalPlanilla = baseParaCargas + ccss + agui + vaca + cesa + ins;

    // Actualizar UI Planilla
    document.getElementById('det-salarios').innerHTML = `${format(totalSalariosBase)} <br><small style="color:#666;">+ HE: ${format(provisionHE)}</small>`;
    document.getElementById('det-feriados').innerText = format(costoExtraFeriados);
    document.getElementById('det-ccss').innerText = format(ccss);
    document.getElementById('det-aguinaldo').innerText = format(agui);
    document.getElementById('det-vacaciones').innerText = format(vaca);
    document.getElementById('det-cesantia').innerText = format(cesa);
    document.getElementById('det-ins').innerText = format(ins);
    document.getElementById('det-total-planilla').innerText = format(costoTotalPlanilla);

    // 4. Calcular Margen Financiero e Impuestos
    const precioVenta = parseFloat(ingresoTotalEl.value) || 0;
    // IVA DEBITO
    const tasaIvaGlobal = Number(tasaIvaEl.value) || 0;
    const ingresoNeto = precioVenta / (1 + tasaIvaGlobal);
    const montoIvaDebito = precioVenta - ingresoNeto;

    // IVA CREDITO
    let montoIvaCredito = 0;
    let totalCostoTercerizadosNeto = 0;

    tercerizados.forEach(t => {
        const tasaTerc = Number(t.tasaIva) || 0;
        const netoServicio = tasaTerc > 0 ? (t.costo / (1 + tasaTerc)) : t.costo;
        totalCostoTercerizadosNeto += netoServicio;
        if (tasaTerc > 0) {
            montoIvaCredito += (t.costo - netoServicio);
        }
    });

    // IVA Neto Final (Asegurar precisión decimal)
    const ivaNetoAPagar = Math.max(0, montoIvaDebito - montoIvaCredito);

    // Poliza RC
    const porcRC = (parseFloat(porcRespCivilEl.value) || 0) / 100;
    const costoRC = precioVenta * porcRC;

    // Costo Operativo Real (Uso para flujo de caja, incluye IVA pagado)
    const flujoCajaCostos = costoTotalPlanilla + totalCostoTercerizados + costoRC;

    // Utilidad Gravable para Renta (Neto - Neto)
    const utilidadMensualGravable = ingresoNeto - (costoTotalPlanilla + totalCostoTercerizadosNeto + costoRC);

    // Renta escalonada 2026
    let montoRenta = 0;
    const tipoRenta = tipoRentaEl.value;
    const utilidadAnualEst = utilidadMensualGravable * 12;
    const ingresosAnualesEst = ingresoNeto * 12;

    if (utilidadMensualGravable > 0) {
        if (tipoRenta === 'fija') {
            const tasaRentaPorc = (parseFloat(tasaRentaEl.value) || 0) / 100;
            montoRenta = utilidadMensualGravable * tasaRentaPorc;
            infoRentaEl.innerHTML = `Aplicando ${tasaRentaEl.value}% fijo.`;
        } else if (tipoRenta === 'fisica') {
            let rentaAnual = 0;
            const util = utilidadAnualEst;
            if (util > 20872000) rentaAnual += (util - 20872000) * 0.25;
            if (util > 10414000) rentaAnual += (Math.min(util, 20872000) - 10414000) * 0.20;
            if (util > 8329000) rentaAnual += (Math.min(util, 10414000) - 8329000) * 0.15;
            if (util > 6244000) rentaAnual += (Math.min(util, 8329000) - 6244000) * 0.10;
            montoRenta = rentaAnual / 12;
            infoRentaEl.innerHTML = `Escala P. Física (mínimo exento ₡6.2M/año)`;
        } else {
            // Persona Jurídica
            const threshold = parseFloat(limiteRenta30El.value) || 119174000;
            if (ingresosAnualesEst > threshold) {
                montoRenta = utilidadMensualGravable * 0.30;
                infoRentaEl.innerHTML = `Tasa Fija 30% (Ingresos > ${format(threshold)} anual)`;
            } else {
                let rentaAnual = 0;
                const util = utilidadAnualEst;
                if (util > 11243000) rentaAnual += (util - 11243000) * 0.20;
                if (util > 8433000) rentaAnual += (Math.min(util, 11243000) - 8433000) * 0.15;
                if (util > 5621000) rentaAnual += (Math.min(util, 8433000) - 5621000) * 0.10;
                rentaAnual += Math.min(util, 5621000) * 0.05;
                montoRenta = rentaAnual / 12;
                infoRentaEl.innerHTML = `Escala P. Jurídica (Pyme)`;
            }
        }
    } else {
        infoRentaEl.innerHTML = `Sin utilidad grabable.`;
    }

    const utilidadNetaFinal = utilidadMensualGravable - montoRenta;
    const porcentajeMargen = ingresoNeto > 0 ? (utilidadNetaFinal / ingresoNeto) * 100 : 0;

    // Actualizar UI
    document.getElementById('res-ingresos').innerText = format(precioVenta);
    document.getElementById('res-ingreso-neto').innerText = format(ingresoNeto);
    document.getElementById('res-iva-neto').innerText = format(ivaNetoAPagar);
    document.getElementById('res-planilla').innerText = format(costoTotalPlanilla);
    document.getElementById('res-tercerizados').innerText = format(totalCostoTercerizados);
    document.getElementById('res-resp-civil').innerText = format(costoRC);
    document.getElementById('res-costos').innerText = format(flujoCajaCostos);
    document.getElementById('res-utilidad-bruta').innerText = format(utilidadMensualGravable);
    document.getElementById('res-renta-monto').innerText = format(montoRenta);

    const margenBox = document.getElementById('margen-box');
    const resMargen = document.getElementById('res-margen');
    const resPorcentaje = document.getElementById('res-porcentaje-margen');

    resMargen.innerText = format(utilidadNetaFinal);
    resPorcentaje.innerText = porcentajeMargen.toFixed(2) + '%';

    // Colores dinámicos
    if (utilidadNetaFinal < 0) {
        resMargen.style.color = '#ff6b6b';
        margenBox.style.background = 'rgba(231, 76, 60, 0.15)';
    } else {
        resMargen.style.color = '#2ecc71';
        margenBox.style.background = 'rgba(46, 204, 113, 0.15)';
    }

    // El gráfico debe sumar todas las salidas de dinero reales
    const totalImpuestos = ivaNetoAPagar + montoRenta;
    updateChart(costoTotalPlanilla, totalCostoTercerizadosNeto, totalImpuestos + costoRC, utilidadNetaFinal);
}

function updateChart(planilla, tercerizados, otrosYImpuestos, utilidad) {
    const ctx = document.getElementById('costChart').getContext('2d');

    // Calcular total para porcentajes
    const total = planilla + tercerizados + otrosYImpuestos + Math.max(0, utilidad);

    const data = {
        labels: [
            'Costos de Planilla (Salarios + Cargas)',
            'Servicios Tercerizados (Operativos)',
            'Impuestos y Póliza RC (Carga Fiscal)',
            'Utilidad Neta (Ganancia Real)'
        ],
        datasets: [{
            data: [planilla, tercerizados, otrosYImpuestos, Math.max(0, utilidad)],
            backgroundColor: [
                '#3498db', // Blue
                '#9b59b6', // Purple
                '#e74c3c', // Red
                '#2ecc71'  // Green
            ],
            hoverOffset: 15,
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        },
                        color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#fff' : '#333',
                        generateLabels: (chart) => {
                            const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                            original.forEach(label => {
                                const value = chart.data.datasets[0].data[label.index];
                                const perc = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                label.text = `${label.text}: ${perc}%`;
                            });
                            return original;
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const perc = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ₡${value.toLocaleString()} (${perc}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    };

    if (mainChart) {
        mainChart.data = data;
        mainChart.options = config.options;
        mainChart.update();
    } else {
        mainChart = new Chart(ctx, config);
    }
}

function resetAll() {
    if (confirm('¿Borrar todos los datos?')) {
        localStorage.removeItem('laboral_calc_v2');
        empleados = [];
        tercerizados = [];
        location.reload();
    }
}

function toggleCard(id) {
    const card = document.getElementById(id);
    if (card) {
        card.classList.toggle('collapsed');
    }
}

function aplicarSugerenciaRenta() {
    limiteRenta30El.value = 119174000;
    render();
    saveState();
}

function exportarJSON() {
    const state = {
        metadata: {
            title: "Calculadora de Negocio 2026 - Exportación",
            date: new Date().toISOString(),
            currency: "CRC"
        },
        config: {
            ingresoTotal: ingresoTotalEl.value,
            tasaIva: tasaIvaEl.value,
            tipoRenta: tipoRentaEl.value,
            limiteRenta30: limiteRenta30El.value,
            porcHorasExtra: porcHorasExtraEl.value,
            feriadosMes: feriadosMesEl.value,
            porcRespCivil: porcRespCivilEl.value
        },
        data: {
            empleados: empleados,
            tercerizados: tercerizados
        }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "calculadora_negocio_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const state = JSON.parse(e.target.result);

            // Validar estructura básica
            if (!state.config || !state.data) {
                alert('Archivo JSON no válido para esta calculadora.');
                return;
            }

            // Actualizar inputs
            ingresoTotalEl.value = state.config.ingresoTotal || 5000000;
            tasaIvaEl.value = state.config.tasaIva || '0.13';
            tipoRentaEl.value = state.config.tipoRenta || 'juridica';
            limiteRenta30El.value = state.config.limiteRenta30 || 119174000;
            porcHorasExtraEl.value = state.config.porcHorasExtra || 1.5;
            feriadosMesEl.value = state.config.feriadosMes || 1;
            porcRespCivilEl.value = state.config.porcRespCivil || 0.2;

            // Actualizar datos
            empleados = state.data.empleados || [];
            tercerizados = state.data.tercerizados || [];

            // Actualizar UI condicional
            rentaFijaGroup.style.display = tipoRentaEl.value === 'fija' ? 'block' : 'none';
            pymeThresholdGroup.style.display = tipoRentaEl.value === 'juridica' ? 'block' : 'none';

            render();
            saveState();
            alert('¡Datos importados con éxito!');
        } catch (err) {
            console.error(err);
            alert('Error al procesar el archivo JSON.');
        }
    };
    reader.readAsText(file);
    // Limpiar input para permitir importar el mismo archivo de nuevo
    event.target.value = '';
}

// Hacer funciones globales para onclick
window.eliminarEmpleado = eliminarEmpleado;
window.eliminarTercerizado = eliminarTercerizado;
window.ajustarSalario = ajustarSalario;
window.actualizarEmpleado = actualizarEmpleado;
window.actualizarTercerizado = actualizarTercerizado;
window.resetAll = resetAll;
window.toggleCard = toggleCard;
window.aplicarSugerenciaRenta = aplicarSugerenciaRenta;
window.exportarJSON = exportarJSON;
window.importarJSON = importarJSON;

window.onload = init;
