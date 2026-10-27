// BARRA DE NAVEGAÇÃO

const header = document.getElementById("header");
const menuToggle = document.getElementById("menu-toggle");
const navbarMenu = document.getElementById("navbar-menu");

function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 50);
}

function closeMenu() {
    navbarMenu.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
}

menuToggle.addEventListener("click", () => {
    const isOpen = navbarMenu.classList.toggle("active");

    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Fechar menu" : "Abrir menu"
    );
});

navbarMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
    if (
        !navbarMenu.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {
        closeMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

window.addEventListener("scroll", updateHeader, { passive: true });

updateHeader();

// SESSÃO ALUNOS

document.querySelectorAll("[data-carrossel]").forEach((carrossel) => {
    const trilha = carrossel.querySelector(".alunos-trilha");
    const anterior = carrossel.querySelector(".alunos-anterior");
    const proximo = carrossel.querySelector(".alunos-proximo");

    const imagensOriginais = Array.from(trilha.children);
    const quantidadeOriginal = imagensOriginais.length;

    let indice = 0;
    let visiveis = 3;
    let larguraImagem = 0;
    let espaco = 0;
    let animando = false;

    function quantidadeVisivel() {
        if (window.matchMedia("(max-width: 520px)").matches) return 1;
        if (window.matchMedia("(max-width: 768px)").matches) return 2;
        return 3;
    }

    function prepararCarrossel() {
        visiveis = quantidadeVisivel();

        trilha.querySelectorAll("[data-clone]").forEach((clone) => clone.remove());

        imagensOriginais.forEach((imagem) => {
            imagem.removeAttribute("data-clone");
        });

        for (let i = 0; i < visiveis; i++) {
            const cloneInicio = imagensOriginais[i].cloneNode(true);
            cloneInicio.setAttribute("data-clone", "true");
            trilha.appendChild(cloneInicio);

            const cloneFim = imagensOriginais[quantidadeOriginal - 1 - i].cloneNode(true);
            cloneFim.setAttribute("data-clone", "true");
            trilha.insertBefore(cloneFim, trilha.firstChild);
        }

        indice = visiveis;
        trilha.style.transition = "none";
        medir();
        posicionar();
        trilha.offsetHeight;
        trilha.style.transition = "transform 0.45s ease";
    }

    function medir() {
        const imagem = trilha.querySelector(".alunos-imagem");
        if (!imagem) return;

        larguraImagem = imagem.getBoundingClientRect().width;
        espaco = parseFloat(getComputedStyle(trilha).gap) || 0;
    }

    function posicionar() {
        trilha.style.transform =
            `translateX(-${indice * (larguraImagem + espaco)}px)`;
    }

    function mover(direcao) {
        if (animando) return;

        animando = true;
        indice += direcao;
        posicionar();
    }

    proximo.addEventListener("click", () => mover(1));
    anterior.addEventListener("click", () => mover(-1));

    trilha.addEventListener("transitionend", () => {
        if (indice >= quantidadeOriginal + visiveis) {
            trilha.style.transition = "none";
            indice = visiveis;
            posicionar();
            trilha.offsetHeight;
            trilha.style.transition = "transform 0.45s ease";
        }

        if (indice < visiveis) {
            trilha.style.transition = "none";
            indice = quantidadeOriginal + visiveis - 1;
            posicionar();
            trilha.offsetHeight;
            trilha.style.transition = "transform 0.45s ease";
        }

        animando = false;
    });

    let redimensionamento;
    window.addEventListener("resize", () => {
        clearTimeout(redimensionamento);
        redimensionamento = setTimeout(prepararCarrossel, 150);
    });

    prepararCarrossel();
});

// AVALIAÇÕES

document.querySelectorAll("[data-avaliacoes]").forEach((carrossel) => {
    const trilha = carrossel.querySelector(".avaliacoes-trilha");
    const anterior = carrossel.querySelector(".avaliacoes-anterior");
    const proximo = carrossel.querySelector(".avaliacoes-proximo");
    const paginacao = carrossel.querySelector(".avaliacoes-paginacao");

    const originais = Array.from(trilha.children);
    const total = originais.length;

    let indice = 0;
    let visiveis = 3;
    let largura = 0;
    let gap = 0;
    let ocupado = false;
    let inicioToque = 0;

    function quantidadeVisivel() {
        if (window.matchMedia("(max-width: 520px)").matches) return 1;
        if (window.matchMedia("(max-width: 768px)").matches) return 2;
        return 3;
    }

    function medir() {
        const item = trilha.querySelector(".avaliacao");
        if (!item) return;

        largura = item.getBoundingClientRect().width;
        gap = parseFloat(getComputedStyle(trilha).gap) || 0;
    }

    function posicionar() {
        trilha.style.transform = `translateX(-${indice * (largura + gap)}px)`;
    }

    function criarPaginacao() {
        paginacao.innerHTML = "";

        for (let i = 0; i < total; i++) {
            const ponto = document.createElement("button");
            ponto.type = "button";
            ponto.className = "avaliacoes-ponto";
            ponto.setAttribute("aria-label", `Ir para a avaliação ${i + 1}`);

            ponto.addEventListener("click", () => {
                if (ocupado) return;
                indice = visiveis + i;
                ocupado = true;
                posicionar();
            });

            paginacao.appendChild(ponto);
        }
    }

    function atualizarPaginacao() {
        const pontos = paginacao.querySelectorAll(".avaliacoes-ponto");
        const atual = ((indice - visiveis) % total + total) % total;

        pontos.forEach((ponto, i) => {
            ponto.classList.toggle("ativo", i === atual);
        });
    }

    function preparar() {
        visiveis = quantidadeVisivel();
        trilha.innerHTML = "";

        for (let i = total - visiveis; i < total; i++) {
            const clone = originais[(i + total) % total].cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            trilha.appendChild(clone);
        }

        originais.forEach((item) => trilha.appendChild(item));

        for (let i = 0; i < visiveis; i++) {
            const clone = originais[i].cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            trilha.appendChild(clone);
        }

        indice = visiveis;
        trilha.style.transition = "none";
        medir();
        posicionar();
        trilha.offsetHeight;
        trilha.style.transition = "transform 0.45s ease";

        criarPaginacao();
        atualizarPaginacao();
        ocupado = false;
    }

    function mover(direcao) {
        if (ocupado) return;

        ocupado = true;
        indice += direcao;
        posicionar();
        atualizarPaginacao();
    }

    proximo.addEventListener("click", () => mover(1));
    anterior.addEventListener("click", () => mover(-1));

    trilha.addEventListener("transitionend", () => {
        if (indice >= total + visiveis) {
            indice = visiveis;
        } else if (indice < visiveis) {
            indice = total + visiveis - 1;
        } else {
            ocupado = false;
            atualizarPaginacao();
            return;
        }

        trilha.style.transition = "none";
        posicionar();
        trilha.offsetHeight;
        trilha.style.transition = "transform 0.45s ease";
        ocupado = false;
        atualizarPaginacao();
    });

    carrossel.addEventListener("touchstart", (event) => {
        inicioToque = event.touches[0].clientX;
    }, { passive: true });

    carrossel.addEventListener("touchend", (event) => {
        const diferenca = event.changedTouches[0].clientX - inicioToque;

        if (Math.abs(diferenca) > 50) {
            mover(diferenca < 0 ? 1 : -1);
        }
    }, { passive: true });

    let temporizador;
    window.addEventListener("resize", () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(preparar, 150);
    });

    preparar();
});
