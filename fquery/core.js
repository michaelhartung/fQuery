// 2023 Michael Hartung <michael@hartung.studio>

//------------------------------------------------------------------------------

var fQuery = function() {}

//------------------------------------------------------------------------------

/**
 * Outputs a help text
 */
fQuery.prototype.help = function()
{
    var help = '\n'
+ ' fQuery 2023 Michael Hartung <michael@hartung.studio>'
+ ' ----------------------------------- \n'
+ ' Core \n'
+ ' ----------------------------------- \n\n'
+ ' get(index)                          return selected object at index\n'
+ ' dump(index)                         calls dump() on selected object at index\n'
+ ' each(function(obj) { //code })      call function on all selected objects\n'

    Object.keys(fQuery.prototype._extensions).forEach(function(extensionName) {
        var extension = fQuery.prototype._extensions[extensionName]
        if(extension.help !== undefined && typeof(extension.help) === 'function') {
            help += extension.help()
        }
    })

    studio.system.print(help)
    return ''
}

//------------------------------------------------------------------------------

// TODO(mhartung):
// - fQueryScatterer

fQuery.prototype._extensions = {
    fQueryMeta:         studio.system.require('meta.js'),
    fQueryEvent:        studio.system.require('event.js'),
    fQueryBank:         studio.system.require('bank.js'),
    fQuerySound:        studio.system.require('sound.js'),
    fQueryModulator:    studio.system.require('modulator.js'),
    fQueryTimeline:     studio.system.require('timeline.js'),
    fQueryTrack:        studio.system.require('track.js'),
    fQueryMasterTrack:  studio.system.require('mastertrack.js'),
}

//------------------------------------------------------------------------------

// selectionTypes  = 'Event', 'Folder', 'Bank', 'AudioFile'
// sheetTypes      = 'ActionSheet', 'Timeline', 'ParameterProxy'
// soundTypes      = 'Sound', 'SingleSound', 'MultiSound', 'CommandSound', 'EventSound', 'SoundScatterer'

fQuery.prototype._extensionsByObjectType = {
    Bank:               ['fQueryBank', 'fQueryMeta'],
    Event:              ['fQueryEvent', 'fQueryMeta', 'fQueryModulator'],
    EventFolder:        ['fQueryMeta'],
    Timeline:           ['fQueryTimeline'],
    AnySound:           ['fQuerySound', 'fQueryMeta', 'fQueryModulator'], 
    SingleSound:        ['fQuerySound', 'fQueryMeta', 'fQueryModulator'], 
    MultiSound:         ['fQuerySound', 'fQueryMeta', 'fQueryModulator'], 
    EventSound:         ['fQuerySound', 'fQueryMeta', 'fQueryModulator'],
    SoundScatterer:     ['fQueryMeta'],
}

//------------------------------------------------------------------------------

fQuery.prototype._objectMethods = []

//------------------------------------------------------------------------------

// FMOD contstants
fQuery.prototype._fmod = 
{
    SEMITONE:               2.0833334922790527,
    DISTANCE_MAX:           10000,
    DOPPLER_MAX_SCALE:      500,

    EVENT_MIN_PITCH:        -24,
    EVENT_MAX_PITCH:        24,

    TRACK_MIN_VOLUME:       -80,
    TRACK_MAX_VOLUME:       10,

    SOUND_MIN_VOLUME:       -80,
    SOUND_MAX_VOLUME:       10,
    SOUND_MIN_PITCH:        -24,
    SOUND_MAX_PITCH:        24,

    MODULATOR_MAX_VOLUME:   80,
    MODULATOR_MAX_PITCH:    48,

    PRIORITY_STR: {         0: 'Lowest',
                            1: 'Low',
                            2: 'Medium',
                            3: 'High',
                            4: 'Highest'        },

    TRIGGER_COOLDOWN_MAX:   60000,

    VOICE_STEALING_STR: {   0: 'Oldest',
                            1: 'Quietest',
                            2: 'Virtualize',
                            3: 'None',
                            4: 'Furthest'       },

    PROPERTIES: {           ADSRModulator: [
                                'initialValue', 'attackTime', 'attackShape', 'peakValue',
                                'holdTime', 'decayTime', 'decayShape', 'sustainValue',
                                'releaseTime', 'releaseShape', 'finalValue'
                            ],
                            LFOModulator: [ 
                                'shape', 'isTempoSync', 'rate', 'beats', 'phase', 'depth',
                                'direction'
                            ],
                            SidechainModulator: [
                                'levelMode', 'amount', 'attackTime', 'releaseTime',
                                'minimumThreshold', 'maximumThreshold' 
                            ],
    }
}

//------------------------------------------------------------------------------

/**
 * Prints an info text to the console
 * @param {string} msg 
 */
fQuery.prototype._logInfo = function (msg) {
    studio.system.print('Info: {0}'.format(msg))
}

//------------------------------------------------------------------------------

/**
 * Prints a warning to the console
 * @param {string} msg 
 */
fQuery.prototype._logWarn = function (msg) {
    studio.system.warn('Warning: {0}'.format(msg))
}

//------------------------------------------------------------------------------

/**
 * Prints an error to the console
 * @param {string} errorType 
 * @param {string} msg 
 */
fQuery.prototype._logError = function (errorType, msg) {
    studio.system.error('Error [{0}]: {1}'.format(errorType, msg))
}

//------------------------------------------------------------------------------

/**
 * Find objects by given type and search context
 * @param {string} objectType
 * @param {bool} includeDerivedTypes
 * @returns 
 */
fQuery.prototype.FindObjectsByType = function (objectType, includeDerivedTypes) {
    includeDerivedTypes = includeDerivedTypes || false

    this._objects = []
    this._selection = this._selectionByContextType('Browser')

    if (this._selection.length == 0) {
        this._selection = this._selectionByContextType('Editor')
    }

    if (this._selection.length == 0) {
        this._logError('SelectionError', 'nothing selected')
        return this
    }

    switch (objectType) {
        case 'Bank':
            this._objects = this._filterObjectsByExactType(this._selection, objectType)
            break

        case 'Event':
            this._objects = this._findAllEventsInSelection(this._selection)
            break

        case 'EventFolder':
            this._objects = this._findAllEventFoldersInSelection(this._selection)
            break

        case 'ActionSheet':
        case 'Timeline':
        case 'ParameterProxy':
        case 'SingleSound':
        case 'MultiSound':
        case 'CommandSound':
        case 'EventSound':
        case 'SoundScatterer':
            var searchContext = this._findAllEventsInSelection(this._selection)
            this._setObjects(this._filterObjectsByType(searchContext, objectType))
            break

        case 'AnySound':
            var searchContext = this._findAllEventsInSelection(this._selection)
            this._setObjects(this._filterObjectsByType(searchContext, 'Sound', includeDerivedTypes))
            break
    }

    if (this._extensionsByObjectType[objectType] !== undefined) {
        this._addExtensions({
            extensions: this._extensionsByObjectType[objectType],
            clearExtensions: true
        })
    }

    return this
}

//------------------------------------------------------------------------------

/**
 * Sets objects and object type
 * @param {[Object]} array of objects
 * @return {fQuery}
 */
fQuery.prototype._setObjects = function (objects) {
    objects = objects || []

    this._objects = objects
    this._objectType = this._objects.length > 0 ? this._objects[0].entity : undefined

    return this
}

//------------------------------------------------------------------------------

/**
 * Adds a given number of extensions, optionally clearing already loaded ones
 * @param {Object} param { extensions: [], clearExtension: bool }
 */
fQuery.prototype._addExtensions = function (param) {
    if (param.clearExtensions) {
        fQuery.prototype._clearExtensions()
    }

    param.extensions.forEach(function (extension) {
        var extension = fQuery.prototype._extensions[extension]
        if (extension !== undefined) {
            fQuery.prototype._addExtension(extension)
        }
    })
}

//------------------------------------------------------------------------------

/**
 * Adds the methods of a given extension to the fQuery.prototype 
 * @param {string} extension
 */
fQuery.prototype._addExtension = function (extension) {
    Object.keys(extension).forEach(function (property) {
        if (fQuery.prototype[property] === undefined) {
            fQuery.prototype[property] = extension[property]
            fQuery.prototype._objectMethods.push(property)
        }
    })
}

//------------------------------------------------------------------------------

/**
 * Removes all added extension methods from the fQuery.prototype
 */
fQuery.prototype._clearExtensions = function () {
    fQuery.prototype._objectMethods.forEach(function (method) {
        if (fQuery.prototype.hasOwnProperty(method)) {
            delete fQuery.prototype[method]
        }
    })
}

//------------------------------------------------------------------------------

/**
 * Returns an array of ManagedObject for the given selection context
 * @param {string} contextType
 * @returns {ManagedObject[]} selection
 */
fQuery.prototype._selectionByContextType = function (contextType) {
    var selection = []

    if (contextType == 'Browser') {
        selection = studio.window.browserSelection()
    } else if (contextType == 'Editor') {
        selection = studio.window.editorSelection()
    }

    return selection
}

//------------------------------------------------------------------------------

/**
 * Find events in selection
 * @param {ManagedObject[]} selection 
 * @returns {ManagedObject[]} events
 */
fQuery.prototype._findAllEventsInSelection = function (selection) {
    var events = []

    events = events.concat(fQuery.prototype._filterObjectsByExactType(selection, 'Event'))

    var eventFolders = fQuery.prototype._filterObjectsByExactType(selection, 'EventFolder')

    if (eventFolders.length > 0) {
        var out_events = []
        eventFolders.forEach(function (obj) {
            fQuery.prototype._findEventsRecursive(obj, out_events)
        })

        events = events.concat(out_events)
    }

    return events
}

//------------------------------------------------------------------------------

/**
 * Find all event folders
 * @param {ManagedObject[]} selection 
 * @returns {ManagedObject[]} eventFolders
 */
fQuery.prototype._findAllEventFoldersInSelection = function (selection) {
    var eventFolders = []

    selection.forEach(function (obj) {
        fQuery.prototype._findEventFoldersRecursive(obj, eventFolders)
    })

    return eventFolders
}

//------------------------------------------------------------------------------

/**
 * Find events recursively
 * @param {ManagedObject} object 
 * @param {ManagedObject[]} out_events 
 */
fQuery.prototype._findEventsRecursive = function (object, out_events) {
    if (object.isOfExactType('EventFolder')) {
        object.items.forEach(function (item) {
            fQuery.prototype._findEventsRecursive(item, out_events)
        })
    }
    else if (object.isOfExactType('Event')) {
        out_events.push(object)
    }
}

//------------------------------------------------------------------------------

/**
 * Recursively find event folders
 * @param {ManagedObject} object
 * @param {ManagedObject[]} out_folders
 */
fQuery.prototype._findEventFoldersRecursive = function (object, out_folders) {
    if (object.isOfExactType('EventFolder')) {
        out_folders.push(object)
        object.items.forEach(function (item) {
            fQuery.prototype._findEventFoldersRecursive(item, out_folders)
        })
    }
}

//------------------------------------------------------------------------------

/**
 * Filters an array of ManagedObjects by a given objectType 
 * @param {ManagedObject[]} objects
 * @param {string} objectType 
 * @returns {ManagedObject[]} ManagedObjects of objectType
 */
fQuery.prototype._filterObjectsByExactType = function (objects, objectType) {
    return objects.filter(function (object) {
        return object.isOfExactType(objectType)
    })
}

//------------------------------------------------------------------------------

/**
 * Searches an array of ManagedObjects for a specific Object type
 * @param {ManagedObject[]} searchContexts 
 * @param {string} objectType 
 * @param {bool} includeDerivedTypes 
 * @return
 */
fQuery.prototype._filterObjectsByType = function (searchContexts, objectType, includeDerivedTypes) {
    includeDerivedTypes = includeDerivedTypes || false

    var objects = []

    searchContexts.forEach(function (searchContext) {
        // TODO(mhartung) multisounds on action sheets count is off by 1
        var instances = studio.project.model[objectType].findInstances({
            searchContext: searchContext,
            includeDerivedTypes: includeDerivedTypes
        })
        objects = objects.concat(instances)
    })

    return objects
}

//------------------------------------------------------------------------------

/**
 * Returns the ManagedObject at the given index
 * @param {number} index 
 * @returns {ManagedObject}
 */
fQuery.prototype.get = function (index) {
    if (this._objects[index] !== undefined) {
        return this._objects[index]
    } else {
        this._logError('IndexError', 'out of range, {0} objects selected'.format(this._objects.length))
        return {}
    }
}

//------------------------------------------------------------------------------

/**
 * Returns the number of selected objects
 * @returns {number}
 */
fQuery.prototype.count = function () {
    return this._objects.length
}


//------------------------------------------------------------------------------

/**
 * Returns the object type of selected objects
 * @returns {string}
 */
fQuery.prototype.type = function () {
    if (this._objects.length > 0) {
        return this._objects[0].entity
    } else {
        return undefined
    }
}

//------------------------------------------------------------------------------

/**
 * Calls dump() on the ManagedObject at the given index
 * @param {number} index 
 */
fQuery.prototype.dump = function (index) {
    if (this._objects[index] !== undefined) {
        var object = this._objects[index]
        if (typeof (object.dump) === 'function') {
            object.dump()
        } else {
            this._logError('FunctionError', 'dump() does not exist on object')
        }
    } else {
        this._logError('IndexError', 'out of range, {0} objects selected'.format(this._objects.length))
    }

    return this
}

//------------------------------------------------------------------------------

/**
 * Executes a callback function on every object in the current selection
 * @param {callback} callback - the function to call for each object
 */
fQuery.prototype.each = function (callback) {
    if (typeof (callback) === 'function') {
        if (this._objects.length > 0) {
            this._objects.forEach(function (object) { callback(object) })
        } else {
            this._logError('QueryError', 'empty selection')
        }
    } else {
        this._logError('ArgumentError', 'must be function callback(object)')
    }
}

//------------------------------------------------------------------------------

/**
 * Returns an array of values for a given property of all slected objects
 * @param {string} propertyName 
 * @returns {array} array of property values
 */
fQuery.prototype.property = function (propertyName) {
    var self = this
    var properties = []

    self.each(function (obj) {
        if (obj.hasOwnProperty(propertyName)) {
            properties.push(obj[propertyName])
        } else {
            self._logError('PropertyError', '{0} does not exist'.format(propertyName))
        }
    })

    return properties
}

//------------------------------------------------------------------------------

/**
 * Sets a given property value on all selected objects
 * @param {string} propertyName 
 * @param {number} value 
 */
fQuery.prototype.setProperty = function (propertyName, value) {
    self = this

    self.each(function (obj) {
        if (obj.properties.hasOwnProperty(propertyName)) {
            obj.properties[propertyName].setValue(value)
        } else {
            self._logError('PropertyError', '{0} does not exist'.format(propertyName))
        }
    })
}

//------------------------------------------------------------------------------

/**
 * Clamps a number between a min and max value
 * @param {number} num 
 * @param {number} min 
 * @param {number} max 
 * @returns {number} result
 */
fQuery.prototype.clamp = function (num, min, max) {
    return Math.min(Math.max(num, min), max);
}

//------------------------------------------------------------------------------

module.exports = fQuery
