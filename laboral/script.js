const feriados2026 = [
    { nombre: "1 Ene: Año Nuevo", tipo: "O", mes: 0 },
    { nombre: "2 Abr: Jueves Santo", tipo: "N", mes: 3 },
    { nombre: "3 Abr: Viernes Santo", tipo: "O", mes: 3 },
    { nombre: "11 Abr: Juan Santamaría", tipo: "O", mes: 3 },
    { nombre: "1 May: Día del Trabajo", tipo: "O", mes: 4 },
    { nombre: "25 Jul: Anexión Nicoya", tipo: "O", mes: 6 },
    { nombre: "2 Ago: Virgen Ángeles", tipo: "N", mes: 7 },
    { nombre: "15 Ago: Día la Madre", tipo: "O", mes: 7 },
    { nombre: "31 Ago: Afrodescendencia", tipo: "N", mes: 7 },
    { nombre: "15 Set: Independencia", tipo: "O", mes: 8 },
    { nombre: "1 Dic: Abolición Ejército", tipo: "N", mes: 11 },
    { nombre: "25 Dic: Navidad", tipo: "O", mes: 11 }
];

const selectCat = document.getElementById('categoriaMtss');
const inputSalario = document.getElementById('salarioBruto');
const inputExtras = document.getElementById('horasExtra');
const listaFeriadosUI = document.getElementById('listaFeriados');

// Tasas
const TASA_CCSS = 0.2683;
const TASA_AGUINALDO = 0.083333;
const TASA_VACACIONES = 0.041666;
const TASA_CESANTIA = 0.0533;
const TASA_INS = 0.025; // 2.5% estimado promedio para servicios

function init() {
    // Generar lista de feriados
    feriados2026.forEach((f, index) => {
        const div = document.createElement('label');
        div.className = `feriado-item ${f.tipo === 'O' ? 'mandatory' : 'non-mandatory'}`;
        div.innerHTML = `
            <input type="checkbox" class="chk-feriado" data-index="${index}">
            <span>${f.nombre}</span>
            ${f.tipo === 'O' ? '<span class="badge-obli">OBLI</span>' : ''}
        `;
        listaFeriadosUI.appendChild(div);
    });

    // Eventos
    selectCat.addEventListener('change', () => {
        if (selectCat.value !== 'custom') {
            inputSalario.value = selectCat.value;
            calculate();
        }
    });

    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', calculate);
    });

    document.querySelectorAll('.chk-feriado').forEach(el => {
        el.addEventListener('change', calculate);
    });

    calculate();
}

function format(val) {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(val);
}

function calculate() {
    const salarioBase = parseFloat(inputSalario.value) || 0;
    const hExtras = parseFloat(inputExtras.value) || 0;

    // Valor tiempo
    const valorDia = salarioBase / 30;
    const valorHora = valorDia / 8;

    // Feriados seleccionados
    const seleccionados = document.querySelectorAll('.chk-feriado:checked');
    const numFeriadosTrabajadosAnual = seleccionados.length;

    // Para el mensual, promediamos el costo de feriados (Total anual / 12) 
    // para dar una visión de flujo de caja constante.
    const costoAdicionalFeriado = valorDia; // Pago doble = Pago ya incluido + 1 adicional.

    // Extras
    const pagoExtrasMensual = hExtras * (valorHora * 1.5);

    // Feriados (impacto distribuido para el "Mes Promedio")
    const pagoFeriadosMensual = (numFeriadosTrabajadosAnual * costoAdicionalFeriado) / 12;

    const brutoTotalDevengado = salarioBase + pagoExtrasMensual + pagoFeriadosMensual;

    // Cargas y Provisiones
    const ccss = brutoTotalDevengado * TASA_CCSS;
    const agui = brutoTotalDevengado * TASA_AGUINALDO;
    const vaca = brutoTotalDevengado * TASA_VACACIONES;
    const cesa = brutoTotalDevengado * TASA_CESANTIA;
    const ins = brutoTotalDevengado * TASA_INS;

    const costoTotalMensual = brutoTotalDevengado + ccss + agui + vaca + cesa + ins;

    // UI Mensual
    document.getElementById('m-base').innerText = format(salarioBase);
    document.getElementById('m-extras').innerText = format(pagoExtrasMensual);
    document.getElementById('m-feriados').innerText = format(pagoFeriadosMensual);
    document.getElementById('m-bruto-total').innerText = format(brutoTotalDevengado);
    document.getElementById('m-ccss').innerText = format(ccss);
    document.getElementById('m-aguinaldo').innerText = format(agui);
    document.getElementById('m-vacaciones').innerText = format(vaca);
    document.getElementById('m-cesantia').innerText = format(cesa);
    document.getElementById('m-ins').innerText = format(ins);
    document.getElementById('m-total').innerText = format(costoTotalMensual);

    // Cálculos Empleado
    const cargasObrero = brutoTotalDevengado * 0.1067; // 10.67% (9.67% CCSS + 1% BP)
    const netoEstimado = brutoTotalDevengado - cargasObrero;

    document.getElementById('e-bruto').innerText = format(brutoTotalDevengado);
    document.getElementById('e-cargas').innerText = format(cargasObrero);
    document.getElementById('e-neto').innerText = format(netoEstimado);

    // Proyección Anual
    const totalSalariosAnual = (salarioBase * 12) + (pagoExtrasMensual * 12) + (numFeriadosTrabajadosAnual * costoAdicionalFeriado);
    const totalCargasAnual = (ccss * 12) + (vaca * 12) + (cesa * 12) + (ins * 12);
    const aguinaldoTotal = totalSalariosAnual * TASA_AGUINALDO;
    const presupuestoAnual = totalSalariosAnual + totalCargasAnual + aguinaldoTotal;

    document.getElementById('a-salarios').innerText = format(totalSalariosAnual);
    document.getElementById('a-cargas').innerText = format(totalCargasAnual);
    document.getElementById('a-aguinaldo').innerText = format(aguinaldoTotal);
    document.getElementById('a-total').innerText = format(presupuestoAnual);
}

window.onload = init;
