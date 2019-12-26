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

<script>

    import HotkeysService from '../../shared/libs/hotkeys-service';
    import DragService from "../../shared/libs/drag-service";

    export default {
        name: 'app',
        components: {},
        data: () => {
            return ({
                infos: [],
                events: [],
                hotkey: '',
            });
        },
        created() {
            // Background window:
            this._backgroundWindow = overwolf.windows.getMainWindow();
            // Page elements:
            this._modal = document.getElementById("exitMinimizeModal");
            this._closeButton = document.getElementById("closeButton");
            this._minimizeHeaderButton = document.getElementById("minimizeButton");
            this._exitButton = document.getElementById("exit");
            this._minimizeButton = document.getElementById("minimize");
            this._header = document.getElementsByClassName("app-header")[0];
            this._version = document.getElementById("version");
            // listen to events from the event bus from the main window,
            // the callback will be run in the context of the current window
            let mainWindow = overwolf.windows.getMainWindow();
            mainWindow.ow_eventBus.addListener(this._eventListener);

            // Update hotkey view and listen to changes:
            this._updateHotkey();
            HotkeysService.addHotkeyChangeListener(this._updateHotkey);
        },
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
            // Enable dragging on this window
            overwolf.windows.getCurrentWindow(result => {
                this.dragService = new DragService(result.window, this._header);
            });
            // Display version
            overwolf.extensions.current.getManifest(manifest => {
                if (!this._version) {
                    return;
                }
                this._version.textContent = `Version ${manifest.meta.version}`;
            });
        },
        methods: {
            async _updateHotkey() {
                const hotkey = await HotkeysService.getToggleHotkey();
                this.hotkey = hotkey;
            },

            _eventListener(eventName, data) {
                switch (eventName) {
                    case 'event': {
                        this._gameEventHandler(data);
                        break;
                    }
                    case 'info': {
                        this._infoUpdateHandler(data);
                        break;
                    }
                }
            },

            // Logs events
            _gameEventHandler(event) {
                let isHightlight = false;
                switch (event.name) {
                    case 'kill':
                    case 'death':
                    case 'matchStart':
                    case 'matchEnd':
                        isHightlight = true;
                }
                this.events.push(JSON.stringify(event));
            },

            // Logs info updates
            _infoUpdateHandler(infoUpdate) {
                this.infos.push(JSON.stringify(infoUpdate));
            },
            _showExitMinimizeModal() {
                this._modal.style.display = "block";
            },
            _hideExitMinimizeModal() {
                this._modal.style.display = "none";
            }
        }

    }
</script>
<style>
</style>
