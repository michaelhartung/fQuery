// 2023 Michael Hartung <michael@hartung.studio>

var fQueryEvent = {}

//------------------------------------------------------------------------------

/**
 * Returns help string
 * @returns {string}
 */
fQueryEvent.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' Event \n'
        + ' ----------------------------------- \n\n'
        + ' path()                              log the path of the selected events\n'
        + ' setEventMacros({object})            set multiple event macros at once\n'
        + ' setPersistent(boolean)              \n'
        + ' setDoppler(boolean, 0...100)        enable/disable doppler and set optional dopplerScale\n'
        + ' setDopplerScale(0-100)              \n'
        + ' setMaxInstances(0-65)               sets maxInstances, >64 = infinite\n'
        + ' setPitch(-24...24)                  \n'
        + ' setVolume(-80...10)                 \n'
        + ' setVoiceStealing(0...4)             \n'
        + ' setPriority(0...4)                  \n'
        + ' setCooldown(0...60000)              \n'
        + ' setMinDistance(0...10000)           \n'
        + ' setMaxDistance(0...10000)           \n'
        + ' uiMacros()                          shows a dialogue for setting event macros\n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Helper function to select an automatableProperty
 * @param {string} propertyName 
 * @param {number|string} propertyValue 
 */
fQueryEvent._setAutomtableProperty = function (propertyName, propertyValue) {
    var self = this

    self.each(function (obj) {
        if (obj.automatableProperties.properties[propertyName] !== undefined) {

            if (propertyName === 'maximumDistance') {

                if (obj.automatableProperties.properties.minimumDistance.value < propertyValue) {
                    obj.automatableProperties.properties.maximumDistance.setValue(propertyValue)
                } else {
                    self._logError('ValueError',
                        'maxDistance needs to be greater than minDistance: {0}'.format(
                            obj.automatableProperties.properties.minimumDistance.value
                        )
                    )
                }

            } else if (propertyName === 'minimumDistance') {

                if (obj.automatableProperties.properties.maximumDistance.value > propertyValue) {
                    obj.automatableProperties.properties.maximumDistance.setValue(propertyValue)
                } else {
                    self._logError('ValueError',
                        'minDistance needs to be lower than maxDistance: {0}'.format(
                            obj.automatableProperties.properties.maximumDistance.value
                        )
                    )
                }

            } else {
                obj.automatableProperties.properties[propertyName].setValue(propertyValue)
            }
        } else {
            self._logError('PropertyError', 'Missing property: {0}'.format(propertyName))
        }
    })
}

//------------------------------------------------------------------------------

/**
 * Logs the path of all selected events
 * @returns {string}
 */
fQueryEvent.path = function () {
    this.each(function (obj) {
        studio.system.print(obj.getPath().substr(7))
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Returns all master tracks for all selected events
 * @returns {fQuery}
 */
fQueryEvent.masterTrack = function () {
    var masterTracks = []

    this.each(function (obj) {
        if (obj.isOfExactType('Event')) {
            masterTracks.push(obj.mixer.masterBus)
        }
    })

    this._setObjects(masterTracks)

    this._addExtensions({
        extensions: ['fQueryMasterTrack', 'fQueryTrack', 'fQueryModulator'],
        clearExtensions: true
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Sets multiple event macros for all selected events
 * @param {object} options - object containing event macros to set
 * @returns {fQuery}
 */
fQueryEvent.setEventMacros = function (options) {
    var self = this

    options = options || {}

    var macros = {
        setPersistent: options.persistent || null,
        setDoppler: options.doppler || null,
        setDopplerScale: options.dopplerScale || null,
        setMaxInstances: options.maxInstances || null,
        setVoiceStealing: options.voiceStealing || null,
        setPriority: options.priority || null,
        setCooldown: options.triggerCooldown || null,
        setMinimumDistance: options.minimumDistance || null,
        setMaximumDistance: options.maximumDistance || null,
    }

    Object.keys(macros).forEach(function (key) {
        if (macros[key] !== null) {
            self[key](macros[key])
        }
    })

    return self
}

//------------------------------------------------------------------------------

/**
 * Sets persistent state of selected events
 * @param {boolean} isPersistent 
 * @returns {fQuery}
 */
fQueryEvent.setPersistent = function (isPersistent) {
    if (isPersistent === undefined) {
        this._logError('ArgumentError', 'expected true or false')
        return this
    }

    this._setAutomtableProperty('isPersistent', isPersistent)
    return this
}

//------------------------------------------------------------------------------

/**
 * Enables/disabled selected objects doppler and allows for setting dopplerScale
 * @param {boolean} dopplerEnabled 
 * @param {number} dopplerScale - number between 0 - 100
 * @returns {fQuery}
 */
fQueryEvent.setDoppler = function (dopplerEnabled, dopplerScale) {
    if (dopplerEnabled === undefined) {
        this._logError('ArgumentError', 'expected true or false')
        return this
    }

    this._setAutomtableProperty('dopplerEnabled', dopplerEnabled)

    if (dopplerScale !== undefined) {
        this.setDopplerScale(dopplerScale)
    }

    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the dopplerScale of all selected Events
 * @param {number} dopplerScale - number between 0 - 100
 * @returns {fQuery}
 */
fQueryEvent.setDopplerScale = function (dopplerScale) {
    if (dopplerScale === undefined) {
        this._logError('ArgumentError', 'expected value between 0 - 100')
        return this
    }

    this._setAutomtableProperty('dopplerScale', this.clamp(dopplerScale, 0, this._fmod.DOPPLER_MAX_SCALE))
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets maxVoices of selected events,
 * Named setMaxInstances to reflect UI name
 * 
 * @param {number} maxVoices 
 * @returns {fQuery}
 */
fQueryEvent.setMaxInstances = function (maxVoices) {
    if (maxVoices === undefined) {
        this._logError('ArgumentError', 'expected priority between 0 65 (65 = no limit)')
        return this
    }

    maxVoices = this.clamp(maxVoices, 0, 65)

    this._setAutomtableProperty('maxVoices', maxVoices)
    return this
}

//------------------------------------------------------------------------------

/**
 * Set the pitch for all selected events
 * @param {number} pitch 
 * @returns {fQuery}
 */
fQueryEvent.setPitch = function (pitch) {
    if (pitch === undefined) {
        this._logError('ArgumentError', 'expected value between -24 - 24')
        return this
    }

    pitch = this.clamp(pitch, this._fmod.EVENT_MIN_PITCH, this._fmod.EVENT_MAX_PITCH)

    this.each(function (obj) {
        if (obj.isOfExactType('Event')) {
            obj.mixer.masterBus.properties.pitch.setValue(pitch)
        }
    })
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the volume of all selected events master track
 * @param {number} volume 
 * @returns {fQuery}
 */
fQueryEvent.setVolume = function (volume) {
    if (volume === undefined) {
        this._logError('ArgumentError', 'expected value between -80 - 0')
        return this
    }

    volume = this.clamp(volume, this._fmod.EVENT_MIN_VOLUME, this._fmod.EVENT_MAX_VOLUME)

    this.each(function (obj) {
        if (obj.isOfExactType('Event')) {
            obj.mixer.masterBus.properties.volume.setValue(volume)
        }
    })
    return this

}

//------------------------------------------------------------------------------

/**
 * Sets the voice stealing method of all selected events master track
 * @param {numer} voiceStealing - number between 0 - 4
 * @returns {fQuery}
 */
fQueryEvent.setVoiceStealing = function (voiceStealing) {
    if (voiceStealing === undefined || voiceStealing < 0 || voiceStealing > 4) {
        this._logError('ArgumentError', 'expected priority between 0 - 4')
        return this
    }

    this._setAutomtableProperty('voiceStealing', voiceStealing)
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the priority of all selected events
 * @param {number} priority - number between 0 - 4
 * @returns {fQuery}
 */
fQueryEvent.setPriority = function (priority) {
    if (priority === undefined || priority < 0 || priority > 4) {
        this._logError('ArgumentError', 'expected priority between 0 - 4')
        return this
    }

    this._setAutomtableProperty('priority', priority)
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the event trigger cooldown
 * @param {number} cooldown 
 * @returns {fQuery}
 */
fQueryEvent.setCooldown = function (cooldown) {
    if (cooldown === undefined || cooldown < 0 || cooldown > this._fmod.TRIGGER_COOLDOWN_MAX) {
        this._logError('ArgumentError', 'expected cooldown between 0 - 60000')
        return this
    }

    this._setAutomtableProperty('triggerCooldown', cooldown)
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets the event minimum distance
 * @param {number} minDistance 
 * @returns {fQuery}
 */
fQueryEvent.setMinDistance = function (minDistance) {
    if (minDistance === undefined
        || minDistance < 0 || minDistance > this._fmod.DISTANCE_MAX) {
        this._logError('ArgumentError',
            'expected priority between 0 - {0}'.format(this._fmod.DISTANCE_MAX))
        return this
    }

    this._setAutomtableProperty('minimumDistance', minDistance)
    return this
}

//------------------------------------------------------------------------------

/**
 * Sets he event maximum distance
 * @param {number} maxDistance 
 * @returns {fQuery}
 */
fQueryEvent.setMaxDistance = function (maxDistance) {
    if (maxDistance === undefined
        || maxDistance < 0 || maxDistance > this._fmod.DISTANCE_MAX) {
        this._logError('ArgumentError',
            'expected maxDistance between 0 - {0}'.format(this._fmod.DISTANCE_MAX))
        return this
    }

    this._setAutomtableProperty('maximumDistance', maxDistance)
    return this
}

//------------------------------------------------------------------------------

/**
 * Shows a modeless dialog for editing event macros
 * @returns {fQuery}
 */
fQueryEvent.uiMacros = function (page) {
    var self = this
    var items = []
    page = page || 0

    if (self.count() == 0) {
        studio.ui.showModalDialog({
            windowTitle: "Event Macros",
            widgetType: studio.ui.widgetType.Layout,
            layout: studio.ui.layoutType.VBoxLayout,
            sizePolicy: studio.ui.sizePolicy.Minimum,
            spacing: 4,
            items: [
                {
                    widgetType: studio.ui.widgetType.PushButton,
                    text: "No Events Selected!",
                    onClicked: function () {
                        this.closeDialog()
                    }
                }
            ],
        })

        return self
    }

    var objects = []
    if (self.count() > 20) {
        self._uiPage = page
        objects = self._objects.slice(20 * page, 20 * page + 20)

        items.push({
            widgetType: studio.ui.widgetType.Layout,
            layout: studio.ui.layoutType.HBoxLayout,
            alignment: studio.ui.alignment.AlignTop,
            contentsMargins: { left: 0, top: 4, right: 0, bottom: 16 },
            spacing: 4,
            items: [
                {
                    widgetType: studio.ui.widgetType.PushButton,
                    sizePolicy: studio.ui.sizePolicy.Minimum,
                    isEnabled: self._uiPage > 0,
                    text: "<<",
                    onClicked: function () {
                        this.closeDialog()
                        self.uiMacros(self._uiPage - 1)
                    }
                },
                {
                    widgetType: studio.ui.widgetType.Label,
                    text: "{0} - {1}".format(self._uiPage * 20, self._uiPage * 20 + 20),
                    alignment: studio.ui.alignment.Justify,
                    sizePolicy: studio.ui.sizePolicy.Maximum,
                    minimumWidth: 1060,
                },
                {
                    widgetType: studio.ui.widgetType.PushButton,
                    sizePolicy: studio.ui.sizePolicy.Minimum,
                    text: ">>",
                    onClicked: function () {
                        this.closeDialog()
                        self.uiMacros(self._uiPage + 1)
                    }
                }
            ]
        })
    } else {
        objects = self._objects
    }

    items.push({
        widgetType: studio.ui.widgetType.Layout,
        layout: studio.ui.layoutType.HBoxLayout,
        alignment: studio.ui.alignment.AlignTop,
        contentsMargins: { left: 0, top: 0, right: 0, bottom: 0 },
        spacing: 4,
        items: [
            {
                widgetType: studio.ui.widgetType.Label,
                text: "Event",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                alignment: studio.ui.alignment.AlignCenter,
                text: "Persistent",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                text: "Pitch",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                alignment: studio.ui.alignment.AlignCenter,
                text: "Doppler Enabled",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                text: "Doppler Scale",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                text: "Priority",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                text: "Max Instances",
                wordWrap: true
            },
            {
                widgetType: studio.ui.widgetType.Label,
                text: "Stealing",
                wordWrap: true
            }
        ]
    })

    var events = []

    objects.forEach(function (obj) {
        events.push({
            widgetType: studio.ui.widgetType.Layout,
            layout: studio.ui.layoutType.HBoxLayout,
            alignment: studio.ui.alignment.AlignTop,
            contentsMargins: { left: 0, top: 0, right: 0, bottom: 0 },
            spacing: 4,
            items: [
                {
                    widgetType: studio.ui.widgetType.Label,
                    text: obj.name,
                    wordWrap: true
                },
                {
                    widgetType: studio.ui.widgetType.CheckBox,
                    widgetId: "isPersistent_" + obj.id,
                    alignment: studio.ui.alignment.AlignCenter,
                    text: "",
                    isChecked: obj.automatableProperties.isPersistent,
                    onToggled: function () {
                        var isPersistent = this.findWidget(this.widgetId()).isChecked()
                        obj.automatableProperties.properties.isPersistent.setValue(isPersistent)
                    }
                },
                {
                    widgetType: studio.ui.widgetType.SpinBox,
                    widgetId: "pitch_" + obj.id,
                    range: { miminum: self._fmod.EVENT_MIN_PITCH, maximum: self._fmod.EVENT_MAX_PITCH },
                    value: obj.automatableProperties.pitch,
                    onValueChanged: function () {
                        var pitch = this.findWidget(this.widgetId()).value()
                        pitch = self.clamp(pitch, self._fmod.EVENT_MIN_PITCH, self._fmod.EVENT_MAX_PITCH)
                        obj.mixer.masterBus.properties.pitch.setValue(pitch)
                    },
                },
                {
                    widgetType: studio.ui.widgetType.CheckBox,
                    widgetId: "dopplerEnabled_" + obj.id,
                    alignment: studio.ui.alignment.AlignCenter,
                    text: "",
                    isChecked: obj.automatableProperties.dopplerEnabled,
                    onToggled: function () {
                        var dopplerEnabled = this.findWidget(this.widgetId()).isChecked()
                        obj.automatableProperties.properties.dopplerEnabled.setValue(dopplerEnabled)
                    }
                },
                {
                    widgetType: studio.ui.widgetType.SpinBox,
                    widgetId: "dopplerScale_" + obj.id,
                    range: { miminum: 0, maximum: self._fmod.DOPPLER_MAX_SCALE },
                    value: obj.automatableProperties.dopplerScale,
                    onValueChanged: function () {
                        var dopplerScale = this.findWidget(this.widgetId()).value()
                        obj.automatableProperties.properties.dopplerScale.setValue(dopplerScale)
                    },
                },
                {
                    widgetType: studio.ui.widgetType.ComboBox,
                    widgetId: "priority_" + obj.id,
                    currentIndex: obj.automatableProperties.priority,
                    items: [
                        { text: self._fmod.PRIORITY_STR[0], userData: 0 },
                        { text: self._fmod.PRIORITY_STR[1], userData: 1 },
                        { text: self._fmod.PRIORITY_STR[2], userData: 2 },
                        { text: self._fmod.PRIORITY_STR[3], userData: 3 },
                        { text: self._fmod.PRIORITY_STR[4], userData: 4 },
                    ],
                    onCurrentIndexChanged: function () {
                        var priority = this.findWidget(this.widgetId()).currentIndex()
                        obj.automatableProperties.properties.priority.setValue(priority)
                    }
                },
                {
                    widgetType: studio.ui.widgetType.SpinBox,
                    widgetId: "maxVoices_" + obj.id,
                    range: { miminum: 1, maximum: 65 },
                    value: obj.automatableProperties.maxVoices,
                    onValueChanged: function () {
                        var maxVoices = this.findWidget(this.widgetId()).value()
                        obj.automatableProperties.properties.maxVoices.setValue(maxVoices)
                    },
                },
                {
                    widgetType: studio.ui.widgetType.ComboBox,
                    widgetId: "voideStealing_" + obj.id,
                    currentIndex: obj.automatableProperties.voiceStealing,
                    items: [
                        { text: self._fmod.VOICE_STEALING_STR[0], userData: 0 },
                        { text: self._fmod.VOICE_STEALING_STR[1], userData: 1 },
                        { text: self._fmod.VOICE_STEALING_STR[2], userData: 2 },
                        { text: self._fmod.VOICE_STEALING_STR[3], userData: 3 },
                        { text: self._fmod.VOICE_STEALING_STR[4], userData: 4 },
                    ],
                    onCurrentIndexChanged: function () {
                        var voiceStealing = this.findWidget(this.widgetId()).currentIndex()
                        obj.automatableProperties.properties.voiceStealing.setValue(voiceStealing)
                    },
                },
            ]
        })
    })

    items.push({
        widgetType: studio.ui.widgetType.Layout,
        widgetId: "events",
        layout: studio.ui.layoutType.VBoxLayout,
        sizePolicy: studio.ui.sizePolicy.Preferred,
        contentsMargins: { left: 0, top: 0, right: 0, bottom: 0 },
        items: events
    })

    studio.ui.showModelessDialog({
        windowTitle: "Event Macros",
        minimumWidth: 1280,
        widgetType: studio.ui.widgetType.Layout,
        layout: studio.ui.layoutType.VBoxLayout,
        sizePolicy: studio.ui.sizePolicy.Preferred,
        spacing: 4,
        items: items,
    })

    return self
}

//------------------------------------------------------------------------------

module.exports = fQueryEvent
