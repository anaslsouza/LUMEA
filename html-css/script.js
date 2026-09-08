// 1. STATE & DATA
const orderState = {
    brownie: 0,
    caramelo: 0,
    citricos: 0
};

const prices = {
    brownie: 12.00,
    caramelo: 13.00,
    citricos: 12.50
};

function getLocationsData() {
    return {
        fea: {
            title: "FEA — Engenharia de Alimentos",
            badge: "🟢 PONTO FIXO DE ESTOQUE",
            badgeClass: "badge-fixed-stock",
            desc: "Ponto fixo principal! Disponibilidade imediata dos 3 sabores na vivência/cantina da FEA.",
            selectValue: "FEA - Faculdade de Engenharia de Alimentos"
        },
        iq: {
            title: "IQ — Instituto de Química",
            badge: "🟢 PONTO FIXO DE ESTOQUE",
        badgeClass: "badge-fixed-stock",
        desc: "Ponto de estoque garantido! Encontre nossos cookies prontos na praça central do IQ.",
        selectValue: "IQ - Instituto de Química"
    },
    ib: {
        title: "IB — Instituto de Biologia",
        badge: "🟢 PONTO FIXO DE ESTOQUE",
        badgeClass: "badge-fixed-stock",
        desc: "Ponto fixo de venda! Retirada imediata na área de vivência dos estudantes do IB.",
        selectValue: "IB - Instituto de Biologia"
    },
    ifgw: {
        title: "IFGW — Instituto de Física",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Sem ponto fixo contínuo, mas entregamos rapidinho no Café da Física assim que você pedir!",
        selectValue: "IFGW - Instituto de Física"
    },
    imecc: {
        title: "IMECC — Matemática & Estatística",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Montamos seu pedido e levamos até o térreo ou vivência do IMECC no campus.",
        selectValue: "IMECC - Matemática"
    },
    feec: {
        title: "FEEC — Engenharia Elétrica",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Entregamos seu pedido direto na vivência da FEEC.",
        selectValue: "FEEC - Engenharia Elétrica"
    }
};

let activeLocationKey = 'fea';

// 2. WEB AUDIO SYNTHESIZER
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, type = 'sine', duration = 0.15) {
    if (!soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

document.getElementById('soundToggle').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('soundIcon').textContent = soundEnabled ? '🔊' : '🔇';
    document.getElementById('soundText').textContent = soundEnabled ? 'SOM' : 'MUTADO';
    if (soundEnabled) playTone(440);
});

// 3. WHATSAPP ORDER BUILDER
function updateQty(flavor, delta) {
    orderState[flavor] = Math.max(0, orderState[flavor] + delta);
    document.getElementById(`qty-${flavor}`).textContent = orderState[flavor];
    calculateTotal();
    if (delta > 0) playTone(500, 'triangle');
    else playTone(300, 'sine');
}

function addToWhatsappOrder(flavor) {
    updateQty(flavor, 1);
    switchTab('whatsapp');
    document.getElementById('comprar').scrollIntoView({ behavior: 'smooth' });
}

function calculateTotal() {
    const total = (orderState.brownie * prices.brownie) +
                  (orderState.caramelo * prices.caramelo) +
                  (orderState.citricos * prices.citricos);

    document.getElementById('orderTotalValue').textContent = 
        total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function sendWhatsappOrder() {
    const total = (orderState.brownie * prices.brownie) +
                  (orderState.caramelo * prices.caramelo) +
                  (orderState.citricos * prices.citricos);

    if (total === 0) {
        alert('Por favor, adicione pelo menos 1 cookie ao seu pedido!');
        return;
    }

    const location = document.getElementById('locationSelect').value;
    let itemsText = '';

    if (orderState.brownie > 0) itemsText += `• ${orderState.brownie}x Cookie Brownie\n`;
    if (orderState.caramelo > 0) itemsText += `• ${orderState.caramelo}x Cookie Caramelo Salgado\n`;
    if (orderState.citricos > 0) itemsText += `• ${orderState.citricos}x Cookie Cítricos Sunburst\n`;

    const message = `Olá! Gostaria de fazer um pedido de cookies LUMEA para entrega na UNICAMP:\n\n` +
                    `*Itens:*\n${itemsText}\n` +
                    `*Local de Entrega:* ${location}\n` +
                    `*Total:* ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n` +
                    `Como podemos combinar a entrega?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5519999999999?text=${encodedMessage}`, '_blank');
}

// 4. MAP & TABS
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'whatsapp') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-whatsapp').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-mapa').classList.add('active');
    }
    playTone(350, 'sine');
}

function selectLocation(key) {
    activeLocationKey = key;
    const data = locationsData[key];

    document.querySelectorAll('.map-pin').forEach(pin => pin.classList.remove('selected'));
    document.getElementById(`pin-${key}`).classList.add('selected');

    document.getElementById('locationTitle').textContent = data.title;
    document.getElementById('locationBadge').textContent = data.badge;
    document.getElementById('locationBadge').className = `stock-badge ${data.badgeClass}`;
    document.getElementById('locationDesc').textContent = data.desc;

    playTone(480, 'triangle');
}

function orderForSelectedLocation() {
    const data = locationsData[activeLocationKey];
    document.getElementById('locationSelect').value = data.selectValue;
    switchTab('whatsapp');
}

// Dados de todos os locais do mapa
const locationsData = {
    pb: {
        title: "Ciclo Básico / PB — Praça da Paz",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Ponto de encontro central da UNICAMP! Entregamos nos bancos do Ciclo Básico, bandejão ou Praça da Paz."
    },
    fea: {
        title: "FEA — Engenharia de Alimentos",
        badge: "🟢 PONTO FIXO DE ESTOQUE",
        badgeClass: "badge-fixed-stock",
        desc: "Ponto de venda principal! Retirada imediata de cookies fresquinhos na área de vivência da FEA."
    },
    iq: {
        title: "IQ — Instituto de Química",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Entregamos na área de convivência e portaria do IQ sob demanda via WhatsApp!"
    },
    ib: {
        title: "IB — Instituto de Biologia",
        badge: "🟢 PONTO FIXO DE ESTOQUE",
        badgeClass: "badge-fixed-stock",
        desc: "Estoque disponível para retirada rápida perto dos laboratórios e vivência do IB."
    },
    ifgw: {
        title: "IFGW — Instituto de Física",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Entregamos no hall principal do IFGW sob solicitação!"
    },
    imecc: {
        title: "IMECC — Matemática e Computação",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Entregamos na vivência ou portaria do IMECC sob solicitação."
    },
    feec: {
        title: "FEEC — Engenharia Elétrica",
        badge: "🚀 ENTREGA SOB SOLICITAÇÃO",
        badgeClass: "badge-delivery-stock",
        desc: "Entregas no saguão central da FEEC sob solicitação."
    }
};

// Função executada ao clicar em qualquer pino
function selectLocation(key) {
    activeLocationKey = key;
    const data = locationsData[key];
    if (!data) return;

    // 1. Alterna a classe 'selected' nos pinos
    document.querySelectorAll('.map-pin').forEach(pin => pin.classList.remove('selected'));
    const selectedPin = document.getElementById(`pin-${key}`);
    if (selectedPin) {
        selectedPin.classList.add('selected');
    }

    // 2. Atualiza o Card de Informações
    const titleEl = document.getElementById('locationTitle');
    const badgeEl = document.getElementById('locationBadge');
    const descEl = document.getElementById('locationDesc');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) {
        badgeEl.textContent = data.badge;
        badgeEl.className = `stock-badge ${data.badgeClass}`;
    }

    // 3. Monta o texto de descrição e estoque (se disponível)
    let textoFinal = data.desc;

    if (typeof estoqueReal !== 'undefined' && estoqueReal.brownie) {
        if (['fea', 'ib'].includes(key)) {
            textoFinal += `<br><br><strong>📦 Estoque Atual no Local:</strong><br>` +
                          `• Brownie: <b>${estoqueReal.brownie[key] || 0} un</b><br>` +
                          `• Caramelo: <b>${estoqueReal.caramelo[key] || 0} un</b><br>` +
                          `• Cítricos: <b>${estoqueReal.citricos[key] || 0} un</b>`;
        } else {
            textoFinal += `<br><br><strong>📦 Disponível para Pronta Entrega:</strong><br>` +
                          `• Brownie: <b>${estoqueReal.brownie.prontaEntrega || 0} un</b><br>` +
                          `• Caramelo: <b>${estoqueReal.caramelo.prontaEntrega || 0} un</b><br>` +
                          `• Cítricos: <b>${estoqueReal.citricos.prontaEntrega || 0} un</b>`;
        }
    }

    if (descEl) descEl.innerHTML = textoFinal;
}

// Rola até o formulário e pré-seleciona o local
function orderForSelectedLocation() {
    const select = document.getElementById('locationSelect');
    if (select) select.value = activeLocationKey;

    const orderSection = document.getElementById('pedidos') || document.getElementById('comprar');
    if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Garante a seleção inicial ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    selectLocation('fea');
});
}

// 5. STICKER INTERACTION
const sticker = document.getElementById('heroSticker');
if (sticker) {
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        sticker.style.transform = `translate(${x}px, ${y}px) rotate(12deg)`;
    });
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();