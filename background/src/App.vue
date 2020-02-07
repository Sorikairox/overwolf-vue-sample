<template>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { windowNames, fortniteClassId } from "../../shared/constants/consts";
    import { OWGames } from '../../shared/libs/ow-games';
    import { OWGameListener } from '../../shared/libs/ow-game-listener';
    import { OWWindow } from '../../shared/libs/ow-window';
    // @ts-ignore
    import RunningGameInfo = overwolf.games.RunningGameInfo;
    // The background controller holds all of the app's background logic - hence its name. it has
    // many possible use cases, for example sharing data between windows, or, in our case,
    // managing which window is currently presented to the user. To that end, it holds a dictionary
    // of the windows available in the app.
    // Our background controller implements the Singleton design pattern, since only one
    // instance of it should exist.
    @Component
    export default class App extends Vue {
        private _windows = {};
        private _gameListener: OWGameListener;

        mounted() {
            this._windows = {};
            // Populating the background controller's window dictionary
            this._windows[windowNames.desktop] = new OWWindow(windowNames.desktop);
            this._windows[windowNames.inGame] = new OWWindow(windowNames.inGame);

        };

        // When running the app, start listening to games' status and decide which window should
        // be launched first, based on whether Fortnite is currently running
       async created() {
           // When a Fortnite game is started or is ended, toggle the app's windows
           this._gameListener = new OWGameListener({
               onGameStarted: this.toggleWindows.bind(this),
               onGameEnded: this.toggleWindows.bind(this)
           });
            this._gameListener.start();
            const currWindow = await this.isFortniteRunning() ? windowNames.inGame : windowNames.desktop;
            this._windows[currWindow].restore();
        }

        private toggleWindows(info) {
            if (!info || !this.isGameFortnite(info)) {
                return;
            }

            if (info.isRunning) {
                this._windows[windowNames.desktop].close();
                this._windows[windowNames.inGame].restore();
            } else {
                this._windows[windowNames.inGame].close();
                this._windows[windowNames.desktop].restore();
            }
        }

        private async isFortniteRunning(): Promise<boolean> {
            const info = await OWGames.getRunningGameInfo();

            return info && info.isRunning && this.isGameFortnite(info);
        }

        // Identify whether the RunningGameInfo object we have references Fortnite
        private isGameFortnite(info: RunningGameInfo) {
            return info.classId === fortniteClassId;
        }
    }
</script>

<style>
</style>
