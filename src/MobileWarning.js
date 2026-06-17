export class MobileWarning {
  constructor({ onDismiss } = {}) {
    this.onDismiss = onDismiss;
    this.element = null;
  }

  static isLikelyMobile() {
    return (
      window.matchMedia("(pointer: coarse)").matches &&
      window.matchMedia("(hover: none)").matches
    );
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("MobileWarning");

    this.element.innerHTML = (`
      <div class="MobileWarning_box">
        <p class="MobileWarning_text">Este juego está pensado para teclado (PC). En un móvil o tablet sin teclado físico la experiencia no será la prevista.</p>
        <button class="MobileWarning_button">Entendido, continuar</button>
      </div>
    `);

    this.element.querySelector("button").addEventListener("click", () => {
      this.element.remove();
      this.onDismiss && this.onDismiss();
    });
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
  }
}
