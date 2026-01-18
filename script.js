// ================= CLASSES =================
const classes = {
  "cx 6/1 ml 200 76 fardos": { tipo: "cx", ml: 200, limite: 76 },
  "pet 6/1 ml 1500 22 fardos": { tipo: "pet", ml: 1500, limite: 22, perfil: "padrao" },
  "pet 6/1 ml 1000 25 fardos": { tipo: "pet", ml: 1000, limite: 25, perfil: "padrao" },
  "pet 6/1 ml 1000 DV 20 fardos": { tipo: "pet", ml: 1000, limite: 20, perfil: "baixo_largo" },
  "cx 48/1 ml 310 12 fardos": { tipo: "cx", ml: 310, limite: 12 },
  "pet 8/1 ml 1500 20 fardos": { tipo: "pet", ml: 1500, limite: 20, perfil: "padrao" },
  "pet 6/1 ml 600 40 fardos": { tipo: "pet", ml: 600, limite: 40, perfil: "padrao" },
  "pet 12/1 ml 500 24 fardos": { tipo: "pet", ml: 500, limite: 24, perfil: "padrao" },
  "lt 6/1 ml 220 60 fardos": { tipo: "lt", ml: 220, limite: 60 },
  "cx 6/1 ml 1500 22 fardos": { tipo: "cx", ml: 1500, limite: 22 },
  "cx 12/1 ml 200 40 fardos": { tipo: "cx", ml: 200, limite: 40 },
  "cx 6/1 ml 1000 32 fardos": { tipo: "cx", ml: 1000, limite: 32 },
  "lt 12/1 ml 260 28 fardos": { tipo: "lt", ml: 260, limite: 28 },
  "lt 12/1 ml 350 28 fardos": { tipo: "lt", ml: 350, limite: 28 },
  "lt 6/1 ml 350 45 fardos": { tipo: "lt", ml: 350, limite: 45 },
  "pet 6/1 ml 2000 20 fardos": { tipo: "pet", ml: 2000, limite: 20, perfil: "padrao" },
  "pet 6/1 ml 2500 15 fardos": { tipo: "pet", ml: 2500, limite: 15, perfil: "padrao" },
  "pet 6/1 ml 3000 15 fardos": { tipo: "pet", ml: 3000, limite: 15, perfil: "padrao" }
};

// ================= DADOS =================
const produtos = [];

// ================= ELEMENTOS =================
const selectClasse = document.getElementById("classe");
const lista = document.getElementById("lista");
const resultado = document.getElementById("resultado");
const nomeInput = document.getElementById("nome");
const qtdInput = document.getElementById("quantidade");

// ================= SELECT =================
Object.keys(classes).forEach(nomeClasse => {
  const option = document.createElement("option");
  option.value = nomeClasse;
  option.textContent = nomeClasse;
  selectClasse.appendChild(option);
});

// ================= LISTA VISUAL =================
function renderLista() {
  lista.innerHTML = "";
  produtos.forEach((p, i) => {
    lista.innerHTML += `
      <div class="item">
        <strong>${p.nome}</strong><br>
        ${p.classe}<br>
        Quantidade: <b>${p.quantidade}</b><br>
        <button onclick="remover(${i})">❌ Remover</button>
      </div>
    `;
  });
}

function remover(i) {
  produtos.splice(i, 1);
  renderLista();
}

// ================= ADICIONAR =================
document.getElementById("btnAdicionar").onclick = () => {
  const nome = nomeInput.value.trim();
  const classe = selectClasse.value;
  const quantidade = Number(qtdInput.value);

  if (!nome || quantidade <= 0) {
    alert("Preencha corretamente");
    return;
  }

  produtos.push({
    nome,
    classe,
    quantidade,
    ...classes[classe]
  });

  nomeInput.value = "";
  qtdInput.value = "";
  renderLista();
};

// ================= COMPATIBILIDADE =================
function compativel(a, b) {

  // DV baixo e largo: só 600 ou 500
  if (a.perfil === "baixo_largo") {
    return b.ml === 600 || b.ml === 500;
  }
  if (b.perfil === "baixo_largo") {
    return a.ml === 600 || a.ml === 500;
  }

  // Regras por faixa
  if (a.ml === 3000) return b.ml === 2000;
  if (a.ml === 2000) return b.ml === 1500 || b.ml === 3000;
  if (a.ml === 1500) return b.ml === 1000 || b.ml === 2000;
  if (a.ml === 1000) return b.ml >= 500 && b.ml <= 1500;

  // Outros: diferença até 100 ml
  return Math.abs(a.ml - b.ml) <= 100;
}

// ================= PALETIZAÇÃO =================
document.getElementById("btnCalcular").onclick = () => {
  resultado.textContent = "";

  const fila = produtos.map(p => ({ ...p }));
  let camada = 1;
  let texto = "";

  while (fila.some(p => p.quantidade > 0)) {

    texto += "====================================\n";
    texto += `CAMADA ${camada}\n`;
    texto += "====================================\n";

    // maior limite primeiro
    fila.sort((a, b) => b.limite - a.limite);

    const base = fila.find(p => p.quantidade > 0);
    let fechou = false;

    // 🔴 PRIORIDADE DV BAIXO E LARGO
    if (base.perfil === "baixo_largo" && base.quantidade < base.limite) {
      const comp = fila.find(p =>
        p.quantidade > 0 &&
        (p.ml === 600 || p.ml === 500)
      );

      if (comp) {
        const qtdBase = Math.min(base.quantidade, Math.floor(base.limite / 2));
        const qtdComp = Math.min(comp.quantidade, Math.floor(comp.limite / 2));

        if (qtdBase > 0 && qtdComp > 0) {
          texto += `${base.nome} = ${qtdBase}\n`;
          texto += `${comp.nome} = ${qtdComp}\n`;

          base.quantidade -= qtdBase;
          comp.quantidade -= qtdComp;
          fechou = true;
        }
      }
    }

    // 🔵 MISTURA NORMAL
    if (!fechou) {
      for (const p of fila) {
        if (p === base || p.quantidade <= 0) continue;
        if (!compativel(base, p)) continue;

        const qtdBase = Math.min(base.quantidade, Math.floor(base.limite / 2));
        const qtdP = Math.min(p.quantidade, Math.floor(p.limite / 2));

        if (qtdBase > 0 && qtdP > 0) {
          texto += `${base.nome} = ${qtdBase}\n`;
          texto += `${p.nome} = ${qtdP}\n`;

          base.quantidade -= qtdBase;
          p.quantidade -= qtdP;
          fechou = true;
          break;
        }
      }
    }

    // ⚪ FECHAMENTO SOZINHO
    if (!fechou && base.quantidade > 0) {
      const qtd = Math.min(base.quantidade, base.limite);
      texto += `${base.nome} = ${qtd}\n`;
      base.quantidade -= qtd;
    }

    texto += "\n";
    camada++;
  }

  resultado.textContent = texto;
};