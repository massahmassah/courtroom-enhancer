// ==UserScript==
// @name         Objection.lol Courtroom Enhancer
// @namespace    https://objection.lol/courtroom/*
// @description  Enhances Objection.lol Courtroom functionality
// @version      0.57
// @author       w452tr4w5etgre
// @match        https://objection.lol/courtroom/*
// @icon         https://objection.lol/favicon.ico
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
        "show_console": getSetting("show_console", false),
        "evid_roulette": getSetting("evid_roulette", false),
        "sound_roulette": getSetting("sound_roulette", false),
        "music_roulette": getSetting("music_roulette", false),
        "evid_roulette_max": getSetting("evid_roulette_max", 465000),
        "sound_roulette_max": getSetting("sound_roulette_max", 40000),
        "music_roulette_max": getSetting("music_roulette_max", 130000)
    };
};

initSettings();

window.addEventListener('beforeunload', confirmClose, false);

let storedUsername = getStoredUsername();

const uiElementSelector = {
    "joinBox_container": "#app > div.v-dialog__content.v-dialog__content--active > div > div",
    "joinBox_joinButton": "form > div.v-card__actions > button:nth-child(3)",
    "joinBox_usernameInput": "form > div.v-card__text > div > div > div > div > div.v-input__slot > div > input",

    "mainFrame_container": "#app > div > div.container > main > div.v-main__wrap > div > div:first-of-type > div:first-child",
    "mainFrame_textarea": "div textarea.frameTextarea",
    "mainFrame_sendButton": "div > div:nth-child(4) > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:last-of-type > button.v-btn > span.v-btn__content > i.mdi-send",

    "rightFrame_container": "#app > div > div.container > main > div.v-main__wrap > div > div:first-of-type > div:nth-child(2) div",

    "rightFrame_toolbarContainer": "div.v-card.v-sheet > header.v-toolbar > div.v-toolbar__content",
    "rightFrame_toolbarTabs": "div.v-tabs > div[role=tablist] > div.v-slide-group__wrapper > div.v-slide-group__content.v-tabs-bar__content",

    "chatLog_container": "div.v-card.v-sheet > div.v-window.v-item-group > div.v-window__container > div.v-window-item:first-of-type",
    "chatLog_chat": "div > div.chat",
    "chatLog_chatList": "div.v-list",
    "chatLog_textField": "div.v-window-item > div > div:nth-child(2) > div > div > div > div.v-text-field__slot > input[type=text]",
    "chatLog_sendButton": "div > button",

    "evidence_container": "div.v-card.v-sheet > div.v-window.v-item-group > div.v-window__container > div.v-window-item:nth-of-type(2)",
    "evidence_form": "div form",
    "evidence_addButton": "div > div > button.mr-2.v-btn.success",
    "evidence_list": "div div",

    "settings_container": "div.v-card.v-sheet > div.v-window.v-item-group > div.v-window__container > div.v-window-item:nth-of-type(4)",
    "settings_usernameChangeInput": "div > div > div div.v-input > div.v-input__control > div.v-input__slot > div.v-text-field__slot > input[type=text]",
    "settings_switchDiv": "div > div:nth-child(2) > div > div.v-input--switch",
    "settings_hrSeparator": "div > hr:last-of-type"
};

function getUiElement(name, parent=document) {
    return parent.querySelector(uiElementSelector[name]);
}

const ui = {};

(new MutationObserver(checkJoinBoxReady)).observe(document, {childList: true, subtree: true});

function checkJoinBoxReady(changes, observer) {
    // Wait for the Join pop-up to show up

    if (ui.joinBox_container = getUiElement("joinBox_container")) {
        observer.disconnect();
        ui.joinBox_usernameInput = getUiElement("joinBox_usernameInput", ui.joinBox_container);
        ui.joinBox_usernameInput.value = storedUsername;
        ui.joinBox_usernameInput.dispatchEvent(new Event("input"));

        // When the "Join" button is clicked
        getUiElement("joinBox_joinButton", ui.joinBox_container).addEventListener('click', e => {
            setStoredUsername(ui.joinBox_usernameInput.value);
        });

        // When "Enter" is pressed in the username input box
        ui.joinBox_usernameInput.addEventListener("keydown", e => {
            if (ui.joinBox_usernameInput.value && (e.keyCode == 13 || e.key == "Enter")) {
                setStoredUsername(ui.joinBox_usernameInput.value);
            }
        });

        ui.mainFrame_container = getUiElement("mainFrame_container");
        ui.mainFrame_textarea = getUiElement("mainFrame_textarea", ui.mainFrame_container);
        ui.mainFrame_sendButton = getUiElement("mainFrame_sendButton", ui.mainFrame_container).parentNode.parentNode;

        ui.rightFrame_container = getUiElement("rightFrame_container");

        ui.rightFrame_toolbarContainer = getUiElement("rightFrame_toolbarContainer", ui.rightFrame_container);
        ui.rightFrame_toolbarTabs = getUiElement("rightFrame_toolbarTabs", ui.rightFrame_toolbarContainer);

        ui.chatLog_container = getUiElement("chatLog_container", ui.rightFrame_container);
        ui.chatLog_chat = getUiElement("chatLog_chat", ui.chatLog_container);
        ui.chatLog_chatList = getUiElement("chatLog_chatList", ui.chatLog_chat);
        ui.chatLog_textField = getUiElement("chatLog_textField", ui.chatLog_container);

        ui.evidence_container = getUiElement("evidence_container");
        ui.evidence_form = getUiElement("evidence_form", ui.evidence_form);
        ui.evidence_formFields = ui.evidence_form.querySelectorAll("input");
        ui.evidence_addButton = getUiElement("evidence_addButton", ui.evidence_form);
        ui.evidence_list = getUiElement("evidence_list", ui.evidence_list);

        ui.settings_container = getUiElement("settings_container", ui.rightFrame_container);
        ui.settings_usernameChangeInput = getUiElement("settings_usernameChangeInput", ui.settings_container);
        ui.settings_switchDiv = getUiElement("settings_switchDiv", ui.settings_container).parentNode.parentNode;
        ui.settings_separator = getUiElement("settings_hrSeparator", ui.settings_container);

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

        // Listen for clicks on right-side tabs
        ui.rightFrame_toolbarTabs.addEventListener("click", e => {
            switch (e.target.textContent.toLowerCase().trim()) {
                case "evidence":
                    ui.customButtonsContainer.style.display = "none";
                    break;
                default:
                    ui.customButtonsContainer.style.display = "block";
                    break;
            }
        });

        // Enhance evidence inputs functionality
        ui.evidence_formFields.forEach(a => {
            a.addEventListener("keydown", e =>{
                if (e.keyCode == 13 || e.key == "Enter") {
                    ui.evidence_addButton.click();
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
                className: "pr-4",
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

            ui.extraSettings_warnOnExit = createExtraSettingElemCheckbox("warn_on_exit", "Confirm on exit", function(e) {
                let value = e.target.checked;
                setSetting("warn_on_exit", value);
            });

            ui.extraSettings_showConsole = createExtraSettingElemCheckbox("show_console", "Show log console", function(e) {
                let value = e.target.checked;
                setSetting("show_console", value);
                ui.customButtons_rowLog.style.display = value ? "flex" : "none";
            })

            ui.extraSettings_rouletteEvid = createExtraSettingElemCheckbox("evid_roulette", "Evidence roulette", function(e) {
                let value = e.target.checked;
                setSetting("evid_roulette", value);
                ui.customButtons_evidRouletteButton.style.display = value ? "inline" : "none"
                ui.extraSettings_rouletteEvidMax.style.display = value ? "inline-block" : "none";
            });

            ui.extraSettings_rouletteSound = createExtraSettingElemCheckbox("sound_roulette", "Sound roulette", function(e) {
                let value = e.target.checked;
                setSetting("sound_roulette", value);
                ui.customButtons_soundRouletteButton.style.display = value ? "inline" : "none"
                ui.extraSettings_rouletteSoundMax.style.display = value ? "inline-block" : "none";
            });

            ui.extraSettings_rouletteMusic = createExtraSettingElemCheckbox("music_roulette", "Music roulette", function(e) {
                let value = e.target.checked;
                setSetting("music_roulette", value);
                ui.customButtons_musicRouletteButton.style.display = value ? "inline" : "none"
                ui.extraSettings_rouletteMusicMax.style.display = value ? "inline-block" : "none";
            });

            ui.extraSettings_rouletteEvidMax = createExtraSettingElemText("evid_roulette_max", "max", function(e) {
                let value = parseInt(e.target.value);
                if (value) {
                    setSetting("evid_roulette_max", value);
                } else {
                    e.target.value = scriptSetting.evid_roulette_max;
                    e.preventDefault();
                    return false;
                }
            }, "number");

            ui.extraSettings_rouletteSoundMax = createExtraSettingElemText("sound_roulette_max", "max", function(e) {
                let value = parseInt(e.target.value);
                if (value) {
                    setSetting("sound_roulette_max", value);
                } else {
                    e.target.value = scriptSetting.sound_roulette_max;
                    e.preventDefault();
                    return false;
                }
            }, "number");

            ui.extraSettings_rouletteMusicMax = createExtraSettingElemText("music_roulette_max", "max", function(e) {
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
                if (!confirm("Reset all extension settings and refresh the page?")) {
                    return;
                }
                let storedSettings = GM_listValues();
                for (let val in storedSettings) {
                    GM_deleteValue(storedSettings[val]);
                    scriptSetting.warn_on_exit = false;
                    window.location.reload();
                }
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
                                                         ui.extraSettings_showConsole);
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
            ui.customButtons_rowRoulette = document.createElement("div");
            ui.customButtons_rowRoulette.setAttributes({
                className: "row no-gutters"
            });

            ui.customButtons_evidRouletteButton = createButton("customButtons_evidRoulette", "EVD", "dice-multiple", e => {
                // Check if the send button is not on cooldown
                if (ui.mainFrame_sendButton.disabled) {
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
                if (ui.mainFrame_sendButton.disabled) {
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
                if (ui.mainFrame_sendButton.disabled) {
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

            ui.customButtons_rowRoulette.append(ui.customButtons_evidRouletteButton,
                                                ui.customButtons_soundRouletteButton,
                                                ui.customButtons_musicRouletteButton);

            ui.customButtons_rows.push(ui.customButtons_rowRoulette);

            // Music buttons row
            if (typeof unsafeWindow !== "undefined" && typeof unsafeWindow.Howler === "object") {
                ui.customButtons_rowMusic = document.createElement("div");
                ui.customButtons_rowMusic.setAttributes({
                    className: "row mt-4 no-gutters"
                });

                ui.customButton_stopAllSounds = createButton("stop_all_sounds", "Stop sounds and music", "volume-variant-off", e => {
                    if (typeof unsafeWindow !== "undefined") {
                        unsafeWindow.Howler.stop();
                    }
                });

                ui.customButton_stopAllSounds.firstChild.setAttributes({
                    title: "Stop all currently playing sounds and music (just for me)",
                    style: {
                        backgroundColor: "teal"
                    }
                });

                ui.customButton_getCurMusicUrl = createButton("get_cur_music_url", "Get URL to BGM", "link-variant", e => {
                    if (typeof unsafeWindow !== "undefined") {
                        for (let howl of unsafeWindow.Howler._howls) {
                            if (howl._state == "loaded" && howl._loop) {
                                if (!scriptSetting.show_console) {
                                    alert(howl._src);
                                }
                                Logger.log(howl._src, "link-variant");
                                break;
                            }
                        };
                    };
                });

                ui.customButton_getCurMusicUrl.firstChild.setAttributes({
                    title: "Get the URL for the currently playing Music",
                    style: {
                        backgroundColor: "teal"
                    }
                });

                ui.customButtons_rowMusic.append(ui.customButton_stopAllSounds,
                                                 ui.customButton_getCurMusicUrl);

                ui.customButtons_rows.push(ui.customButtons_rowMusic);
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
                    if (this.lines.length >= 5) {
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
                }
            }

            ui.customButtons_rowLog = document.createElement("div");
            ui.customButtons_rowLog.setAttributes({
                className: "row mt-8 no-gutters",
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

            ui.customButtons_showLogButton = document.createElement("i");
            ui.customButtons_showLogButton.classList.add("mdi", "mdi-console", "v-icon", "theme--dark");
            ui.customButtons_rowLogContainer.append(ui.customButtons_showLogButton);

            ui.customButtons_logArea = document.createElement("div");
            ui.customButtons_logArea.setAttributes({
                className: "d-flex ml-2",
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

    }
}

function confirmClose (zEvent) {
    if (scriptSetting.warn_on_exit) {
        zEvent.preventDefault();
        zEvent.returnValue = "Are you sure?";
    }
}

function getSetting(setting_name, default_value) {
    let value = GM_getValue("setting_" + setting_name, default_value);
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
    return GM_setValue("setting_" + setting_name, value);
}

function getStoredUsername() {
    return String(GM_getValue("courtroom_username",""));
}

function setStoredUsername(username) {
    storedUsername = username;
    return GM_setValue("courtroom_username", String(username));
}

// Helper function to set multiple element attributes at once
Element.prototype.setAttributes = function(attr) {var recursiveSet = function(at,set) {for(var prop in at){if(typeof at[prop] == 'object' && at[prop].dataset == null && at[prop][0] == null){recursiveSet(at[prop],set[prop]);}else {set[prop] = at[prop];}}};recursiveSet(attr,this);}
