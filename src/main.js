import { Overworld } from "./Overworld.js";
import { MobileWarning } from "./MobileWarning.js";

(function () {

  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  });
  overworld.init();

  if (MobileWarning.isLikelyMobile()) {
    const warning = new MobileWarning();
    warning.init(document.body);
  }

})();
