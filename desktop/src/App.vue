<template>
  <div  class="desktopTop">
        <h1>Overwolf Sample App</h1>
        <p>
          Sample app with VUE
        </p>
        <div id="version"></div>
    </div>
</template>

<script lang="ts">

import { OWWindow } from "../../shared/libs/ow-window";
import {Component, Vue} from "vue-property-decorator";

@Component
export default class App extends Vue {
    _backgroundWindow: OWWindow;
    currWindow: OWWindow;
    _modal: HTMLElement;
    _closeButton: HTMLElement;
    _minimizeHeaderButton: HTMLElement;
    _exitButton: HTMLElement;
    _minimizeButton: HTMLElement;
    _header: HTMLElement;
    _version: HTMLElement;
  created() {
    // Background window:
      this._backgroundWindow = new OWWindow('background');
      this.currWindow = new OWWindow('desktop');
    // Page elements:
    this._modal = document.getElementById("exitMinimizeModal");
    this._closeButton = document.getElementById("closeButton");
    this._minimizeHeaderButton = document.getElementById("minimizeButton");
    this._exitButton = document.getElementById("exit");
    this._minimizeButton = document.getElementById("minimize");
    this._header = document.getElementsByClassName("app-header")[0] as HTMLElement;
    this._version = document.getElementById("version");
  }
  mounted() {
    // Listen to X button click
    this._closeButton.addEventListener("click", this._showExitMinimizeModal);
    // Listen to minimize click
    this._minimizeHeaderButton.addEventListener("click", () => {
      this._backgroundWindow.minimize();
    });
    // Close app on exit click
    this._exitButton.addEventListener("click", () => {
      this._backgroundWindow.close();
    });
    // Minimize app on minimize click
    this._minimizeButton.addEventListener("click", () => {
      this._backgroundWindow.minimize();
      this._hideExitMinimizeModal();
    });
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
      if (event.target == this._modal) {
        this._hideExitMinimizeModal();
      }
    };
      this.currWindow.dragMove(this._header);
    }

    _showExitMinimizeModal() {
      this._modal.style.display = "block";
    }
    _hideExitMinimizeModal() {
      this._modal.style.display = "none";
    }
  }
</script>
