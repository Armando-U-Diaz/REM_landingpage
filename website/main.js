(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const encabezado = document.querySelector("[data-encabezado]");
  const botonMenu = document.querySelector("[data-menu-boton]");
  const menu = document.querySelector("[data-menu]");
  const galeria = document.querySelector("[data-galeria]");
  const botonAnterior = document.querySelector("[data-galeria-anterior]");
  const botonSiguiente = document.querySelector("[data-galeria-siguiente]");
  const estadoGaleria = document.querySelector("[data-galeria-estado]");
  const mediaMenu = window.matchMedia("(max-width: 48rem)");

  let posicionAnterior = window.scrollY;
  let desplazamientoPendiente = false;

  const cerrarMenu = (devolverFoco = false) => {
    if (!menu || !botonMenu) return;
    menu.classList.remove("navegacion--abierta");
    botonMenu.setAttribute("aria-expanded", "false");
    if (devolverFoco) botonMenu.focus();
  };

  const alternarMenu = () => {
    if (!menu || !botonMenu) return;
    const estaAbierto = botonMenu.getAttribute("aria-expanded") === "true";
    menu.classList.toggle("navegacion--abierta", !estaAbierto);
    botonMenu.setAttribute("aria-expanded", String(!estaAbierto));
    encabezado?.classList.remove("encabezado--oculto");
  };

  const actualizarEncabezado = () => {
    desplazamientoPendiente = false;
    if (!encabezado) return;

    const posicionActual = Math.max(window.scrollY, 0);
    const menuAbierto = botonMenu?.getAttribute("aria-expanded") === "true";
    const diferencia = posicionActual - posicionAnterior;

    if (!menuAbierto && posicionActual > encabezado.offsetHeight * 1.5 && diferencia > 7) {
      encabezado.classList.add("encabezado--oculto");
    } else if (diferencia < -5 || posicionActual < 16) {
      encabezado.classList.remove("encabezado--oculto");
    }

    posicionAnterior = posicionActual;
  };

  window.addEventListener("scroll", () => {
    if (desplazamientoPendiente) return;
    desplazamientoPendiente = true;
    window.requestAnimationFrame(actualizarEncabezado);
  }, { passive: true });

  botonMenu?.addEventListener("click", alternarMenu);

  encabezado?.addEventListener("focusin", () => {
    encabezado.classList.remove("encabezado--oculto");
  });

  menu?.querySelectorAll("a").forEach((enlace) => {
    enlace.addEventListener("click", () => cerrarMenu());
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && botonMenu?.getAttribute("aria-expanded") === "true") {
      cerrarMenu(true);
    }
  });

  mediaMenu.addEventListener("change", (evento) => {
    if (!evento.matches) cerrarMenu();
  });

  if (galeria && botonAnterior && botonSiguiente) {
    const piezas = [...galeria.querySelectorAll(".galeria__pieza")];
    let actualizacionGaleriaPendiente = false;

    const obtenerPaso = () => {
      const primeraPieza = piezas[0];
      if (!primeraPieza) return galeria.clientWidth;
      const estilos = window.getComputedStyle(galeria);
      const espacio = Number.parseFloat(estilos.columnGap || estilos.gap) || 0;
      return primeraPieza.getBoundingClientRect().width + espacio;
    };

    const obtenerIndice = () => {
      if (piezas.length < 2) return 0;
      const posiciones = piezas.map((pieza) => Math.abs(pieza.offsetLeft - galeria.scrollLeft));
      return posiciones.indexOf(Math.min(...posiciones));
    };

    const actualizarGaleria = () => {
      actualizacionGaleriaPendiente = false;
      const limite = Math.max(galeria.scrollWidth - galeria.clientWidth, 0);
      const indice = obtenerIndice();
      botonAnterior.disabled = galeria.scrollLeft <= 2;
      botonSiguiente.disabled = galeria.scrollLeft >= limite - 2;
      if (estadoGaleria) estadoGaleria.textContent = `Proyecto ${indice + 1} de ${piezas.length}`;
    };

    const programarActualizacion = () => {
      if (actualizacionGaleriaPendiente) return;
      actualizacionGaleriaPendiente = true;
      window.requestAnimationFrame(actualizarGaleria);
    };

    botonAnterior.addEventListener("click", () => {
      galeria.scrollBy({ left: -obtenerPaso(), behavior: "smooth" });
    });

    botonSiguiente.addEventListener("click", () => {
      galeria.scrollBy({ left: obtenerPaso(), behavior: "smooth" });
    });

    galeria.addEventListener("keydown", (evento) => {
      if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
      evento.preventDefault();
      const direccion = evento.key === "ArrowRight" ? 1 : -1;
      galeria.scrollBy({ left: obtenerPaso() * direccion, behavior: "smooth" });
    });

    galeria.addEventListener("scroll", programarActualizacion, { passive: true });
    window.addEventListener("resize", programarActualizacion);
    actualizarGaleria();
  }

  const elementosRevelables = [...document.querySelectorAll("[data-revelar]")];

  if ("IntersectionObserver" in window && elementosRevelables.length) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("revelar-visible");
        observador.unobserve(entrada.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    elementosRevelables.forEach((elemento) => {
      elemento.classList.add("revelar-preparado");
      observador.observe(elemento);
    });
  }

  const anio = document.querySelector("[data-anio]");
  if (anio) anio.textContent = String(new Date().getFullYear());
})();
