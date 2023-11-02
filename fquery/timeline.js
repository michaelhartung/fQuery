// 2023 Michael Hartung <michael@hartung.studio>

var fQueryTimeline = {}

//------------------------------------------------------------------------------

/**
 * Returns the help string
 * @returns {string}
 */
fQueryTimeline.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' Timeline \n'
        + ' ----------------------------------- \n\n'
        + ' markers(?markerType)                returns all markers \n'
        + '     TransitionMarker                \n'
        + '     NamedMarker                     \n'
        + '     TempoMarker                     \n'
        + ' regions(?regionType)                returns all regions \n'
        + '     TransitionRegion                \n'
        + '     LoopRegion                      \n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Gets all sounds of an optional type on the timeline 
 * @param {string} soundType 
 * @returns {fQuery}
 */
fQueryTimeline.sounds = function (soundType) {
    soundType = soundType || 'Sound'
    var includeDerivedTypes = soundType === 'Sound'

    this._objects = this._filterObjectsByType(this._objects, soundType, includeDerivedTypes)
    this._objectType = soundType

    this._addExtensions({
        extensions: ['fQuerySound', 'fQueryMeta', 'fQueryModulator'],
        clearExtensions: true
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Returns all markers of a given type of the selected timelines
 * @param {string} markerType [TransitionMarker, NamedMarker, TempoMarker]
 * @returns {fQuery}
 */
fQueryTimeline.markers = function (markerType) {
    markerType = markerType || 'Marker'
    var includeDerivedTypes = markerType === 'Marker'

    this._objects = this._filterObjectsByType(this._objects, markerType, includeDerivedTypes)
    this._objectType = markerType

    // TODO(mhartung)
    this._addExtensions({
        extensions: [],
        clearExtensions: true
    })

    return this
}

//------------------------------------------------------------------------------

/**
 * Returns all markers of a given type of the selected timelines
 * @param {string} regionType [LoopRegion, TransitionRegion]
 * @returns {fQuery}
 */
fQueryTimeline.regions = function (regionType) {
    regionType = regionType || 'Region'
    var includeDerivedTypes = regionType === 'Region'

    this._objects = this._filterObjectsByType(this._objects, regionType, includeDerivedTypes)
    this._objectType = regionType

    // TODO(mhartung)
    this._addExtensions({
        extensions: [],
        clearExtensions: true
    })

    return this
}

//------------------------------------------------------------------------------

module.exports = fQueryTimeline
