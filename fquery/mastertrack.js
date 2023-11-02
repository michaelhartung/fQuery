// 2023 Michael Hartung <michael@hartung.studio>

var fQueryMasterTrack = {}

//------------------------------------------------------------------------------

/**
 * Returns the help string
 * @returns {string}
 */
fQueryMasterTrack.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' MasterTrack \n'
        + ' ----------------------------------- \n\n'
        + ' setPitch(-24 - 24)                  sets the pitch of the master track\n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Set the pitch for all selected master tracks
 * @param {number} pitch 
 * @returns {fQuery}
 */
fQueryMasterTrack.setPitch = function (pitch) {
    if (pitch === undefined) {
        this._logError('ArgumentError', 'expected value between -24...24')
        return this
    }

    pitch = this.clamp(pitch, this._fmod.EVENT_MIN_PITCH, this._fmod.EVENT_MAX_PITCH)

    this.each(function (obj) {
        if (obj.isOfExactType('EventMixerMaster')) {
            obj.properties.pitch.setValue(pitch)
        }
    })
    return this
}

//------------------------------------------------------------------------------

module.exports = fQueryMasterTrack
