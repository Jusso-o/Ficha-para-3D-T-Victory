// script.js - Lógica 3D&T Victory Completa e Corrigida

const NOME_STORAGE = 'ficha3DTVictoryData'; 

// === 1. VARIÁVEIS DE CONFIGURAÇÃO E REFERÊNCIAS DOM ===
const CUSTO_TECNICA_COMUM = 1;
const CUSTO_TECNICA_LENDARIA = 2;

// Função para garantir que o elemento exista antes de tentar referenciá-lo
const getElement = (id) => document.getElementById(id);

// Referências de Atributos
const inputPoder = getElement('input_poder');
const inputHabilidade = getElement('input_hab');
const inputResistencia = getElement('input_resis');

// Referências de Pontuação
const inputPontosBase = getElement('input_pontos_base'); // Pontos Totais (EDITÁVEL)
const inputPontos = getElement('input_pontos'); // Pontos Restantes (DISPLAY)
const inputXP = getElement('input_xp'); // XP (APENAS REGISTRO)

// IMAGEM
const imgPersonagemDisplay = getElement('imagem_personagem_display'); 

// RECURSOS PV/PM/PA
const displayPV = getElement('display_pv');
const displayPM = getElement('display_pm');
const displayPA = getElement('display_pa');
const inputPVAtual = getElement('input_pv_atual');
const inputPMAtual = getElement('input_pm_atual');
const inputPAAtual = getElement('input_pa_atual');
const inputAjustePV = getElement('input_ajuste_pv');
const inputAjustePM = getElement('input_ajuste_pm');
const inputAjustePA = getElement('input_ajuste_pa'); 

// Outros Custos
const checkboxesPericias = document.querySelectorAll('input[name="pericias"]'); 
const selectRaca = getElement('raca_arquetipo');
const inputTecComum = getElement('input_tec_comum');
const inputTecLendaria = getElement('input_tec_lendaria');
const inputCustoVantagens = getElement('input_custo_vantagens');
const inputCustoDesvantagens = getElement('input_custo_desvantagens');
const allInputs = document.querySelectorAll('#fichaForm input, #fichaForm select, #fichaForm textarea');


// === 2. LÓGICA DE CUSTO E DEPENDÊNCIA ===

const parseValue = (element) => parseInt(element ? element.value : 0) || 0;

function calcularCustoAtributo(nivel) {
    if (nivel <= 5) { return nivel; }
    return 5 + (nivel - 5) * 2;
}

// === FUNÇÃO CORRIGIDA NA SEÇÃO 2 ===

function obterCustoArquetipo(valorRaca) {
    
    // CORREÇÃO: Se o valor da raça for nulo ou vazio (estado inicial do select), o custo é 0
    if (!valorRaca) {
        return 0; 
    }
    
    switch (valorRaca) {
        case 'centauro': case 'ciborgue': case 'construto': 
        case 'minotauro': case 'ogro': return 2;
        case 'humano': case 'outros': return 0;
        default: return 1; // Custo padrão para raças de 1 ponto não listadas explicitamente
    }
}
// ... restante do script.js

function calcularValoresMaximos() {
    const R = parseValue(inputResistencia);
    const H = parseValue(inputHabilidade);
    
    const pvMax = R * 5; 
    const pmMax = H * 5; 
    const paMax = H; 

    // Atualiza os displays de máximo
    if (displayPV) displayPV.value = `${pvMax}`; 
    if (displayPM) displayPM.value = `${pmMax}`;
    if (displayPA) displayPA.value = `${paMax}`; 
    
    let pvAtual = parseValue(inputPVAtual);
    let pmAtual = parseValue(inputPMAtual);
    let paAtual = parseValue(inputPAAtual);

    // Limita os valores atuais aos máximos
    if (inputPVAtual) inputPVAtual.value = Math.max(0, Math.min(pvAtual, pvMax));
    if (inputPMAtual) inputPMAtual.value = Math.max(0, Math.min(pmAtual, pmMax));
    if (inputPAAtual) inputPAAtual.value = Math.max(0, Math.min(paAtual, paMax)); 
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

/** Calcula Pontos Restantes usando o valor de Pontos Totais (input_pontos_base). */
function atualizarPontos() {
    const pontosTotais = parseValue(inputPontosBase); 
    const custoGasto = calcularCustoGasto();
    const pontosRestantes = pontosTotais - custoGasto;

    if (inputPontos) {
        inputPontos.value = pontosRestantes; 

        // Feedback Visual
        if (pontosRestantes < 0) {
            inputPontos.classList.add('ponto-negativo'); 
        } else {
            inputPontos.classList.remove('ponto-negativo');
        }
    }
    
    return { pontosTotais, custoGasto, pontosRestantes };
}


function atualizarFichaCompleta(campoAlterado = null) {
    
    calcularValoresMaximos(); 
    
    const { pontosTotais, custoGasto, pontosRestantes } = atualizarPontos();

    // VALIDAÇÃO DE LIMITE 
    if (pontosRestantes < 0 && campoAlterado) {
        
        const tipo = campoAlterado.type;
        
        if (tipo === 'number') {
            campoAlterado.value = parseValue(campoAlterado) - 1; 
        } else if (tipo === 'checkbox') {
            campoAlterado.checked = false;
        } else if (tipo === 'select-one') {
            carregarFicha(); 
        }

        calcularValoresMaximos(); 
        const novoRecalculo = atualizarPontos();
        
        alert(`Limite de pontos excedido! Custo total: ${novoRecalculo.custoGasto}. Pontos disponíveis: ${novoRecalculo.pontosTotais}. A última mudança foi desfeita.`);
    }
    
    salvarFicha();
}


// === 3. LÓGICA DE AJUSTE E RESTAURAÇÃO (PV/PM/PA) ===

function aplicarAjuste(inputAtual, inputAjuste, displayMax) {
    let valorAtual = parseValue(inputAtual);
    const valorAjuste = parseValue(inputAjuste); 
    const valorMax = parseValue(displayMax);
    
    if (valorAjuste === 0 || !inputAtual) return; 

    valorAtual += valorAjuste;
    valorAtual = Math.max(0, Math.min(valorAtual, valorMax));

    inputAtual.value = valorAtual;
    inputAjuste.value = '';
    
    salvarFicha();
}

window.aplicarAjustePV = function() {
    aplicarAjuste(inputPVAtual, inputAjustePV, displayPV);
}
window.restaurarPVMax = function() {
    if (inputPVAtual && displayPV) inputPVAtual.value = parseValue(displayPV);
    salvarFicha();
}

window.aplicarAjustePM = function() {
    aplicarAjuste(inputPMAtual, inputAjustePM, displayPM);
}
window.restaurarPMMax = function() {
    if (inputPMAtual && displayPM) inputPMAtual.value = parseValue(displayPM);
    salvarFicha();
}

window.aplicarAjustePA = function() {
    aplicarAjuste(inputPAAtual, inputAjustePA, displayPA);
}

window.ganharPA = function() {
    let valorAtual = parseValue(inputPAAtual);
    const valorMax = parseValue(displayPA);
    
    if (inputPAAtual && valorAtual < valorMax) {
        inputPAAtual.value = Math.min(valorAtual + 1, valorMax);
        salvarFicha();
    } else if (inputPAAtual) {
        alert('PA Máximo (H) atingido!');
    }
}


// === 4. LÓGICA DE IMAGEM E BASE64 ===
window.previewImagem = function(event) {
    const file = event.target.files[0];
    
    if (file && imgPersonagemDisplay) { 
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
    
    if (imgPersonagemDisplay) {
        if (base64) {
            imgPersonagemDisplay.src = base64;
        } else {
            imgPersonagemDisplay.src = 'placeholder_imagem.png'; 
        }
    }
}


// === 5. LÓGICA DE PERSISTÊNCIA (localStorage) ===

window.salvarFicha = function() {
    const dadosFicha = {};
    
    allInputs.forEach(element => {
        if (element.id.startsWith('input_ajuste_') || element.type === 'file') {
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

function carregarFicha() {
    const dadosSalvos = localStorage.getItem(NOME_STORAGE);
    if (!dadosSalvos) {
        if (inputPVAtual) inputPVAtual.value = 0;
        if (inputPMAtual) inputPMAtual.value = 0;
        if (inputPAAtual) inputPAAtual.value = 0;
        return;
    }

    const dados = JSON.parse(dadosSalvos);

    allInputs.forEach(element => {
        const id = element.id;
        
        if (id.startsWith('input_ajuste_') || element.type === 'file') {
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


// === 7. LÓGICA DE RESET COM CONFIRMAÇÃO (REVISADO) ===

/**
 * Pede confirmação ao usuário antes de resetar a ficha.
 * Esta função deve ser chamada pelo botão no HTML: onclick="confirmarResetFicha()"
 */
window.confirmarResetFicha = function() {
    // Confirmação clara
    const confirmacao = confirm("ATENÇÃO: Você tem certeza que deseja APAGAR COMPLETAMENTE esta ficha? Todos os dados, incluindo a imagem, serão perdidos.");
    
    if (confirmacao) {
        resetarFicha();
    } else {
        alert("Reset cancelado. Seus dados estão seguros.");
    }
}

/**
 * Executa o reset completo: limpa armazenamento local e força recarga.
 */
function resetarFicha() {
    // 1. Limpa o Local Storage do personagem (dados do formulário)
    localStorage.removeItem(NOME_STORAGE);
    
    // 2. Limpa o Local Storage da imagem
    localStorage.removeItem('imagemBase64');
    
    // 3. Força a recarga da página. Isso limpa todos os campos, o estado JavaScript
    //    e carrega os valores padrão do HTML novamente.
    window.location.reload(true); // O 'true' força um recarregamento do cache (embora desnecessário em navegadores modernos)
}


// === 8. CONFIGURAÇÃO DE EVENT LISTENERS E INICIALIZAÇÃO ===

function configurarListeners() {
    
    const camposImportantes = [
        inputPoder, inputHabilidade, inputResistencia, selectRaca, 
        inputTecComum, inputTecLendaria, inputCustoVantagens, inputCustoDesvantagens,
        inputPontosBase 
    ];

    // Listeners para Campos Importantes e Checkboxes de Perícias
    [...camposImportantes, ...checkboxesPericias].forEach(element => {
        if (element) {
            element.addEventListener('input', () => atualizarFichaCompleta(element));
            element.addEventListener('change', () => atualizarFichaCompleta(element));
        }
    });
    
    // Listeners de Enter para ajuste de recursos (PV, PM, PA)
    if (inputAjustePV) inputAjustePV.addEventListener('keydown', (event) => { if (event.key === 'Enter') { aplicarAjustePV(); event.preventDefault(); } });
    if (inputAjustePM) inputAjustePM.addEventListener('keydown', (event) => { if (event.key === 'Enter') { aplicarAjustePM(); event.preventDefault(); } });
    if (inputAjustePA) inputAjustePA.addEventListener('keydown', (event) => { if (event.key === 'Enter') { aplicarAjustePA(); event.preventDefault(); } });

    // Listener para outros campos (XP, etc.) - Apenas salva
    document.querySelectorAll('input[type="text"], input[type="number"]:not([id^="input_ajuste_"])').forEach(input => {
        if (![...camposImportantes, inputPontos].includes(input) && input) {
            input.addEventListener('input', salvarFicha);
        }
    });

    // INICIALIZAÇÃO 
    document.addEventListener('DOMContentLoaded', () => {
        carregarImagem(); 
        carregarFicha(); 
        atualizarFichaCompleta(); 
    });
}

// === NOVA FUNÇÃO: SALVAR COMO PDF ===

/**
 * Salva a ficha em formato PDF (usando a função de impressão do navegador)
 */
window.salvarComoPDF = function() {
    // 1. Oculta elementos que não devem aparecer no PDF (botões, campos de ajuste, etc.)
    //    A maneira mais fácil de fazer isso é usando CSS Print Media Queries.
    //    Vou apenas chamar a função de impressão e dar uma instrução sobre o CSS.
    
    // 2. Dispara a janela de impressão
    window.print();
    
    // Nota: O CSS da sua página (index.css ou styles.css) deve ter uma seção
    //       para ocultar os botões na impressão, como:
    /*
    @media print {
        .btn-reset, .btn-pdf, .btn-upload, .grupo-ajuste {
            display: none !important;
        }
        // ... (qualquer outro ajuste visual necessário para impressão)
    }
    */
}

configurarListeners();