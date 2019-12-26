# Overwolf VUE sample app

This repository contains a sample app that demonstrates some basic points and flows that are relevant when developing Overwolf apps:

- The app will launch automatically when League Of Legends starts
- Register to the overwolf.games.events API in order to receive real time events from the game.
- Define a custom hotkey to be used in-game
- Communication between the app windows according to our best practices 


## Do I use yarn or npm ?

**Yarn** plz.

## How does this work ?

Each windows is a standalone vue project that build itself in the **`native`** folder that is reserved for :

- Shared assets such as `css` and `img`
- Overwolf's required files such as `manifest.json `

You have to build and run it through Overwolf to test, otherwise overwolf's api is not available and assets loading path is wrong (see improvements list below).

## How install
Launch `install.sh` script


## How build vue into native overwolf folder
Launch `build-all.sh` script to build all, or` yarn build` into the windows project you want to build.


## How to load the app
Under Overwolf's settings, choose Support tab and then Development options. Click the Load unpacked button and choose the native folder of this repository.

## Improvements
There is many things to improve :

- Code duplication for headerbar, can be a vue library
- `yarn serve` cannot be used without using `.env ` files to load css and img from a `public/(css||img)` folder that is a symbolic link to `native/(css||img)`. Without that, design is broken due to `img` and `css` shared folder not loading. We should load asset using an env variable for base path.
- Probably more things because I'm not perfect.
