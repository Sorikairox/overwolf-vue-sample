<template>
</template>

<script>

  import WindowsService from '../../shared/libs/windows-service';
  import runningGameService from '../../shared/libs/running-game-service';
  import WindowNames from '../../shared/constants/window-names';
  import hotkeysService from '../../shared/libs/hotkeys-service';
  import gepService from '../../shared/libs/gep-service';
  import eventBus from '../../shared/libs/event-bus';

    export default {
        name: 'app',
        components: {
        },
     async created() {
        // this will be available when calling overwolf.windows.getMainWindow()
        window.ow_eventBus = eventBus;
        window.minimize = this.minimize;

        // Handle what happens when the app is launched while already running
        // (relaunch)
        this._registerAppLaunchTriggerHandler();
        // Register handlers to hotkey events
        this._registerHotkeys();

        await this._restoreLaunchWindow();

        // Switch between desktop/in-game windows when launching/closing game
        runningGameService.addGameRunningChangedListener(
                this._onRunningGameChanged
        );

        // Listen to changes in windows
        overwolf.windows.onStateChanged.addListener(async () => {
          // If there's only 1 window (background) open, close the app
          const openWindows = await WindowsService.getOpenWindows();
          if (Object.keys(openWindows).length <= 1) {
            window.close();
          }
        });
      },
      methods: {
        /**
         * Minimize all app windows
         * @public
         */
        async minimize() {
            const openWindows = await WindowsService.getOpenWindows();
            for (let windowName in openWindows) {
                await WindowsService.minimize(windowName);
            }
        }

        /**
         * Handle game opening/closing
         * @private
         */
        , async _onRunningGameChanged(isGameRunning) {
            if (isGameRunning) {
                // Register to game events
                gepService.registerToGEP(
                    this.onGameEvents,
                    this.onInfoUpdate
                );
                // Open in-game window
                await WindowsService.restore(WindowNames.IN_GAME);
                // Close desktop window
                WindowsService.close(WindowNames.DESKTOP);
            } else {
                // Open desktop window
                await WindowsService.restore(WindowNames.DESKTOP);
                // Close in-game window
                WindowsService.close(WindowNames.IN_GAME);
            }
        }

        /**
         * Open the relevant window on app launch
         * @private
         */
        , async _restoreLaunchWindow() {
            // Obtain windows and set their sizes:
            // Desktop:
            const desktopWindowName = await WindowsService.getStartupWindowName();
            const desktopWindow = await WindowsService.obtainWindow(
                desktopWindowName
            );
            await WindowsService.changeSize(desktopWindow.window.id, 1200, 659);
            await WindowsService.changePositionCenter(desktopWindowName);
            // In-Game:
            const inGameWindow = await WindowsService.obtainWindow(
                WindowNames.IN_GAME
            );
            await WindowsService.changeSize(inGameWindow.window.id, 1641, 692);

            const isGameRunning = await runningGameService.isGameRunning();

            // Determine which window (desktop/in-game) to display when app is launched
            if (!isGameRunning) {
                // Game isn't runnig, display desktop window
                WindowsService.restore(desktopWindowName);
            } else {
                // Register to game events
                gepService.registerToGEP(
                    this.onGameEvents,
                    this.onInfoUpdate
                );
                // Display in-game window
                await WindowsService.restore(WindowNames.IN_GAME);
                WindowsService.minimize(WindowNames.IN_GAME);
            }
        }

        /**
         * Display notification
         * @private
         */
        , async _displayNotification(title, message, time) {
            const data = {title, message, time};
            const notificationWindow = await WindowsService.obtainWindow(
                WindowNames.NOTIFICATION
            );

            await WindowsService.changeSize(WindowNames.NOTIFICATION, 320, 260);
            await WindowsService.changePositionCenter(WindowNames.NOTIFICATION);

            // Display notification
            await WindowsService.restore(WindowNames.NOTIFICATION);
            // Start notification timer
            // We use a timeout to give the notification controller time to register
            // to the event bus.
            setTimeout(() => {
                window.ow_eventBus.trigger("notification", data);
            }, 1000);
        }

        /**
         * handles app launch trigger event - i.e dock icon clicked
         * @private
         */
        , _registerAppLaunchTriggerHandler() {
            overwolf.extensions.onAppLaunchTriggered.removeListener(
                this._onAppRelaunch
            );
            overwolf.extensions.onAppLaunchTriggered.addListener(
                this._onAppRelaunch
            );
        }

        , _onAppRelaunch() {
            WindowsService.restore(WindowNames.DESKTOP);
        }

        /**
         * set custom hotkey behavior
         * @private
         */
        , _registerHotkeys() {
            hotkeysService.setToggleHotkey(async () => {
                let state = await WindowsService.getWindowState(WindowNames.IN_GAME);
                if (state === "minimized" || state === "closed") {
                    WindowsService.restore(WindowNames.IN_GAME);
                } else if (state === "normal" || state === "maximized") {
                    WindowsService.minimize(WindowNames.IN_GAME);
                }
            });
        }

        /**
         * Pass events to windows that are listening to them
         * @private
         */
        , onGameEvents(data) {
            console.log(data);
            for (let event of data.events) {
                console.log(JSON.stringify(event));
                window.ow_eventBus.trigger("event", event);
                if (event.name === "matchStart") {
                    WindowsService.restore(WindowNames.IN_GAME);
                }
            }
        }

        /**
         * Pass info updates to windows that are listening to them
         * @privates
         */
        , onInfoUpdate(data) {
            window.ow_eventBus.trigger("info", data);
        }
    }
    }
</script>

<style>
</style>
