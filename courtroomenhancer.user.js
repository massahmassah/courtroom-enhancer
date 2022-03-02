// ==UserScript==
// @name         Objection.lol Courtroom Enhancer
// @namespace    https://github.com/w452tr4w5etgre/
// @description  Enhances Objection.lol Courtroom functionality
// @version      0.656
// @author       w452tr4w5etgre
// @homepage     https://github.com/w452tr4w5etgre/courtroom-enhancer
// @match        https://objection.lol/courtroom/*
// @icon         https://github.com/w452tr4w5etgre/courtroom-enhancer/raw/main/logo.png
// @downloadURL  https://github.com/w452tr4w5etgre/courtroom-enhancer/raw/main/courtroomenhancer.user.js
// @updateURL    https://github.com/w452tr4w5etgre/courtroom-enhancer/raw/main/courtroomenhancer.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @run-at       document-end
// ==/UserScript==

let scriptSetting = {};

function initSettings() {
    scriptSetting = {
        "warn_on_exit": getSetting("warn_on_exit", true),
        "remember_username": getSetting("remember_username", true),
        "show_console": getSetting("show_console", false),
        "adjust_chat_text_with_wheel": getSetting("adjust_chat_text_with_wheel", true),
        "chat_hover_tooltip": getSetting("chat_hover_tooltip", true),
        "evid_roulette": getSetting("evid_roulette", false),
        "sound_roulette": getSetting("sound_roulette", false),
        "music_roulette": getSetting("music_roulette", false),
        "evid_roulette_max": getSetting("evid_roulette_max", 476000),
        "sound_roulette_max": getSetting("sound_roulette_max", 40000),
        "music_roulette_max": getSetting("music_roulette_max", 131000)
    };
};

initSettings();

let storedUsername = getStoredUsername();

const ui = {"app": document.querySelector("div#app")};

(new MutationObserver(checkJoinBoxReady)).observe(document, {childList: true, subtree: true});

function checkJoinBoxReady(changes, observer) {
    if (typeof ui.app === "undefined" || !ui.app) {
        ui.app = document.querySelector("div#app");
    }

    for (let change of changes) {
        for (let node of change.addedNodes) {
            if (node === ui.app.querySelector("div.v-dialog__content.v-dialog__content--active")) {
                if (ui.joinBox_container = node.querySelector("div.v-dialog > div.v-card")) {
                    ui.joinBox_usernameInput = ui.joinBox_container.querySelector("form > div.v-card__text > div.row:first-of-type > div.col > div.v-input > div.v-input__control > div.v-input__slot > div.v-text-field__slot > input");
                    ui.joinBox_passwordInput = ui.joinBox_container.querySelector("form > div.v-card__text > div.row:nth-of-type(2) > div.col > div.v-input > div.v-input__control > div.v-input__slot > div.v-text-field__slot > input");
                    ui.joinBox_spectateButton = ui.joinBox_container.querySelector("form > div.v-card__actions > button:first-of-type");
                    ui.joinBox_joinButton = ui.joinBox_container.querySelector("form > div.v-card__actions > button:last-of-type");

                    // When "Spectate" button is clicked
                    ui.joinBox_spectateButton.addEventListener("click", e => {
                        ui.spectating = true;
                    });

                    // When "Join" button is clicked
                    ui.joinBox_joinButton.addEventListener("click", e => {
                        ui.spectating = false;
                    });

                    // When "Enter" is pressed in the username input box
                    ui.joinBox_usernameInput.addEventListener("keydown", e => {
                        if (ui.joinBox_usernameInput.value && (e.keyCode == 13 || e.key == "Enter")) {
                            ui.joinBox_joinButton.click();
                        }
                    });

                    // When "Enter" is pressed in the password input box
                    if (ui.joinBox_passwordInput) {
                        ui.joinBox_passwordInput.addEventListener("keydown", e => {
                            if (ui.joinBox_usernameInput.value && (e.keyCode == 13 || e.key == "Enter")) {
                                ui.joinBox_joinButton.click();
                            }
                        });
                    }

                    if (scriptSetting.remember_username) {
                        ui.joinBox_usernameInput.value = storedUsername;
                        ui.joinBox_usernameInput.dispatchEvent(new Event("input"));
                    }
                }
            }
        }

        for (let node of change.removedNodes) {
            if (ui.joinBox_container && node === ui.joinBox_container.parentNode.parentNode) {
                observer.disconnect();
                if (scriptSetting.remember_username) {
                    setStoredUsername(ui.joinBox_usernameInput.value);
                }
                onCourtroomJoin();
            }
        }
    }
}

function onCourtroomJoin() {
    ui.mainFrame_container = ui.app.querySelector("div > div.container > main > div.v-main__wrap > div > div:first-of-type > div:first-child");

    if (ui.spectating) {
        console.log("spectating");
        if (!ui.mainFrame_joinRoomButton) {
            ui.mainFrame_joinRoomButton = ui.mainFrame_container.querySelector("div > div:last-of-type > div.text-right > button");
            ui.mainFrame_joinRoomButton.addEventListener("click", f => {
                console.log("clicked");
                (new MutationObserver(checkJoinBoxReady)).observe(document, {childList: true, subtree: true});
            }, true);
        }
        return;
    }

    ui.mainFrame_textarea = ui.mainFrame_container.querySelector("div textarea.frameTextarea");
    ui.mainFrame_sendButton = ui.mainFrame_container.querySelector("div > div:nth-child(4) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:last-of-type > button.v-btn > span.v-btn__content > i.mdi-send").parentNode.parentNode;
    ui.mainFrame_currentChar = ui.mainFrame_container.querySelector("div > div:nth-child(2) > div.col-sm-3.col-2 > div");

    ui.courtroom_container = ui.mainFrame_container.querySelector("div.court-container > div.courtroom");
    ui.courtroom_chatBoxes = ui.courtroom_container.querySelector("div.fade_everything").previousSibling;

    ui.rightFrame_container = ui.app.querySelector("#app > div > div.container > main > div.v-main__wrap > div > div:first-of-type > div:nth-child(2) div");
    ui.rightFrame_toolbarContainer = ui.rightFrame_container.querySelector("div.v-card.v-sheet > header.v-toolbar > div.v-toolbar__content");
    ui.rightFrame_toolbarTabs = ui.rightFrame_toolbarContainer.querySelector("div.v-tabs > div[role=tablist] > div.v-slide-group__wrapper > div.v-slide-group__content.v-tabs-bar__content");

    ui.chatLog_container = ui.rightFrame_container.querySelector("div.v-card.v-sheet > div.v-window.v-item-group > div.v-window__container > div.v-window-item:first-of-type");
    ui.chatLog_chat = ui.chatLog_container.querySelector("div > div.chat");
    ui.chatLog_chatList = ui.chatLog_chat.querySelector("div.v-list");
    ui.chatLog_textField = ui.chatLog_container.querySelector("div.v-window-item > div > div:nth-child(2) > div > div > div > div.v-text-field__slot > input[type=text]");

    ui.evidence_container = ui.rightFrame_container.querySelector("div.v-card.v-sheet > div.v-window.v-item-group > div.v-window__container > div.v-window-item:nth-of-type(2)");
    ui.evidence_form = ui.evidence_container.querySelector("div form");
    ui.evidence_formFields = ui.evidence_form.querySelectorAll("input");
    ui.evidence_addButton = ui.evidence_form.querySelector("div > div > button.mr-2.v-btn.success");
    ui.evidence_list = ui.evidence_container.querySelector("div > div.row");

    ui.settings_container = ui.rightFrame_container.querySelector("div.v-card.v-sheet > div.v-window.v-item-group > div.v-window__container > div.v-window-item:nth-of-type(4)");
    ui.settings_usernameChangeInput = ui.settings_container.querySelector("div > div > div div.v-input > div.v-input__control > div.v-input__slot > div.v-text-field__slot > input[type=text]");
    ui.settings_switchDiv = ui.settings_container.querySelector("div > div:nth-child(2) > div > div.v-input--switch").parentNode.parentNode;
    ui.settings_separator = ui.settings_container.querySelector("div > hr:last-of-type");

    window.addEventListener("beforeunload", confirmClose, false);
    // Handle username changes and update the stored username
    let onUsernameChange = function(name) {
        // Set a timeout because for some reason the name box reverts for a split second on change
        setTimeout(f => {
            setStoredUsername(name);
        }, 100);
    };

    ui.settings_usernameChangeInput.addEventListener("focusout", e => {
        onUsernameChange(e.target.value);
    });

    ui.settings_usernameChangeInput.addEventListener("keydown", e => {
        if (e.keyCode == 13 || e.key == "Enter") {
            onUsernameChange(e.target.value);
        }
    });

    ui.evidence_list.style.maxHeight = "70vh";

    // Enhance evidence inputs functionality
    ui.evidence_formFields.forEach(a => {
        a.addEventListener("keydown", e =>{
            if (e.keyCode == 13 || e.key == "Enter") {
                ui.evidence_addButton.click();
                e.currentTarget.blur();
            }
        });
    });

    ui.evidence_addButton.addEventListener("click", e=> {
        if (ui.evidence_formFields[0].value === "") {
            ui.evidence_formFields[0].value = " ";
            ui.evidence_formFields[0].dispatchEvent(new Event("input"));
            setTimeout(f=>{e.target.click()}, 25);
        }
    });

    // Add setting options under the Settings tab
    createExtraSettingsElements();

    // Create additional buttons container below the right panels
    createCustomButtonsContainer();

    function createButton(id, label, icon=null, callback) {
        let elem_div = document.createElement("div");
        elem_div.setAttributes({
            id: id + "_button"
        });

        let elem_button = document.createElement("button");
        elem_button.setAttributes({
            className: "v-btn v-btn--has-bg v-size--small theme--dark",
            type: "button",
            style: {
                background: "rgb(184 39 146)"
            }
        });
        elem_button.addEventListener("click", callback)

        let elem_span = document.createElement("span");
        elem_span.setAttributes({
            className: "v-btn__content"
        });

        elem_span.textContent = label;

        if (icon) {
            let elem_icon = document.createElement("i");
            elem_icon.setAttributes({
                className: "v-icon v-icon--left mdi mdi-"+icon+" theme--dark"
            });
            elem_span.firstChild.before(elem_icon);
        }

        elem_button.appendChild(elem_span);
        elem_div.appendChild(elem_button);

        return elem_div;
    }

    function createExtraSettingsElements() {

        function createExtraSettingElemCheckbox(id, text, callback) {
            let div = document.createElement("div");
            div.setAttributes({
                className: "v-input d-inline-block mr-2"
            });

            let div_input_control = document.createElement("div");
            div_input_control.setAttributes({
                className: "v-input__control"
            });
            div.appendChild(div_input_control);

            let div_input_slot = document.createElement("div");
            div_input_slot.setAttributes({
                className: "v-input__slot"
            });
            div_input_control.appendChild(div_input_slot);

            let div_input_selection = document.createElement("div");
            div_input_selection.setAttributes({
                className: "v-input--selection-controls__input mr-0"
            });
            div_input_slot.appendChild(div_input_selection);

            let input = document.createElement("input");
            div_input_selection.appendChild(input);
            input.setAttributes({
                className: "v-input--selection-controls__input pointer-item",
                style: {
                    accentColor: "#007aff"
                },
                checked: scriptSetting[id],
                id: id,
                type: "checkbox"
            });
            input.addEventListener("change", callback);

            let label = document.createElement("label");
            div_input_slot.appendChild(label);
            label.setAttributes({
                htmlFor: id,
                className: "v-label pointer-item",
                style: {
                    paddingLeft: "6px"
                }
            });
            label.textContent = text;

            return div;
        }

        function createExtraSettingElemText(id, text, callback, input_type="text") {
            let div_column = document.createElement("div");
            div_column.setAttributes({
                className: "d-inline-block"
            });

            let div = document.createElement("div");
            div.setAttributes({
                className: "v-input v-text-field",
                style: {
                    padding: "0px"
                }
            });
            div_column.appendChild(div);

            let div_input_control = document.createElement("div");
            div_input_control.setAttributes({
                className: "v-input__control"
            });
            div.appendChild(div_input_control);

            let div_input_slot = document.createElement("div");
            div_input_slot.setAttributes({
                className: "v-input__slot",
                style: {
                    margin: "0"
                }
            });
            div_input_control.appendChild(div_input_slot);

            let div_input_selection = document.createElement("div");
            div_input_selection.setAttributes({
                className: "v-text-field__slot"
            });
            div_input_slot.appendChild(div_input_selection);

            let label = document.createElement("label");
            label.setAttributes({
                htmlFor: id,
                className: "v-label v-label--active",
                style: {
                    left: "0px",
                    right: "auto",
                    position: "absolute"
                }
            });

            label.textContent = text;
            div_input_slot.appendChild(label);

            let input = document.createElement("input");
            input.type = input_type;
            input.id = id;
            input.value = scriptSetting[id];
            input.setAttributes({
                className: "v-input--selection-controls__input",
                style: {
                    marginRight: "0"
                }
            });

            input.addEventListener("focus", function(e) {
                div.classList.add("v-input--is-focused","primary--text");
                label.classList.add("primary--text");
            });

            input.addEventListener("focusout",function (e) {
                div.classList.remove("v-input--is-focused","primary--text");
                label.classList.remove("primary--text");
                callback(e)
            });

            div_input_selection.append(label, input);

            return div_column;
        }

        ui.extraSettings_warnOnExit = createExtraSettingElemCheckbox("warn_on_exit", "Confirm on exit", e => {
            let value = e.target.checked;
            setSetting("warn_on_exit", value);
        });

        ui.extraSettings_rememberUsername = createExtraSettingElemCheckbox("remember_username", "Remember username", e => {
            let value = e.target.checked;
            setSetting("remember_username", value);
        });

        ui.extraSettings_showConsole = createExtraSettingElemCheckbox("show_console", "Show log console", e => {
            let value = e.target.checked;
            setSetting("show_console", value);
            ui.customButtons_rowLog.style.display = value ? "flex" : "none";
        });

        ui.extraSettings_adjustChatTextWithWheel = createExtraSettingElemCheckbox("adjust_chat_text_with_wheel", "Courtroom: scroll to change text size", e => {
            let value = e.target.checked;
            setSetting("adjust_chat_text_with_wheel", value);
            if (value) {
                ui.courtroom_chatBoxes.addEventListener("wheel", chatBoxTextWheelScrollEvent);
            } else {
                ui.courtroom_chatBoxes.removeEventListener("wheel", chatBoxTextWheelScrollEvent);
            }
        });

        ui.extraSettings_chatHoverTooltip = createExtraSettingElemCheckbox("chat_hover_tooltip", "Chatlog: Show urls on hover", e => {
            let value = e.target.checked;
            setSetting("chat_hover_tooltip", value);
            if (value) {
                ui.chatLog_chat.addEventListener("mouseover", onChatListMouseOver, false);
            } else {
                ui.chatLog_chat.removeEventListener("mouseover", onChatListMouseOver, false);
            }
        });

        ui.extraSettings_rouletteEvid = createExtraSettingElemCheckbox("evid_roulette", "Evidence roulette", e => {
            let value = e.target.checked;
            setSetting("evid_roulette", value);
            ui.customButtons_evidRouletteButton.style.display = value ? "inline" : "none"
            ui.extraSettings_rouletteEvidMax.style.display = value ? "inline-block" : "none";
        });

        ui.extraSettings_rouletteSound = createExtraSettingElemCheckbox("sound_roulette", "Sound roulette", e => {
            let value = e.target.checked;
            setSetting("sound_roulette", value);
            ui.customButtons_soundRouletteButton.style.display = value ? "inline" : "none"
            ui.extraSettings_rouletteSoundMax.style.display = value ? "inline-block" : "none";
        });

        ui.extraSettings_rouletteMusic = createExtraSettingElemCheckbox("music_roulette", "Music roulette", e => {
            let value = e.target.checked;
            setSetting("music_roulette", value);
            ui.customButtons_musicRouletteButton.style.display = value ? "inline" : "none"
            ui.extraSettings_rouletteMusicMax.style.display = value ? "inline-block" : "none";
        });

        ui.extraSettings_rouletteEvidMax = createExtraSettingElemText("evid_roulette_max", "max", e => {
            let value = parseInt(e.target.value);
            if (value) {
                setSetting("evid_roulette_max", value);
            } else {
                e.target.value = scriptSetting.evid_roulette_max;
                e.preventDefault();
                return false;
            }
        }, "number");

        ui.extraSettings_rouletteSoundMax = createExtraSettingElemText("sound_roulette_max", "max", e => {
            let value = parseInt(e.target.value);
            if (value) {
                setSetting("sound_roulette_max", value);
            } else {
                e.target.value = scriptSetting.sound_roulette_max;
                e.preventDefault();
                return false;
            }
        }, "number");

        ui.extraSettings_rouletteMusicMax = createExtraSettingElemText("music_roulette_max", "max", e => {
            let value = parseInt(e.target.value);
            if (value) {
                setSetting("music_roulette_max", value);
            } else {
                e.target.value = scriptSetting.music_roulette_max;
                e.preventDefault();
                return false;
            }
        }, "number")

        // Get the <hr> separator on the Settings page
        let settings_separator = ui.settings_separator;

        // Row 1 - Header
        let extraSettings_rows = [];
        ui.extraSettings_rowHeader = document.createElement("h3");
        ui.extraSettings_rowHeader.textContent = "Courtroom Enhancer";

        ui.extraSettings_resetButton = createButton("extraSettings_reset", "Reset and reload", "refresh", e => {
            if (!confirm("Reset Courtroom Enhancer settings and refresh the page?")) {
                return;
            }
            storeClear();
        });

        ui.extraSettings_resetButton.classList.add("d-inline-block", "ml-2");
        ui.extraSettings_resetButton.firstChild.setAttributes({
            style: {
                backgroundColor: "rgb(161 35 35)"
            }
        });

        ui.extraSettings_rowHeader.appendChild(ui.extraSettings_resetButton);
        extraSettings_rows.push(ui.extraSettings_rowHeader);

        // Row 2 - Buttons
        ui.extraSettings_rowButtons = ui.settings_switchDiv.cloneNode();
        ui.extraSettings_rowButtons.appendChild(ui.settings_switchDiv.firstChild.cloneNode());
        ui.extraSettings_rowButtons.lastChild.append(ui.extraSettings_warnOnExit,
                                                     ui.extraSettings_rememberUsername,
                                                     ui.extraSettings_showConsole,
                                                     ui.extraSettings_adjustChatTextWithWheel,
                                                     ui.extraSettings_chatHoverTooltip);
        extraSettings_rows.push(ui.extraSettings_rowButtons);

        // Row 3 - Roulettes
        ui.extraSettings_rowRoulettes = ui.settings_switchDiv.cloneNode();

        ui.extraSettings_rowRoulettes.appendChild(ui.settings_switchDiv.firstChild.cloneNode());

        ui.extraSettings_rouletteEvidMax.classList.remove("d-inline-block");
        ui.extraSettings_rouletteEvidMax.setAttributes({
            style: {
                display: scriptSetting.evid_roulette ? "inline-block" : "none",
                padding: "0px",
                marginRight: "8px"
            }
        });
        ui.extraSettings_rouletteEvidMax.querySelector("input").setAttributes({
            maxLength: "7",
            min: "0",
            max: "9999999",
            style: {
                width:"55px"
            }
        });

        ui.extraSettings_rouletteSoundMax.classList.remove("d-inline-block");
        ui.extraSettings_rouletteSoundMax.setAttributes({
            style: {
                display: scriptSetting.sound_roulette ? "inline-block" : "none",
                padding: "0px",
                marginRight: "8px"
            }
        });
        ui.extraSettings_rouletteSoundMax.querySelector("input").setAttributes({
            maxLength: "7",
            min: "0",
            max: "9999999",
            style: {
                width:"45px"
            }
        });

        ui.extraSettings_rouletteMusicMax.classList.remove("d-inline-block");
        ui.extraSettings_rouletteMusicMax.setAttributes({
            style: {
                display: scriptSetting.music_roulette ? "inline-block" : "none",
                padding: "0px",
                marginRight: "8px"
            }
        });
        ui.extraSettings_rouletteMusicMax.querySelector("input").setAttributes({
            maxLength: "7",
            min: "0",
            max: "9999999",
            style: {
                width:"55px"
            }
        });

        ui.extraSettings_rowRoulettes.lastChild.append(
            ui.extraSettings_rouletteEvid,
            ui.extraSettings_rouletteEvidMax,
            ui.extraSettings_rouletteSound,
            ui.extraSettings_rouletteSoundMax,
            ui.extraSettings_rouletteMusic,
            ui.extraSettings_rouletteMusicMax);
        extraSettings_rows.push(ui.extraSettings_rowRoulettes);

        // Find the element after the last <hr> and attach the extra settings before it
        ui.settings_afterSeparator = settings_separator.nextElementSibling;
        extraSettings_rows.forEach(row => {
            ui.settings_afterSeparator.insertAdjacentElement("beforebegin", row);
        });

        // Add the <hr> separator after the last row
        ui.settings_afterSeparator.insertAdjacentElement("beforebegin",settings_separator.cloneNode());
    }

    function createCustomButtonsContainer() {
        ui.customButtonsContainer = ui.rightFrame_container.insertAdjacentElement("afterend", document.createElement("div"));
        ui.customButtonsContainer.className = "mx-0 mx-md-4 mt-4 rounded-0";

        ui.customButtons_rows = []

        // Roulette buttons row
        ui.customButtons_rowButtons = document.createElement("div");
        ui.customButtons_rowButtons.setAttributes({
            className: "row no-gutters",
            style: {
                gap: "10px"
            }
        });

        ui.customButtons_evidRouletteButton = createButton("customButtons_evidRoulette", "EVD", "dice-multiple", e => {
            // Check if the send button is not on cooldown
            if (ui.mainFrame_sendButton.disabled || !ui.mainFrame_container.contains(ui.mainFrame_sendButton)) {
                return;
            }

            let random = Math.floor(Math.random() * scriptSetting.evid_roulette_max);

            ui.mainFrame_textarea.value = "[#evd" + random + "]";
            ui.mainFrame_textarea.dispatchEvent(new Event("input"));

            // Click Send button
            ui.mainFrame_sendButton.click()
            Logger.log("[#evd" + random + "]", "image");
        });
        ui.customButtons_evidRouletteButton.setAttributes({
            title: "Show a random piece of evidence",
            style: {
                display: scriptSetting.evid_roulette ? "inline" : "none"
            }
        });

        ui.customButtons_soundRouletteButton = createButton("customButtons_soundRoulette", "SFX", "dice-multiple", e => {
            // Check if the send button is not on cooldown
            if (ui.mainFrame_sendButton.disabled || !ui.mainFrame_container.contains(ui.mainFrame_sendButton)) {
                return;
            }

            let random = Math.floor(Math.random() * scriptSetting.sound_roulette_max);

            ui.mainFrame_textarea.value = "[#bgs" + random + "]";
            ui.mainFrame_textarea.dispatchEvent(new Event("input"));

            // Click Send button
            ui.mainFrame_sendButton.click();
            Logger.log("[#bgs" + random + "]", "volume-medium");
        });
        ui.customButtons_soundRouletteButton.setAttributes({
            title: "Play a random sound effect",
            style: {
                display: scriptSetting.sound_roulette ? "inline" : "none"
            }
        });

        ui.customButtons_musicRouletteButton = createButton("customButtons_musicRoulette", "BGM", "dice-multiple", e => {
            // Check if the send button is not on cooldown
            if (ui.mainFrame_sendButton.disabled || !ui.mainFrame_container.contains(ui.mainFrame_sendButton)) {
                return;
            }

            let random = Math.floor(Math.random() * scriptSetting.music_roulette_max);

            ui.mainFrame_textarea.value = "[#bgm" + random + "]";
            ui.mainFrame_textarea.dispatchEvent(new Event("input"));

            // Click Send button
            ui.mainFrame_sendButton.click();
            Logger.log("[#bgm" + random + "]", "music-note");
        });
        ui.customButtons_musicRouletteButton.setAttributes({
            title: "Play a random Music",
            style: {
                display: scriptSetting.music_roulette ? "inline" : "none"
            }
        });

        ui.customButtons_rowButtons.append(ui.customButtons_evidRouletteButton,
                                           ui.customButtons_soundRouletteButton,
                                           ui.customButtons_musicRouletteButton);

        // Music buttons
        if (typeof unsafeWindow !== "undefined" && typeof unsafeWindow.Howler === "object") {
            ui.customButton_stopAllSounds = createButton("stop_all_sounds", "Shut up SFX and BGM", "volume-variant-off", e => {
                unsafeWindow.Howler.stop();
            });

            ui.customButton_stopAllSounds.firstChild.setAttributes({
                title: "Stop all currently playing sounds and music (just for me)",
                style: {
                    backgroundColor: "teal"
                }
            });

            ui.customButton_getCurMusicUrl = createButton("get_cur_music_url", "BGM URL", "link-variant", e => {
                for (let howl of unsafeWindow.Howler._howls) {
                    if (howl._state == "loaded" && howl._loop) {
                        if (!scriptSetting.show_console) {
                            alert(howl._src);
                        }
                        Logger.log(howl._src, "link-variant");
                        break;
                    }
                };
            });

            ui.customButton_getCurMusicUrl.firstChild.setAttributes({
                title: "Get the URL for the currently playing Music",
                style: {
                    backgroundColor: "teal"
                }
            });

            ui.customButtons_rowButtons.append(ui.customButton_stopAllSounds,
                                               ui.customButton_getCurMusicUrl);

            ui.customButtons_rows.push(ui.customButtons_rowButtons);
        }

        // Log row
        let Logger = {
            lines: [],
            log: function(str, icon=null) {
                // If a duplicate is find, delete it before adding a new one
                let duplicate;
                if (duplicate = this.lines.find(line=> line.str == str)) {
                    this.lines.splice(this.lines.indexOf(duplicate), 1);
                }
                if (this.lines.length >= 8) {
                    this.lines.shift();
                }
                this.lines.push({
                    str: str,
                    icon: icon
                });

                while (ui.customButtons_logArea.firstChild) {
                    ui.customButtons_logArea.firstChild.remove()
                }

                this.lines.forEach(entry => {
                    let item = document.createElement("span")
                    if (entry.icon) {
                        icon = document.createElement("i");
                        icon.classList.add("mdi","mr-1", "mdi-" + entry.icon);
                        item.append(icon);
                    }
                    item.setAttributes({
                        style: {
                            display: "inline-block",
                            padding: "2px 4px",
                            border: "1px solid rgb(126 85 143)",
                            borderRadius: "4px",
                            backgroundColor: "rgb(126 85 143)",
                            userSelect: "all",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }
                    });
                    item.append(document.createTextNode(entry.str));

                    item.addEventListener("mouseenter", e=>{
                        e.target.style.overflow="visible";
                    });

                    item.addEventListener("mouseleave", e=>{
                        e.target.parentNode.childNodes.forEach(c=>{
                            c.style.overflow="hidden";
                        })
                    });

                    if (scriptSetting.show_console && ui.customButtons_rowLog.style.display == "none") {
                        ui.customButtons_rowLog.style.display = "flex";
                    }
                    ui.customButtons_logArea.prepend(item);
                });
                ui.customButtons_logArea.firstChild.style.borderColor = "#b82792";
            },
            clear: function() {
                lines: [];
                while (ui.customButtons_logArea.firstChild) {
                    ui.customButtons_logArea.firstChild.remove()
                }
                ui.customButtons_rowLog.style.display = "none";
            }
        }

        ui.customButtons_rowLog = document.createElement("div");
        ui.customButtons_rowLog.setAttributes({
            className: "row mt-4 no-gutters",
            style: {
                display: "none"
            }
        });

        ui.customButtons_rowLogContainer = document.createElement("div");
        ui.customButtons_rowLogContainer.setAttributes({
            style: {
                width: "100%",
                display: "flex"
            }
        });
        ui.customButtons_rowLog.append(ui.customButtons_rowLogContainer);

        ui.customButtons_showLogButton = document.createElement("button");
        ui.customButtons_showLogButton.setAttributes({
            className: "mdi mdi-console theme--dark",
            style: {
                fontSize: "24px"
            }
        });

        ui.customButtons_showLogButton.addEventListener("mouseover", e=>{
            e.target.classList.remove("mdi-console");
            e.target.classList.add("mdi-close-circle");
        });

        ui.customButtons_showLogButton.addEventListener("mouseout", e=>{
            e.target.classList.remove("mdi-close-circle");
            e.target.classList.add("mdi-console");
        });

        ui.customButtons_showLogButton.addEventListener("click", e=>{
            Logger.clear();
        });

        ui.customButtons_rowLogContainer.append(ui.customButtons_showLogButton);

        ui.customButtons_logArea = document.createElement("div");
        ui.customButtons_logArea.setAttributes({
            className: "d-flex ml-1",
            style: {
                width: "100%",
                gap: "3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexWrap: "nowrap",
                fontSize: "11px",
                fontFamily: "monospace",
                textColor: "white",
                lineHeight: "14px",
                alignItems: "center",
                textAlign: "center"
            }
        });

        ui.customButtons_rowLogContainer.append(ui.customButtons_logArea);

        ui.customButtons_rows.push(ui.customButtons_rowLog);

        // Attach each rows to the custom buttons container
        ui.customButtons_rows.forEach(row => {
            ui.customButtonsContainer.append(row);
        });

        return true;
    }

    // Restore right click functionality to courtroom container
    ui.courtroom_container.addEventListener("contextmenu", e => {
        e.stopImmediatePropagation();
    }, true);

    // Add scroll wheel to increase/decrease chatbox text size
    // Define the function so we can add / remove the event whenever the setting changes
    function chatBoxTextWheelScrollEvent(e) {
        if (ui.courtroom_chatBoxText === null || typeof ui.courtroom_chatBoxText === "undefined") {
            ui.courtroom_chatBoxText = ui.courtroom_container.querySelector("div.chat-box-text");
            ui.courtroom_chatBoxText.style.lineHeight = "1.3";
        }
        ui.courtroom_chatBoxText.style.fontSize = parseFloat(parseFloat(getComputedStyle(ui.courtroom_chatBoxText, null).getPropertyValue('font-size')) + e.deltaY * -0.01) + "px";
    }
    if (scriptSetting.adjust_chat_text_with_wheel) {
        ui.courtroom_chatBoxes.addEventListener("wheel", chatBoxTextWheelScrollEvent);
    }

    // Make the "fade" courtroom elements click-through to right-click images underneath directly
    ui.courtroom_container.querySelectorAll("div.fade_everything, div.fade_scene, div.fade_background").forEach(f => {
        f.style.pointerEvents = "none";
    });
    ui.courtroom_container.querySelector("div.scene-container").style.pointerEvents = "auto";

    // Chat hover tooltips
    ui.chatLog_customTooltip = document.createElement("div");
    ui.chatLog_customTooltip.setAttributes({
        id: "customTooltip",
        style: {
            visibility: "hidden",
            position: "absolute",
            top: "0px",
            right: "20px",
            padding: "4px",
            maxWidth: "300px",
            maxHeight: "360px",
            overflow: "auto",
            background: "rgba(24, 24, 24, 0.9)",
            border: "1px solid rgb(62, 67, 70)",
            borderRadius: "3px",
            opacity: "0",
            wordBreak: "break-all",
            textAlign: "center",
            fontSize: "13px",
            lineHeight: "14px",
            color: "rgb(211, 207, 201)",
            transition: "opacity 0.15s ease-in-out 0.25s, top 0.05s linear 0s"
        }
    });

    ui.chatLog_chat.append(ui.chatLog_customTooltip);

    ui.chatLog_customTooltip.reposition = function(node) {
        let top = 0;
        top = node.parentNode.offsetTop;
        if (top + this.offsetHeight > Math.min(ui.chatLog_chatList.lastChild.offsetTop + ui.chatLog_chatList.lastChild.offsetHeight, Math.max(ui.chatLog_chat.offsetHeight, ui.chatLog_chat.scrollHeight))) {
            top = Math.min(ui.chatLog_chatList.lastChild.offsetTop + ui.chatLog_chatList.lastChild.offsetHeight, Math.max(ui.chatLog_chat.offsetHeight, ui.chatLog_chat.scrollHeight)) - this.offsetHeight;
        }
        if (top < 0) {
            top = Math.max(0, ui.chatLog_chatList.firstChild.offsetTop);
        }
        this.style.top = top + "px"
    }

    let chatLog_lastItem;

    ui.chatLog_customTooltip.addEventListener("mouseover", e => {

    });

    if (scriptSetting.chat_hover_tooltip) {
        ui.chatLog_chat.addEventListener("mouseover", onChatListMouseOver, false);
    }

    function onChatListMouseOver(e) {
        // Find the item element
        let chatItem = e.target.closest("div.v-list-item__content"), chatName, chatText;
        if (chatItem === null || chatLog_lastItem == chatItem) {
            return;
        }
        chatLog_lastItem = chatItem;

        // Make sure the chat element is not a system message
        let chatItemIcon = chatItem.previousSibling.firstChild.firstChild;
        if (!chatItemIcon.classList.contains("mdi-account-tie") &&
            !chatItemIcon.classList.contains("mdi-crown") &&
            !chatItemIcon.classList.contains("mdi-account")) {
            return;
        }

        chatName = chatItem.querySelector("div.v-list-item__title").textContent;
        chatText = chatItem.querySelector("div.v-list-item__subtitle.chat-text").textContent;

        ui.chatLog_customTooltip.innerHTML = chatName + ": ";

        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        let urlMatches = chatText.match(urlRegex);
        if (urlMatches) {
            urlMatches.forEach(f => {
                let a = document.createElement("a");
                a.setAttributes({
                    href: f,
                    textContent: f,
                    target: "_blank",
                    rel: "noreferrer",
                    style: {display: "inline-block", fontSize: "14px"}
                });
                let i = document.createElement("i");
                i.setAttributes({
                    classList: "mdi mdi-open-in-new",
                    style: {marginLeft: "2px", fontSize: "12px"}
                });
                a.append(i);
                ui.chatLog_customTooltip.append(a);
            });
        }

        let imgRegex = /(https?:\/\/\S+(?:png|jpe?g|gif|webp)\S*)/ig;
        let imgMatches = chatText.match(imgRegex);
        if (imgMatches) {
            imgMatches.forEach(f => {
                let img = document.createElement("img");
                img.setAttributes({
                    src: f,
                    alt: f,
                    referrerPolicy: "no-referrer",
                    style: {maxWidth: "280px", maxHeight: "300px", marginTop: "2px"}
                });

                // Move the custom tooltip to fit the loaded image
                img.addEventListener("load", e => {
                    ui.chatLog_customTooltip.reposition(chatItem);
                });

                img.addEventListener("error", e => {
                    img.style.display = "none";
                    ui.chatLog_customTooltip.reposition(chatItem);
                });

                let a = document.createElement("a");
                a.setAttributes({
                    href: f,
                    target: "_blank",
                    rel: "noreferrer",
                    style: {display: "inline-block"}
                });
                a.append(img);
                ui.chatLog_customTooltip.append(a);
            });
        }


        if (!urlMatches && !imgMatches) {
            ui.chatLog_customTooltip.setAttributes({
                style: {
                    visibility: "hidden",
                    opacity: "0"
                }
            });
        } else {
            ui.chatLog_customTooltip.reposition(chatItem);
            ui.chatLog_customTooltip.setAttributes({
                style: {
                    visibility: "visible",
                    opacity: "1"
                }
            });

            ui.chatLog_customTooltip.addEventListener("mouseleave", onChatItemMouseLeave, {capture:false});
            chatItem.addEventListener("mouseleave", onChatItemMouseLeave, {capture:false});
        }
    }

    function onChatItemMouseLeave(e) {
        if (ui.chatLog_customTooltip.contains(e.toElement)) {
            return;
        }
        chatLog_lastItem = null;

        ui.chatLog_customTooltip.style.visibility = "hidden";
        ui.chatLog_customTooltip.style.opacity = "0";

        e.target.removeEventListener("mouseleave", onChatItemMouseLeave, {capture:false});
    }

}

function confirmClose (zEvent) {
    if (scriptSetting.warn_on_exit) {
        zEvent.preventDefault();
        zEvent.returnValue = "Are you sure you want to leave?";
    }
    return "Are you sure you want to leave?";
}

function getSetting(setting_name, default_value) {
    let value = storeGet("setting_" + setting_name, default_value);
    switch (typeof default_value) {
        case "number":
            value = parseInt(value) || default_value;
            break;
        case "boolean":
            value = Boolean(value);
            break;
    }
    return value;
}

function setSetting(setting_name, value) {
    scriptSetting[setting_name] = value;
    return storeSet("setting_" + setting_name, value);
}

function getStoredUsername() {
    return storeGet("courtroom_username");
}

function setStoredUsername(username) {
    storedUsername = username;
    return storeSet("courtroom_username", String(username));
}

function storeGet(key, def="") {
    var res;
    if (typeof GM_getValue === "undefined") {
        res = localStorage.getItem(key);
    } else {
        res = GM_getValue(key);
    }
    try {
        if (typeof res === "undefined" || res === null) {
            return def;
        } else {
            return JSON.parse(res);
        }
    } catch(e) {
        if (typeof res === "undefined" || res === null) {
            return def;
        } else {
            return res;
        }
    }
};

function storeSet(key, value) {
    //value = JSON.stringify(value);
    if (typeof GM_setValue === "undefined") {
        return localStorage.setItem(key, value);
    } else {
        return GM_setValue(key, value);
    }
};

function storeDel(key) {
    if (typeof GM_deleteValue === "undefined") {
        return localStorage.removeItem(key);
    } else {
        return GM_deleteValue(key);
    }
};

function storeClear() {
    if (typeof GM_listValues === "undefined") {
        localStorage.clear();
    } else {
        let storedSettings = GM_listValues();
        for (let val in storedSettings) {
            GM_deleteValue(storedSettings[val]);
        }
    }
    scriptSetting.warn_on_exit = false;
    window.location.reload();
};

// Helper function to set multiple element attributes at once
Element.prototype.setAttributes = function(attr) {var recursiveSet = function(at,set) {for(var prop in at){if(typeof at[prop] == 'object' && at[prop].dataset == null && at[prop][0] == null){recursiveSet(at[prop],set[prop]);}else {set[prop] = at[prop];}}};recursiveSet(attr,this);}
