<template>
        <div id="logs">
            <div id="events" class="logColumn">
                <h1>Game Events</h1>
                <div id="eventsLog" class="dataText">
                    <p v-for="event in events">
                        {{event}}
                    </p>
                </div>
                <button id="copyEvents" class="logCopy">
                    COPY GAME EVENTS
                </button>
            </div>
            <div id="infoUpdates" class="logColumn">
                <h1>Info Updates</h1>
                <div id="infoLog" class="dataText">
                    <p v-for="info in infos">
                        {{info}}
                    </p>
                </div>
                <button id="copyInfo" class="logCopy">
                    COPY INFO UPDATES
                </button>
            </div>
        </div>
<!--        <div id="other">-->
<!--            <h1>Real time Game Data</h1>-->
<!--            <p id="infoParagraph">-->
<!--                The background controller of this app is listening to all the game-->
<!--                events and info updates, and sends them to this window, that prints-->
<!--                them to the screen. Some specific events (startMatch, Kill and Death)-->
<!--                are painted in <span style="color: #00DEFA">teal</span> and logged to-->
<!--                the developers console.-->
<!--            </p>-->
<!--            <div id="ad"></div>-->
<!--            <p id="sampleAdText">-->
<!--                This is a sample ad (400x300px) of the best size-->
<!--            </p>-->
<!--        </div>-->
</template>

<script lang="ts">

    import {Component, Vue} from "vue-property-decorator";
    import {OWGamesEvents} from "../../shared/libs/ow-games-events";
    import {hotkeys, interestingFeatures, windowNames} from "../../shared/constants/consts";
    import {OWHotkeys} from "../../shared/libs/ow-hotkeys";
    import {OWWindow} from "../../shared/libs/ow-window";
    // @ts-ignore
    let WindowState = overwolf.windows.WindowState;

    @Component
    export default class App extends Vue{
        private _gameEventsListener: OWGamesEvents;
        private _eventsLog: HTMLElement;
        private _infoLog: HTMLElement;
        public events: Array<any> = [];
        public infos: Array<any> = [];
        _backgroundWindow: OWWindow;
        currWindow: OWWindow;
        _modal: HTMLElement;
        _closeButton: HTMLElement;
        _minimizeHeaderButton: HTMLElement;
        _exitButton: HTMLElement;
        _minimizeButton: HTMLElement;
        _header: HTMLElement;
        _version: HTMLElement;

        _showExitMinimizeModal() {
            this._modal.style.display = "block";
        }
        _hideExitMinimizeModal() {
            this._modal.style.display = "none";
        }
        mounted() {
            this._eventsLog = document.getElementById('eventsLog');
            this._infoLog = document.getElementById('infoLog');

            this.setToggleHotkeyBehavior();
            this.setToggleHotkeyText();
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

        public created() {
            // Background window:
            this._backgroundWindow = new OWWindow('background');
            this.currWindow = new OWWindow('in_game');
            // Page elements:
            this._modal = document.getElementById("exitMinimizeModal");
            this._closeButton = document.getElementById("closeButton");
            this._minimizeHeaderButton = document.getElementById("minimizeButton");
            this._exitButton = document.getElementById("exit");
            this._minimizeButton = document.getElementById("minimize");
            this._header = document.getElementsByClassName("app-header")[0] as HTMLElement;
            this._version = document.getElementById("version");
            this._gameEventsListener = new OWGamesEvents({
                    onInfoUpdates: this.onInfoUpdates.bind(this),
                    onNewEvents: this.onNewEvents.bind(this)
                },
                interestingFeatures);
            this._gameEventsListener.start();
        }

        private onInfoUpdates(info) {
          this.infos.push(info);
        }

        // Special events will be highlighted in the event log
        private onNewEvents(e) {
            this.events.push(e);
        }

        // Displays the toggle minimize/restore hotkey in the window header
        private async setToggleHotkeyText() {
            const hotkeyText = await OWHotkeys.getHotkeyText(hotkeys.toggle);
            const hotkeyElem = document.getElementById('hotkey');
            hotkeyElem.textContent = hotkeyText;
        }

        // Sets toggleInGameWindow as the behavior for the Ctrl+F hotkey
        private async setToggleHotkeyBehavior() {
            const toggleInGameWindow = async hotkeyResult => {
                console.log(`pressed hotkey for ${hotkeyResult.featureId}`);
                const inGameState = await this.getWindowState();

                if (inGameState.window_state === WindowState.NORMAL ||
                    inGameState.window_state === WindowState.MAXIMIZED) {
                    this.currWindow.minimize();
                } else if (inGameState.window_state === WindowState.MINIMIZED ||
                    inGameState.window_state === WindowState.CLOSED) {
                    this.currWindow.restore();
                }
            }

            OWHotkeys.onHotkeyDown(hotkeys.toggle, toggleInGameWindow);
        }
        public async getWindowState() {
            return await this.currWindow.getWindowState();
        }
    }
</script>
<style>
</style>
