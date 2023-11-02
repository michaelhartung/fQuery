// 2023 Michael Hartung <michael@hartung.studio>

var fQueryTrack = {}

//------------------------------------------------------------------------------

/**
 * Returns the help string
 * @returns {string}
 */
fQueryTrack.help = function () {
    var help = '\n\n'
        + ' ----------------------------------- \n'
        + ' Track \n'
        + ' ----------------------------------- \n\n'
        + ' setVolume(-80 - 10)                 \n'
    return help
}

//------------------------------------------------------------------------------

/**
 * Sets the volume of all selected master tracks
 * @param {number} volume 
 * @returns {fQuery}
 */
fQueryTrack.setVolume = function (volume) {
    if (volume === undefined) {
        this._logError('ArgumentError', 'expected value between -80...10')
        return this
    }

    volume = this.clamp(volume, this._fmod.TRACK_MIN_VOLUME, this._fmod.TRACK_MAX_VOLUME)
    this._logInfo(volume)
    this.setProperty('volume', volume)
    return this
}

//------------------------------------------------------------------------------

module.exports = fQueryTrack
