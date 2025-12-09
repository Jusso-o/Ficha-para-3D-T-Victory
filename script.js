// script.js - Lógica 3D&T Victory com Ajuste, Botão de Cura Max e Imagem

// === Variável Global para a Base de Pontos ===
let PONTOS_INICIAIS = 10; // Mantém o valor inicial padrão (10)
const NOME_STORAGE = 'ficha3DTVictoryData'; 

// === 1. VARIÁVEIS DE CONFIGURAÇÃO E REFERÊNCIAS DOM ===
const CUSTO_TECNICA_COMUM = 1;
const CUSTO_TECNICA_LENDARIA = 2;

const inputPontos = document.getElementById('input_pontos');
const inputPoder = document.getElementById('input_poder');
const inputHabilidade = document.getElementById('input_hab');
const inputResistencia = document.getElementById('input_resis');

// Imagem
const imgPersonagemDisplay = document.getElementById('imagem_personagem_display');

// RECURSOS PV/PM
const displayPV = document.getElementById('display_pv');
const displayPM = document.getElementById('display_pm');
const inputPVAtual = document.getElementById('input_pv_atual');
const inputPMAtual = document.getElementById('input_pm_atual');

// CAMPOS DE AJUSTE
const inputAjustePV = document.getElementById('input_ajuste_pv');
const inputAjustePM = document.getElementById('input_ajuste_pm');

// Outros Custos
const checkboxesPericias = document.querySelectorAll('input[name="pericias"]'); 
const selectRaca = document.getElementById('raca_arquetipo');
const inputTecComum = document.getElementById('input_tec_comum');
const inputTecLendaria = document.getElementById('input_tec_lendaria');
const inputCustoVantagens = document.getElementById('input_custo_vantagens');
const inputCustoDesvantagens = document.getElementById('input_custo_desvantagens');
const allInputs = document.querySelectorAll('#fichaForm input, #fichaForm select, #fichaForm textarea');


// === 2. LÓGICA DE CUSTO E DEPENDÊNCIA ===

const parseValue = (element) => parseInt(element ? element.value : 0) || 0;

function calcularCustoAtributo(nivel) {
    if (nivel <= 5) { return nivel; }
    return 5 + (nivel - 5) * 2;
}

function obterCustoArquetipo(valorRaca) {
    switch (valorRaca) {
        case 'centauro': case 'ciborgue': case 'construto': 
        case 'minotauro': case 'ogro': return 2;
        case 'humano': case 'outros': return 0;
        default: return 1;
    }
}

function calcularValoresMaximos() {
    const R = parseValue(inputResistencia);
    const H = parseValue(inputHabilidade);
    const pvMax = R * 5; 
    const pmMax = H * 5; 

    displayPV.value = `${pvMax}`; 
    displayPM.value = `${pmMax}`;
    
    let pvAtual = parseValue(inputPVAtual);
    let pmAtual = parseValue(inputPMAtual);
    
    // Garante que o valor atual não exceda o novo Máximo
    inputPVAtual.value = Math.max(0, Math.min(pvAtual, pvMax));
    inputPMAtual.value = Math.max(0, Math.min(pmAtual, pmMax));
}

function calcularCustoGasto() {
    let custoTotal = 0;
    custoTotal += calcularCustoAtributo(parseValue(inputPoder));
    custoTotal += calcularCustoAtributo(parseValue(inputHabilidade));
    custoTotal += calcularCustoAtributo(parseValue(inputResistencia));

    checkboxesPericias.forEach(checkbox => {
        if (checkbox.checked) { custoTotal += 1; }
    });

    custoTotal += (parseValue(inputTecComum) * CUSTO_TECNICA_COMUM);
    custoTotal += (parseValue(inputTecLendaria) * CUSTO_TECNICA_LENDARIA);
    custoTotal += obterCustoArquetipo(selectRaca.value);
    custoTotal += parseValue(inputCustoVantagens); 
    custoTotal -= parseValue(inputCustoDesvantagens); 
    
    return custoTotal;
}

/** 🚨 FUNÇÃO CORRIGIDA 🚨 */
function atualizarPontosRestantes() {
    // Carrega o valor inicial de pontos que deve ser usado para o cálculo.
    // Usamos o valor salvo no localStorage para garantir que XP/pontos extras sejam considerados.
    const pontosIniciaisParaCalculo = parseValue(document.getElementById('input_xp').value) + PONTOS_INICIAIS; 

    const custoGasto = calcularCustoGasto();
    const pontosRestantes = pontosIniciaisParaCalculo - custoGasto;

    // Se o usuário está focando no campo, não alteramos o valor do input
    if (document.activeElement !== inputPontos) {
        inputPontos.value = pontosRestantes; 
    }

    const corFundo = pontosRestantes < 0 ? '#ffcccc' : '#ccffcc'; 
    inputPontos.style.backgroundColor = corFundo;
    inputPontos.style.color = 'black';
}

/** Função mestra que atualiza todos os dados da ficha e salva. */
function atualizarFichaCompleta() {
    calcularValoresMaximos(); 
    atualizarPontosRestantes();
    salvarFicha();
}

// === 3. LÓGICA DE AJUSTE E RESTAURAÇÃO (Mantida) ===

function aplicarAjuste(inputAtual, inputAjuste, displayMax) {
    let valorAtual = parseValue(inputAtual);
    const valorAjuste = parseValue(inputAjuste); 
    const valorMax = parseValue(displayMax);
    
    if (valorAjuste === 0) return; 

    valorAtual += valorAjuste;
    valorAtual = Math.max(0, Math.min(valorAtual, valorMax));

    inputAtual.value = valorAtual;
    inputAjuste.value = '';
    
    salvarFicha();
}

window.aplicarAjustePV = function() {
    aplicarAjuste(inputPVAtual, inputAjustePV, displayPV);
}

window.aplicarAjustePM = function() {
    aplicarAjuste(inputPMAtual, inputAjustePM, displayPM);
}

window.restaurarPVMax = function() {
    const pvMax = parseValue(displayPV);
    inputPVAtual.value = pvMax;
    salvarFicha();
}

window.restaurarPMMax = function() {
    const pmMax = parseValue(displayPM);
    inputPMAtual.value = pmMax;
    salvarFicha();
}

// === 4. LÓGICA DE IMAGEM E BASE64 ===

window.previewImagem = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPersonagemDisplay.src = e.target.result;
            localStorage.setItem('imagemBase64', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function carregarImagem() {
    const base64 = localStorage.getItem('imagemBase64');
    if (base64) {
        imgPersonagemDisplay.src = base64;
    } else {
        imgPersonagemDisplay.src = 'placeholder_imagem.png'; 
    }
}


// === 5. LÓGICA DE PERSISTÊNCIA (localStorage) ===

window.salvarFicha = function() {
    const dadosFicha = {};
    
    allInputs.forEach(element => {
        if (element.id === 'input_ajuste_pv' || element.id === 'input_ajuste_pm' || element.type === 'file') {
            return;
        }
        
        if (element.type === 'checkbox') {
            dadosFicha[element.name + '_' + element.value] = element.checked;
        } else {
            dadosFicha[element.id] = element.value;
        }
    });

    localStorage.setItem(NOME_STORAGE, JSON.stringify(dadosFicha));
}

/** Carrega os dados salvos do localStorage para a ficha. */
function carregarFicha() {
    const dadosSalvos = localStorage.getItem(NOME_STORAGE);
    if (!dadosSalvos) {
        // Inicialização padrão se não houver dados salvos
        inputPVAtual.value = 0;
        inputPMAtual.value = 0;
        return;
    }

    const dados = JSON.parse(dadosSalvos);

    allInputs.forEach(element => {
        const id = element.id;
        
        if (id === 'input_ajuste_pv' || id === 'input_ajuste_pm' || element.type === 'file') {
            return;
        }
        
        if (element.type === 'checkbox') {
            const key = element.name + '_' + element.value;
            if (dados[key] !== undefined) {
                element.checked = dados[key];
            }
        } else if (dados[id] !== undefined) {
            element.value = dados[id];
        }
    });

    configurarTextareas();
}


// === 6. LÓGICA DE REDIMENSIONAMENTO DE TEXTAREA ===

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px';
}

function configurarTextareas() {
    const textareas = document.querySelectorAll('textarea');

    textareas.forEach(textarea => {
        if (!textarea.hasAttribute('data-listener-active')) {
             textarea.addEventListener('input', () => {
                autoResizeTextarea(textarea);
                salvarFicha(); 
            });
            textarea.setAttribute('data-listener-active', 'true');
        }
        autoResizeTextarea(textarea);
    });
}


// === 7. CONFIGURAÇÃO DE EVENT LISTENERS E INICIALIZAÇÃO ===

function configurarListeners() {
    
    const camposImportantes = [
        inputPoder, inputHabilidade, inputResistencia, selectRaca, 
        inputTecComum, inputTecLendaria, inputCustoVantagens, inputCustoDesvantagens,
    ];

    camposImportantes.forEach(element => {
        element.addEventListener('input', atualizarFichaCompleta);
        element.addEventListener('change', atualizarFichaCompleta);
    });
    
    // Listeners de Enter para aplicar ajuste
    inputAjustePV.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            aplicarAjustePV();
            event.preventDefault(); 
        }
    });
    inputAjustePM.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            aplicarAjustePM();
            event.preventDefault();
        }
    });

    // Checkboxes (afetam o custo)
    checkboxesPericias.forEach(checkbox => {
        checkbox.addEventListener('change', atualizarFichaCompleta);
    });
    
    // Listener ESPECIAL para inputPontos e XP (afetam os pontos disponíveis)
    inputPontos.addEventListener('input', atualizarFichaCompleta);
    document.getElementById('input_xp').addEventListener('input', atualizarFichaCompleta);


    // Listener para campos de texto (Nome do jogador, descrição, etc.)
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', salvarFicha);
    });

    // INICIALIZAÇÃO AJUSTADA
    document.addEventListener('DOMContentLoaded', () => {
        carregarImagem(); // 1. Carrega a imagem salva (Base64)
        carregarFicha(); // 2. Carrega todos os valores salvos no DOM (incluindo o último valor de input_pontos)
        
        // 3. Recalcula (e salva) os valores com base nos dados carregados.
        // O valor de 'input_pontos' que foi carregado é o PONTOS RESTANTES FINAL.
        // A função atualizarPontosRestantes recalcula o PONTOS RESTANTES baseado no CUSTO
        // e garante que o valor seja o mesmo, a menos que os atributos tenham sido alterados manualmente
        // pelo usuário antes de recarregar.
        atualizarFichaCompleta(); 
    });
}

configurarListeners();