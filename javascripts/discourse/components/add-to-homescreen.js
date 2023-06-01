import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { later } from "@ember/runloop";
import I18n from "I18n";
import discourseLater from "discourse-common/lib/later";
import { bind } from "discourse-common/utils/decorators";

export default class AddToHomescreen extends Component {
  @service capabilities;
  @service currentUser;
  @service keyValueStore;
  @service site;

  @tracked hasHiddenPopup = this.keyValueStore.getItem("hasHiddenPopup");
  @tracked showPopupTimer = false;
  @tracked arrowUp = !window.matchMedia("(orientation: portrait)");

  constructor() {
    super(...arguments);

    discourseLater(() => {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }

      this.showPopupTimer = true;
    }, 1000);
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
      siteTitle: this.site.siteSettings.title,
    });
  }

  @action
  setup() {
    if (this.capabilities.isIpadOS) {
      this.arrowUp = true;
      return;
    }

    window
      .matchMedia("(orientation: portrait)")
      .addEventListener("change", this.handleOrientationChange);
  }

  @action
  teardown() {
    window
      .matchMedia("(orientation: portrait)")
      .removeEventListener("change", this.handleOrientationChange);
  }

  @action
  hidePopup() {
    this.keyValueStore.setItem("hasHiddenPopup", true);
    this.hasHiddenPopup = true;
  }

  @bind
  handleOrientationChange(event) {
    this.arrowUp = event.matches;
  }
}
