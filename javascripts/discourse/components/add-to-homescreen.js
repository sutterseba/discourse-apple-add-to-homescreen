import Component from "@glimmer/component";
import { classNameBindings } from "@ember-decorators/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { later } from "@ember/runloop";
import I18n from "I18n";

@classNameBindings("shouldRender:show")
export default class AddToHomescreen extends Component {
  @service capabilities;
  @service currentUser;
  @service keyValueStore;
  @service site;
  @tracked hasHiddenPopup;
  @tracked showPopupTimer = false;
  @tracked arrowUp = !window.matchMedia("(orientation: portrait)");

  constructor() {
    super(...arguments);
    this.hasHiddenPopup = this.keyValueStore.getItem("hasHiddenPopup");

    later(() => {
      this.showPopupTimer = true;
    }, 1000);

    if (this.capabilities.isIpadOS) {
      this.arrowUp = true;
      return;
    }

    window.matchMedia("(orientation: portrait)").addEventListener("change", e => {
      const portrait = e.matches;

      if (this.capabilities.isIpadOS) {
        this.arrowUp = true;
        return;
      } else if (portrait) {
          this.arrowUp = false;
      } else {
          this.arrowUp = true;
      }
  });
  }

  get shouldRender() {
    const appleMobile = this.capabilities.isIOS || this.capabilities.isIpadOS;
    const isPWA = this.capabilities.isPwa;
    const isHub = this.capabilities.wasLaunchedFromDiscourseHub;
    return (
      this.currentUser &&
      this.showPopupTimer &&
      appleMobile &&
      !this.hasHiddenPopup &&
      !isPWA &&
      !isHub
    );
  }

  get PWALabel() {
    return I18n.t(themePrefix("pwa_text"), {
      siteTitle: this.site.siteSettings.title
    });
  }

  @action
  hidePopup() {
    this.keyValueStore.setItem("hasHiddenPopup", true);
    this.hasHiddenPopup = true;
  }
}
